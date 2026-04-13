from pydantic import BaseModel, Field, field_validator


class UserStoryRequest(BaseModel):
    """Input model for test case generation request."""
    
    title: str = Field(
        ...,
        min_length=10,
        max_length=200,
        description="User story title (10-200 characters)"
    )
    description: str = Field(
        ...,
        min_length=20,
        max_length=2000,
        description="User story description (20-2000 characters)"
    )
    acceptance_criteria: list[str] = Field(
        ...,
        min_items=1,
        max_items=10,
        description="List of acceptance criteria (1-10 items, each 15-500 chars)"
    )
    
    @field_validator('title', 'description')
    @classmethod
    def strip_whitespace(cls, v):
        """Strip leading/trailing whitespace from strings."""
        return v.strip()
    
    @field_validator('acceptance_criteria', mode='before')
    @classmethod
    def validate_criteria_list(cls, v):
        """Validate acceptance criteria list format and content."""
        if not isinstance(v, list):
            raise ValueError("Acceptance criteria must be a list")
        
        # Filter and validate each item
        validated_items = []
        for item in v:
            if not isinstance(item, str):
                raise ValueError("Each acceptance criteria item must be a string")
            
            stripped_item = item.strip()
            
            if not stripped_item:
                continue  # Skip empty items
            
            if len(stripped_item) < 5:
                raise ValueError(f"Each acceptance criteria must be at least 5 characters, got: '{stripped_item}'")
            
            if len(stripped_item) > 500:
                raise ValueError(f"Each acceptance criteria must be at most 500 characters, got: '{stripped_item[:50]}...'")
            
            validated_items.append(stripped_item)
        
        if not validated_items:
            raise ValueError("Acceptance criteria cannot be empty")
        
        return validated_items
    
    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "title": "User Login Feature",
                "description": "As a user, I want to login to the system with my email and password so that I can access my account securely",
                "acceptance_criteria": [
                    "User can login with valid credentials",
                    "System shows error for invalid credentials",
                    "Account gets locked after 3 failed attempts"
                ]
            }
        }


class DownloadRequest(BaseModel):
    """Request model for downloading test cases."""
    
    format: str = Field(
        default="csv",
        pattern="^(csv|json)$",
        description="Export format (csv or json)"
    )
    test_cases: list[dict] = Field(
        default_factory=list,
        description="Test cases to export"
    )

    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "format": "csv",
                "test_cases": [
                    {
                        "test_case_id": "TC-001",
                        "test_case_title": "Verify login with valid credentials",
                        "test_type": "Positive",
                        "priority": "High",
                        "preconditions": ["User account exists"],
                        "test_steps": ["Enter credentials", "Click login"],
                        "test_data": ["Valid email", "Valid password"],
                        "expected_result": "User is logged in",
                        "confidence_score": 0.95,
                        "review_status": "Draft"
                    }
                ]
            }
        }
