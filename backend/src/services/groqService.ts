import axios from 'axios';

class GroqService {
  private apiKey: string;
  private model: string;
  private baseURL: string = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateTestCases(userStory: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an expert QA engineer and test case generator. Generate exactly 5 comprehensive test cases based on user stories.

RULES FOR DETAILED TEST STEPS:
1. STEP DETAIL: Every test step must be specific and actionable — include exact UI element names, field labels, button text, menu paths, and sample input values.
2. LOGIN: Include login steps ONLY in TC-001 (open the app URL, enter username/email, enter password, click Login button, verify dashboard). TC-002 through TC-005 must assume the user is already logged in — do NOT repeat login steps in those test cases. Exception: include login ONLY if a later test case specifically tests authentication, session expiry, or access control.
3. NAVIGATION: Specify the exact navigation path (e.g., "Click 'Orders' in the left navigation sidebar", "Navigate to Dashboard > Reports > Monthly Sales").
4. FIELD INTERACTIONS: Name each field and value explicitly (e.g., "Enter 'john.doe@example.com' in the 'Email Address' field", "Select 'Manager' from the 'Role' dropdown", "Click the 'Save Changes' button").
5. VERIFICATION: State exactly what to verify after each key action (e.g., "Verify a success toast 'Record saved successfully' appears", "Confirm the data table refreshes and shows the new entry").
6. Each test case must have 5–8 detailed, numbered steps.
7. Cover these test types across the 5 test cases: Positive (happy path), Negative (missing required fields), Negative (invalid/incorrect data), Boundary Validation, and End-to-End Functional.

Return ONLY valid JSON (no markdown, no code blocks, no explanations) with this exact structure:
{"testCases":[{"testCaseId":"TC-001","testCaseTitle":"Title","testType":"Type","preconditions":["cond"],"testSteps":["Detailed step 1","Detailed step 2"],"testData":["data"],"expectedResult":"result","priority":"High"},{"testCaseId":"TC-002","testCaseTitle":"Title","testType":"Type","preconditions":["cond"],"testSteps":["Detailed step 1"],"testData":["data"],"expectedResult":"result","priority":"High"},{"testCaseId":"TC-003","testCaseTitle":"Title","testType":"Type","preconditions":["cond"],"testSteps":["Detailed step 1"],"testData":["data"],"expectedResult":"result","priority":"Medium"},{"testCaseId":"TC-004","testCaseTitle":"Title","testType":"Type","preconditions":["cond"],"testSteps":["Detailed step 1"],"testData":["data"],"expectedResult":"result","priority":"High"},{"testCaseId":"TC-005","testCaseTitle":"Title","testType":"Type","preconditions":["cond"],"testSteps":["Detailed step 1"],"testData":["data"],"expectedResult":"result","priority":"Critical"}]}`
            },
            {
              role: 'user',
              content: `Generate exactly 5 comprehensive test cases with detailed, step-by-step instructions for the following user story.

IMPORTANT REMINDERS:
- TC-001 MUST include login steps (open URL, enter credentials, click Login, verify landing page).
- TC-002 through TC-005: assume user is already logged in — DO NOT include login steps.
- Every step must name specific fields, buttons, menus, and input values.
- Each test case needs 5–8 detailed steps.
- Cover: Positive, Negative (missing fields), Negative (invalid data), Boundary Validation, End-to-End.

User Story:
${userStory}`
            }
          ],
          temperature: 0.7,
          max_tokens: 4096
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      let content = response.data.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present (both ```json and ```)
      content = content.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '');
      
      // Extract JSON - find the first { and last }
      const jsonStartIndex = content.indexOf('{');
      const jsonEndIndex = content.lastIndexOf('}');
      
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex >= jsonStartIndex) {
        content = content.substring(jsonStartIndex, jsonEndIndex + 1);
      }
      
      // Clean up any remaining non-JSON characters
      content = content.trim();
      
      return content;
    } catch (error: any) {
      console.error('⚠️ Groq API Error:', error.response?.status, error.message);
      console.error('Falling back to sample test cases');
      // Return empty marker to trigger fallback
      return JSON.stringify({ testCases: [] });
    }
  }

  async scoreConfidence(testCase: string): Promise<number> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a test case quality evaluator. Return ONLY a number between 0 and 1 representing confidence score.'
            },
            {
              role: 'user',
              content: `Score this test case (0-1): ${testCase}`
            }
          ],
          temperature: 0.3,
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content.trim();
      return parseFloat(content) || 0.8;
    } catch (error) {
      console.error('Error scoring confidence:', error);
      return 0.8;
    }
  }
}

export default GroqService;
