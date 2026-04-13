# Implementation Roadmap — Test Case Generation Agent

## Overview

This roadmap provides step-by-step instructions to build and run the complete Test Case Generation Agent application locally.

**Estimated Build Time:** 30-45 minutes  
**Technology Stack:**
- **Backend:** Python 3.11, FastAPI, Uvicorn
- **Frontend:** React 18, TypeScript, Vite
- **LLM:** OpenAI (GPT-4 or GPT-3.5-Turbo)
- **Deployment:** Docker + Docker Compose
- **Database:** SQLite (development)

---

## Project Structure

```
test-case-generator/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── config.py               # Configuration
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py           # API endpoints
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── orchestrator.py     # Pipeline orchestrator
│   │   ├── phases/
│   │   │   ├── __init__.py
│   │   │   ├── phase1_normalize.py
│   │   │   ├── phase2_understand.py
│   │   │   ├── phase3_extract.py
│   │   │   ├── phase4_generate.py
│   │   │   ├── phase5_confidence.py
│   │   │   └── phase6_output.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── llm_service.py
│   │   │   ├── rule_engine.py
│   │   │   ├── export_service.py
│   │   │   └── cache_service.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── request.py
│   │   │   ├── response.py
│   │   │   └── domain.py
│   │   ├── validators/
│   │   │   ├── __init__.py
│   │   │   └── input_validator.py
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── logger.py
│   │   │   └── helpers.py
│   │   ├── exceptions/
│   │   │   ├── __init__.py
│   │   │   └── custom_exceptions.py
│   │   └── prompts/
│   │       ├── __init__.py
│   │       ├── phase1.txt
│   │       ├── phase2.txt
│   │       ├── phase3.txt
│   │       ├── phase4.txt
│   │       └── phase5.txt
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_api.py
│   │   └── test_orchestrator.py
│   ├── .env.example
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── FormInputs/
│   │   │   │   ├── UserStoryForm.tsx
│   │   │   │   └── FormErrorDisplay.tsx
│   │   │   ├── TestCaseReview/
│   │   │   │   ├── TestCaseCard.tsx
│   │   │   │   ├── TestCaseList.tsx
│   │   │   │   └── ConfidenceScoreBadge.tsx
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   └── Common/
│   │   │       └── LoadingSpinner.tsx
│   │   ├── pages/
│   │   │   ├── GenerationForm.tsx
│   │   │   └── ReviewTestCases.tsx
│   │   ├── hooks/
│   │   │   ├── useGenerateTestCases.ts
│   │   │   └── useDownloadTestCases.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── errorHandler.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Implementation Steps

### Step 1: Clone/Create Project Structure (5 min)

```bash
# Create root directory
mkdir test-case-generator
cd test-case-generator

# Create backend structure
mkdir -p backend/app/{api,core,phases,services,models,validators,utils,exceptions,prompts}
mkdir -p backend/tests

# Create frontend structure
mkdir -p frontend/src/{components,pages,hooks,services,types}
mkdir -p frontend/public
```

### Step 2: Backend Implementation (15 min)

**Create all backend files** (see section below)

Key files to create:
- `backend/requirements.txt` - Python dependencies
- `backend/app/main.py` - FastAPI application
- `backend/app/config.py` - Configuration
- `backend/app/models/*` - Pydantic models
- `backend/app/services/*` - Business logic
- `backend/app/phases/*` - Generation phases
- `backend/app/api/routes.py` - API endpoints
- `backend/Dockerfile` - Container configuration

### Step 3: Frontend Implementation (15 min)

**Create all frontend files** (see section below)

Key files to create:
- `frontend/package.json` - Dependencies
- `frontend/tsconfig.json` - TypeScript config
- `frontend/vite.config.ts` - Build config
- `frontend/src/App.tsx` - Main app
- `frontend/src/components/*` - UI components
- `frontend/src/services/api.ts` - API client
- `frontend/src/pages/*` - Pages

### Step 4: Configuration Files (5 min)

- `docker-compose.yml` - Local development setup
- `.env.example` files for both backend and frontend
- `.gitignore` - Version control exclusions

### Step 5: Local Development Setup (10 min)

```bash
# 1. Setup backend
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# 2. Setup frontend
cd ../frontend
npm install

# Copy environment file
cp .env.example .env

# 3. Run with Docker Compose
cd ..
docker-compose up
```

---

## Quick Start (Without Docker)

### Terminal 1: Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## Environment Configuration

### Backend (.env)
```env
LLM_PROVIDER=openai
LLM_MODEL=gpt-4
LLM_API_KEY=your_openai_api_key_here
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2048
DATABASE_URL=sqlite:///./test_cases.db
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Verification Checklist

After implementation, verify:

- [ ] Backend running on `http://localhost:8000`
- [ ] API docs accessible at `http://localhost:8000/docs`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Form page loads without errors
- [ ] OpenAI API key configured and working
- [ ] Can submit form and generate test cases
- [ ] Can download test cases as CSV
- [ ] No console errors in browser
- [ ] No errors in backend logs

---

## Testing the Implementation

### 1. Test Form Submission

Visit `http://localhost:5173` and fill the form:
- **Title:** "User Registration Form Validation"
- **Description:** "As a user, I want to register with email validation so I can create a secure account."
- **Acceptance Criteria:**
  - "System validates email format"
  - "System rejects duplicate emails"
  - "System sends confirmation email"

### 2. Verify Generation

- Click "Generate Test Cases"
- Wait for generation (30-60 seconds)
- See generated test cases on review screen

### 3. Test Download

- Click "Download Test Cases"
- Select CSV format
- Verify file downloads

---

## Troubleshooting

### Issue: OpenAI API Error
**Solution:** Verify `LLM_API_KEY` in `.env` and check OpenAI account has available quota

### Issue: CORS Error
**Solution:** Ensure `CORS_ORIGINS` in backend `.env` includes frontend URL

### Issue: Port Already in Use
**Solution:** Change port: `uvicorn app.main:app --port 8001`

### Issue: Module Not Found
**Solution:** Ensure virtual environment is activated and `requirements.txt` installed

---

## Next Steps

After successful local run:

1. **Customize prompts** in `backend/app/prompts/` for your domain
2. **Adjust confidence scoring** in `backend/app/services/rule_engine.py`
3. **Add more export formats** in `backend/app/services/export_service.py`
4. **Deploy to production** using Docker Compose or Kubernetes

---

## Performance Optimization

For faster LLM responses:
- Use GPT-3.5-Turbo instead of GPT-4
- Enable response caching in `backend/app/services/cache_service.py`
- Reduce LLM_MAX_TOKENS to 1500

---

## Support

For issues or questions:
1. Check logs in `backend/` or browser console
2. Review API documentation at `http://localhost:8000/docs`
3. Check GitHub Issues (when repository is created)

---

**Let's Build! 🚀**

All implementation files are provided in the sections below. Follow the file creation order for best results.
