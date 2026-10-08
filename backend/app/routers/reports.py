from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, BackgroundTasks, Query, Header
from fastapi.responses import StreamingResponse, Response, FileResponse, RedirectResponse
from sqlalchemy.orm import Session
import asyncio
import json
import os
import uuid
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.report import Report
from app.models.provider import ProviderPatient
from app.schemas.report import ReportResponse
from app.middleware.auth_middleware import get_current_user
from app.services.auth_service import verify_token
from app.utils.storage import upload_file, delete_file, get_pdf_bytes_from_cloudinary
from app.utils.file_processor import validate_file
from app.services.report_service import process_report_ai, reanalyze_report_ai

router = APIRouter()


@router.post("/upload", response_model=ReportResponse)
async def upload_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    patient_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get file content to check size and upload
    file_bytes = await file.read()
    file_size = len(file_bytes)

    validate_file(file.content_type, file_size)

    target_user_id = current_user.id
    if patient_id:
        if current_user.role not in ["doctor", "admin"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to upload on behalf of patient")
        if current_user.role != "admin":
            is_assigned = db.query(ProviderPatient).filter(
                ProviderPatient.provider_id == current_user.id,
                ProviderPatient.patient_id == patient_id,
                ProviderPatient.is_active == True
            ).first()
            if not is_assigned:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patient not assigned to this provider")
        target_user_id = patient_id

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"

    # Upload to Cloudinary
    file_url = await upload_file(file_bytes, unique_filename)

    # Create DB record with pending status
    new_report = Report(
        user_id=target_user_id,
        file_url=file_url,
        file_type=file.content_type,
        original_filename=file.filename,
        processing_status="pending"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    # Save local copy for zero-latency direct viewing
    try:
        cache_dir = os.path.join(os.getcwd(), "backend", "data", "uploads")
        if not os.path.exists(cache_dir):
            cache_dir = os.path.join(os.getcwd(), "data", "uploads")
        os.makedirs(cache_dir, exist_ok=True)
        local_path = os.path.join(cache_dir, f"{new_report.id}.pdf")
        with open(local_path, "wb") as f:
            f.write(file_bytes)
    except Exception as cache_err:
        print(f"Warning: could not cache upload file locally: {cache_err}")

    # Trigger AI processing as background task (OCR → Analysis → FAISS → Timeline)
    background_tasks.add_task(
        process_report_ai,
        file_bytes=file_bytes,
        file_type=file.content_type,
        report_id=str(new_report.id),
        user_id=str(target_user_id)
    )

    return new_report


@router.get("/", response_model=list[ReportResponse])
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reports = db.query(Report).filter(
        Report.user_id == current_user.id
    ).order_by(Report.uploaded_at.desc()).all()
    return reports


@router.get("/{id}", response_model=ReportResponse)
def get_report(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this report")

    return report


@router.get("/{id}/file")
async def get_report_file(
    id: uuid.UUID,
    token: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Delivers the genuine PDF document for inline viewing or tab display.
    Bypasses Cloudinary raw PDF 401 ACL blocks by serving either from local cache
    or assembling high-resolution pages via Cloudinary into standard PDF format.
    """
    user = None
    auth_token = token
    if not auth_token and authorization and authorization.startswith("Bearer "):
        auth_token = authorization.split(" ")[1]

    if auth_token:
        try:
            payload = verify_token(auth_token)
            user_id = payload.get("sub")
            if user_id:
                user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
        except Exception:
            pass

    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    if user and user.role not in ["doctor", "admin"] and report.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this report")

    cache_dir = os.path.join(os.getcwd(), "backend", "data", "uploads")
    if not os.path.exists(cache_dir):
        cache_dir = os.path.join(os.getcwd(), "data", "uploads")
    os.makedirs(cache_dir, exist_ok=True)
    local_path = os.path.join(cache_dir, f"{report.id}.pdf")

    filename_val = report.original_filename or f"{report.id}.pdf"

    # 1. Return from local cache if present
    if os.path.exists(local_path):
        return FileResponse(
            local_path,
            media_type="application/pdf",
            filename=filename_val,
            headers={"Content-Disposition": f'inline; filename="{filename_val}"'}
        )

    # 2. Fetch and assemble from Cloudinary
    if report.file_url and "res.cloudinary.com" in report.file_url:
        try:
            pdf_bytes = get_pdf_bytes_from_cloudinary(report.file_url)
            with open(local_path, "wb") as f:
                f.write(pdf_bytes)
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={"Content-Disposition": f'inline; filename="{filename_val}"'}
            )
        except Exception as e:
            print(f"Failed to assemble PDF from Cloudinary for {report.id}: {e}")

    # Fallback to redirecting to file_url
    return RedirectResponse(url=report.file_url)


@router.delete("/{id}")
async def delete_report(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Delete file from cloud storage
    if report.file_url:
        await delete_file(report.file_url)
    
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}


@router.get("/{id}/progress")
async def report_progress(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """SSE endpoint for real-time report processing progress."""
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    async def event_generator():
        current_status = ""
        current_progress = ""
        
        while True:
            from app.database import SessionLocal
            local_db = SessionLocal()
            try:
                # Re-fetch report state using a fresh session
                latest_report = local_db.query(Report).filter(Report.id == id).first()
                if not latest_report:
                    break
                
                if latest_report.processing_status != current_status or latest_report.processing_progress != current_progress:
                    current_status = latest_report.processing_status
                    current_progress = latest_report.processing_progress
                    
                    data = {
                        "status": current_status,
                        "progress": current_progress
                    }
                    yield f"data: {json.dumps(data)}\n\n"
                    
                    if current_status in ["done", "failed"]:
                        break
                else:
                    # Send a heartbeat every second to keep the connection alive
                    yield ": heartbeat\n\n"
            finally:
                local_db.close()
                    
            await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/{id}/reanalyze", response_model=ReportResponse)
async def reanalyze_report(
    id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Re-run AI analysis on an existing report using its saved OCR text."""
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if not report.ocr_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No OCR text available. Please re-upload the report.")

    # Reset to processing state immediately
    report.processing_status = "processing"
    report.processing_progress = "Starting re-analysis..."
    report.ai_highlights = []
    report.abnormal_values = []
    report.questions_for_doctor = []
    db.commit()
    db.refresh(report)

    background_tasks.add_task(reanalyze_report_ai, str(report.id))

    return report


class FeedbackPayload(BaseModel):
    feedback: str # "up" or "down"

@router.post("/{id}/insights/{index}/feedback")
def submit_insight_feedback(
    id: uuid.UUID,
    index: int,
    payload: FeedbackPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit thumbs up/down feedback for a specific actionable insight."""
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    insights = list(report.actionable_insights or [])
    if index < 0 or index >= len(insights):
        raise HTTPException(status_code=400, detail="Invalid insight index")
        
    # Python lists of dicts from JSONB require assignment to save
    insights[index]["feedback"] = payload.feedback
    
    # SQLAlchemy JSONB mutation trick
    report.actionable_insights = insights
    # Or db.execute(update...) if the above doesn't trigger a change, but flag_modified works:
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(report, "actionable_insights")
    
    db.commit()
    
    return {"status": "success"}
