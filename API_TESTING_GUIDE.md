# API Testing Guide

This guide helps you quickly test the Test Case Generation Agent API.

## Quick Access

**API Base URL:** `http://localhost:8000`
**Interactive Docs:** `http://localhost:8000/docs` (Swagger UI)
**Alternative Docs:** `http://localhost:8000/redoc` (ReDoc)

## Testing Methods

### Method 1: Using Swagger UI (Easiest)

1. Open `http://localhost:8000/docs` in your browser
2. Find the endpoint you want to test
3. Click "Try it out"
4. Enter request parameters
5. Click "Execute"
6. View response

### Method 2: Using cURL

#### Health Check
```bash
curl http://localhost:8000/api/testcases/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Test Case Generation Agent"
}
```

#### Generate Test Cases
```bash
curl -X POST http://localhost:8000/api/testcases/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "User Login Feature",
    "description": "As a user, I want to login with username and password so that I can access my account securely.",
    "acceptance_criteria": [
      "User can login with correct credentials",
      "System rejects login with wrong password",
      "System handles empty username or password gracefully"
    ]
  }'
```

#### Download Test Cases
```bash
curl -X POST http://localhost:8000/api/testcases/download \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "test_cases": [
      {
        "test_case_id": "TC-001",
        "test_case_title": "Verify user login",
        "test_type": "Positive",
        "preconditions": ["User is on login page"],
        "test_steps": ["Enter username", "Enter password", "Click login"],
        "test_data": ["valid_user", "valid_password"],
        "expected_result": "User logged in successfully",
        "priority": "High",
        "confidence_score": 0.95,
        "review_status": "Draft"
      }
    ]
  }' \
  -o generated_test_cases.csv
```

### Method 3: Using Postman

1. **Import collection:**
   - Go to Postman
   - Click "Import"
   - Paste: `http://localhost:8000/openapi.json`
   - Click Import

2. **Test endpoints:**
   - Select environment (set base URL to `http://localhost:8000`)
   - Click on endpoint
   - Click "Send"
   - View response

### Method 4: Using Python

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Health check
response = requests.get(f"{BASE_URL}/testcases/health")
print(response.json())

# Generate test cases
payload = {
    "title": "User Registration",
    "description": "Register new user with email validation",
    "acceptance_criteria": [
        "Email must be valid format",
        "Duplicate emails rejected",
        "Confirmation email sent"
    ]
}

response = requests.post(f"{BASE_URL}/testcases/generate", json=payload)
print(response.json())
```

## Test Scenarios

### Scenario 1: Basic Happy Path

**Input:**
```json
{
  "title": "Shopping Cart Checkout",
  "description": "User can proceed to checkout from shopping cart",
  "acceptance_criteria": [
    "Calculate total price correctly",
    "Apply discount codes if valid",
    "Redirect to payment page after checkout"
  ]
}
```

**Expected:**
- 200 OK response
- Multiple test cases generated
- Confidence scores between 0.7-1.0

### Scenario 2: Edge Cases

Test with minimum/maximum values:

**Minimum Input:**
```json
{
  "title": "User can log out",
  "description": "The user should be able to log out from the application when clicking the logout button.",
  "acceptance_criteria": [
    "Logout button is visible on dashboard"
  ]
}
```

**Maximum Input:**
```json
{
  "title": "Complex Multi-step Workflow with Many Requirements",
  "description": "This is a very detailed description with many paragraphs explaining the complete workflow...[long text]",
  "acceptance_criteria": [
    "Criterion 1 with detailed explanation",
    "Criterion 2 with detailed explanation",
    "...",
    "Criterion 10 with detailed explanation"
  ]
}
```

### Scenario 3: Error Cases

**Invalid Input (too short):**
```json
{
  "title": "Short",
  "description": "Short desc",
  "acceptance_criteria": []
}
```

**Expected:** 422 Unprocessable Entity

**Missing Fields:**
```json
{
  "title": "Valid Title with Enough Characters"
}
```

**Expected:** 422 Unprocessable Entity

## Response Validation

Check response structure:

```
{
  ✓ status: "success" or "error"
  ✓ draft_test_cases: [array of test cases]
  ✓ summary: {
      ✓ total_test_cases: number
      ✓ functional_count: number
      ✓ positive_count: number
      ✓ negative_count: number
      ✓ boundary_count: number
    }
  ✓ download_supported: boolean
  ✓ download_format: "csv"
}
```

Each test case should have:
- ✓ test_case_id (TC-XXX format)
- ✓ test_case_title (descriptive)
- ✓ test_type (Functional/Positive/Negative/Boundary Validation)
- ✓ preconditions (non-empty list)
- ✓ test_steps (2+ atomic steps)
- ✓ test_data (list of values)
- ✓ expected_result (20+ chars, observable)
- ✓ priority (Low/Medium/High/Critical)
- ✓ confidence_score (0.0-1.0)

## Performance Testing

### Time Generation
- Make request and check response time
- Typical: 30-60 seconds
- Slow if: >90 seconds (check LLM API status)

### Load Testing
```bash
# Using Apache Bench
ab -n 10 -c 1 -p payload.json -T application/json \
  http://localhost:8000/api/testcases/generate
```

## Debugging

### View Detailed Logs

Backend terminal will show:
- Incoming requests
- Phase execution progress
- LLM API calls
- Generation results

### Check Error Messages

Sample error responses:

```json
{
  "status": "error",
  "error": "LLM service temporarily unavailable"
}
```

```json
{
  "status": "error",
  "error": "Validation error",
  "details": {
    "title": ["Title must be at least 10 characters"]
  }
}
```

## Environment Issues

### API Not Responding

```bash
# Check if backend is running
curl http://localhost:8000/api/testcases/health

# If not, restart:
# Terminal 1:
python -m uvicorn app.main:app --reload
```

### OpenAI API Issues

```bash
# Check API key in .env
echo $LLM_API_KEY  # Should print your key

# Verify key is valid at:
# https://platform.openai.com/account/api-keys
```

### CORS Issues

If frontend can't reach backend:
- Check `.env` CORS_ORIGINS includes frontend URL
- Frontend URL should be: `http://localhost:5173` or `http://localhost:3000`

## Success Criteria

API is working correctly if:

- ✅ Health check returns 200 OK
- ✅ Generation accepts valid input
- ✅ Generation rejects invalid input
- ✅ Test cases have all required fields
- ✅ Confidence scores are in 0.0-1.0 range
- ✅ Download returns correct file format
- ✅ Response time is reasonable (<90 seconds)

## Next Steps

After verifying API works:

1. **Test with Postman/Insomnia** - Create collection
2. **Load Testing** - Test with multiple concurrent requests
3. **Integration** - Connect frontend (when ready)
4. **Deployment** - Push to staging/production

---

**Need help?** Check Backend README or review error logs in terminal output.
