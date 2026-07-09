import pytest
import uuid
from datetime import datetime, timedelta, timezone
from app.models.user import User
from app.models.provider import ProviderPatient
from app.models.medication import Medication, MedicationLog
from app.models.follow_up import FollowUp
from app.models.report import Report
from tests.conftest import TestingSessionLocal

@pytest.fixture
def dashboard_data(client):
    db = TestingSessionLocal()
    # Clean up tables
    db.query(MedicationLog).delete()
    db.query(Medication).delete()
    db.query(FollowUp).delete()
    db.query(Report).delete()
    db.query(ProviderPatient).delete()
    db.query(User).filter(User.email.in_(["doc@example.com", "pat@example.com", "pat2@example.com", "admin@example.com"])).delete()
    db.commit()

    # Create doctor
    doc_res = client.post("/api/auth/register", json={
        "email": "doc@example.com",
        "password": "password123",
        "name": "Dr. House",
        "role": "doctor"
    })
    doc_id = doc_res.json()["id"]

    # Create admin
    admin_res = client.post("/api/auth/register", json={
        "email": "admin@example.com",
        "password": "password123",
        "name": "Admin User",
        "role": "admin"
    })
    admin_id = admin_res.json()["id"]

    # Create patient 1 (assigned to doctor)
    pat1_res = client.post("/api/auth/register", json={
        "email": "pat@example.com",
        "password": "password123",
        "name": "John Doe",
        "role": "patient"
    })
    pat1_id = pat1_res.json()["id"]

    # Create patient 2 (unassigned)
    pat2_res = client.post("/api/auth/register", json={
        "email": "pat2@example.com",
        "password": "password123",
        "name": "Jane Smith",
        "role": "patient"
    })
    pat2_id = pat2_res.json()["id"]

    # Assign patient 1 to doctor
    rel = ProviderPatient(
        provider_id=uuid.UUID(doc_id),
        patient_id=uuid.UUID(pat1_id),
        is_active=True
    )
    db.add(rel)
    db.commit()

    # Add medication for patient 1
    med = Medication(
        user_id=uuid.UUID(pat1_id),
        name="Lisinopril",
        dosage="10mg",
        frequency="Once daily",
        start_date=datetime.now(timezone.utc).date(),
        is_active=True
    )
    db.add(med)
    db.commit()
    db.refresh(med)

    # Add medication logs: 1 taken, 1 missed
    now = datetime.now(timezone.utc)
    log1 = MedicationLog(
        medication_id=med.id,
        scheduled_time=now - timedelta(days=2),
        taken_at=now - timedelta(days=2),
        status="taken"
    )
    log2 = MedicationLog(
        medication_id=med.id,
        scheduled_time=now - timedelta(days=1),
        status="missed"
    )
    db.add_all([log1, log2])

    # Add follow-ups: 1 pending (future), 1 missed (past)
    fu1 = FollowUp(
        user_id=uuid.UUID(pat1_id),
        doctor_name="Dr. House",
        specialty="Diagnostics",
        appointment_date=now + timedelta(days=5),
        status="scheduled"
    )
    fu2 = FollowUp(
        user_id=uuid.UUID(pat1_id),
        doctor_name="Dr. House",
        specialty="Diagnostics",
        appointment_date=now - timedelta(days=3),
        status="scheduled"
    )
    db.add_all([fu1, fu2])

    # Add report for patient 1
    rep = Report(
        user_id=uuid.UUID(pat1_id),
        file_url="http://example.com/report1.pdf",
        file_type="application/pdf",
        original_filename="blood_test.pdf",
        processing_status="done",
        uploaded_at=now - timedelta(days=4)
    )
    db.add(rep)
    db.commit()
    db.refresh(rep)

    db.close()

    # Login to get tokens
    doc_login = client.post("/api/auth/login", json={"email": "doc@example.com", "password": "password123"}).json()
    admin_login = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "password123"}).json()

    return {
        "doc_headers": {"Authorization": f"Bearer {doc_login['access_token']}"},
        "admin_headers": {"Authorization": f"Bearer {admin_login['access_token']}"},
        "patient1_id": pat1_id,
        "patient2_id": pat2_id,
        "report_id": str(rep.id)
    }


def test_list_patients(client, dashboard_data):
    # Doctor should see only assigned patient (patient 1)
    response = client.get("/api/dashboard/patients", headers=dashboard_data["doc_headers"])
    assert response.status_code == 200
    patients = response.json()
    assert len(patients) == 1
    assert patients[0]["name"] == "John Doe"
    assert patients[0]["medication_adherence_rate"] == 50.0
    assert patients[0]["pending_follow_ups"] == 1
    assert patients[0]["recent_report_id"] == dashboard_data["report_id"]

    # Admin should see all patients (including patient 1 and patient 2)
    response_admin = client.get("/api/dashboard/patients", headers=dashboard_data["admin_headers"])
    assert response_admin.status_code == 200
    patients_admin = response_admin.json()
    admin_patient_ids = [p["patient_id"] for p in patients_admin]
    assert len(patients_admin) >= 2
    assert dashboard_data["patient1_id"] in admin_patient_ids
    assert dashboard_data["patient2_id"] in admin_patient_ids


