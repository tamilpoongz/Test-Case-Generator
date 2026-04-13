import pytest
from app.main import app as fastapi_app
from fastapi.testclient import TestClient


@pytest.fixture
def app():
    """Fixture for FastAPI application."""
    return fastapi_app


@pytest.fixture
def client():
    """Fixture for test client."""
    return TestClient(fastapi_app)


@pytest.fixture
def sample_user_story():
    """Fixture for sample user story request."""
    return {
        "title": "User Registration Form Submission",
        "description": "As a new user, I want to submit a registration form so that I can create an account. The system should validate all fields and provide clear feedback.",
        "acceptance_criteria": [
            "System validates email format before accepting",
            "System rejects duplicate email addresses",
            "System sends confirmation email after successful registration",
            "User receives clear error messages for invalid inputs"
        ]
    }
