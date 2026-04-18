export interface UserStory {
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface TestCase {
  testCaseId: string;
  testCaseTitle: string;
  testType: 'Functional' | 'Positive' | 'Negative' | 'Boundary Validation';
  preconditions: string[];
  testSteps: string[];
  testData: string[];
  expectedResult: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  confidenceScore?: number;
  // Per-row review state (used in Jira workflow)
  reviewStatus?: 'pending' | 'approved' | 'rejected';
}

export interface GenerationResponse {
  status: 'success' | 'error';
  draftTestCases: TestCase[];
  summary: {
    totalTestCases: number;
    byType: Record<string, number>;
    averageConfidence: number;
  };
  error?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface StoredTestCase extends TestCase {
  _id: string;
  userStoryTitle: string;
  userStoryDescription: string;
  ingestedAt: string;
  version: number;
  // Optional Jira metadata
  jiraStoryKey?: string;
  jiraProjectKey?: string;
  storySummary?: string;
  approvedAt?: string;
  evalOverallScore?: number;
  evalVerdict?: 'PASS' | 'WARN' | 'FAIL';
}

export interface ImpactAnalysisResponse {
  status: 'success' | 'error';
  newTestCases: TestCase[];
  impactedTestCases: StoredTestCase[];
  impactReasons: Record<string, string>;
  summary: {
    totalNewTestCases: number;
    totalImpacted: number;
    byType: Record<string, number>;
    averageConfidence: number;
  };
  mongoConnected: boolean;
  error?: string;
}

export interface IngestResponse {
  status: 'success' | 'error';
  ingested: number;
  updated: number;
  message: string;
}

// ── DeepEval / LLM-as-Judge ───────────────────────────────────────────────────

export interface MetricResult {
  score: number;
  reason: string;
  passed: boolean;
}

export interface EvalResult {
  testCaseId: string;
  testCaseTitle: string;
  faithfulness: MetricResult;
  answerRelevancy: MetricResult;
  contextualPrecision: MetricResult;
  contextualRecall: MetricResult;
  hallucination: MetricResult;   // lower = better
  gEvalQuality: MetricResult;
  coverageScore: MetricResult;
  actionability: MetricResult;
  stepSpecificity: MetricResult;
  overallScore: number;
  verdict: 'PASS' | 'WARN' | 'FAIL';
}

export interface EvalResponse {
  status: 'success' | 'error';
  evaluations: EvalResult[];
  summary: {
    totalEvaluated: number;
    passed: number;
    warned: number;
    failed: number;
    averageOverallScore: number;
    hallucinationFree: boolean;
  };
  error?: string;
}

// ── Jira Integration ──────────────────────────────────────────────────────────

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  issueType: string;
}

export interface JiraStory {
  key: string;
  summary: string;
  description: string;
  acceptanceCriteria: string[];
  status: string;
  assignee: string | null;
  priority: string;
  url: string;
}

export interface JiraFetchResponse {
  status: 'success' | 'error';
  stories: JiraStory[];
  total: number;
  project: string;
  error?: string;
}

export interface JiraUploadResult {
  testCaseTitle: string;
  jiraKey?: string;
  jiraUrl?: string;
  error?: string;
}

export interface JiraUploadResponse {
  status: 'success' | 'error';
  created: number;
  failed: number;
  results: JiraUploadResult[];
  error?: string;
}
