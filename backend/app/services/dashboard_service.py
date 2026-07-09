import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User
from app.models.doctor import DoctorPatient
from app.models.medication import Medication, MedicationLog
from app.models.follow_up import FollowUp
from app.models.report import Report
from app.models.memo import PatientMemo
from app.models.analytics import PatientAnalytics
from app.schemas.dashboard import DashboardKPIsResponse, NextMedication, NextAppointment


def _sync_patient_analytics(patient_id: uuid.UUID, db: Session):
    """
    Synchronously computes adherence and follow-up stats and upserts into PatientAnalytics.
    """
    now_utc = datetime.now(timezone.utc)
    cutoff_30 = now_utc - timedelta(days=30)
    
    patient_meds = db.query(Medication).filter(Medication.user_id == patient_id).all()
    patient_med_ids = [m.id for m in patient_meds]

    if patient_med_ids:
        logs = db.query(MedicationLog).filter(
            MedicationLog.medication_id.in_(patient_med_ids),
            MedicationLog.scheduled_time >= cutoff_30
        ).all()
        total_logs = len(logs)
        taken_logs = sum(1 for l in logs if l.status == "taken")
        adherence_rate = round((taken_logs / total_logs) * 100, 1) if total_logs > 0 else 0.0
    else:
        adherence_rate = 0.0

    pending_follow_ups = db.query(FollowUp).filter(
        FollowUp.user_id == patient_id,
        FollowUp.status == "scheduled",
        FollowUp.appointment_date >= now_utc
    ).count()

    missed_follow_ups = db.query(FollowUp).filter(
        FollowUp.user_id == patient_id,
        or_(
            FollowUp.status == "missed",
            (FollowUp.status == "scheduled") & (FollowUp.appointment_date < now_utc)
        )
    ).count()

    analytics = db.query(PatientAnalytics).filter(PatientAnalytics.patient_id == patient_id).first()
    if analytics:
        analytics.adherence_rate_30d = adherence_rate
        analytics.pending_follow_ups_count = pending_follow_ups
        analytics.missed_follow_ups_count = missed_follow_ups
    else:
        analytics = PatientAnalytics(
            patient_id=patient_id,
            adherence_rate_30d=adherence_rate,
            pending_follow_ups_count=pending_follow_ups,
            missed_follow_ups_count=missed_follow_ups
        )
        db.add(analytics)
    db.commit()
    return analytics

async def get_patient_dashboard_kpis(patient: User, db: Session) -> DashboardKPIsResponse:
    now_utc = datetime.now(timezone.utc)
    
    # 1. Medications Today
    today = now_utc.date()
    start_of_day = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end_of_day = datetime.combine(today, datetime.max.time(), tzinfo=timezone.utc)
    
    patient_meds = db.query(Medication).filter(Medication.user_id == patient.id, Medication.is_active == True).all()
    patient_med_ids = [m.id for m in patient_meds]
    
    medications_today_total = 0
    medications_today_taken = 0
    next_medication = None
    
    if patient_med_ids:
        # Get logs for today
        today_logs = db.query(MedicationLog).filter(
            MedicationLog.medication_id.in_(patient_med_ids),
            MedicationLog.scheduled_time >= start_of_day,
            MedicationLog.scheduled_time <= end_of_day
        ).order_by(MedicationLog.scheduled_time.asc()).all()
        
        medications_today_total = len(today_logs)
        medications_today_taken = sum(1 for log in today_logs if log.status == "taken")
        
        # Find the next scheduled medication that is not taken/skipped
        for log in today_logs:
            if log.status == "pending" or log.status is None or log.status == "scheduled":
                med = next((m for m in patient_meds if m.id == log.medication_id), None)
                if med:
                    next_medication = NextMedication(
                        id=str(med.id),
                        name=med.name,
                        scheduled_time=log.scheduled_time,
                        status=log.status or "scheduled"
                    )
                    break

    # 2. Next Appointment
    next_follow_up = db.query(FollowUp).filter(
        FollowUp.user_id == patient.id,
        FollowUp.status == "scheduled",
        FollowUp.appointment_date >= now_utc
    ).order_by(FollowUp.appointment_date.asc()).first()
    
    next_appointment = None
    if next_follow_up:
        next_appointment = NextAppointment(
            id=str(next_follow_up.id),
            doctor_name=next_follow_up.doctor_name,
            specialty=next_follow_up.specialty,
            appointment_date=next_follow_up.appointment_date,
            status=next_follow_up.status
        )

    return DashboardKPIsResponse(
        medications_today_total=medications_today_total,
        medications_today_taken=medications_today_taken,
        next_medication=next_medication,
        next_appointment=next_appointment
    )

async def get_patient_overview(doctor: User, db: Session):
    """
    Get a summary of patients assigned to the doctor.
    Reads metrics from the pre-computed PatientAnalytics table.
    """
    if doctor.role == "admin":
        assigned_patients = db.query(User).filter(User.role == "patient", User.is_active == True).all()
    else:
        assigned_patients = db.query(User).join(
            DoctorPatient, DoctorPatient.patient_id == User.id
        ).filter(
            DoctorPatient.doctor_id == doctor.id,
            DoctorPatient.is_active == True
        ).all()

    result = []
    for patient in assigned_patients:
        analytics = db.query(PatientAnalytics).filter(PatientAnalytics.patient_id == patient.id).first()
        if not analytics:
            # First time fallback compute
            analytics = _sync_patient_analytics(patient.id, db)

        # Get most recent report ID
        recent_report = db.query(Report).filter(
            Report.user_id == patient.id
        ).order_by(Report.uploaded_at.desc()).first()
        recent_report_id = recent_report.id if recent_report else None

        result.append({
            "patient_id": patient.id,
            "name": patient.name,
            "email": patient.email,
            "medication_adherence_rate": analytics.adherence_rate_30d,
            "pending_follow_ups": analytics.pending_follow_ups_count,
            "recent_report_id": recent_report_id
        })

    return result


