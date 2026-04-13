import logging
from app.models.response import (
    GenerationResponse, TestCaseResponse, GenerationSummary,
    TestTypeEnum, PriorityEnum, ReviewStatusEnum
)
from app.models.domain import TestCaseData

logger = logging.getLogger(__name__)


class Phase6OutputStructuring:
    """Phase 6: Output Structuring and Review Packaging."""
    
    def structure(self, test_cases: list) -> GenerationResponse:
        """
        Return test cases in UI-ready draft structure.
        
        Returns:
            GenerationResponse with test cases and summary
        """
        try:
            response_cases = []
            
            for tc in test_cases:
                try:
                    response_case = TestCaseResponse(
                        test_case_id=tc.test_case_id,
                        test_case_title=tc.test_case_title,
                        test_type=self._parse_test_type(tc.test_type),
                        preconditions=tc.preconditions or [],
                        test_steps=tc.test_steps or [],
                        test_data=tc.test_data or [],
                        expected_result=tc.expected_result,
                        priority=self._parse_priority(tc.priority),
                        confidence_score=min(max(tc.confidence_score, 0.0), 1.0),
                        review_status=ReviewStatusEnum.DRAFT,
                    )
                    response_cases.append(response_case)
                except Exception as e:
                    logger.warning(f"Could not convert test case {tc.test_case_id}: {str(e)}")
                    continue
            
            summary = self._generate_summary(response_cases)
            
            response = GenerationResponse(
                status="success",
                draft_test_cases=response_cases,
                summary=summary,
                download_supported=True,
                download_format="csv",
            )
            
            logger.info(f"Phase 6 structured {len(response_cases)} test cases")
            return response
        
        except Exception as e:
            logger.error(f"Phase 6 failed: {str(e)}")
            return GenerationResponse(
                status="error",
                error=f"Output structuring failed: {str(e)}",
                draft_test_cases=[],
            )
    
    def _parse_test_type(self, test_type: str) -> TestTypeEnum:
        """Parse test type string to enum."""
        type_map = {
            "Functional": TestTypeEnum.FUNCTIONAL,
            "Positive": TestTypeEnum.POSITIVE,
            "Negative": TestTypeEnum.NEGATIVE,
            "Boundary": TestTypeEnum.BOUNDARY,
            "Boundary Validation": TestTypeEnum.BOUNDARY,
        }
        return type_map.get(test_type, TestTypeEnum.FUNCTIONAL)
    
    def _parse_priority(self, priority: str) -> PriorityEnum:
        """Parse priority string to enum."""
        priority_map = {
            "Low": PriorityEnum.LOW,
            "Medium": PriorityEnum.MEDIUM,
            "High": PriorityEnum.HIGH,
            "Critical": PriorityEnum.CRITICAL,
        }
        return priority_map.get(priority, PriorityEnum.MEDIUM)
    
    def _generate_summary(self, test_cases: list) -> GenerationSummary:
        """Generate summary statistics."""
        return GenerationSummary(
            total_test_cases=len(test_cases),
            functional_count=sum(1 for tc in test_cases if tc.test_type == TestTypeEnum.FUNCTIONAL),
            positive_count=sum(1 for tc in test_cases if tc.test_type == TestTypeEnum.POSITIVE),
            negative_count=sum(1 for tc in test_cases if tc.test_type == TestTypeEnum.NEGATIVE),
            boundary_count=sum(1 for tc in test_cases if tc.test_type == TestTypeEnum.BOUNDARY),
        )
