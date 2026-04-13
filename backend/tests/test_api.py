import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/api/testcases/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_generate_test_cases_invalid_input():
    """Test generation with invalid input."""
    response = client.post(
        "/api/testcases/generate",
        json={
            "title": "short",  # Too short
            "description": "description",  # Too short
            "acceptance_criteria": []  # Empty
        }
    )
    assert response.status_code == 422  # Validation error


def test_generate_test_cases_missing_fields():
    """Test generation with missing fields."""
    response = client.post(
        "/api/testcases/generate",
        json={
            "title": "Valid Title with More Characters"
        }
    )
    assert response.status_code == 422  # Missing required fields


def test_download_without_test_cases():
    """Test download endpoint without test cases."""
    response = client.post(
        "/api/testcases/download",
        json={
            "format": "csv",
            "test_cases": []
        }
    )
    assert response.status_code == 400
    assert "No test cases" in response.json()["detail"]
