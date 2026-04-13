from fastapi import APIRouter, HTTPException, status
from app.models.request import UserStoryRequest, DownloadRequest
from app.models.response import GenerationResponse, ErrorResponse
from app.core.orchestrator import get_orchestrator
from app.services.export_service import export_service
from fastapi.responses import StreamingResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/testcases")


@router.post(
    "/generate",
    response_model=GenerationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate test cases",
)
async def generate_test_cases(request: UserStoryRequest):
    """
    Generate test cases from user story inputs.
    
    Request body:
    - title: User story title (10-200 chars)
    - description: User story description (20-2000 chars)
    - acceptance_criteria: List of AC (1-10 items, 15-500 chars each)
    
    Returns:
    - Generated test cases with confidence scores
    - Summary statistics
    """
    try:
        logger.info(f"Received generation request for: {request.title}")
        
        # Generate test cases
        orchestrator = get_orchestrator()
        response = orchestrator.generate(request)
        
        if response.status == "error":
            logger.error(f"Generation error: {response.error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=response.error,
            )
        
        logger.info(f"Successfully generated {len(response.draft_test_cases)} test cases")
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}",
        )


@router.post(
    "/download",
    status_code=status.HTTP_200_OK,
    summary="Download test cases",
)
async def download_test_cases(request: DownloadRequest):
    """
    Download generated test cases in specified format.
    
    Supported formats:
    - csv: Comma-separated values (recommended for Phase 1)
    - json: JSON format
    """
    try:
        logger.info(f"Download requested in format: {request.format}")
        
        if not request.test_cases:
            logger.error("No test cases provided for download")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No test cases provided for download",
            )
        
        if request.format == "csv":
            content = export_service.to_csv(request.test_cases)
            media_type = "text/csv"
            filename = "generated_test_cases.csv"
        elif request.format == "json":
            content = export_service.to_json(request.test_cases)
            media_type = "application/json"
            filename = "generated_test_cases.json"
        else:
            logger.error(f"Unsupported format requested: {request.format}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Format {request.format} not supported. Use 'csv' or 'json'",
            )
        
        logger.info(f"Exporting {len(request.test_cases)} test cases as {request.format}")
        
        return StreamingResponse(
            iter([content]),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Download failed: {str(e)}",
        )


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health check"
)
async def health_check():
    """System health check endpoint."""
    return {"status": "ok", "service": "Test Case Generation Agent", "version": "1.0.0"}
