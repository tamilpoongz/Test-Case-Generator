# 📮 Postman Collection Setup Guide

**Complete guide to testing Test Case Generator APIs using Postman**

---

## 📥 Quick Import (2 minutes)

### Step 1: Download the Collection Files
You have two files:
1. **`TestCaseGeneratorAPI.postman_collection.json`** - The API collection
2. **`TestCaseGenerator_Environment.postman_environment.json`** - Environment configuration

### Step 2: Import Collection in Postman

**Method A: Using Postman UI (Easiest)**
1. Open Postman
2. Click **"Import"** button (top-left)
3. Select **"Upload Files"** tab
4. Choose `TestCaseGeneratorAPI.postman_collection.json`
5. Click **"Import"**

**Method B: Via File Menu**
1. Click **File** → **Import**
2. Upload `TestCaseGeneratorAPI.postman_collection.json`

### Step 3: Import Environment

1. Click **"Import"** again
2. Upload `TestCaseGenerator_Environment.postman_environment.json`
3. In top-right, select **"Test Case Generator - Local"** from the environment dropdown

---

## ✅ What You Get

### 11 Pre-built Requests:

| Request | Purpose | Expected Result |
|---------|---------|-----------------|
| 1. **Health Check** | Verify backend is running | 200 OK |
| 2. **Valid Request** | Generate test cases (basic) | 200 OK + test cases |
| 3. **Complex Feature** | Generate for complex feature | 200 OK + multiple test cases |
| 4. **Minimal Request** | Generate with minimal input | 200 OK |
| 5. **Download CSV** | Export as CSV | 200 OK + CSV file |
| 6. **Download JSON** | Export as JSON | 200 OK + JSON file |
| 7. **Error: Missing Title** | Test validation | 422 Error |
| 8. **Error: Title Too Short** | Test validation | 422 Error |
| 9. **Error: Description Too Short** | Test validation | 422 Error |
| 10. **Error: Empty Criteria** | Test validation | 422 Error |
| 11. **Error: Invalid Format** | Test validation | 422/400 Error |

---

## 🚀 Running Tests

### Before You Start:
✅ Backend must be running: `python -m uvicorn app.main:app --reload`
✅ Environment selected: "Test Case Generator - Local"
✅ Base URL is correct: `http://localhost:8000`

### Test Sequence:

#### **Start Here: Verify Everything Works**
1. **Click: "1. Health Check"**
   - Click **"Send"**
   - Should see: `{"status": "ok"}`
   - Status: **200 OK** ✅

#### **Test: Generate Test Cases (Success Cases)**
2. **Click: "2. Generate Test Cases - Valid Request"**
   - Click **"Send"**
   - Should see: Multiple test cases with confidence scores
   - Status: **200 OK** ✅
   - **Verify in "Tests" tab**: 4 green checkmarks

3. **Click: "3. Generate Test Cases - Complex Feature"**
   - Click **"Send"**
   - Should see: 5+ test cases with varied priorities
   - Status: **200 OK** ✅

4. **Click: "4. Generate Test Cases - Minimal Valid Request"**
   - Click **"Send"**
   - Should see: At least 1 test case
   - Status: **200 OK** ✅

#### **Test: Export Functionality**
5. **Click: "5. Download as CSV"**
   - Click **"Send"**
   - Should see: Downloaded CSV file with headers
   - Content-Type: `text/csv` ✅
   - File contains: `test_id,title,type,priority`

6. **Click: "6. Download as JSON"**
   - Click **"Send"**
   - Should see: JSON array response
   - Content-Type: `application/json` ✅

#### **Test: Error Handling (Expected to Fail - That's Good!)**
7. **Click: "7. Error - Missing Title"**
   - Click **"Send"**
   - Should see: **422 Error** (validation error)
   - Status: **422 Unprocessable Entity** ✅

8. **Click: "8. Error - Title Too Short"**
   - Click **"Send"**
   - Should see: **422 Error**
   - Status: **422 Unprocessable Entity** ✅

