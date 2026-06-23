from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.report import Report
from app.schemas.report import ReportResponse
from app.middleware.auth_middleware import get_current_user
from app.utils.storage import upload_file
from app.utils.file_processor import validate_file
import uuid

router = APIRouter()

@router.post("/upload", response_model=ReportResponse)
async def upload_report(
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
    
    # Create DB record
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
    
    return new_report

@router.get("/", response_model=list[ReportResponse])
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reports = db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.uploaded_at.desc()).all()
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
