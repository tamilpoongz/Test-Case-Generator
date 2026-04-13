# Test Case Generation Agent - Backend

FastAPI backend for the Test Case Generation Agent application.

## Quick Start

### Prerequisites
- Python 3.11+
- pip
- OpenAI API key

### Installation

1. **Create virtual environment:**
```bash
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### Running the Server

```bash
python -m uvicorn app.main:app --reload
```

Server will be available at: `http://localhost:8000`

### API Documentation

Interactive API docs: `http://localhost:8000/docs`

### Testing

```bash
pytest tests/
```

## API Endpoints

### Generate Test Cases
```
POST /api/testcases/generate

Request:
{
  "title": "User story title",
  "description": "User story description",
  "acceptance_criteria": ["AC 1", "AC 2"]
}

Response:
{
  "status": "success",
  "draft_test_cases": [...],
  "summary": {...}
}
```

### Download Test Cases
```
POST /api/testcases/download

Request:
{
  "format": "csv",
  "test_cases": [...]
}

Response: CSV file download
```

### Health Check
```
GET /api/testcases/health

Response:
{
  "status": "healthy",
  "service": "Test Case Generation Agent"
}
```

## Project Structure

- `app/main.py` - FastAPI application entry point
- `app/config.py` - Configuration management
- `app/api/routes.py` - API endpoints
- `app/core/orchestrator.py` - Pipeline orchestrator
- `app/phases/` - Generation phases (1-6)
- `app/services/` - Business logic services
- `app/models/` - Pydantic models
- `tests/` - Test suite

## Environment Variables

See `.env.example` for all available options.

Key variables:
- `LLM_API_KEY` - OpenAI API key (required)
- `LLM_MODEL` - LLM model (default: gpt-4)
- `API_PORT` - API port (default: 8000)
- `LOG_LEVEL` - Logging level (default: INFO)
- `CORS_ORIGINS` - CORS allowed origins

## Docker

### Build and run with Docker:

```bash
docker build -t test-case-generator-backend .
docker run -p 8000:8000 --env-file .env test-case-generator-backend
```

### Using Docker Compose:

```bash
docker-compose up
```

## Troubleshooting

### OpenAI API Error
- Verify `LLM_API_KEY` is set correctly in `.env`
- Check OpenAI account has available quota

### Module Not Found Errors
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

### Port Already in Use
```bash
# Use different port
python -m uvicorn app.main:app --port 8001
```

## Performance Notes

- Generation typically takes 30-60 seconds depending on:
  - LLM model (GPT-4 is slower but better quality)
  - Input complexity
  - Network latency

- To speed up:
  - Use GPT-3.5-Turbo instead of GPT-4
  - Reduce `LLM_MAX_TOKENS` to 1500

## Support

For issues:
1. Check logs: `TAIL app logs`
2. Review API docs: `http://localhost:8000/docs`
3. Check error messages in terminal output
