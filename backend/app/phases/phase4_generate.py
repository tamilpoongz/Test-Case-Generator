import json
import logging
from app.services.llm_service import get_llm_service
from app.models.domain import TestCaseData
from app.exceptions.custom_exceptions import LLMError

logger = logging.getLogger(__name__)


class Phase4GenerateTestCases:
    """Phase 4: Test Case Generation."""
    
    SYSTEM_PROMPT = """You are an expert QA test case generator.

Your task is to generate detailed, executable test cases from provided scenarios.

Each test case MUST include ALL these fields:
- test_case_id: Unique ID like TC-001, TC-002, etc.
- test_case_title: Clear, objective-based title (10-100 chars)
- test_type: One of [Functional, Positive, Negative, Boundary Validation]
- preconditions: List of setup requirements (at least 1)
- test_steps: List of atomic, executable steps (at least 2)
- test_data: List of test data values to use
- expected_result: Observable, testable outcome (20+ chars)
- priority: One of [Low, Medium, High, Critical]

Guidelines:
- Each step must be a single atomic action
- Steps must be in logical execution order
- Use imperative language: "Enter...", "Click...", "Verify..."
- Expected result must be specific and observable
- Do NOT hallucinate features not in scenarios

CRITICAL: Respond ONLY with valid JSON. No markdown, no extra text.

Output JSON format EXACTLY:
{
  "test_cases": [
    {
      "test_case_id": "TC-001",
      "test_case_title": "Verify specific testable objective",
      "test_type": "Positive",
      "preconditions": ["Precondition 1", "Precondition 2"],
      "test_steps": ["Step 1: Action", "Step 2: Action", "Step 3: Verify"],
      "test_data": ["Value 1", "Value 2"],
      "expected_result": "Specific observable outcome",
      "priority": "High"
    }
  ]
}"""
    
    def generate(self, scenarios: list, understanding: object, normalized_input: dict) -> list:
        """Generate test cases from scenarios."""
        
        scenario_text = self._format_scenarios(scenarios)
        business_goal = understanding.business_goal if hasattr(understanding, 'business_goal') else ''
        constraints = understanding.constraints if hasattr(understanding, 'constraints') else []
        
        user_message = f"""Generate detailed test cases for these scenarios:

{scenario_text}

Business Goal: {business_goal}

Constraints:
{chr(10).join(f"- {c}" for c in constraints)}

Acceptance Criteria:
{chr(10).join(f"- {ac}" for ac in normalized_input['acceptance_criteria'])}

Generate test cases (2-4 per scenario type) with:
- Clear, atomic test steps
- Specific test data
- Observable expected results
- Appropriate priority levels

Respond with ONLY valid JSON."""
        
        try:
            llm = get_llm_service()
            logger.info("Phase 4: Invoking LLM to generate test cases...")
            response = llm.invoke_json(
                self.SYSTEM_PROMPT,
                user_message
            )
            
            logger.info(f"Phase 4: LLM returned response with {len(response.get('test_cases', []))} test cases")
            
            test_cases = []
            test_case_items = response.get("test_cases", [])
            
            if not test_case_items:
                logger.warning("Phase 4: LLM returned empty test_cases array, generating fallback test cases")
                test_case_items = self._generate_fallback_test_cases(scenarios, understanding, normalized_input)
            
            for i, tc in enumerate(test_case_items):
                try:
                    test_case = TestCaseData(
                        test_case_id=tc.get("test_case_id", f"TC-{i+1:03d}"),
                        test_case_title=tc.get("test_case_title", f"Test Case {i+1}"),
                        test_type=tc.get("test_type", "Functional"),
                        preconditions=tc.get("preconditions", ["Setup complete"]),
                        test_steps=tc.get("test_steps", ["Execute test"]),
                        test_data=tc.get("test_data", ["Test data"]),
                        expected_result=tc.get("expected_result", "Test passes"),
                        priority=tc.get("priority", "Medium"),
                    )
                    test_cases.append(test_case)
                except Exception as item_error:
                    logger.error(f"Phase 4: Failed to parse test case {i}: {str(item_error)}")
                    continue
            
            logger.info(f"Phase 4: Successfully generated {len(test_cases)} test cases")
            return test_cases
        
        except Exception as e:
            logger.error(f"Phase 4 failed: {str(e)}")
            logger.warning("Phase 4: Falling back to generating synthetic test cases...")
            try:
                fallback_cases = self._generate_fallback_test_cases(scenarios, understanding, normalized_input)
                logger.info(f"Phase 4: Generated {len(fallback_cases)} fallback test cases")
                return fallback_cases
            except Exception as fallback_error:
                logger.error(f"Phase 4 fallback also failed: {str(fallback_error)}")
                raise LLMError(f"Phase 4 failed: {str(e)}")
    
    def _generate_fallback_test_cases(self, scenarios: list, understanding: object, normalized_input: dict) -> list:
        """Generate synthetic test cases when LLM fails."""
        fallback_cases = []
        test_types = ["Functional", "Positive", "Negative", "Boundary Validation"]
        priorities = ["High", "Medium", "Low"]
        
        for idx, scenario in enumerate(scenarios):
            scenario_text = scenario.get("scenario", "") if isinstance(scenario, dict) else str(scenario)
            
            test_case_dict = {
                "test_case_id": f"TC-{idx+1:03d}",
                "test_case_title": f"Verify scenario: {scenario_text[:60]}...",
                "test_type": test_types[idx % len(test_types)],
                "preconditions": ["System is accessible", "User is authenticated"],
                "test_steps": [
                    "Navigate to feature",
                    "Execute action",
                    "Verify result"
                ],
                "test_data": ["Sample data value 1", "Sample data value 2"],
                "expected_result": "Feature works as expected",
                "priority": priorities[idx % len(priorities)]
            }
            
            fallback_cases.append(test_case_dict)
        
        return fallback_cases
    
    def _format_scenarios(self, scenarios: list) -> str:
        """Format scenarios into readable text."""
        formatted = []
        for s in scenarios:
            if isinstance(s, dict):
                formatted.append(f"- {s.get('scenario_type', 'Unknown')}: {s.get('scenario_description', '')}")
            else:
                formatted.append(f"- {s.scenario_type}: {s.scenario_description}")
        return "\n".join(formatted)
