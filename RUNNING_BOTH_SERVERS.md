# 🚀 RUNNING BOTH BACKEND & FRONTEND - COMPLETE SETUP GUIDE

## Current Status

✅ **Backend**: Running on http://127.0.0.1:8000  
⏳ **Frontend**: Installing dependencies (in progress)

---

## ✅ BACKEND IS ALREADY RUNNING

Your backend server is actively running with output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started server process
INFO:     Application startup complete
2026-04-11 12:08:10,971 - app.main - INFO - Starting Test Case Generation Agent v1.0.0
2026-04-11 12:08:10,971 - app.main - INFO - LLM Provider: groq
2026-04-11 12:08:10,971 - app.main - INFO - LLM Model: llama-3.3-70b-versatile
```

### ✅ Backend is Ready!
- **API Health**: http://127.0.0.1:8000/api/testcases/health
- **Generate Endpoint**: http://127.0.0.1:8000/api/testcases/generate
- **Download Endpoint**: http://127.0.0.1:8000/api/testcases/download

**Keep the backend running - DO NOT close this terminal!**

---

## ⏳ FRONTEND INSTALLATION IN PROGRESS

Currently installing npm dependencies:
- React 18.2.0
- Material-UI 5.14
- Vite (build tool)
- React Hook Form
- Axios
- And other packages

This may take 2-5 minutes depending on internet speed.

---

## What to do while installing:

### Option 1: Wait for automatic completion
The frontend will start automatically once npm install finishes.

### Option 2: Manual start after installation completes
Once you see the list of installed packages, run:
```bash
cd "c:\Users\LENOVO\Desktop\AI by Testleaf\Phase - 2\Week 11 & 12 Hackathon\Test Case Generator\frontend"
npm run dev
```

---

## 📋 Expected Frontend Startup Output

When frontend starts successfully, you should see:
```
VITE v5.0.7  ready in 234 ms

➜  Local:   http://127.0.0.1:5173/
➜  press h + enter to show help

VITE v5.0.7
 Dev server running at:
  > Local: http://127.0.0.1:5173/
  > use --host to expose
  > Network: use --host to expose

ready in 156ms.
```

---

## 🌐 Access the Application

Once frontend is running:

1. **Open your browser**
2. **Go to**: http://localhost:5173
3. **You should see**: 
   - Test Case Generation Agent header
   - Input form with fields:
     - User Story Title
     - Description
     - Acceptance Criteria
   - Generate button
   - Clear button

---

## 🧪 Quick Test After Both Are Running

### Test 1: Health Check
```bash
curl http://localhost:8000/api/testcases/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Test Case Generation Agent",
  "version": "1.0.0"
}
```

### Test 2: Frontend Test
1. Open http://localhost:5173 in browser
2. Fill the form:
   ```
   Title: User Login Feature
   Description: User should be able to login with email and password
   AC:
   Email must be valid
   Password minimum 8 characters
   Success page should load
   ```
3. Click "Generate Test Cases"
4. Wait 3-8 seconds
5. See test cases appear in table

---

## 🎯 Complete System Architecture

```
┌─────────────────────────────────────────────────────┐
│              Browser (Your Window)                   │
│           http://localhost:5173                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  React Frontend (Material-UI)                │   │
│  │  • Input Form                                │   │
│  │  • Test Cases Table                          │   │
│  │  • Download Buttons                          │   │
│  │  • Status Messages                           │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────┬───────────────────────────────────┘
                   │ HTTP REST API
                   ↓
┌─────────────────────────────────────────────────────┐
│         FastAPI Backend (Terminal 1)                 │
│           http://127.0.0.1:8000                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  6-Phase Pipeline:                           │   │
│  │  1. Normalize                                │   │
│  │  2. Understand (LLM)                         │   │
│  │  3. Extract (LLM)                            │   │
│  │  4. Generate (LLM + Fallback)               │   │
│  │  5. Confidence Scoring                       │   │
│  │  6. Format Response                          │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────┬───────────────────────────────────┘
                   │ LLM API Calls
                   ↓
         ┌─────────────────────┐
         │  Groq API (Cloud)   │
         │ llama-3.3-70b       │
         └─────────────────────┘
