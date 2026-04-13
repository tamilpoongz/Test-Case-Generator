class TestCaseGenerationError(Exception):
    """Base exception for test case generation."""
    pass


class LLMError(TestCaseGenerationError):
    """LLM service error."""
    pass


class ValidationError(TestCaseGenerationError):
    """Input validation error."""
    pass


class ExportError(TestCaseGenerationError):
    """Export generation error."""
    pass


class OrchestrationError(TestCaseGenerationError):
    """Pipeline orchestration error."""
    pass
