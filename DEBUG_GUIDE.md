# DEBUG GUIDE - Test Case Generator

## Current Status
✅ **Backend**: Running on http://localhost:3001  
✅ **Frontend**: Running on http://127.0.0.1:5173  

## Issue
Frontend shows "0 test cases" even though backend is returning test cases correctly (verified manually).

## Steps to Debug & Fix

### Step 1: Check Browser Console Logs
1. Open http://127.0.0.1:5173 in browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for your logs starting with 🚀, 📤, ✅, 📥, 📊

### Step 2: Look for These Log Messages

**You should see these in browser console:**
```
🚀 Sending request to: http://localhost:3001/api/testcases/generate
📤 Payload: { title: "...", description: "...", acceptanceCriteria: [...] }
📥 Response data: { status: 'success', draftTestCases: [ {...}, {...} ], summary: {...} }
📊 Test cases in response: 5
```

**If you see ERROR instead:**
```
❌ Generation error: [error message]
```

### Step 3: Check Backend Terminal Logs
Look at the backend terminal (where server is running) for messages like:
```
📨 Received /generate request
Title: [your title]
Description: [your description]
✅ Generated result:
Status: success
Test cases count: 5
```

### Step 4: Fill Form & Test

**Form fields:**
- **Title**: "User Login Feature"
- **Description**: "Users should be able to login with their credentials"
- **Acceptance Criteria** (each on new line):
  - Username field
  - Password field  
  - Login button

### Step 5: What Each Log Means

| Log | Meaning | Action |
|-----|---------|--------|
| 🚀 Sending request | Frontend is sending request to backend | Good ✅ |
| 📤 Payload | What frontend is sending | Check title/description not empty |
| ❌ Generation error | Error calling backend | Check backend isrunning |
| 📥 Response data | What backend returned | Should have `draftTestCases` array |
| 📊 Test cases count: 0 | Response received but empty | Backend issue |
| 📊 Test cases count: 5 | SUCCESS! Response complete | Tests should display |

### Step 6: If Still Showing 0

Check for:
1. **CORS Issue**: If you see CORS error in console, the frontend can't reach backend
2. **Wrong Port**: Ensure frontend is using http://localhost:3001 (not 3000 or 8000)
3. **Backend Not Running**: Check terminal for backend startup message
4. **Response Structure**: Check if draftTestCases is present in response

## Common Issues & Solutions

### Issue 1: "Cannot POST /api/testcases/generate"
**Solution**: Backend not running or wrong port. Restart background terminal with backend.

### Issue 2: CORS Error
**Solution**: Backend CORS might be blocking. Check .env file has correct CORS_ORIGINS

### Issue 3: "draftTestCases is not recognized"
**Solution**: Type mismatch. Check if backend is returning the correct property name.

### Issue 4: Response is empty object `{}`
**Solution**: Check if backend route is actually being hit. Add console.log at top of route.

## Quick Test
Open terminal and run:
```powershell
cd 'c:\Users\LENOVO\Desktop\AI by Testleaf\Phase - 2\Week 11 & 12 Hackathon\Test Case Generator\backend'
cmd /c curl -s -X POST http://localhost:3001/api/testcases/generate -H "Content-Type: application/json" -d @test-request.json
```

Should return:
```json
{"status":"success","draftTestCases":[...5 test cases...],"summary":{...}}
```

If you see an error, the backend route isbroken.

## Contact Points to Debug
1. **Frontend Service** (`frontend/src/services/testcaseService.ts`): Makes the API call
2. **App Component** (`frontend/src/App.tsx`): Processes the response
3. **Backend Route** (`backend/src/routes/testcaseRoutes.ts`): Receives request & returns response
4. **Test Case Service** (`backend/src/services/testCaseService.ts`): Generates test cases

---

**Now test and share the logs/error messages you see!**
