from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from datetime import date
from app.ai.ocr import extract_text_from_file
from app.ai.report_analyzer import analyze_report
from app.ai.vector_store import embed_report
from app.models.report import Report
from app.utils.timeline_builder import add_timeline_event


async def upload_and_process(
    file_bytes: bytes,
    filename: str,
    file_type: str,
    user_id: str,
    db: Session,
    background_tasks: BackgroundTasks
) -> Report:
    # Create DB record with pending status
    report = Report(
        user_id=user_id,
        file_url="",  # Will be set by caller who already uploaded
        file_type=file_type,
        original_filename=filename,
        processing_status="pending"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Trigger AI processing as background task
    background_tasks.add_task(
        process_report_ai,
        file_bytes=file_bytes,
        file_type=file_type,
        report_id=str(report.id),
        user_id=str(user_id),
        db=db
    )

    return report


async def process_report_ai(
    file_bytes: bytes,
    file_type: str,
    report_id: str,
    user_id: str,
    db: Session
):
    """Background task: OCR → AI Analysis → FAISS embedding → Timeline event"""
    try:
        # Update status to processing
        report = db.query(Report).filter(Report.id == report_id).first()
        report.processing_status = "processing"
        db.commit()

        # Step 1: OCR
        ocr_text = await extract_text_from_file(file_bytes, file_type)
        report.ocr_text = ocr_text
        db.commit()

        # Step 2: AI Analysis
        analysis = await analyze_report(ocr_text)
        report.ai_summary = analysis.get("summary", "")
        report.ai_highlights = analysis.get("highlights", [])
        report.abnormal_values = analysis.get("abnormal_values", [])
        report.questions_for_doctor = analysis.get("questions_for_doctor", [])
        report.processing_status = "done"
        db.commit()

        # Step 3: Embed into patient's FAISS vector store
        await embed_report(user_id, ocr_text, report_id, report.ai_summary)

        # Step 4: Add to health timeline
        await add_timeline_event(
            db=db,
            user_id=user_id,
            event_type="report",
            event_date=report.uploaded_at.date(),
            title="Medical Report Uploaded",
            description=report.ai_summary[:200] if report.ai_summary else "New report processed",
            reference_id=report_id,
            reference_table="reports"
        )

    except Exception as e:
        report = db.query(Report).filter(Report.id == report_id).first()
        if report:
            report.processing_status = "failed"
            db.commit()
        print(f"Report processing failed for {report_id}: {e}")


async def reanalyze_report_ai(report_id: str, db: Session):
    """
    Fast re-analysis: ONLY re-runs the AI analysis step using saved OCR text.
    Skips OCR (already done), FAISS embedding (text unchanged), and timeline (already has event).
    Typical time: ~3 seconds vs ~30 seconds for full pipeline.
    """
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report or not report.ocr_text:
            print(f"Re-analyze skipped for {report_id}: no OCR text saved")
            return

        # Only the AI analysis step
        analysis = await analyze_report(report.ocr_text)
        report.ai_summary = analysis.get("summary", "")
        report.ai_highlights = analysis.get("highlights", [])
        report.abnormal_values = analysis.get("abnormal_values", [])
        report.questions_for_doctor = analysis.get("questions_for_doctor", [])
        report.processing_status = "done"
        db.commit()

    except Exception as e:
        report = db.query(Report).filter(Report.id == report_id).first()
        if report:
            report.processing_status = "failed"
            db.commit()
        print(f"Re-analysis failed for {report_id}: {e}")

