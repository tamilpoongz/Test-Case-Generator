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
              content: `You are an expert QA test case generator. Generate exactly 5 comprehensive test cases (minimum 5) based on user stories.
              Return ONLY valid JSON (no markdown formatting, no code blocks, no explanations) with this exact structure:
              {"testCases":[{"testCaseId":"TC-001","testCaseTitle":"Title","testType":"Type","preconditions":["cond"],"testSteps":["step"],"testData":["data"],"expectedResult":"result","priority":"High"},...]}`
            },
            {
              role: 'user',
              content: `Generate exactly 5 comprehensive test cases for: ${userStory}`
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
          timeout: 30000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
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
