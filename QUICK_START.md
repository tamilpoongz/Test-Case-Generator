# 🚀 Quick Start - Backend Only

Get the Test Case Generation Agent backend running in 3 minutes!

## Step 1: Setup (2 minutes)

### Prerequisites
- Python 3.11+ installed
- OpenAI API key ready

### Install & Configure

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup .env file
cp .env.example .env

# Edit .env and add your OpenAI API key
# Open .env in your editor and replace:
# LLM_API_KEY=your_api_key_here
```

## Step 2: Run Server (30 seconds)

```bash
python -m uvicorn app.main:app --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Step 3: Test API (30 seconds)

### Option A: Browser (Easiest)
Open: **`http://localhost:8000/docs`**

You'll see interactive API documentation. Click "Try it out" on any endpoint.

### Option B: Quick cURL Test

```bash
# Health check
curl http://localhost:8000/api/testcases/health

# Generate test cases
curl -X POST http://localhost:8000/api/testcases/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "User Login Feature",
    "description": "User logs in with email and password",
    "acceptance_criteria": [
      "System validates email format",
      "System rejects invalid passwords"
    ]
  }'
```

## What to Test

1. **Health Check** - Should return `{"status": "healthy"}`
2. **Generate Test Cases** - Should return 8-12 test cases with confidence scores
3. **Download** - Should download CSV file

## Expected Results

✅ Health returns immediately  
✅ Generation takes 30-60 seconds  
✅ Test cases have ~85%+ confidence scores  
✅ CSV download works  

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` | Activate venv: `source venv/bin/activate` |
| OpenAI API error | Check `LLM_API_KEY` in `.env` |
| Port 8000 in use | Use port 8001: `--port 8001` |
| Import errors | Run: `pip install -r requirements.txt` |

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/testcases/generate` | Generate test cases |
| POST | `/api/testcases/download` | Download as CSV/JSON |
| GET | `/api/testcases/health` | Health check |

## Documentation

- **API Docs**: `http://localhost:8000/docs`
- **Full Guide**: `API_TESTING_GUIDE.md`
- **Backend Readme**: `backend/README.md`

## Environment Variables

Add to `.env`:

```env
LLM_API_KEY=sk-...your-key...   # Required!
LLM_MODEL=gpt-4                 # or gpt-3.5-turbo
API_PORT=8000
LOG_LEVEL=INFO
```

## Stop Server

Press `Ctrl+C` in the terminal

## Next Steps

✅ Backend running and tested?  
→ Ask to start **frontend implementation**

---

**Stuck?** Check error messages in terminal. Most common:
- Missing OpenAI key → Add to `.env`
- Module not found → Activate venv
- Port in use → Change port number

**Ready to go?** 🎉
