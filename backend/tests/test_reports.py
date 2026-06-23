import io
from unittest.mock import patch

def test_upload_report(client, auth_headers):
    file_content = b"Fake PDF content"
    file = io.BytesIO(file_content)
    file.name = "test_report.pdf"

    # Mock the cloudinary upload to avoid actual network calls
    with patch("app.routers.reports.upload_file", return_value="https://res.cloudinary.com/fake/image/upload/v1/fake/test_report.pdf"):
        response = client.post(
            "/api/reports/upload",
            files={"file": ("test_report.pdf", file, "application/pdf")},
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["file_url"] == "https://res.cloudinary.com/fake/image/upload/v1/fake/test_report.pdf"
        assert data["processing_status"] == "pending"

def test_upload_invalid_type(client, auth_headers):
    file_content = b"Fake text content"
    file = io.BytesIO(file_content)
    
    response = client.post(
        "/api/reports/upload",
        files={"file": ("test_report.txt", file, "text/plain")},
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]

def test_upload_too_large(client, auth_headers):
    # Simulate a file larger than 10MB
    large_file_content = b"0" * (11 * 1024 * 1024)
    file = io.BytesIO(large_file_content)
    
    response = client.post(
        "/api/reports/upload",
        files={"file": ("large_report.pdf", file, "application/pdf")},
        headers=auth_headers
    )
    assert response.status_code == 413
    assert "too large" in response.json()["detail"]

def test_get_reports(client, auth_headers):
    response = client.get("/api/reports/", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_report_not_owner(client):
    # Create a second user
    client.post("/api/auth/register", json={
        "email": "other_user@example.com",
        "password": "testpassword",
        "name": "Other User",
        "role": "patient"
    })
    
    response = client.post("/api/auth/login", json={
        "email": "other_user@example.com",
        "password": "testpassword"
    })
    other_token = response.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}
    
    # Try to access a non-existent report (or one that belongs to first user)
    # The UUID below is random, so it will return 404
    import uuid
    random_uuid = str(uuid.uuid4())
    response = client.get(f"/api/reports/{random_uuid}", headers=other_headers)
    assert response.status_code == 404
