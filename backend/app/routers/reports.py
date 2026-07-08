from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import asyncio
import json
from app.database import get_db
from app.models.user import User
from app.models.report import Report
from app.schemas.report import ReportResponse
from app.middleware.auth_middleware import get_current_user
from app.utils.storage import upload_file
from app.utils.file_processor import validate_file
from app.services.report_service import process_report_ai, reanalyze_report_ai
import uuid

router = APIRouter()


@router.post("/upload", response_model=ReportResponse)
async def upload_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get file content to check size and upload
    file_bytes = await file.read()
    file_size = len(file_bytes)

    validate_file(file.content_type, file_size)

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"

    # Upload to Cloudinary
    file_url = await upload_file(file_bytes, unique_filename)

    # Create DB record with pending status
    new_report = Report(
        user_id=current_user.id,
        file_url=file_url,
        file_type=file.content_type,
        original_filename=file.filename,
        processing_status="pending"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    # Trigger AI processing as background task (OCR → Analysis → FAISS → Timeline)
    background_tasks.add_task(
        process_report_ai,
        file_bytes=file_bytes,
        file_type=file.content_type,
        report_id=str(new_report.id),
        user_id=str(current_user.id)
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


@router.delete("/{id}")
def delete_report(
    id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    if report.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
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
    report.ai_highlights = []
    report.abnormal_values = []
    report.questions_for_doctor = []
    db.commit()
    db.refresh(report)

    # Fast re-analysis: only the AI step (skips OCR, embedding, timeline)
    background_tasks.add_task(
        reanalyze_report_ai,
        report_id=str(report.id)
    )

    return report

