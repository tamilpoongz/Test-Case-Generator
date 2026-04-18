import { Router, Request, Response } from 'express';
import JiraService from '../services/jiraService';
import { JiraConfig } from '../types/index';

const router = Router();

// ── Shared helper: extract + validate JiraConfig from request body ────────────
function extractConfig(body: any): { config: JiraConfig; error?: string } {
  const { baseUrl, email, apiToken, projectKey, issueType } = body;
  if (!baseUrl || !email || !apiToken || !projectKey) {
    return {
      config: {} as JiraConfig,
      error: 'Missing required Jira config fields: baseUrl, email, apiToken, projectKey',
    };
  }
  return {
    config: {
      baseUrl: String(baseUrl).trim(),
      email: String(email).trim(),
      apiToken: String(apiToken).trim(),
      projectKey: String(projectKey).trim().toUpperCase(),
      issueType: String(issueType || 'Story').trim(),
    },
  };
}

// ── POST /api/jira/validate ───────────────────────────────────────────────────
router.post('/validate', async (req: Request, res: Response) => {
  const { config, error } = extractConfig(req.body);
  if (error) return res.status(400).json({ status: 'error', connected: false, error });

  try {
    const jira = new JiraService(config);
    const result = await jira.validateConnection();
    res.json({ status: result.connected ? 'success' : 'error', ...result });
  } catch (err: any) {
    res.status(500).json({ status: 'error', connected: false, error: err.message });
  }
});

// ── POST /api/jira/stories ────────────────────────────────────────────────────
router.post('/stories', async (req: Request, res: Response) => {
  const { config, error } = extractConfig(req.body);
  if (error) return res.status(400).json({ status: 'error', stories: [], total: 0, project: '', error });

  const maxResults = typeof req.body.maxResults === 'number' ? req.body.maxResults : 50;

  try {
    const jira = new JiraService(config);
    const result = await jira.fetchStories(maxResults);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: 'error', stories: [], total: 0, project: config.projectKey, error: err.message });
  }
});

// ── POST /api/jira/upload ─────────────────────────────────────────────────────
router.post('/upload', async (req: Request, res: Response) => {
  const { config, error } = extractConfig(req.body);
  if (error) return res.status(400).json({ status: 'error', created: 0, failed: 0, results: [], error });

  const { storyKey, testCases } = req.body;

  if (!storyKey || typeof storyKey !== 'string') {
    return res.status(400).json({ status: 'error', created: 0, failed: 0, results: [], error: 'storyKey is required' });
  }
  if (!Array.isArray(testCases) || testCases.length === 0) {
    return res.status(400).json({ status: 'error', created: 0, failed: 0, results: [], error: 'testCases array is required' });
  }

  try {
    const jira = new JiraService(config);
    const result = await jira.uploadTestCases(storyKey, testCases);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ status: 'error', created: 0, failed: testCases.length, results: [], error: err.message });
  }
});

export default router;