def test_adherence_analytics(client, dashboard_data):
    response = client.get("/api/dashboard/analytics/adherence?days=30", headers=dashboard_data["doc_headers"])
    assert response.status_code == 200
    analytics = response.json()
    assert analytics["total_patients"] == 1
    assert analytics["overall_adherence"] == 50.0
    assert len(analytics["by_patient"]) == 1
    assert analytics["by_patient"][0]["name"] == "John Doe"
    assert analytics["by_patient"][0]["rate"] == 50.0


def test_followup_analytics(client, dashboard_data):
    response = client.get("/api/dashboard/analytics/followups", headers=dashboard_data["doc_headers"])
    assert response.status_code == 200
    stats = response.json()
    assert stats["missed"] == 1


def test_patient_detail(client, dashboard_data):
    # Get details for assigned patient (patient 1)
    pat1_id = dashboard_data["patient1_id"]
    response = client.get(f"/api/dashboard/patients/{pat1_id}", headers=dashboard_data["doc_headers"])
    assert response.status_code == 200
    detail = response.json()
    assert detail["name"] == "John Doe"
    assert len(detail["medications"]) == 1
    assert detail["medications"][0]["name"] == "Lisinopril"
    assert len(detail["reports"]) == 1
    assert detail["reports"][0]["original_filename"] == "blood_test.pdf"
    assert len(detail["follow_ups"]) == 2

    # Attempt to access unassigned patient (patient 2) -> should return 404
    pat2_id = dashboard_data["patient2_id"]
    response_forbidden = client.get(f"/api/dashboard/patients/{pat2_id}", headers=dashboard_data["doc_headers"])
    assert response_forbidden.status_code == 404

    # Admin should bypass assignments and be able to see patient 2
    response_admin = client.get(f"/api/dashboard/patients/{pat2_id}", headers=dashboard_data["admin_headers"])
    assert response_admin.status_code == 200
    detail_admin = response_admin.json()
    assert detail_admin["name"] == "Jane Smith"


def test_unassigned_patients(client, dashboard_data):
    response = client.get("/api/dashboard/patients/unassigned", headers=dashboard_data["doc_headers"])
    assert response.status_code == 200
    unassigned = response.json()
    unassigned_ids = [p["patient_id"] for p in unassigned]
    # Patient 2 is unassigned, Patient 1 is assigned
    assert dashboard_data["patient2_id"] in unassigned_ids
    assert dashboard_data["patient1_id"] not in unassigned_ids


def test_assign_patient(client, dashboard_data):
    pat2_id = dashboard_data["patient2_id"]
    # Assign Patient 2 to Doctor
    response = client.post("/api/dashboard/patients/assign", json={"patient_id": pat2_id}, headers=dashboard_data["doc_headers"])
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Now verify Patient 2 is listed under Doctor's patients
    res_patients = client.get("/api/dashboard/patients", headers=dashboard_data["doc_headers"])
    assert res_patients.status_code == 200
    p_ids = [p["patient_id"] for p in res_patients.json()]
    assert pat2_id in p_ids


def test_remove_patient(client, dashboard_data):
    pat1_id = dashboard_data["patient1_id"]
    # Remove Patient 1 from Doctor
    response = client.post(f"/api/dashboard/patients/{pat1_id}/remove", headers=dashboard_data["doc_headers"])
    assert response.status_code == 200
    assert response.json()["status"] == "success"

    # Verify Patient 1 is no longer listed in Doctor's patients overview
    res_patients = client.get("/api/dashboard/patients", headers=dashboard_data["doc_headers"])
    assert res_patients.status_code == 200
    p_ids = [p["patient_id"] for p in res_patients.json()]
    assert pat1_id not in p_ids


def test_provider_recent_reports(client, dashboard_data):
    response = client.get("/api/dashboard/analytics/reports", headers=dashboard_data["doc_headers"])
    assert response.status_code == 200
    reports = response.json()
    assert len(reports) >= 1
    assert reports[0]["patient_name"] == "John Doe"
    assert reports[0]["original_filename"] == "blood_test.pdf"


def test_provider_upcoming_followups(client, dashboard_data):
    response = client.get("/api/dashboard/analytics/upcoming-followups", headers=dashboard_data["doc_headers"])
    assert response.status_code == 200
    followups = response.json()
    assert len(followups) >= 1
    assert followups[0]["patient_name"] == "John Doe"
    assert followups[0]["doctor_name"] == "Dr. House"


def test_doctor_create_on_behalf_of(client, dashboard_data):
    pat1_id = dashboard_data["patient1_id"]

    # Doctor schedules follow-up on behalf of patient 1
    fu_res = client.post("/api/follow-ups/", json={
        "doctor_name": "Dr. Gregory House",
        "specialty": "Nephrology",
        "appointment_date": (datetime.now(timezone.utc) + timedelta(days=10)).isoformat(),
        "notes": "Renal biopsy follow-up",
        "patient_id": pat1_id
    }, headers=dashboard_data["doc_headers"])
    assert fu_res.status_code == 200
    assert fu_res.json()["user_id"] == pat1_id

    # Doctor adds a medication on behalf of patient 1
    med_res = client.post("/api/medications/", json={
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "Twice daily",
        "times_of_day": ["08:00", "20:00"],
        "start_date": datetime.now(timezone.utc).date().isoformat(),
        "notes": "For type 2 diabetes",
        "patient_id": pat1_id
    }, headers=dashboard_data["doc_headers"])
    assert med_res.status_code == 200
    assert med_res.json()["user_id"] == pat1_id
