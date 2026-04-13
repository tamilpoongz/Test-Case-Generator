from app.models.request import UserStoryRequest


class Phase1Normalizer:
    """Phase 1: Input Normalization."""
    
    def normalize(self, request: UserStoryRequest) -> dict:
        """
        Normalize input into canonical structure.
        
        Returns:
            Normalized requirement object
        """
        normalized_criteria = [
            criterion.strip()
            for criterion in request.acceptance_criteria
            if criterion.strip()
        ]
        
        return {
            "title": request.title.strip(),
            "description": request.description.strip(),
            "acceptance_criteria": normalized_criteria,
        }