9. **Click: "9. Error - Description Too Short"**
   - Click **"Send"**
   - Should see: **422 Error**
   - Status: **422 Unprocessable Entity** ✅

10. **Click: "10. Error - Empty Acceptance Criteria"**
    - Click **"Send"**
    - Should see: **422 Error**
    - Status: **422 Unprocessable Entity** ✅

11. **Click: "11. Error - Invalid Format in Download"**
    - Click **"Send"**
    - Should see: **400 or 422 Error**
    - Status: **4xx Error** ✅

---

## 📊 Understanding Responses

### Successful Generation Response:
```json
{
  "test_cases": [
    {
      "test_id": "TC-001",
      "title": "Successful login with valid credentials",
      "type": "Functional",
      "priority": "High",
      "preconditions": "Application is accessible. User account exists.",
      "steps": "1. Navigate to login page...",
      "test_data": "email: user@example.com, password: ValidPass123",
      "expected_result": "User is logged in and dashboard is displayed",
      "confidence_score": 0.92,
      "review_status": "Approved"
    }
  ],
  "summary": {
    "total_test_cases": 5,
    "by_type": {
      "Functional": 3,
      "Positive": 1,
      "Negative": 1
    },
    "by_priority": {
      "High": 2,
      "Medium": 2,
      "Low": 1
    }
  }
}
```

### Error Response Example:
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "title"],
      "msg": "Field required",
      "input": {}
    }
  ]
}
```

---

## 🔍 Viewing Automated Tests

Each request has **pre-written tests** that automatically verify responses:

1. **Open any request** (e.g., "Health Check")
2. Click **"Tests"** tab (next to "Body")
3. Click **"Send"**
4. See results at bottom: ✅ Passed or ❌ Failed

**Example Test Results:**
```
✅ Status code is 200
✅ Response has status field
✅ Status is ok
```

---

## 🎯 Common Issues & Solutions

### Issue: "Connection refused" or "Cannot connect to localhost:8000"

**Solution:**
1. Backend must be running: `python -m uvicorn app.main:app --reload`
2. Check backend is on port 8000
3. Verify environment variable: `base_url = http://localhost:8000`

### Issue: "422 Unprocessable Entity" on valid request

**Possible causes:**
1. JSON syntax error in request body
2. Missing required fields
3. Field values don't match constraints

**Fix:**
1. Check request body is valid JSON
2. Verify all required fields are present
3. Check field value lengths

### Issue: "500 Internal Server Error"

**Solution:**
1. Check backend logs for error details
2. Verify OpenAI API key is set in `.env`
3. Check internet connection (for LLM calls)
4. Restart backend

### Issue: "Test_cases in response is empty"

**Possible causes:**
1. LLM service is not responding
2. OpenAI API key is invalid
3. LLM rate limit exceeded

**Fix:**
1. Check `.env` file has valid OpenAI API key
2. Wait a moment and retry
3. Check OpenAI dashboard for quota

---

## 📋 Test Checklist

Use this checklist to verify all APIs work correctly:

### Basic Functionality
- [ ] Health Check returns 200 OK
- [ ] Valid request generates test cases
- [ ] Complex request generates multiple test cases
- [ ] Minimal request works

### Export Functionality
- [ ] CSV export returns text/csv content
- [ ] JSON export returns application/json content
- [ ] CSV has proper headers
- [ ] JSON is valid array

### Error Handling
- [ ] Missing title returns 422
- [ ] Short title returns 422
- [ ] Short description returns 422
- [ ] Empty criteria returns 422
- [ ] Invalid format returns 422/400

### Response Validation
- [ ] Test cases have all required fields
- [ ] Confidence scores are 0.0-1.0
- [ ] Priority values are valid (High/Medium/Low)
- [ ] Type values are valid (Functional/Positive/Negative/Boundary)
- [ ] Summary has correct counts

---

## 🔧 Customizing Requests

### Change Backend URL

1. Click **"Test Case Generator - Local"** dropdown (top-right)
2. Click **"Manage Environments"**
3. Find **"base_url"** variable
4. Change value (e.g., `http://your-server.com:8000`)
5. Click **"Save"**

### Create Your Own Request

