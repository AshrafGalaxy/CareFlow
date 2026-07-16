"""
PHASE 3 TESTS — Reports, AI Chat, and Timeline
Covers: Document uploads, chat interactions, and timeline retrieval.
"""
import pytest
import uuid
from datetime import datetime, timezone
from tests.conftest import TestingSessionLocal
from app.models.provider import ProviderPatient


@pytest.fixture()
def phase3_actors(client):
    for payload in [
        {"email": "doc3@test.com", "password": "Test@1234", "name": "Dr. Smith", "role": "doctor"},
        {"email": "pat3@test.com", "password": "Test@1234", "name": "Charlie", "role": "patient"},
    ]:
        client.post("/api/auth/register", json=payload)

    def login(email):
        r = client.post("/api/auth/login", json={"email": email, "password": "Test@1234"})
        return {"Authorization": f"Bearer {r.json()['access_token']}"}

    doc_h = login("doc3@test.com")
    pat_h = login("pat3@test.com")

    doc_id = client.get("/api/auth/me", headers=doc_h).json()["id"]
    pat_id = client.get("/api/auth/me", headers=pat_h).json()["id"]

    db = TestingSessionLocal()
    db.add(ProviderPatient(provider_id=uuid.UUID(doc_id), patient_id=uuid.UUID(pat_id), is_active=True))
    db.commit()
    db.close()

    return {"doc": doc_h, "pat": pat_h, "doc_id": doc_id, "pat_id": pat_id}


# ── Reports ───────────────────────────────────────────────────────────────────

def test_patient_can_get_reports(client, phase3_actors):
    # Testing the endpoint to get reports, even if empty initially
    res = client.get("/api/reports/", headers=phase3_actors["pat"])
    assert res.status_code == 200
    assert isinstance(res.json(), list)


# ── Chat ──────────────────────────────────────────────────────────────────────

def test_patient_chat_sessions(client, phase3_actors):
    res = client.get("/api/chat/sessions", headers=phase3_actors["pat"])
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_chat_message_requires_payload(client, phase3_actors):
    session_id = uuid.uuid4()
    res = client.post(f"/api/chat/{session_id}/message", json={}, headers=phase3_actors["pat"])
    assert res.status_code == 422  # Unprocessable Entity (missing message)


# ── Timeline ──────────────────────────────────────────────────────────────────

def test_patient_can_get_timeline(client, phase3_actors):
    res = client.get("/api/timeline/", headers=phase3_actors["pat"])
    assert res.status_code == 200
    data = res.json()
    assert "events" in data
    assert "total" in data

def test_patient_can_get_timeline_summary(client, phase3_actors):
    res = client.get("/api/timeline/summary", headers=phase3_actors["pat"])
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data
