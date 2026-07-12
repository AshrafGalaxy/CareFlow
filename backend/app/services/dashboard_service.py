import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User
from app.models.doctor import DoctorPatient
from app.models.provider import ProviderPatient
from app.models.medication import Medication, MedicationLog
from app.models.follow_up import FollowUp
from app.models.report import Report
from app.models.memo import PatientMemo
from app.models.analytics import PatientAnalytics
from app.schemas.dashboard import DashboardKPIsResponse, NextMedication, NextAppointment, ActionItem, LatestMemo


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
    
    # Only active medications that have started and haven't ended
    patient_meds = db.query(Medication).filter(
        Medication.user_id == patient.id, 
        Medication.is_active == True,
        Medication.start_date <= today,
    ).all()
    # Filter by end_date in python
    patient_meds = [m for m in patient_meds if not m.end_date or m.end_date >= today]
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
        ).all()
        
        # Build dynamic schedule
        schedule = []
        for m in patient_meds:
            medications_today_total += len(m.times_of_day or [])
            for t_str in (m.times_of_day or []):
                try:
                    t_obj = datetime.strptime(t_str, "%H:%M").time()
                    dt = datetime.combine(today, t_obj, tzinfo=timezone.utc)
                    # Check if there is a log for this specific med and time (within 1 hr window for matching)
                    log = next((l for l in today_logs if l.medication_id == m.id and abs((l.scheduled_time - dt).total_seconds()) < 3600), None)
                    status = log.status if log else "scheduled"
                    if status == "taken":
                        medications_today_taken += 1
                        
                    schedule.append({
                        "med": m,
                        "scheduled_time": dt,
                        "status": status
                    })
                except Exception:
                    pass
                    
        schedule.sort(key=lambda x: x["scheduled_time"])
        
        for item in schedule:
            if item["status"] in ["scheduled", "pending"]:
                # Only show if it's the next one upcoming today
                if item["scheduled_time"] >= now_utc or item["status"] == "scheduled":
                    next_medication = NextMedication(
                        id=str(item["med"].id),
                        name=item["med"].name,
                        scheduled_time=item["scheduled_time"],
                        status=item["status"]
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

    # 3. Health Score & Action Items
    action_items = []
    
    analytics = db.query(PatientAnalytics).filter(PatientAnalytics.patient_id == patient.id).first()
    if not analytics:
        analytics = _sync_patient_analytics(patient.id, db)
        
    adherence_score = analytics.adherence_rate_30d * 0.5
    if not patient_med_ids:
        adherence_score = 50.0 # No meds = perfect adherence score
        
    recent_report = db.query(Report).filter(
        Report.user_id == patient.id,
        Report.processing_status == 'done'
    ).order_by(Report.uploaded_at.desc()).first()
    
    biomarker_score = 50.0
    if recent_report and recent_report.ai_highlights:
        highlights = recent_report.ai_highlights
        total_biomarkers = len(highlights)
        if total_biomarkers > 0:
            normal_biomarkers = sum(1 for h in highlights if h.get("status", "normal").lower() == "normal")
            biomarker_score = (normal_biomarkers / total_biomarkers) * 50.0
            
        # Action items from report
        if recent_report.actionable_insights:
            for insight in recent_report.actionable_insights:
                if insight.get("type") in ["warning", "action_required"]:
                    action_items.append(ActionItem(
                        title=insight.get("title", "Health Alert"),
                        description=insight.get("content_simple", "Please review your recent report."),
                        type="warning",
                        action_url=f"/reports/{recent_report.id}",
                        action_label="View Report"
                    ))
                    
    health_score = int(adherence_score + biomarker_score)
    
    # Action item for adherence
    if analytics.adherence_rate_30d > 0 and analytics.adherence_rate_30d < 80 and patient_med_ids:
        action_items.append(ActionItem(
            title="Medication Adherence Low",
            description=f"Your recent adherence is {analytics.adherence_rate_30d}%. Please make sure to take your medications on time.",
            type="warning",
            action_url="/medications",
            action_label="View Schedule"
        ))
        
    # Action item for appointments
    if next_follow_up:
        days_until = (next_follow_up.appointment_date - now_utc).days
        if 0 <= days_until <= 3:
            action_items.append(ActionItem(
                title="Upcoming Appointment",
                description=f"You have an appointment with Dr. {next_follow_up.doctor_name} in {days_until} day(s).",
                type="info",
                action_url="/dashboard",
                action_label="View Details"
            ))

    # 4. Latest Memo
    latest_memo_obj = db.query(PatientMemo).filter(
        PatientMemo.patient_id == patient.id
    ).order_by(PatientMemo.created_at.desc()).first()
    
    latest_memo = None
    if latest_memo_obj:
        doctor_obj = db.query(User).filter(User.id == latest_memo_obj.doctor_id).first()
        if doctor_obj:
            latest_memo = LatestMemo(
                id=str(latest_memo_obj.id),
                doctor_name=doctor_obj.name,
                content=latest_memo_obj.content,
                created_at=latest_memo_obj.created_at
            )

    return DashboardKPIsResponse(
        medications_today_total=medications_today_total,
        medications_today_taken=medications_today_taken,
        health_score=health_score,
        action_items=action_items,
        next_medication=next_medication,
        next_appointment=next_appointment,
        latest_memo=latest_memo
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
            ProviderPatient, ProviderPatient.patient_id == User.id
        ).filter(
            ProviderPatient.provider_id == doctor.id,
            ProviderPatient.is_active == True
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
        
        # Get active medications for preview
        active_meds = db.query(Medication).filter(
            Medication.user_id == patient.id,
            Medication.is_active == True
        ).all()
        meds_data = [{
            "id": m.id,
            "name": m.name,
            "dosage": m.dosage,
            "frequency": m.frequency
        } for m in active_meds]

        result.append({
            "patient_id": patient.id,
            "name": patient.name,
            "email": patient.email,
            "medication_adherence_rate": analytics.adherence_rate_30d,
            "pending_follow_ups": analytics.pending_follow_ups_count,
            "recent_report_id": recent_report_id,
            "active_medications": meds_data
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
            ProviderPatient, ProviderPatient.patient_id == User.id
        ).filter(
            ProviderPatient.provider_id == doctor.id,
            ProviderPatient.is_active == True
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
            p.patient_id for p in db.query(ProviderPatient).filter(
                ProviderPatient.provider_id == doctor.id,
                ProviderPatient.is_active == True
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
        is_assigned = db.query(ProviderPatient).filter(
            ProviderPatient.provider_id == doctor.id,
            ProviderPatient.patient_id == patient_id,
            ProviderPatient.is_active == True
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
        "phone": patient.phone,
        "blood_group": patient.blood_group,
        "height": patient.height,
        "weight": patient.weight,
        "medications": medications_list,
        "reports": reports_list,
        "follow_ups": follow_ups_list,
        "memos": memos_list
    }

async def add_patient_memo(patient_id: uuid.UUID, doctor: User, content: str, db: Session):
    if doctor.role != "admin":
        is_assigned = db.query(ProviderPatient).filter(
            ProviderPatient.provider_id == doctor.id,
            ProviderPatient.patient_id == patient_id,
            ProviderPatient.is_active == True
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


async def get_unassigned_patients(provider: User, db: Session):
    """
    Get a list of active patients who are not currently assigned to the provider.
    """
    assigned_subquery = db.query(ProviderPatient.patient_id).filter(
        ProviderPatient.provider_id == provider.id,
        ProviderPatient.is_active == True
    )
    unassigned_patients = db.query(User).filter(
        User.role == "patient",
        User.is_active == True,
        ~User.id.in_(assigned_subquery)
    ).all()

    return [
        {
            "patient_id": p.id,
            "name": p.name,
            "email": p.email
        } for p in unassigned_patients
    ]


async def assign_patient(provider_id: uuid.UUID, patient_id: uuid.UUID, db: Session):
    """
    Assign a patient to a provider. Sets is_active=True on ProviderPatient association.
    """
    patient = db.query(User).filter(User.id == patient_id, User.role == "patient", User.is_active == True).first()
    if not patient:
        return None

    rel = db.query(ProviderPatient).filter(
        ProviderPatient.provider_id == provider_id,
        ProviderPatient.patient_id == patient_id
    ).first()

    if rel:
        rel.is_active = True
    else:
        rel = ProviderPatient(
            provider_id=provider_id,
            patient_id=patient_id,
            is_active=True
        )
        db.add(rel)

    db.commit()
    db.refresh(rel)
    return rel


async def remove_patient(provider_id: uuid.UUID, patient_id: uuid.UUID, db: Session):
    """
    Remove a patient from a provider (soft-remove relationship by setting is_active=False).
    """
    rel = db.query(ProviderPatient).filter(
        ProviderPatient.provider_id == provider_id,
        ProviderPatient.patient_id == patient_id,
        ProviderPatient.is_active == True
    ).first()

    if not rel:
        return False

    rel.is_active = False
    db.commit()
    return True


async def get_recent_reports(provider: User, db: Session, limit: int = 5):
    """
    Get the most recent reports uploaded by patients assigned to the provider.
    """
    if provider.role == "admin":
        patient_ids_sub = db.query(User.id).filter(User.role == "patient", User.is_active == True)
    else:
        patient_ids_sub = db.query(ProviderPatient.patient_id).filter(
            ProviderPatient.provider_id == provider.id,
            ProviderPatient.is_active == True
        )

    reports = db.query(Report, User.name).join(
        User, User.id == Report.user_id
    ).filter(
        Report.user_id.in_(patient_ids_sub)
    ).order_by(
        Report.uploaded_at.desc()
    ).limit(limit).all()

    return [
        {
            "id": r.Report.id,
            "patient_name": r.name,
            "original_filename": r.Report.original_filename,
            "file_type": r.Report.file_type,
            "processing_status": r.Report.processing_status,
            "uploaded_at": r.Report.uploaded_at
        } for r in reports
    ]


async def get_upcoming_followups(provider: User, db: Session, limit: int = 5):
    """
    Get upcoming follow-ups scheduled for patients assigned to the provider.
    """
    if provider.role == "admin":
        patient_ids_sub = db.query(User.id).filter(User.role == "patient", User.is_active == True)
    else:
        patient_ids_sub = db.query(ProviderPatient.patient_id).filter(
            ProviderPatient.provider_id == provider.id,
            ProviderPatient.is_active == True
        )

    now_utc = datetime.now(timezone.utc)
    followups = db.query(FollowUp, User.name).join(
        User, User.id == FollowUp.user_id
    ).filter(
        FollowUp.user_id.in_(patient_ids_sub),
        FollowUp.status == "scheduled",
        FollowUp.appointment_date >= now_utc
    ).order_by(
        FollowUp.appointment_date.asc()
    ).limit(limit).all()

    return [
        {
            "id": f.FollowUp.id,
            "patient_name": f.name,
            "doctor_name": f.FollowUp.doctor_name,
            "specialty": f.FollowUp.specialty,
            "appointment_date": f.FollowUp.appointment_date,
            "status": f.FollowUp.status
        } for f in followups
    ]
