import logging
from app.models.request import UserStoryRequest
from app.models.response import GenerationResponse
from app.phases.phase1_normalize import Phase1Normalizer
from app.phases.phase2_understand import Phase2RequirementUnderstanding
from app.phases.phase3_extract import Phase3ScenarioExtraction
from app.phases.phase4_generate import Phase4GenerateTestCases
from app.phases.phase5_confidence import Phase5ConfidenceScoring
from app.phases.phase6_output import Phase6OutputStructuring
from app.exceptions.custom_exceptions import OrchestrationError

logger = logging.getLogger(__name__)


class Orchestrator:
    """Main pipeline orchestrator for test case generation."""
    
    def __init__(self):
        self.phase1 = Phase1Normalizer()
        self.phase2 = Phase2RequirementUnderstanding()
        self.phase3 = Phase3ScenarioExtraction()
        self.phase4 = Phase4GenerateTestCases()
        self.phase5 = Phase5ConfidenceScoring()
        self.phase6 = Phase6OutputStructuring()
    
    def generate(self, request: UserStoryRequest) -> GenerationResponse:
        """
        Execute full pipeline: Normalize → Understand → Extract → Generate → Score → Format.
        """
        try:
            logger.info("Starting test case generation pipeline")
            
            # Phase 1: Normalize
            logger.info("Executing Phase 1: Normalization")
            normalized = self.phase1.normalize(request)
            logger.debug(f"Normalized input: {normalized}")
            
            # Phase 2: Understand
            logger.info("Executing Phase 2: Requirement Understanding")
            understanding = self.phase2.understand(normalized)
            logger.debug(f"Understanding: {understanding}")
            
            # Phase 3: Extract
            logger.info("Executing Phase 3: Scenario Extraction")
            scenarios = self.phase3.extract(understanding, normalized)
            logger.debug(f"Extracted {len(scenarios)} scenarios")
            
            # Phase 4: Generate
            logger.info("Executing Phase 4: Test Case Generation")
            test_cases = self.phase4.generate(scenarios, understanding, normalized)
            logger.debug(f"Generated {len(test_cases)} test cases")
            
            # Phase 5: Confidence Scoring
            logger.info("Executing Phase 5: Confidence Scoring")
            test_cases = self.phase5.score(test_cases)
            
            # Phase 6: Format Output
            logger.info("Executing Phase 6: Output Formatting")
            response = self.phase6.structure(test_cases)
            
            logger.info(f"Pipeline completed successfully. Generated {len(test_cases)} test cases")
            return response
        
        except Exception as e:
            logger.error(f"Pipeline failed at unknown phase: {str(e)}", exc_info=True)
            return GenerationResponse(
                status="error",
                error=f"Generation pipeline failed: {str(e)}",
                draft_test_cases=[],
            )


# Global orchestrator instance
orchestrator = None

def get_orchestrator():
    global orchestrator
    if orchestrator is None:
        orchestrator = Orchestrator()
    return orchestrator
