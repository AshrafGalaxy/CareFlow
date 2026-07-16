"""
conftest.py — Shared pytest fixtures for CareFlow API test suite.
Uses an in-memory SQLite database so tests are fully isolated from production.
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# ── Use SQLite in-memory for full test isolation ──────────────────────────────
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ── Override DB dependency before importing the app ────────────────────────────
from app.database import Base, get_db

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import all models so Base.metadata knows about all tables
import app.models.user
import app.models.provider
import app.models.provider_profile
import app.models.medication
import app.models.follow_up
import app.models.report
import app.models.memo
import app.models.appointment
import app.models.timeline
import app.models.insurance
import app.models.chat
import app.models.analytics
import app.models.audit

from main import app
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function", autouse=True)
def create_tables():
    """Create all tables before each test and drop them after, ensuring complete isolation."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def client():
    """Provide a single TestClient for the entire test session to avoid starting/stopping lifespan repeatedly."""
    with TestClient(app) as c:
        yield c
