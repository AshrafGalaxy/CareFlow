def test_register_success(client):
    response = client.post("/api/auth/register", json={
        "email": "new_user@example.com",
        "password": "testpassword",
        "name": "New User",
        "role": "patient"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "new_user@example.com"
    assert "id" in data

def test_register_duplicate_email(client):
    # Relies on setup from conftest or previous test
    response = client.post("/api/auth/register", json={
        "email": "test_user@example.com",
        "password": "testpassword",
        "name": "Test User",
        "role": "patient"
    })
    assert response.status_code == 400

def test_login_success(client):
    response = client.post("/api/auth/login", json={
        "email": "test_user@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

def test_login_wrong_password(client):
    response = client.post("/api/auth/login", json={
        "email": "test_user@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_login_wrong_email(client):
    response = client.post("/api/auth/login", json={
        "email": "notfound@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 401

def test_protected_route_without_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_protected_route_with_token(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test_user@example.com"
