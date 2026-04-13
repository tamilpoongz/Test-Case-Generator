import json
import logging
from app.services.llm_service import get_llm_service
from app.services.rule_engine import rule_engine
from app.models.domain import TestCaseData
from app.exceptions.custom_exceptions import LLMError

logger = logging.getLogger(__name__)


class Phase5ConfidenceScoring:
    """Phase 5: Confidence Scoring."""
    
    SYSTEM_PROMPT = """You are a QA quality assurance expert evaluating test case quality.

Your task is to assess semantic confidence of generated test cases based on:
1. Requirement relevance - alignment with original requirement
2. Scenario completeness - fully derived from scenario
3. Step clarity - unambiguous and executable steps
4. Expected result observability - objectively verifiable
5. Acceptance criteria coverage - covers stated criteria

Score each test case 0.0-1.0:
- 1.0: Perfect alignment, clear steps, observable results
- 0.9-0.99: All requirements clear and testable
- 0.8-0.89: Minor ambiguities or partial coverage
- 0.7-0.79: Some assumptions required
- 0.6-0.69: Significant assumptions, potentially ambiguous
- Below 0.6: Major clarity issues

CRITICAL: Respond ONLY with valid JSON. No markdown, no extra text.

Output JSON format EXACTLY:
{
  "test_case_confidence_scores": [
    {
      "test_case_id": "TC-001",
      "llm_confidence_score": 0.85,
      "reasoning": "Brief explanation"
    }
  ]
}"""
    
    def score(self, test_cases: list) -> list:
        """
        Calculate confidence scores for generated test cases.
        Applies hybrid formula: (0.60 × LLM) + (0.40 × Rule-Based)
        """
        try:
            # Get LLM-based confidence scores
            llm_scores = self._get_llm_confidence_scores(test_cases)
            
            # Calculate rule-based and apply hybrid formula
            for test_case in test_cases:
                llm_score = llm_scores.get(test_case.test_case_id, 0.75)
                rule_score = rule_engine.calculate_rule_based_confidence(test_case)
                
                # Apply hybrid formula: 60% LLM + 40% Rules
                final_score = rule_engine.apply_rule_adjustments(llm_score, rule_score)
                test_case.confidence_score = min(final_score, 1.0)
            
            logger.info(f"Phase 5 scored {len(test_cases)} test cases")
            return test_cases
        
        except Exception as e:
            logger.error(f"Phase 5 failed: {str(e)}")
            # Fallback to rule-based only if LLM fails
            for test_case in test_cases:
                score = rule_engine.calculate_rule_based_confidence(test_case)
                test_case.confidence_score = score
            return test_cases
    
    def _get_llm_confidence_scores(self, test_cases: list) -> dict:
        """Get LLM-based confidence scores."""
        try:
            tc_text = "\n".join([
                f"TC-{i+1}: {tc.test_case_title}"
                for i, tc in enumerate(test_cases[:5])  # Score first 5 to save tokens
            ])
            
            user_message = f"""Evaluate confidence for these test cases:

{tc_text}

Score each 0.0-1.0 based on clarity, completeness, and testability.
Return ONLY valid JSON."""
            
            llm = get_llm_service()
            response = llm.invoke_json(
                self.SYSTEM_PROMPT,
                user_message
            )
            
            scores = {}
            for item in response.get("test_case_confidence_scores", []):
                tc_id = item.get("test_case_id", "")
                score = float(item.get("llm_confidence_score", 0.75))
                scores[tc_id] = min(max(score, 0.0), 1.0)
            
            return scores
        
        except Exception as e:
            logger.warning(f"LLM confidence scoring failed, using defaults: {str(e)}")
            # Return default scores if LLM fails
            return {tc.test_case_id: 0.75 for tc in test_cases}
