import axios from 'axios';
import { EvalResult, EvalResponse, MetricResult } from '../types/index';

// ── Metric weights (must sum to 1.0) ─────────────────────────────────────────
const WEIGHTS = {
  faithfulness:       0.15,
  answerRelevancy:    0.15,
  contextualPrecision:0.10,
  contextualRecall:   0.10,
  hallucination:      0.20,  // inverted in weighted calc
  gEvalQuality:       0.15,
  coverageScore:      0.10,
  actionability:      0.03,
  stepSpecificity:    0.02,
} as const;

// ── Pass thresholds ───────────────────────────────────────────────────────────
const THRESHOLDS = {
  faithfulness:        0.75,
  answerRelevancy:     0.75,
  contextualPrecision: 0.70,
  contextualRecall:    0.70,
  hallucination:       0.20,  // passed when score <= threshold
  gEvalQuality:        0.75,
  coverageScore:       0.70,
  actionability:       0.75,
  stepSpecificity:     0.75,
} as const;

type MetricKey = keyof typeof WEIGHTS;

// ── LLM prompt ────────────────────────────────────────────────────────────────
function buildEvalPrompt(
  userStory: { title: string; description: string; acceptanceCriteria: string[] },
  tc: any
): string {
  const acText = userStory.acceptanceCriteria.length
    ? userStory.acceptanceCriteria.map((c, i) => `  AC${i + 1}: ${c}`).join('\n')
    : '  (none provided)';

  return `You are a senior QA evaluation expert. Score the following TEST CASE against its USER STORY using 9 metrics. Return ONLY valid JSON — no markdown, no explanation outside the JSON.

===  USER STORY  ===
Title: ${userStory.title}
Description: ${userStory.description}
Acceptance Criteria:
${acText}

===  TEST CASE  ===
ID: ${tc.testCaseId}
Title: ${tc.testCaseTitle}
Type: ${tc.testType}
Priority: ${tc.priority}
Preconditions: ${(tc.preconditions || []).join('; ')}
Test Steps:
${(tc.testSteps || []).map((s: string, i: number) => `  ${i + 1}. ${s}`).join('\n')}
Test Data: ${(tc.testData || []).join(', ')}
Expected Result: ${tc.expectedResult}

===  SCORING GUIDE  ===
Score each metric 0.0 – 1.0 (two decimal places). For HALLUCINATION a LOWER score is better (0.0 = zero hallucination).

1. faithfulness        – Does the test case ONLY assert things the user story explicitly supports? Penalise for assumptions not in the story.
2. answerRelevancy     – Does this test case directly test scenarios from the user story? Penalise off-topic scenarios.
3. contextualPrecision – Are the test steps accurate, logically ordered, and contextually correct for the feature?
4. contextualRecall    – Does this single test case cover the scope implied by its type (positive/negative/boundary)?
5. hallucination       – Does the test case introduce features, fields, or behaviours NOT mentioned in the user story? (0.0 = none, 1.0 = severe)
6. gEvalQuality        – Overall completeness, clarity, and actionability judged as a QA professional.
7. coverageScore       – How well does this test case cover the acceptance criteria relevant to its type?
8. actionability       – Can a tester execute this without ambiguity? Are all steps clear enough to follow?
9. stepSpecificity     – Are exact field names, button labels, input values, and UI elements named in the steps?

Return this exact JSON structure:
{
  "faithfulness":        {"score": 0.00, "reason": "one sentence"},
  "answerRelevancy":     {"score": 0.00, "reason": "one sentence"},
  "contextualPrecision": {"score": 0.00, "reason": "one sentence"},
  "contextualRecall":    {"score": 0.00, "reason": "one sentence"},
  "hallucination":       {"score": 0.00, "reason": "one sentence"},
  "gEvalQuality":        {"score": 0.00, "reason": "one sentence"},
  "coverageScore":       {"score": 0.00, "reason": "one sentence"},
  "actionability":       {"score": 0.00, "reason": "one sentence"},
  "stepSpecificity":     {"score": 0.00, "reason": "one sentence"}
}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function clamp(v: number): number {
  return Math.min(1, Math.max(0, isNaN(v) ? 0 : v));
}

function makeMetric(key: MetricKey, raw: any): MetricResult {
  const score = clamp(parseFloat(raw?.score ?? 0));
  const reason = typeof raw?.reason === 'string' ? raw.reason : 'No reason provided';
  const threshold = THRESHOLDS[key];
  const passed = key === 'hallucination' ? score <= threshold : score >= threshold;
  return { score, reason, passed };
}

function computeOverallScore(metrics: Record<MetricKey, MetricResult>): number {
  let total = 0;
  for (const key of Object.keys(WEIGHTS) as MetricKey[]) {
    const w = WEIGHTS[key];
    // Hallucination contribution: invert so 0.0 hallucination = full weight contribution
    const contribution =
      key === 'hallucination' ? (1 - metrics[key].score) * w : metrics[key].score * w;
    total += contribution;
  }
  return clamp(total);
}

function computeVerdict(
  overallScore: number,
  hallucinationScore: number
): 'PASS' | 'WARN' | 'FAIL' {
  if (overallScore < 0.60 || hallucinationScore > 0.40) return 'FAIL';
  if (overallScore < 0.80 || hallucinationScore > 0.20) return 'WARN';
  return 'PASS';
}

// ── EvalService ───────────────────────────────────────────────────────────────
class EvalService {
  private apiKey: string;
  private model: string;
  private baseURL = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async scoreOneTestCase(
    userStory: { title: string; description: string; acceptanceCriteria: string[] },
    tc: any
  ): Promise<EvalResult> {
    const prompt = buildEvalPrompt(userStory, tc);

    const response = await axios.post(
      `${this.baseURL}/chat/completions`,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a QA evaluation expert. Return ONLY valid JSON with no markdown fences.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000,
      }
    );

    let content: string = response.data.choices[0].message.content.trim();
    // Strip markdown fences if present
    content = content.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '');
    const s = content.indexOf('{');
    const e = content.lastIndexOf('}');
    if (s !== -1 && e !== -1) content = content.substring(s, e + 1);

    const raw = JSON.parse(content);

    const metrics: Record<MetricKey, MetricResult> = {
      faithfulness:        makeMetric('faithfulness',        raw.faithfulness),
      answerRelevancy:     makeMetric('answerRelevancy',     raw.answerRelevancy),
      contextualPrecision: makeMetric('contextualPrecision', raw.contextualPrecision),
      contextualRecall:    makeMetric('contextualRecall',    raw.contextualRecall),
      hallucination:       makeMetric('hallucination',       raw.hallucination),
      gEvalQuality:        makeMetric('gEvalQuality',        raw.gEvalQuality),
      coverageScore:       makeMetric('coverageScore',       raw.coverageScore),
      actionability:       makeMetric('actionability',       raw.actionability),
      stepSpecificity:     makeMetric('stepSpecificity',     raw.stepSpecificity),
    };

    const overallScore = computeOverallScore(metrics);
    const verdict = computeVerdict(overallScore, metrics.hallucination.score);

    return {
      testCaseId: tc.testCaseId,
      testCaseTitle: tc.testCaseTitle,
      ...metrics,
      overallScore,
      verdict,
    };
  }

  async evaluateTestCases(
    userStory: { title: string; description: string; acceptanceCriteria: string[] },
    testCases: any[]
  ): Promise<EvalResponse> {
    if (!testCases || testCases.length === 0) {
      return {
        status: 'success',
        evaluations: [],
        summary: {
          totalEvaluated: 0,
          passed: 0,
          warned: 0,
          failed: 0,
          averageOverallScore: 0,
          hallucinationFree: true,
        },
      };
    }

    const evaluations: EvalResult[] = [];

    // Evaluate test cases sequentially to avoid Groq rate-limit bursts
    for (const tc of testCases) {
      try {
        const result = await this.scoreOneTestCase(userStory, tc);
        evaluations.push(result);
        console.log(
          `  ✓ Eval [${tc.testCaseId}] — overall: ${result.overallScore.toFixed(2)}, verdict: ${result.verdict}, hallucination: ${result.hallucination.score.toFixed(2)}`
        );
      } catch (err: any) {
        console.error(`  ✗ Eval failed for [${tc.testCaseId}]:`, err.message);
        // Push a fallback result so the UI always gets a complete list
        const fallback: EvalResult = {
          testCaseId: tc.testCaseId,
          testCaseTitle: tc.testCaseTitle,
          faithfulness:        { score: 0, reason: 'Evaluation failed', passed: false },
          answerRelevancy:     { score: 0, reason: 'Evaluation failed', passed: false },
          contextualPrecision: { score: 0, reason: 'Evaluation failed', passed: false },
          contextualRecall:    { score: 0, reason: 'Evaluation failed', passed: false },
          hallucination:       { score: 0, reason: 'Evaluation failed', passed: true },
          gEvalQuality:        { score: 0, reason: 'Evaluation failed', passed: false },
          coverageScore:       { score: 0, reason: 'Evaluation failed', passed: false },
          actionability:       { score: 0, reason: 'Evaluation failed', passed: false },
          stepSpecificity:     { score: 0, reason: 'Evaluation failed', passed: false },
          overallScore: 0,
          verdict: 'FAIL',
        };
        evaluations.push(fallback);
      }
    }

    // Summary
    const passed = evaluations.filter(e => e.verdict === 'PASS').length;
    const warned = evaluations.filter(e => e.verdict === 'WARN').length;
    const failed = evaluations.filter(e => e.verdict === 'FAIL').length;
    const averageOverallScore =
      evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length;
    const hallucinationFree = evaluations.every(e => e.hallucination.score <= 0.20);

    return {
      status: 'success',
      evaluations,
      summary: {
        totalEvaluated: evaluations.length,
        passed,
        warned,
        failed,
        averageOverallScore: clamp(averageOverallScore),
        hallucinationFree,
      },
    };
  }
}

export default EvalService;
