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

export interface StoredTestCase extends TestCase {
  _id: string;
  userStoryTitle: string;
  userStoryDescription: string;
  ingestedAt: string;
  version: number;
  // Optional Jira metadata (populated during Jira-workflow ingestion)
  jiraStoryKey?: string;
  jiraProjectKey?: string;
  storySummary?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
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
  score: number;    // 0.0 – 1.0
  reason: string;   // LLM explanation
  passed: boolean;  // score meets threshold (hallucination: inverted)
}

export interface EvalResult {
  testCaseId: string;
  testCaseTitle: string;
  // RAGAS-style retrieval metrics
  faithfulness: MetricResult;
  answerRelevancy: MetricResult;
  contextualPrecision: MetricResult;
  contextualRecall: MetricResult;
  // Hallucination (lower = better; passed when score <= 0.20)
  hallucination: MetricResult;
  // Custom LLM judge
  gEvalQuality: MetricResult;
  // Test-case-specific
  coverageScore: MetricResult;
  actionability: MetricResult;
  stepSpecificity: MetricResult;
  // Aggregates
  overallScore: number;           // weighted 0.0 – 1.0
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
    hallucinationFree: boolean;   // true when ALL hallucination scores <= 0.20
  };
  error?: string;
}

// ── Jira Integration ──────────────────────────────────────────────────────────

export interface JiraConfig {
  baseUrl: string;       // e.g. https://yourorg.atlassian.net
  email: string;         // Jira account email
  apiToken: string;      // Jira API token (not password)
  projectKey: string;    // e.g. "PROJ"
  issueType: string;     // e.g. "Story"
}

export interface JiraStory {
  key: string;           // e.g. "PROJ-42"
  summary: string;
  description: string;
  acceptanceCriteria: string[];
  status: string;        // e.g. "To Do", "In Progress"
  assignee: string | null;
  priority: string;      // e.g. "High"
  url: string;           // direct browser link
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

// ── Extended StoredTestCase metadata ─────────────────────────────────────────
// These optional fields are appended during Jira-workflow ingestion.
export interface JiraIngestMeta {
  jiraStoryKey?: string;
  jiraProjectKey?: string;
  storySummary?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  evalOverallScore?: number;
  evalVerdict?: 'PASS' | 'WARN' | 'FAIL';
}
