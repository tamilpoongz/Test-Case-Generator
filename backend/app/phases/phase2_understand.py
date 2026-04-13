import json
import logging
from app.services.llm_service import get_llm_service
from app.models.domain import RequirementUnderstanding
from app.exceptions.custom_exceptions import LLMError

logger = logging.getLogger(__name__)


class Phase2RequirementUnderstanding:
    """Phase 2: Requirement Understanding."""
    
    SYSTEM_PROMPT = """You are a QA analyst expert at understanding user stories and requirements.

Your task is to analyze the provided user story and extract:
- Business goal
- Actors involved
- Functional behaviors
- Constraints
- Validations
- Any ambiguities

CRITICAL: You MUST respond ONLY with a valid JSON object. No markdown, no extra text, no explanations.

Output JSON format EXACTLY:
{
  "business_goal": "clear business objective string",
  "actors": ["Actor 1", "Actor 2"],
  "functional_behaviors": ["Behavior 1", "Behavior 2"],
  "constraints": ["Constraint 1", "Constraint 2"],
  "identified_validations": ["Validation 1", "Validation 2"],
  "ambiguities": ["Ambiguity 1", "Ambiguity 2"]
}

Do not hallucinate. Only extract what is explicitly stated or clearly implied."""
    
    def understand(self, normalized_input: dict) -> RequirementUnderstanding:
        """
        Analyze user story to extract requirement understanding.
        """
        user_message = f"""Analyze this user story:

Title: {normalized_input['title']}

Description: {normalized_input['description']}

Acceptance Criteria:
{chr(10).join(f"- {ac}" for ac in normalized_input['acceptance_criteria'])}

Extract business goal, actors, behaviors, constraints, validations, and ambiguities.
Respond with ONLY valid JSON."""
        
        try:
            llm = get_llm_service()
            response = llm.invoke_json(
                self.SYSTEM_PROMPT,
                user_message
            )
            
            understanding = RequirementUnderstanding(
                business_goal=response.get("business_goal", ""),
                actors=response.get("actors", []),
                functional_behaviors=response.get("functional_behaviors", []),
                constraints=response.get("constraints", []),
                identified_validations=response.get("identified_validations", []),
                ambiguities=response.get("ambiguities", []),
            )
            
            logger.info("Phase 2 completed successfully")
            return understanding
        
        except Exception as e:
            logger.error(f"Phase 2 failed: {str(e)}")
            raise LLMError(f"Phase 2 failed: {str(e)}")
