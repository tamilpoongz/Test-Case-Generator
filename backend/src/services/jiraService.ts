import axios, { AxiosInstance } from 'axios';
import {
  JiraConfig,
  JiraStory,
  JiraFetchResponse,
  JiraUploadResponse,
  JiraUploadResult,
  TestCase,
} from '../types/index';

class JiraService {
  private client: AxiosInstance;
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
    const token = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
    this.client = axios.create({
      baseURL: config.baseUrl.replace(/\/$/, ''),
      headers: {
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000,
    });
  }

  // ── Validate credentials ────────────────────────────────────────────────────
  async validateConnection(): Promise<{ connected: boolean; displayName?: string; error?: string }> {
    try {
      const res = await this.client.get('/rest/api/3/myself');
      return { connected: true, displayName: res.data.displayName };
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) return { connected: false, error: 'Invalid credentials (401 Unauthorized)' };
      if (status === 403) return { connected: false, error: 'Access denied (403 Forbidden)' };
      if (status === 404) return { connected: false, error: 'Jira URL not found — check Base URL' };
      return { connected: false, error: err.message || 'Connection failed' };
    }
  }

  // ── Fetch stories ───────────────────────────────────────────────────────────
  async fetchStories(maxResults = 50): Promise<JiraFetchResponse> {
    try {
      const jql = `project = "${this.config.projectKey}" AND issuetype = "${this.config.issueType}" ORDER BY created DESC`;
      const res = await this.client.get('/rest/api/3/search', {
        params: {
          jql,
          maxResults,
          startAt: 0,
          fields: 'summary,description,status,assignee,priority,customfield_10014',
        },
      });

      const issues: any[] = res.data.issues || [];
      const stories: JiraStory[] = issues.map((issue) => this.mapIssueToStory(issue));

      return {
        status: 'success',
        stories,
        total: res.data.total || issues.length,
        project: this.config.projectKey,
      };
    } catch (err: any) {
      const status = err.response?.status;
      const msg =
        status === 400
          ? `Bad JQL query — check project key "${this.config.projectKey}"`
          : status === 401
          ? 'Unauthorized — re-validate credentials'
          : err.message || 'Failed to fetch stories';
      return { status: 'error', stories: [], total: 0, project: this.config.projectKey, error: msg };
    }
  }

  // ── Upload test cases as subtasks ───────────────────────────────────────────
  async uploadTestCases(storyKey: string, testCases: TestCase[]): Promise<JiraUploadResponse> {
    const results: JiraUploadResult[] = [];
    let created = 0;
    let failed = 0;

    for (const tc of testCases) {
      try {
        const stepsText = (tc.testSteps || [])
          .map((s, i) => `${i + 1}. ${s}`)
          .join('\n');

        const body = {
          fields: {
            project: { key: this.config.projectKey },
            parent: { key: storyKey },
            issuetype: { name: 'Subtask' },
            summary: `[TC] ${tc.testCaseTitle}`,
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: `Test Case ID: ${tc.testCaseId}` }],
                },
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: `Type: ${tc.testType} | Priority: ${tc.priority}` }],
                },
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: `Preconditions: ${(tc.preconditions || []).join('; ')}` }],
                },
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: `Test Steps:\n${stepsText}` }],
                },
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: `Test Data: ${(tc.testData || []).join(', ')}` }],
                },
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: `Expected Result: ${tc.expectedResult}` }],
                },
              ],
            },
            priority: { name: this.mapPriority(tc.priority) },
          },
        };

        const res = await this.client.post('/rest/api/3/issue', body);
        const jiraKey: string = res.data.key;
        const jiraUrl = `${this.config.baseUrl.replace(/\/$/, '')}/browse/${jiraKey}`;
        results.push({ testCaseTitle: tc.testCaseTitle, jiraKey, jiraUrl });
        created++;
      } catch (err: any) {
        const errMsg = err.response?.data?.errors
          ? JSON.stringify(err.response.data.errors)
          : err.message || 'Unknown error';
        results.push({ testCaseTitle: tc.testCaseTitle, error: errMsg });
        failed++;
      }
    }

    return {
      status: failed === 0 ? 'success' : created > 0 ? 'success' : 'error',
      created,
      failed,
      results,
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────
  private mapIssueToStory(issue: any): JiraStory {
    const fields = issue.fields || {};
    const description = this.parseADF(fields.description);
    const acceptanceCriteria = this.extractAcceptanceCriteria(fields);
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');

    return {
      key: issue.key,
      summary: fields.summary || '',
      description,
      acceptanceCriteria,
      status: fields.status?.name || 'Unknown',
      assignee: fields.assignee?.displayName || null,
      priority: fields.priority?.name || 'Medium',
      url: `${baseUrl}/browse/${issue.key}`,
    };
  }

  private parseADF(adf: any): string {
    if (!adf) return '';
    if (typeof adf === 'string') return adf;
    const lines: string[] = [];
    this.walkADF(adf, lines);
    return lines.join('\n').trim();
  }

  private walkADF(node: any, out: string[]): void {
    if (!node) return;
    if (node.type === 'text') {
      out.push(node.text || '');
      return;
    }
    if (node.type === 'hardBreak') {
      out.push('\n');
      return;
    }
    if (node.content && Array.isArray(node.content)) {
      const childParts: string[] = [];
      for (const child of node.content) {
        const sub: string[] = [];
        this.walkADF(child, sub);
        childParts.push(...sub);
      }
      const text = childParts.join('');
      if (
        node.type === 'paragraph' ||
        node.type === 'heading' ||
        node.type === 'listItem' ||
        node.type === 'bulletList' ||
        node.type === 'orderedList'
      ) {
        if (text.trim()) out.push(text.trim());
      } else {
        out.push(text);
      }
    }
  }

  private extractAcceptanceCriteria(fields: any): string[] {
    // Try Jira Software "Acceptance Criteria" custom field (customfield_10014)
    const customAC = fields['customfield_10014'];
    if (customAC) {
      const text = this.parseADF(customAC);
      if (text.trim()) {
        return text
          .split('\n')
          .map((l: string) => l.trim().replace(/^[-•*\d+.)]\s*/, '').trim())
          .filter((l: string) => l.length > 0);
      }
    }

    // Fall back: look for "Acceptance Criteria" section inside the description ADF
    const descText = this.parseADF(fields.description);
    const acMatch = descText.match(/acceptance criteria[:\s]*([\s\S]*?)(?:\n{2,}|$)/i);
    if (acMatch) {
      return acMatch[1]
        .split('\n')
        .map((l: string) => l.trim().replace(/^[-•*\d+.)]\s*/, '').trim())
        .filter((l: string) => l.length > 0);
    }

    return [];
  }

  private mapPriority(priority: string): string {
    const map: Record<string, string> = {
      Critical: 'Highest',
      High: 'High',
      Medium: 'Medium',
      Low: 'Low',
    };
    return map[priority] || 'Medium';
  }
}

export default JiraService;
