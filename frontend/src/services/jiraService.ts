import { JiraConfig, JiraFetchResponse, JiraUploadResponse, TestCase } from '../types/index';

const API_BASE_PATH = '/api';

export const validateJiraConnection = async (
  config: JiraConfig
): Promise<{ connected: boolean; displayName?: string; error?: string }> => {
  const response = await fetch(`${API_BASE_PATH}/jira/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
};

export const fetchJiraStories = async (
  config: JiraConfig,
  maxResults = 50
): Promise<JiraFetchResponse> => {
  const response = await fetch(`${API_BASE_PATH}/jira/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...config, maxResults }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
};

export const uploadToJira = async (
  config: JiraConfig,
  storyKey: string,
  testCases: TestCase[]
): Promise<JiraUploadResponse> => {
  const response = await fetch(`${API_BASE_PATH}/jira/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...config, storyKey, testCases }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  return response.json();
};
