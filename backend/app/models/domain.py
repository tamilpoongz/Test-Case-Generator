from dataclasses import dataclass, field
from typing import Optional


@dataclass
class RequirementUnderstanding:
    """Output of Phase 2: Requirement Understanding."""
    
    business_goal: str
    actors: list[str]
    functional_behaviors: list[str]
    constraints: list[str]
    identified_validations: list[str]
    ambiguities: list[str]


@dataclass
class Scenario:
    """Extracted scenario model."""
    
    scenario_id: str
    scenario_type: str
    scenario_description: str
    mapped_acceptance_criteria: list[str]
    test_approach: str = ""


@dataclass
class TestCaseData:
    """Internal test case representation."""
    
    test_case_id: str
    test_case_title: str
    test_type: str
    preconditions: list[str]
    test_steps: list[str]
    test_data: list[str]
    expected_result: str
    priority: str
    confidence_score: float = 0.0
    scenario_mapping: Optional[list[str]] = field(default_factory=list)
