"""
PHASE 1 TESTS — Authentication & User Management
Covers: register, login, token refresh, profile CRUD, password change, account deletion,
        role-based access guards, and duplicate-email prevention.
"""
import pytest


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

PATIENT = {"email": "p1@test.com", "password": "Test@1234", "name": "Alice Patient", "role": "patient"}
DOCTOR  = {"email": "d1@test.com", "password": "Test@1234", "name": "Dr. Bob", "role": "doctor"}


def register_and_login(client, payload: dict) -> dict:
    """Register a user and return login token headers."""
    reg = client.post("/api/auth/register", json=payload)
    assert reg.status_code == 200, reg.text
    login = client.post("/api/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}", "login_data": login.json()}


# ─────────────────────────────────────────────────────────────────────────────
# Registration
# ─────────────────────────────────────────────────────────────────────────────

class TestRegistration:
    def test_register_patient_success(self, client):
        res = client.post("/api/auth/register", json=PATIENT)
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == PATIENT["email"]
        assert data["role"] == "patient"
        assert "id" in data

    def test_register_doctor_success(self, client):
        res = client.post("/api/auth/register", json=DOCTOR)
        assert res.status_code == 200
        data = res.json()
        assert data["role"] == "doctor"

    def test_register_duplicate_email_rejected(self, client):
        client.post("/api/auth/register", json=PATIENT)
        res = client.post("/api/auth/register", json=PATIENT)
        assert res.status_code == 400
        assert "already registered" in res.json()["detail"].lower()

    def test_register_invalid_email_rejected(self, client):
        bad = {**PATIENT, "email": "not-an-email"}
        res = client.post("/api/auth/register", json=bad)
        assert res.status_code == 422

    def test_register_missing_required_fields(self, client):
        res = client.post("/api/auth/register", json={"email": "x@x.com"})
        assert res.status_code == 422


# ─────────────────────────────────────────────────────────────────────────────
# Login
# ─────────────────────────────────────────────────────────────────────────────

class TestLogin:
    def test_login_success(self, client):
        client.post("/api/auth/register", json=PATIENT)
        res = client.post("/api/auth/login", json={"email": PATIENT["email"], "password": PATIENT["password"]})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["role"] == "patient"

    def test_login_wrong_password(self, client):
        client.post("/api/auth/register", json=PATIENT)
        res = client.post("/api/auth/login", json={"email": PATIENT["email"], "password": "wrongpass"})
        assert res.status_code == 401

    def test_login_nonexistent_email(self, client):
        res = client.post("/api/auth/login", json={"email": "ghost@test.com", "password": "anything"})
        assert res.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# Token Refresh
# ─────────────────────────────────────────────────────────────────────────────

class TestTokenRefresh:
    def test_refresh_token_returns_new_access_token(self, client):
        client.post("/api/auth/register", json=PATIENT)
        login = client.post("/api/auth/login", json={"email": PATIENT["email"], "password": PATIENT["password"]}).json()
        res = client.post("/api/auth/refresh", json={"refresh_token": login["refresh_token"]})
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_invalid_refresh_token_rejected(self, client):
        res = client.post("/api/auth/refresh", json={"refresh_token": "garbage.token.here"})
        assert res.status_code in (401, 422)


# ─────────────────────────────────────────────────────────────────────────────
# Profile
# ─────────────────────────────────────────────────────────────────────────────

class TestProfile:
    def test_get_me(self, client):
        result = register_and_login(client, PATIENT)
        headers = {k: v for k, v in result.items() if k != "login_data"}
        res = client.get("/api/auth/me", headers=headers)
        assert res.status_code == 200
        assert res.json()["email"] == PATIENT["email"]

    def test_unauthenticated_me_rejected(self, client):
        res = client.get("/api/auth/me")
        assert res.status_code == 401

    def test_update_profile_name_and_phone(self, client):
        result = register_and_login(client, PATIENT)
        headers = {k: v for k, v in result.items() if k != "login_data"}
        res = client.patch("/api/auth/profile", json={"name": "Alice Updated", "phone": "+919876543210"}, headers=headers)
        assert res.status_code == 200
        assert res.json()["name"] == "Alice Updated"
        assert res.json()["phone"] == "+919876543210"

    def test_update_doctor_profile_specialization(self, client):
        result = register_and_login(client, DOCTOR)
        headers = {k: v for k, v in result.items() if k != "login_data"}
        res = client.patch("/api/auth/profile", json={"specialization": "Cardiology", "experience_years": 10}, headers=headers)
        assert res.status_code == 200
        assert res.json()["provider_profile"]["specialization"] == "Cardiology"


# ─────────────────────────────────────────────────────────────────────────────
# Password Change
# ─────────────────────────────────────────────────────────────────────────────

class TestPasswordChange:
    def test_change_password_success(self, client):
        result = register_and_login(client, PATIENT)
        headers = {k: v for k, v in result.items() if k != "login_data"}
        res = client.put("/api/auth/password", json={
            "current_password": PATIENT["password"],
            "new_password": "NewPass@5678"
        }, headers=headers)
        assert res.status_code == 200
        assert res.json()["status"] == "success"
        # Verify new password works
        login = client.post("/api/auth/login", json={"email": PATIENT["email"], "password": "NewPass@5678"})
        assert login.status_code == 200

    def test_change_password_wrong_current(self, client):
        result = register_and_login(client, PATIENT)
        headers = {k: v for k, v in result.items() if k != "login_data"}
        res = client.put("/api/auth/password", json={
            "current_password": "wrongpass",
            "new_password": "NewPass@5678"
        }, headers=headers)
        assert res.status_code == 400


# ─────────────────────────────────────────────────────────────────────────────
# Account Deletion
# ─────────────────────────────────────────────────────────────────────────────

class TestAccountDeletion:
    def test_delete_account(self, client):
        result = register_and_login(client, PATIENT)
        headers = {k: v for k, v in result.items() if k != "login_data"}
        res = client.delete("/api/auth/account", headers=headers)
        assert res.status_code == 200
        # After deletion, login should fail
        login = client.post("/api/auth/login", json={"email": PATIENT["email"], "password": PATIENT["password"]})
        assert login.status_code == 401


# ─────────────────────────────────────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────────────────────────────────────

def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
