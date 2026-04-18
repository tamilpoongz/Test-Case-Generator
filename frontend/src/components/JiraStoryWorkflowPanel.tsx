import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';
import { JiraConfig, JiraStory, TestCase, EvalResponse, JiraUploadResponse } from '../types/index';
import { TestCaseTable } from './TestCaseTable';
import { DeepEvalTab } from './DeepEvalTab';
import GenerationStatus from './GenerationStatus';
import { evaluateTestCases, ingestTestCases } from '../services/testcaseService';
import { uploadToJira } from '../services/jiraService';

interface ApprovalMap {
  [testCaseId: string]: 'pending' | 'approved' | 'rejected';
}

interface JiraStoryWorkflowPanelProps {
  story: JiraStory;
  testCases: TestCase[];
  isGenerating: boolean;
  generationError: string | null;
  jiraConfig: JiraConfig;
  mongoConnected: boolean;
  onClose: () => void;
}

// ── Verdict gate: block ingest if any FAIL ────────────────────────────────────
function hasFailingVerdict(evalResults: EvalResponse | null): boolean {
  if (!evalResults) return false;
  return evalResults.evaluations.some(e => e.verdict === 'FAIL');
}

const JiraStoryWorkflowPanel: React.FC<JiraStoryWorkflowPanelProps> = ({
  story,
  testCases,
  isGenerating,
  generationError,
  jiraConfig,
  mongoConnected,
  onClose,
}) => {
  // DeepEval
  const [evalResults, setEvalResults] = useState<EvalResponse | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Approval
  const [approvalMap, setApprovalMap] = useState<ApprovalMap>({});

  // Ingest
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  // Jira upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<JiraUploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Workflow completion flags
  const [ingested, setIngested] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  // ── Approval ──────────────────────────────────────────────────────────────
  const handleApprovalChange = (tcId: string, status: 'approved' | 'rejected') => {
    setApprovalMap(prev => ({ ...prev, [tcId]: status }));
  };

  const approvedCases = testCases.filter(tc => approvalMap[tc.testCaseId] === 'approved');

  // ── DeepEval ──────────────────────────────────────────────────────────────
  const handleRunEval = async () => {
    if (testCases.length === 0) return;
    setIsEvaluating(true);
    setEvalError(null);
    try {
      const result = await evaluateTestCases(
        {
          title: story.summary,
          description: story.description,
          acceptanceCriteria: story.acceptanceCriteria,
        },
        testCases
      );
      setEvalResults(result);
    } catch (err: any) {
      setEvalError(err.message || 'Evaluation failed');
    } finally {
      setIsEvaluating(false);
    }
  };

  // ── Ingest ────────────────────────────────────────────────────────────────
  // Build set of FAIL-verdict IDs to exclude from ingest
  const failIds = new Set(
    evalResults?.evaluations
      .filter(e => e.verdict === 'FAIL')
      .map(e => e.testCaseId) ?? []
  );
  const eligibleForIngest = approvedCases.filter(tc => !failIds.has(tc.testCaseId));
  const failExcludedCount = approvedCases.length - eligibleForIngest.length;

  const ingestEnabled =
    mongoConnected &&
    eligibleForIngest.length > 0 &&
    evalResults !== null &&
    !ingested;

  const handleIngest = async () => {
    setIsIngesting(true);
    setIngestStatus(null);
    try {
      const result = await ingestTestCases(eligibleForIngest, story.summary, story.description);
      if (result.status === 'success') {
        const excludeNote = failExcludedCount > 0
          ? ` (⚠️ ${failExcludedCount} FAIL-verdict TC${failExcludedCount > 1 ? 's' : ''} excluded)`
          : '';
        setIngestStatus(`✅ Ingested ${result.ingested} test cases into MongoDB${excludeNote}`);
        setIngested(true);
      } else {
        setIngestStatus(`❌ Ingest failed: ${result.message}`);
      }
    } catch (err: any) {
      setIngestStatus(`❌ ${err.message}`);
    } finally {
      setIsIngesting(false);
    }
  };

  // ── Upload to Jira ────────────────────────────────────────────────────────
  const uploadEnabled = ingested && !uploaded;

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await uploadToJira(jiraConfig, story.key, approvedCases);
      setUploadResult(result);
      if (result.status === 'success') setUploaded(true);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Active step ───────────────────────────────────────────────────────────
  const activeStep =
    uploaded ? 4 :
    ingested ? 3 :
    evalResults !== null ? 2 :
    testCases.length > 0 ? 1 : 0;

  const STEPS = ['Generated', 'Reviewed & Approved', 'DeepEval Validated', 'Ingested to MongoDB', 'Uploaded to Jira'];

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#4f46e5' }}>
            📋 {story.key}: {story.summary}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            {story.status} · {story.priority} · {story.assignee || 'Unassigned'}
          </Typography>
        </Box>
        <Button size="small" onClick={onClose} variant="outlined" color="inherit">
          ← Back to Stories
        </Button>
      </Box>

      {/* Progress stepper */}
      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: '12px', p: 2, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label, i) => (
            <Step key={label} completed={i < activeStep}>
              <StepLabel
                StepIconProps={{
                  sx: { color: i < activeStep ? '#10b981 !important' : undefined },
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', fontWeight: i === activeStep ? 700 : 400 }}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step 1 — Generation */}
      <GenerationStatus
        status={isGenerating ? 'loading' : generationError ? 'error' : testCases.length > 0 ? 'success' : 'idle'}
        message={isGenerating ? 'Generating test cases…' : generationError || (testCases.length > 0 ? `Generated ${testCases.length} test cases` : '')}
        isLoading={isGenerating}
      />

      {/* Step 2 — Review & Approval */}
      {testCases.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              ✏️ Review &amp; Approve Test Cases
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={`${approvedCases.length} Approved`} size="small" color={approvedCases.length > 0 ? 'success' : 'default'} />
              <Chip
                label={`${testCases.filter(tc => approvalMap[tc.testCaseId] === 'rejected').length} Rejected`}
                size="small"
                color="error"
                variant="outlined"
              />
            </Box>
          </Box>
          <TestCaseTable
            testCases={testCases}
            showCheckboxes={false}
            showApprovalActions
            approvalMap={approvalMap}
            onApprovalChange={handleApprovalChange}
          />
        </Box>
      )}

      {/* Step 3 — DeepEval */}
      {testCases.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <DeepEvalTab
            testCases={testCases}
            evalResults={evalResults}
            isEvaluating={isEvaluating}
            evalError={evalError}
            onRunEval={handleRunEval}
          />
          {evalResults && hasFailingVerdict(evalResults) && (
            <Alert severity="error" sx={{ mt: 1.5, borderRadius: '10px' }}>
              ❌ One or more test cases have a <strong>FAIL</strong> verdict. Fix or remove them before ingesting.
            </Alert>
          )}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Step 4 — Ingest */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          disabled={!ingestEnabled || isIngesting}
          onClick={handleIngest}
          startIcon={isIngesting ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#fff', fontWeight: 700 }}
        >
          {isIngesting ? 'Ingesting…' : `💾 Ingest to MongoDB${eligibleForIngest.length < approvedCases.length ? ` (${eligibleForIngest.length} eligible)` : ''}`}
        </Button>
        {!evalResults && (
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
            Run DeepEval first
          </Typography>
        )}
        {evalResults && failExcludedCount > 0 && (
          <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 600 }}>
            ⚠️ {failExcludedCount} FAIL-verdict TC{failExcludedCount > 1 ? 's' : ''} will be excluded from ingest
          </Typography>
        )}
        {!mongoConnected && (
          <Typography variant="caption" sx={{ color: '#f59e0b' }}>
            MongoDB not connected
          </Typography>
        )}
        {ingestStatus && (
          <Typography variant="body2" sx={{ color: ingested ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {ingestStatus}
          </Typography>
        )}
      </Box>

      {/* Step 5 — Upload to Jira */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          disabled={!uploadEnabled || isUploading}
          onClick={handleUpload}
          startIcon={isUploading ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700 }}
        >
          {isUploading ? 'Uploading…' : '🔗 Upload to Jira'}
        </Button>
        {!ingested && (
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
            Ingest to MongoDB first
          </Typography>
        )}

        {uploadError && (
          <Alert severity="error" sx={{ flex: 1, borderRadius: '10px' }}>
            {uploadError}
          </Alert>
        )}
      </Box>

      {/* Upload result summary */}
      {uploadResult && (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: '12px' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {uploadResult.status === 'success' ? '✅' : '⚠️'} Jira Upload Summary — {uploadResult.created} created · {uploadResult.failed} failed
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {uploadResult.results.map((r, i) => (
              <Box component="li" key={i} sx={{ fontSize: '0.8rem', mb: 0.5, color: r.error ? '#ef4444' : '#065f46' }}>
                {r.testCaseTitle}
                {r.jiraKey && (
                  <> →{' '}
                    <a href={r.jiraUrl} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 600 }}>
                      {r.jiraKey}
                    </a>
                  </>
                )}
                {r.error && <> — {r.error}</>}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default JiraStoryWorkflowPanel;
