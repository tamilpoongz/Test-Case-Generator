from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class TestTypeEnum(str, Enum):
    FUNCTIONAL = "Functional"
    POSITIVE = "Positive"
    NEGATIVE = "Negative"
    BOUNDARY = "Boundary Validation"


class PriorityEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class ReviewStatusEnum(str, Enum):
    DRAFT = "Draft"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class TestCaseResponse(BaseModel):
    """Generated test case model."""
    
    test_case_id: str
    test_case_title: str
    test_type: TestTypeEnum
    preconditions: list[str]
    test_steps: list[str]
    test_data: list[str]
    expected_result: str
    priority: PriorityEnum
    confidence_score: float = Field(ge=0.0, le=1.0)
    review_status: ReviewStatusEnum = ReviewStatusEnum.DRAFT


class GenerationSummary(BaseModel):
    """Summary of generated test cases."""
    
    total_test_cases: int
    functional_count: int
    positive_count: int
    negative_count: int
    boundary_count: int


class GenerationResponse(BaseModel):
    """Response model for test case generation."""
    
    status: str = Field(pattern="^(success|error)$")
    draft_test_cases: list[TestCaseResponse] = Field(default_factory=list)
    summary: Optional[GenerationSummary] = None
    download_supported: bool = True
    download_format: str = "csv"
    message: Optional[str] = None
    error: Optional[str] = None


class ErrorResponse(BaseModel):
    """Error response model."""
    
    status: str = "error"
    error: str
    details: Optional[dict] = None
