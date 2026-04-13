import json
import logging
from app.services.llm_service import get_llm_service
from app.exceptions.custom_exceptions import LLMError

logger = logging.getLogger(__name__)


class Phase3ScenarioExtraction:
    """Phase 3: Scenario Extraction."""
    
    SYSTEM_PROMPT = """You are an expert test scenario designer.

Your task is to extract testable scenarios from requirement understanding.

Create scenarios in these EXACT categories ONLY:
- Functional
- Positive
- Negative
- Boundary Validation

For each scenario:
1. Create one scenario per atomic test path
2. Map to relevant acceptance criteria
3. Avoid duplicates
4. Ensure negative scenarios cover stated constraints

CRITICAL: Respond ONLY with valid JSON. No markdown, no extra text.

Output JSON format EXACTLY:
{
  "scenarios": [
    {
      "scenario_id": "SCN-001",
      "scenario_type": "Functional|Positive|Negative|Boundary Validation",
      "scenario_description": "Clear description of testable scenario",
      "mapped_acceptance_criteria": ["AC-1", "AC-2"],
      "test_approach": "How this would be tested"
    }
  ]
}"""
    
    def extract(self, understanding: object, normalized_input: dict) -> list:
        """
        Transform requirement understanding into testable scenarios.
        """
        behaviors = understanding.functional_behaviors if hasattr(understanding, 'functional_behaviors') else []
        constraints = understanding.constraints if hasattr(understanding, 'constraints') else []
        validations = understanding.identified_validations if hasattr(understanding, 'identified_validations') else []
        
        user_message = f"""Extract testable scenarios from this requirement:

Business Goal: {understanding.business_goal if hasattr(understanding, 'business_goal') else ''}

Functional Behaviors:
{chr(10).join(f"- {b}" for b in behaviors)}

Constraints:
{chr(10).join(f"- {c}" for c in constraints)}

Validations:
{chr(10).join(f"- {v}" for v in validations)}

Acceptance Criteria:
{chr(10).join(f"- {ac}" for ac in normalized_input['acceptance_criteria'])}

Create scenarios across Functional, Positive, Negative, and Boundary Validation categories.
Respond with ONLY valid JSON."""
        
        try:
            llm = get_llm_service()
            response = llm.invoke_json(
                self.SYSTEM_PROMPT,
                user_message
            )
            
            scenarios = response.get("scenarios", [])
            logger.info(f"Phase 3 extracted {len(scenarios)} scenarios")
            return scenarios
        
        except Exception as e:
            logger.error(f"Phase 3 failed: {str(e)}")
            raise LLMError(f"Phase 3 failed: {str(e)}")
