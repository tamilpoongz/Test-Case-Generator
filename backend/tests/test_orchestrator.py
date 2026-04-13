import pytest
from app.models.request import UserStoryRequest
from app.core.orchestrator import get_orchestrator


# Note: These tests require a valid OpenAI API key
# They will make actual LLM calls

@pytest.mark.asyncio
async def test_orchestrator_with_sample_input():
    """Test orchestrator with real LLM (requires API key)."""
    
    request = UserStoryRequest(
        title="User Login with Email Validation",
        description="As a user, I want to log in with my email and password so that I can access my account securely.",
        acceptance_criteria=[
            "System validates email format is correct",
            "System rejects login with incorrect password",
            "System shows clear error messages",
        ]
    )
    
    orchestrator = get_orchestrator()
    response = orchestrator.generate(request)
    
    # Verify response structure
    assert response.status == "success"
    assert len(response.draft_test_cases) > 0
    assert response.summary is not None
    assert response.summary.total_test_cases > 0
    
    # Verify test cases have required fields
    for tc in response.draft_test_cases:
        assert tc.test_case_id
        assert tc.test_case_title
        assert tc.test_type
        assert len(tc.test_steps) > 0
        assert tc.expected_result
        assert 0.0 <= tc.confidence_score <= 1.0


def test_orchestrator_error_handling(client):
    """Test orchestrator handles errors gracefully."""
    
    # Test with invalid input
    response = client.post(
        "/api/testcases/generate",
        json={
            "title": "x" * 10,  # Minimum valid
            "description": "y" * 20,  # Minimum valid
            "acceptance_criteria": ["z" * 15]  # Minimum valid
        }
    )
    
    # Should succeed or provide clear error
    assert response.status_code in [200, 422]
