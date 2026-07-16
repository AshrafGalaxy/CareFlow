"""
PHASE 2 TESTS — Medications & Follow-ups
"""
import pytest
import uuid
from datetime import datetime, timedelta, timezone
from tests.conftest import TestingSessionLocal
from app.models.provider import ProviderPatient


@pytest.fixture()
def phase2_actors(client):
    for payload in [
        {"email": "doc2@test.com", "password": "Test@1234", "name": "Dr. Bob", "role": "doctor"},
        {"email": "pat2@test.com", "password": "Test@1234", "name": "Alice", "role": "patient"},
        {"email": "stranger2@test.com", "password": "Test@1234", "name": "Stranger", "role": "patient"},
    ]:
        client.post("/api/auth/register", json=payload)

    def login(email):
        r = client.post("/api/auth/login", json={"email": email, "password": "Test@1234"})
        return {"Authorization": f"Bearer {r.json()['access_token']}"}

    doc_h = login("doc2@test.com")
    pat_h = login("pat2@test.com")
    str_h = login("stranger2@test.com")

    doc_id = client.get("/api/auth/me", headers=doc_h).json()["id"]
    pat_id = client.get("/api/auth/me", headers=pat_h).json()["id"]

    db = TestingSessionLocal()
    db.add(ProviderPatient(provider_id=uuid.UUID(doc_id), patient_id=uuid.UUID(pat_id), is_active=True))
    db.commit()
    db.close()

    return {"doc": doc_h, "pat": pat_h, "stranger": str_h, "doc_id": doc_id, "pat_id": pat_id}


def med_payload(**overrides):
    base = {
        "name": "Aspirin", "dosage": "75mg", "frequency": "Once daily",
        "times_of_day": ["08:00"],
        "start_date": datetime.now(timezone.utc).date().isoformat(),
    }
    return {**base, **overrides}


def future(days=5):
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


# ── Medications ───────────────────────────────────────────────────────────────

def test_doctor_adds_medication_for_patient(client, phase2_actors):
    res = client.post("/api/medications/", json=med_payload(patient_id=phase2_actors["pat_id"]), headers=phase2_actors["doc"])
    assert res.status_code == 200
    assert res.json()["user_id"] == phase2_actors["pat_id"]


def test_doctor_cannot_add_med_for_unassigned_patient(client, phase2_actors):
    sid = client.get("/api/auth/me", headers=phase2_actors["stranger"]).json()["id"]
    res = client.post("/api/medications/", json=med_payload(patient_id=sid), headers=phase2_actors["doc"])
    assert res.status_code in (403, 404)


def test_patient_sees_own_medications(client, phase2_actors):
    client.post("/api/medications/", json=med_payload(patient_id=phase2_actors["pat_id"]), headers=phase2_actors["doc"])
    res = client.get("/api/medications/", headers=phase2_actors["pat"])
    assert res.status_code == 200
    assert any(m["name"] == "Aspirin" for m in res.json())


def test_stranger_cannot_see_patient_meds(client, phase2_actors):
    client.post("/api/medications/", json=med_payload(patient_id=phase2_actors["pat_id"]), headers=phase2_actors["doc"])
    res = client.get("/api/medications/", headers=phase2_actors["stranger"])
    assert all(m["user_id"] != phase2_actors["pat_id"] for m in res.json())


def test_doctor_approve_medication(client, phase2_actors):
    # Patient creates a med, so it is pending
    med = client.post("/api/medications/", json=med_payload(name="Metformin"), headers=phase2_actors["pat"]).json()
    res = client.post(f"/api/medications/{med['id']}/approve", headers=phase2_actors["doc"])
    assert res.status_code == 200
    assert res.json()["status"] == "active"


def test_doctor_reject_medication(client, phase2_actors):
    # Patient creates a med, so it is pending
    med = client.post("/api/medications/", json=med_payload(name="Warfarin"), headers=phase2_actors["pat"]).json()
    res = client.post(f"/api/medications/{med['id']}/reject", headers=phase2_actors["doc"])
    assert res.status_code == 200
    assert res.json()["status"] == "rejected"


# ── Follow-ups ────────────────────────────────────────────────────────────────

def test_patient_requests_followup(client, phase2_actors):
    res = client.post("/api/follow-ups/", json={"appointment_date": future(), "notes": "Checkup needed"}, headers=phase2_actors["pat"])
    assert res.status_code == 200
    assert res.json()["status"] == "requested"


def test_doctor_schedules_followup(client, phase2_actors):
    res = client.post("/api/follow-ups/", json={"appointment_date": future(7), "patient_id": phase2_actors["pat_id"], "doctor_name": "Dr. Bob"}, headers=phase2_actors["doc"])
    assert res.status_code == 200
    assert res.json()["status"] == "scheduled"


def test_doctor_cannot_schedule_for_unassigned(client, phase2_actors):
    sid = client.get("/api/auth/me", headers=phase2_actors["stranger"]).json()["id"]
    res = client.post("/api/follow-ups/", json={"appointment_date": future(), "patient_id": sid}, headers=phase2_actors["doc"])
    assert res.status_code == 403


def test_patient_sees_own_followups(client, phase2_actors):
    client.post("/api/follow-ups/", json={"appointment_date": future()}, headers=phase2_actors["pat"])
    res = client.get("/api/follow-ups/", headers=phase2_actors["pat"])
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_patient_confirms_followup(client, phase2_actors):
    fu = client.post("/api/follow-ups/", json={"appointment_date": future(10), "patient_id": phase2_actors["pat_id"]}, headers=phase2_actors["doc"]).json()
    res = client.post(f"/api/follow-ups/{fu['id']}/confirm", headers=phase2_actors["pat"])
    assert res.status_code == 200
    assert res.json()["status"] == "confirmed"


def test_patient_declines_followup(client, phase2_actors):
    fu = client.post("/api/follow-ups/", json={"appointment_date": future(10), "patient_id": phase2_actors["pat_id"]}, headers=phase2_actors["doc"]).json()
    res = client.post(f"/api/follow-ups/{fu['id']}/decline", json={"decline_reason": "Work conflict"}, headers=phase2_actors["pat"])
    assert res.status_code == 200
    assert res.json()["status"] == "declined"


def test_doctor_schedules_slot_on_patient_request(client, phase2_actors):
    fu = client.post("/api/follow-ups/", json={"appointment_date": future()}, headers=phase2_actors["pat"]).json()
    assert fu["status"] == "requested"
    res = client.post(f"/api/follow-ups/{fu['id']}/schedule", json={"appointment_date": future(3), "notes": "10am slot"}, headers=phase2_actors["doc"])
    assert res.status_code == 200
    assert res.json()["status"] == "scheduled"


def test_patient_cannot_schedule_for_others(client, phase2_actors):
    sid = client.get("/api/auth/me", headers=phase2_actors["stranger"]).json()["id"]
    res = client.post("/api/follow-ups/", json={"appointment_date": future(), "patient_id": sid}, headers=phase2_actors["pat"])
    assert res.status_code == 403