async def get_adherence_analytics(doctor: User, days: int, db: Session):
    """
    Get adherence analytics for the doctor's patients reading directly from caching table.
    """
    if doctor.role == "admin":
        assigned_patients = db.query(User).filter(User.role == "patient", User.is_active == True).all()
    else:
        assigned_patients = db.query(User).join(
            DoctorPatient, DoctorPatient.patient_id == User.id
        ).filter(
            DoctorPatient.doctor_id == doctor.id,
            DoctorPatient.is_active == True
        ).all()

    total_patients = len(assigned_patients)
    by_patient = []
    rates = []

    for patient in assigned_patients:
        analytics = db.query(PatientAnalytics).filter(PatientAnalytics.patient_id == patient.id).first()
        if not analytics:
            analytics = _sync_patient_analytics(patient.id, db)
        
        rate = analytics.adherence_rate_30d
        by_patient.append({
            "name": patient.name,
            "rate": rate
        })
        rates.append(rate)

    overall_adherence = round(sum(rates) / len(rates), 1) if rates else 0.0

    return {
        "total_patients": total_patients,
        "overall_adherence": overall_adherence,
        "by_patient": by_patient
    }


async def get_followup_stats(doctor: User, db: Session):
    """
    Get follow-up appointment stats for assigned patients directly from caching table.
    """
    if doctor.role == "admin":
        patient_ids = [u.id for u in db.query(User).filter(User.role == "patient", User.is_active == True).all()]
    else:
        patient_ids = [
            p.patient_id for p in db.query(DoctorPatient).filter(
                DoctorPatient.doctor_id == doctor.id,
                DoctorPatient.is_active == True
            ).all()
        ]

    if not patient_ids:
        return {"missed": 0}

    total_missed = 0
    for pid in patient_ids:
        analytics = db.query(PatientAnalytics).filter(PatientAnalytics.patient_id == pid).first()
        if not analytics:
            analytics = _sync_patient_analytics(pid, db)
        total_missed += analytics.missed_follow_ups_count

    return {"missed": total_missed}


async def get_patient_detail(patient_id: uuid.UUID, doctor: User, db: Session):
    """
    Get detailed profile of a patient including medications, recent reports, follow-ups, and memos.
    """
    patient = db.query(User).filter(User.id == patient_id, User.role == "patient").first()
    if not patient:
        return None

    if doctor.role != "admin":
        is_assigned = db.query(DoctorPatient).filter(
            DoctorPatient.doctor_id == doctor.id,
            DoctorPatient.patient_id == patient_id,
            DoctorPatient.is_active == True
        ).first()
        if not is_assigned:
            return None

    # Medications
    medications = db.query(Medication).filter(Medication.user_id == patient_id).all()
    medications_list = [
        {
            "id": m.id,
            "name": m.name,
            "dosage": m.dosage,
            "frequency": m.frequency
        } for m in medications
    ]

    # Reports
    reports = db.query(Report).filter(Report.user_id == patient_id).order_by(Report.uploaded_at.desc()).all()
    reports_list = [
        {
            "id": r.id,
            "original_filename": r.original_filename,
            "file_type": r.file_type,
            "processing_status": r.processing_status
        } for r in reports
    ]

    # Followups
    follow_ups = db.query(FollowUp).filter(FollowUp.user_id == patient_id).order_by(FollowUp.appointment_date.asc()).all()
    follow_ups_list = [
        {
            "id": f.id,
            "doctor_name": f.doctor_name,
            "specialty": f.specialty,
            "appointment_date": f.appointment_date,
            "status": f.status
        } for f in follow_ups
    ]

    # Memos
    memos = db.query(PatientMemo).filter(PatientMemo.patient_id == patient_id).order_by(PatientMemo.created_at.desc()).all()
    memos_list = [
        {
            "id": memo.id,
            "doctor_id": memo.doctor_id,
            "content": memo.content,
            "created_at": memo.created_at
        } for memo in memos
    ]

    return {
        "name": patient.name,
        "email": patient.email,
        "medications": medications_list,
        "reports": reports_list,
        "follow_ups": follow_ups_list,
        "memos": memos_list
    }

async def add_patient_memo(patient_id: uuid.UUID, doctor: User, content: str, db: Session):
    if doctor.role != "admin":
        is_assigned = db.query(DoctorPatient).filter(
            DoctorPatient.doctor_id == doctor.id,
            DoctorPatient.patient_id == patient_id,
            DoctorPatient.is_active == True
        ).first()
        if not is_assigned:
            return None

    memo = PatientMemo(
        doctor_id=doctor.id,
        patient_id=patient_id,
        content=content
    )
    db.add(memo)
    db.commit()
    db.refresh(memo)
    return {
        "id": memo.id,
        "doctor_id": memo.doctor_id,
        "content": memo.content,
        "created_at": memo.created_at
    }
