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
