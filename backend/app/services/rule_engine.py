from app.models.domain import TestCaseData
from typing import Tuple


class RuleEngine:
    """Rule-based validation and confidence scoring."""
    
    REQUIRED_FIELDS = [
        'test_case_id',
        'test_case_title',
        'test_type',
        'preconditions',
        'test_steps',
        'test_data',
        'expected_result',
        'priority',
    ]
    
    def validate_test_case_structure(
        self,
        test_case: TestCaseData
    ) -> Tuple[bool, list]:
        """
        Validate test case structure compliance.
        
        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []
        
        # Check required fields
        for field in self.REQUIRED_FIELDS:
            value = getattr(test_case, field, None)
            if not value:
                errors.append(f"Missing or empty: {field}")
        
        # Check field types
        if not isinstance(test_case.preconditions, list):
            errors.append("Preconditions must be a list")
        
        if not isinstance(test_case.test_steps, list) or len(test_case.test_steps) == 0:
            errors.append("Test steps must be non-empty list")
        
        if not isinstance(test_case.test_data, list):
            errors.append("Test data must be a list")
        
        return len(errors) == 0, errors
    
    def calculate_rule_based_confidence(
        self,
        test_case: TestCaseData
    ) -> float:
        """
        Calculate rule-based validation confidence score (0-1).
        
        Factors:
        - All required fields present
        - Test case mapped to scenario
        - Test steps are sequenced and clear
        - Expected result is observable
        """
        score = 0.0
        total_checks = 0
        
        # Check 1: All required fields present
        total_checks += 1
        is_valid, _ = self.validate_test_case_structure(test_case)
        if is_valid:
            score += 1.0
        
        # Check 2: Has scenario mapping
        total_checks += 1
        if test_case.scenario_mapping and len(test_case.scenario_mapping) > 0:
            score += 1.0
        
        # Check 3: Test steps are substantial
        total_checks += 1
        if len(test_case.test_steps) >= 2:
            score += 1.0
        elif len(test_case.test_steps) >= 1:
            score += 0.5
        
        # Check 4: Expected result is substantial
        total_checks += 1
        if len(test_case.expected_result) > 30:
            score += 1.0
        elif len(test_case.expected_result) > 10:
            score += 0.5
        
        # Check 5: Preconditions present
        total_checks += 1
        if len(test_case.preconditions) > 0:
            score += 1.0
        
        return min(score / total_checks, 1.0)
    
    def apply_rule_adjustments(
        self,
        base_score: float,
        rule_score: float
    ) -> float:
        """
        Apply hybrid confidence formula.
        Final = (0.60 × LLM) + (0.40 × Rule-Based)
        """
        return (0.60 * base_score) + (0.40 * rule_score)


# Global rule engine instance
rule_engine = RuleEngine()
