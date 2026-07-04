import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User
from app.models.doctor import DoctorPatient
from app.models.medication import Medication, MedicationLog
from app.models.follow_up import FollowUp
from app.models.report import Report


async def get_patient_overview(doctor: User, db: Session):
    """
    Get a summary of patients assigned to the doctor (or all patients if admin).
    Includes name, email, 30-day medication adherence rate, pending follow-ups,
    and recent report ID.
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

    now_utc = datetime.now(timezone.utc)
    cutoff_30 = now_utc - timedelta(days=30)

    result = []
    for patient in assigned_patients:
        # Compute medication adherence rate (last 30 days)
        patient_meds = db.query(Medication).filter(Medication.user_id == patient.id).all()
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

        # Count pending follow-ups (future, scheduled)
        pending_follow_ups = db.query(FollowUp).filter(
            FollowUp.user_id == patient.id,
            FollowUp.status == "scheduled",
            FollowUp.appointment_date >= now_utc
        ).count()

        # Get most recent report ID
        recent_report = db.query(Report).filter(
            Report.user_id == patient.id
        ).order_by(Report.uploaded_at.desc()).first()
        recent_report_id = recent_report.id if recent_report else None

        result.append({
            "patient_id": patient.id,
            "name": patient.name,
            "email": patient.email,
            "medication_adherence_rate": adherence_rate,
            "pending_follow_ups": pending_follow_ups,
            "recent_report_id": recent_report_id
        })

    return result


async def get_adherence_analytics(doctor: User, days: int, db: Session):
    """
    Get adherence analytics for the last N days.
    Returns:
    - total_patients
    - overall_adherence (average of patient rates)
    - by_patient (breakdown of rate per patient)
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

    now_utc = datetime.now(timezone.utc)
    cutoff = now_utc - timedelta(days=days)

    total_patients = len(assigned_patients)
    by_patient = []
    rates = []

    for patient in assigned_patients:
        patient_meds = db.query(Medication).filter(Medication.user_id == patient.id).all()
        patient_med_ids = [m.id for m in patient_meds]

        if patient_med_ids:
            logs = db.query(MedicationLog).filter(
                MedicationLog.medication_id.in_(patient_med_ids),
                MedicationLog.scheduled_time >= cutoff
            ).all()
            total_logs = len(logs)
            taken_logs = sum(1 for l in logs if l.status == "taken")
            rate = round((taken_logs / total_logs) * 100, 1) if total_logs > 0 else 0.0
        else:
            rate = 0.0

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
    Get follow-up appointment stats for assigned patients.
    Returns the count of missed follow-ups.
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

    now_utc = datetime.now(timezone.utc)
    
    missed_count = db.query(FollowUp).filter(
        FollowUp.user_id.in_(patient_ids),
        or_(
            FollowUp.status == "missed",
            (FollowUp.status == "scheduled") & (FollowUp.appointment_date < now_utc)
        )
    ).count()

    return {"missed": missed_count}


async def get_patient_detail(patient_id: uuid.UUID, doctor: User, db: Session):
    """
    Get detailed profile of a patient including medications, recent reports, and follow-ups.
    Verifies that the patient is assigned to this doctor (unless doctor is admin).
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

    return {
        "name": patient.name,
        "email": patient.email,
        "medications": medications_list,
        "reports": reports_list,
        "follow_ups": follow_ups_list
    }
