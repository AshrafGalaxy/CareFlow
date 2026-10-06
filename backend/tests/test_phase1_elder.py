import pytest
from fastapi.testclient import TestClient
from app.models.user import User
from app.services.auth_service import create_access_token

def get_auth_headers(client, db_session, email="elder_test@example.com", role="PATIENT"):
    user = db_session.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash="hashedpassword",
            name="Elder Test Patient",
            role=role
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}, user

def test_today_checklist(client: TestClient):
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    headers, user = get_auth_headers(client, db)
    db.close()

    res = client.get("/api/v1/checklist/today", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "item" in data[0]
    assert data[0]["status"] == "PENDING"

def test_complete_and_skip_checklist_item(client: TestClient):
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    headers, user = get_auth_headers(client, db)
    db.close()

    # Get items
    res = client.get("/api/v1/checklist/today", headers=headers)
    items = res.json()
    log_id_1 = items[0]["id"]
    log_id_2 = items[1]["id"]

    # Complete item 1
    res_complete = client.post(f"/api/v1/checklist/{log_id_1}/complete", headers=headers)
    assert res_complete.status_code == 200
    assert res_complete.json()["status"] == "COMPLETED"

    # Skip item 2
    res_skip = client.post(f"/api/v1/checklist/{log_id_2}/skip", headers=headers)
    assert res_skip.status_code == 200
    assert res_skip.json()["status"] == "SKIPPED"

def test_submit_and_get_checkin(client: TestClient):
    from tests.conftest import TestingSessionLocal
    db = TestingSessionLocal()
    headers, user = get_auth_headers(client, db)
    db.close()

    payload = {
        "wellness_status": "GOOD",
        "mood": "happy",
        "notes": "Feeling energized and slept well."
    }

    res_post = client.post("/api/v1/checkins", json=payload, headers=headers)
    assert res_post.status_code == 201
    res_data = res_post.json()
    assert res_data["wellness_status"] == "GOOD"
    assert res_data["mood"] == "happy"

    res_history = client.get("/api/v1/checkins/history", headers=headers)
    assert res_history.status_code == 200
    history = res_history.json()
    assert len(history) >= 1
    assert history[0]["wellness_status"] == "GOOD"
