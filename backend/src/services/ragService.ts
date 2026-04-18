import axios from 'axios';

class RAGService {
  private apiKey: string;
  private model: string;
  private baseURL = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyzeImpact(
    newUserStory: { title: string; description: string; acceptanceCriteria: string[] },
    existingTestCases: any[]
  ): Promise<{ impactedTestCases: any[]; impactReasons: Record<string, string> }> {
    if (!existingTestCases.length) {
      return { impactedTestCases: [], impactReasons: {} };
    }

    try {
      const summaries = existingTestCases
        .map(
          (tc, i) =>
            `${i + 1}. [${tc.testCaseId}] "${tc.testCaseTitle}" (Story: "${tc.userStoryTitle}")\n   Steps: ${(tc.testSteps || [])
              .slice(0, 2)
              .join('; ')}`
        )
        .join('\n\n');

      const prompt = `You are a QA impact analysis expert. Identify which EXISTING test cases may be impacted by the NEW user story below.

NEW USER STORY:
Title: ${newUserStory.title}
Description: ${newUserStory.description}
Acceptance Criteria: ${newUserStory.acceptanceCriteria.join(', ')}

EXISTING TEST CASES (${existingTestCases.length} total):
${summaries}

Rules:
- A test case is impacted if the new story changes the same feature, workflow, or has overlapping acceptance criteria.
- Be conservative — only flag genuinely impacted test cases.
- Use empty arrays if none are impacted.

Return ONLY valid JSON with no markdown, no explanation:
{"impactedIndices":[1,3],"reasons":{"1":"brief reason","3":"brief reason"}}`;

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a QA impact analysis expert. Return only valid JSON, no markdown.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 1024,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      let content: string = response.data.choices[0].message.content.trim();
      // Strip any markdown fences
      content = content.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '');
      const s = content.indexOf('{');
      const e = content.lastIndexOf('}');
      if (s !== -1 && e !== -1) content = content.substring(s, e + 1);

      const parsed = JSON.parse(content);
      const indices: number[] = (parsed.impactedIndices || []).filter(
        (i: any) => typeof i === 'number' && i >= 1 && i <= existingTestCases.length
      );
      const reasons: Record<string, string> = parsed.reasons || {};

      const impactedTestCases = indices.map(i => existingTestCases[i - 1]);
      const impactReasons: Record<string, string> = {};
      indices.forEach(origIdx => {
        const tc = existingTestCases[origIdx - 1];
        const key = String(tc._id || tc.testCaseId);
        impactReasons[key] = reasons[String(origIdx)] || 'Potential overlap with new user story';
      });

      return { impactedTestCases, impactReasons };
    } catch (err: any) {
      console.error('⚠ Impact analysis error:', err.message);
      return { impactedTestCases: [], impactReasons: {} };
    }
  }
}

export default RAGService;