```

---

## 🔧 Terminal Management

You should have 2-3 terminals/processes running:

### Terminal 1: Backend (Keep Running)
```
Status: ✅ RUNNING on http://127.0.0.1:8000
Command: python -m uvicorn app.main:app --reload
Keep this running in background
```

### Terminal 2: Frontend (Installing)
```
Status: ⏳ npm install in progress
Will run: npm run dev
After installation, frontend runs on http://localhost:5173
```

### Terminal 3: Browser
```
Status: Ready to open
Go to: http://localhost:5173
```

---

## ✨ Features Available

Once both are running, you can:

✅ **Generate Test Cases**
- Fill user story form
- Click "Generate"
- Get 5-15 test cases in seconds

✅ **View Results**
- Table with expandable rows
- Confidence scores (color-coded)
- Test case details (steps, data, etc.)

✅ **Download Results**
- CSV format (Excel)
- JSON format (APIs)

✅ **Approve/Reject**
- Mark test cases as approved/rejected
- Ready for team review

✅ **Clear Form**
- Reset everything
- Start fresh

---

## 📊 What to Expect

### Generation Speed
- Typical: 4-8 seconds per request
- Includes LLM API calls
- Confidence scoring

### Test Cases Generated
- Per generation: 5-15 test cases
- Types: Functional, Positive, Negative, Boundary
- Confidence: 0.6 - 0.95 (color-coded)

### File Downloads
- CSV: Spreadsheet format
- JSON: API format
- All test case details included

---

## 🐛 Troubleshooting

### Issue: Frontend still loading
**Solution**: Wait for "npm install" to complete (2-5 min)

### Issue: Backend connection error
**Solution**: Backend is running, might be CORS - check browser console

### Issue: Empty test cases
**Solution**: Fallback generation ensures results, LLM integration working

### Issue: Download fails
**Solution**: Check file permissions, ensure test cases are valid

### Issue: "Port in use" error
**Solution 1**: Kill process on port 5173: `netstat -ano | findstr :5173`
**Solution 2**: Run on different port: `vite --port 5174`

---

## 📞 Important Files

| File | Location | Purpose |
|------|----------|---------|
| Frontend | `frontend/` | React app source |
| Backend | `backend/` | FastAPI source |
| Frontend Docs | `frontend/README.md` | Frontend guide |
| Backend Docs | `BACKEND_SETUP_TESTING_GUIDE.md` | Backend guide |
| Integration | `COMPLETE_INTEGRATION_GUIDE.md` | Both together |

---

## 🎊 Success Indicators

### ✅ Backend Running
- Terminal shows "Uvicorn running on http://127.0.0.1:8000"
- No error messages
- Logs show application startup

### ✅ Frontend Running
- Terminal shows "Local: http://127.0.0.1:5173/"
- Browser displays UI
- No console errors

### ✅ Both Connected
- Form submission works
- Test cases appear
- Downloads available

---

## 🚀 Next Steps

### Step 1: Wait for npm install
- Monitor the installer
- It will show when complete

### Step 2: Frontend starts
- Watch for "Local: http://127.0.0.1:5173/" message
- Browser may auto-open

### Step 3: Open application
- If not auto-opened, go to: http://localhost:5173
- You should see the UI

### Step 4: Test the system
- Fill form with test data
- Click "Generate Test Cases"
- See test cases appear
- Download CSV or JSON

### Step 5: You're done!
- Both servers running
- Application working
- Ready to use!

---

## 📝 Commands Reference

If you need to manually restart:

```bash
# Backend (if stopped)
cd backend
python -m uvicorn app.main:app --reload

# Frontend (if stopped)  
cd frontend
npm run dev

# Check if ports are available
netstat -ano | findstr :8000
netstat -ano | findstr :5173
```

---

## ⏱️ Timeline

**Current Time**: Apr 11, 2026 12:08 PM

**Installation Timeline**:
- ⏳ npm install: 2-5 minutes (In Progress)
- Frontend startup: 30 seconds (After install)
- System ready: ~3-7 minutes total

**Expected ready time**: ~12:15 PM

---

## 🎯 Final Checklist

When everything is set up:

- [ ] Backend running on http://127.0.0.1:8000
- [ ] Frontend running on http://127.0.0.1:5173
- [ ] Browser displays Test Case Generation Agent UI
- [ ] Form has 3 input fields (title, description, AC)
- [ ] Generate button is visible
- [ ] No errors in browser console
- [ ] Test generation works (generates test cases in 3-8 sec)
- [ ] Downloads work (CSV and JSON)
- [ ] Approve/Reject buttons function

Once all checked ✅ - **YOUR SYSTEM IS READY!**

---

**Status**: ✅ Backend Ready + ⏳ Frontend Installing  
**Time**: April 11, 2026  
**Ready in**: ~3-7 minutes

