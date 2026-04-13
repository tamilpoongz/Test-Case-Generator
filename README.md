# Test Case Generation Agent

An enterprise-grade AI-powered test case generation system that uses multi-phase LLM orchestration to automatically generate structured test cases from user stories.

## Project Overview

The Test Case Generation Agent helps QA teams quickly generate comprehensive test cases by:
1. Analyzing user stories and acceptance criteria
2. Understanding business requirements using AI
3. Extracting testable scenarios
4. Generating detailed test cases
5. Scoring confidence levels
6. Providing downloadable artifacts (CSV, JSON)

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend - optional for now)
- OpenAI API key
- Docker (optional)

### Option 1: Run Backend Directly (Recommended for Testing APIs)

1. **Setup Backend**

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OpenAI API key
```

2. **Run the server**

```bash
python -m uvicorn app.main:app --reload
```

Server: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

3. **Test the API**

Visit `http://localhost:8000/docs` to see interactive API documentation and test endpoints directly.

### Option 2: Run with Docker Compose

```bash
# Copy environment file
cp backend/.env.example .env

# Edit .env and add your OpenAI API key

# Run with Docker Compose
docker-compose up
```

Backend will be available at: `http://localhost:8000`

## API Testing

### Health Check

```bash
curl http://localhost:8000/api/testcases/health
```

### Generate Test Cases

```bash
curl -X POST http://localhost:8000/api/testcases/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "User Registration Form",
    "description": "As a user, I want to register with email validation.",
    "acceptance_criteria": [
      "System validates email format",
      "System rejects duplicate emails",
      "System sends confirmation email"
    ]
  }'
```

### Using Postman or Insomnia

1. Import the API from `http://localhost:8000/docs`
2. Test endpoints interactively
3. Verify responses

## Project Structure

```
test-case-generator/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Configuration
│   │   ├── api/                 # API routes
│   │   ├── core/                # Orchestrator
│   │   ├── phases/              # Generation phases
│   │   ├── services/            # Business logic
│   │   ├── models/              # Data models
│   │   └── exceptions/          # Custom exceptions
│   ├── tests/                   # Test suite
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
├── frontend/                    # (Coming after API verification)
├── docker-compose.yml
├── .gitignore
├── IMPLEMENTATION_ROADMAP.md
└── README.md
```

## Backend Architecture

### Multi-Phase Pipeline

The system generates test cases through 6 sequential phases:

1. **Normalization**: Standardize and validate input
2. **Understanding**: Extract business requirements using AI
3. **Scenario Extraction**: Derive testable scenarios
4. **Test Case Generation**: Create detailed test cases
5. **Confidence Scoring**: Hybrid scoring (LLM + Rules)
6. **Output Structuring**: Format for frontend/export

### API Endpoints

#### POST `/api/testcases/generate`
Generate test cases from user story inputs.

**Request:**
```json
{
  "title": "string (10-200 chars)",
  "description": "string (20-2000 chars)",
  "acceptance_criteria": ["string array (1-10 items)"]
}
```

**Response:**
```json
{
  "status": "success",
  "draft_test_cases": [...],
  "summary": {
    "total_test_cases": 8,
    "functional_count": 2,
    "positive_count": 2,
    "negative_count": 3,
    "boundary_count": 1
  },
  "download_supported": true,
  "download_format": "csv"
}
```

#### POST `/api/testcases/download`
Download test cases in specified format.

**Request:**
```json
{
  "format": "csv|json",
  "test_cases": [...]
}
```

**Response:** File download (CSV or JSON)

#### GET `/api/testcases/health`
System health check.

## Configuration

### Environment Variables

Key variables in `.env`:

```
# LLM Configuration
LLM_PROVIDER=openai          # LLM provider
LLM_MODEL=gpt-4              # Model name
LLM_API_KEY=sk-...          # OpenAI API key (REQUIRED)
LLM_TEMPERATURE=0.7          # Response creativity
LLM_MAX_TOKENS=2048          # Max response length

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Database
DATABASE_URL=sqlite:///./test_cases.db

# Logging
LOG_LEVEL=INFO

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Testing

### Run Tests

```bash
cd backend
pytest tests/
```

### Test Coverage

```bash
pytest --cov=app tests/
```

## Troubleshooting

### Issue: OpenAI API Key Error
**Solution:**
- Verify `LLM_API_KEY` is set in `.env`
- Check account has available quota at https://platform.openai.com/account/usage/overview

### Issue: CORS Error
**Solution:**
- Ensure frontend URL is in `CORS_ORIGINS` in `.env`

### Issue: Port Already in Use
**Solution:**
```bash
# Use different port
python -m uvicorn app.main:app --port 8001
```

### Issue: Module Import Errors
**Solution:**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

## Performance Notes

- **Generation Time**: 30-60 seconds typical
- **Model Impact**: GPT-4 is slower but higher quality
- **Optimization**: Use GPT-3.5-Turbo for faster responses

## Next Steps

1. ✅ **Backend Setup** - Currently implemented
2. ✅ **API Testing** - Verify endpoints work
3. 📋 **Frontend Implementation** - After API verification
4. 🚀 **Deployment** - Docker to cloud
5. 📊 **Monitoring** - Add logging/metrics

## Documentation

- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) - Detailed setup guide
- [Backend README](./backend/README.md) - Backend-specific docs
- [API Contract](./API_CONTRACT_SPECIFICATION.md) - Full API specification
- [Technical Design](./test_case_generation_agent_technical_design.md) - Architecture details

## Support

For API issues:
1. Check logs: Backend terminal output
2. Use API docs: `http://localhost:8000/docs`
3. Review error messages carefully

## License

Internal - Testleaf

## Version

**Current:** 1.0.0 (Backend MVP)

---

**Ready to test the APIs?** Start the backend and visit `http://localhost:8000/docs` 🚀