1. Click **"+"** to create new request
2. Use method **POST**
3. URL: `{{base_url}}/api/testcases/generate`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "title": "Your Feature Title",
  "description": "Your detailed description here",
  "acceptance_criteria": [
    "Criteria 1",
    "Criteria 2"
  ]
}
```
6. Click **"Send"**

### Modify Request Body

1. Open request (e.g., "2. Generate Test Cases - Valid Request")
2. Click **"Body"** tab
3. Edit the JSON payload
4. Click **"Send"**

---

## 📊 Performance Observations

**Expected Response Times:**

| Endpoint | Time | Notes |
|----------|------|-------|
| Health Check | < 100ms | Instant |
| Generate (simple) | 5-15 sec | LLM calls |
| Generate (complex) | 10-30 sec | More phases |
| Download (CSV) | < 100ms | Instant |
| Download (JSON) | < 100ms | Instant |
| Error Response | < 100ms | Validation errors |

---

## 🆘 Getting Help

### Check Backend Errors
1. Look at terminal where backend is running
2. Find error messages in logs
3. Common issues:
   - `OpenAI API error` - Check API key
   - `Connection error` - Check internet
   - `Timeout` - LLM is slow, wait and retry

### Verify API Contract
1. Check request in Postman
2. Compare with documentation in [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)
3. Verify all required fields are present
4. Check field value constraints

### Common OpenAI Errors
- `"Invalid API key"` - Set correct key in `.env`
- `"Rate limit exceeded"` - Wait a minute before retrying
- `"Model not found"` - Verify model in config (usually gpt-3.5-turbo)

---

## 🎓 Next Steps

### After Testing is Complete:

1. **Document any issues found**
   - Screenshot of error response
   - Steps to reproduce
   - Expected vs actual behavior

2. **Fix any API issues** (if any)
   - Use logs to diagnose
   - Update backend code if needed
   - Restart server
   - Re-test with Postman

3. **Move to Frontend** (when ready)
   - Frontend team can use this collection as reference
   - Use response examples to design UI

---

## 📝 Running Automated Test Suite

### Run All Tests at Once:

1. **Right-click** on collection name
2. Select **"Run collection"**
3. Postman opens test runner
4. See all 11 requests execute automatically
5. View summary: ✅ Passed vs ❌ Failed

### Export Test Results:

1. After running, see results window
2. Click **"Export Results"** (top-right)
3. Save as JSON
4. Share with team for documentation

---

## 🚀 Tips & Tricks

### Pro Tip 1: Use Variables
```
Variables in Postman: {{variable_name}}
Example: {{base_url}}/api/testcases/health
```

### Pro Tip 2: Save Request Parameters
After successful test, Postman automatically saves responses:
1. Click **"Sessions"** tab
2. View response history
3. Compare different requests

### Pro Tip 3: Pretty Print Responses
1. Click **"Pretty"** button in response
2. JSON is formatted for easy reading
3. Click **"Raw"** to see raw response

### Pro Tip 4: Copy cURL Command
1. Open any request
2. Click **"Code"** button (right side)
3. Select language (e.g., cURL, Python, JavaScript)
4. Copy command
5. Run in terminal

---

## 📞 Support

**For API implementation issues:**
- Check this guide first
- Look at backend logs
- Review [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) for detailed API docs
- Check error messages in Postman response

**For Postman issues:**
- Check Postman documentation
- Verify collection is imported correctly
- Verify environment is selected
- Check base_url is correct

---

## Summary

**You now have:**
- ✅ Complete Postman collection with 11 requests
- ✅ Automated test scripts for verification
- ✅ Pre-configured environment
- ✅ Request and response examples
- ✅ Error test cases

**To get started:**
1. Import the two JSON files
2. Select environment
3. Run "Health Check" first
4. Then test all other requests

**Time to test:** ~10 minutes

**Happy Testing!** 🎉

---

**Last Updated:** April 11, 2026  
**Backend Version:** 1.0.0  
**API Version:** v1  
**Postman Version:** 10.0+

---

*For detailed API documentation, see [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)*
