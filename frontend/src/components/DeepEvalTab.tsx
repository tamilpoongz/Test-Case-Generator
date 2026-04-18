import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Collapse,
  IconButton,
  Skeleton,
  Alert,
  Tooltip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { EvalResponse, EvalResult, TestCase } from '../types/index';
import MetricScoreCard, { MetricChip } from './MetricScoreCard';

// ── Verdict chip ──────────────────────────────────────────────────────────────
const VerdictChip: React.FC<{ verdict: 'PASS' | 'WARN' | 'FAIL' }> = ({ verdict }) => {
  const map = {
    PASS: { bg: '#d1fae5', text: '#065f46', border: '#10b981', icon: '✅' },
    WARN: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b', icon: '⚠️' },
    FAIL: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444', icon: '❌' },
  };
  const c = map[verdict];
  return (
    <Chip
      label={`${c.icon} ${verdict}`}
      size="small"
      sx={{
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        fontWeight: 700,
        fontSize: '0.78rem',
      }}
    />
  );
};

// ── Expanded row — full metric breakdown ──────────────────────────────────────
const ExpandedRow: React.FC<{ evalResult: EvalResult; colSpan: number }> = ({ evalResult, colSpan }) => (
  <TableRow>
    <TableCell colSpan={colSpan} sx={{ p: 0, borderBottom: '2px solid #6366f1' }}>
      <Collapse in timeout="auto" unmountOnExit>
        <Box sx={{ p: 2.5, background: 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(139,92,246,0.04) 100%)' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#4f46e5' }}>
            📊 Full Metric Breakdown — {evalResult.testCaseId}: {evalResult.testCaseTitle}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <MetricScoreCard label="Faithfulness"         abbr="Fth" result={evalResult.faithfulness}        />
            <MetricScoreCard label="Answer Relevancy"     abbr="Rel" result={evalResult.answerRelevancy}     />
            <MetricScoreCard label="Contextual Precision" abbr="CPr" result={evalResult.contextualPrecision} />
            <MetricScoreCard label="Contextual Recall"    abbr="CRc" result={evalResult.contextualRecall}    />
            <MetricScoreCard label="Hallucination"        abbr="Hal" result={evalResult.hallucination}       inverted />
            <MetricScoreCard label="G-Eval Quality"       abbr="GEv" result={evalResult.gEvalQuality}        />
            <MetricScoreCard label="Coverage Score"       abbr="Cov" result={evalResult.coverageScore}       />
            <MetricScoreCard label="Actionability"        abbr="Act" result={evalResult.actionability}       />
            <MetricScoreCard label="Step Specificity"     abbr="Spc" result={evalResult.stepSpecificity}     />
          </Box>
        </Box>
      </Collapse>
    </TableCell>
  </TableRow>
);

// ── Table row ─────────────────────────────────────────────────────────────────
const EvalTableRow: React.FC<{ result: EvalResult }> = ({ result }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        hover
        sx={{
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'rgba(99,102,241,0.04)' },
          ...(open && { backgroundColor: 'rgba(99,102,241,0.06)' }),
        }}
        onClick={() => setOpen(o => !o)}
      >
        {/* Expand toggle */}
        <TableCell padding="checkbox">
          <IconButton size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        {/* TC identity */}
        <TableCell>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{result.testCaseId}</Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>{result.testCaseTitle}</Typography>
        </TableCell>

        {/* Metric chips */}
        <TableCell align="center"><MetricChip label="Faithfulness"         result={result.faithfulness}        /></TableCell>
        <TableCell align="center"><MetricChip label="Answer Relevancy"     result={result.answerRelevancy}     /></TableCell>
        <TableCell align="center"><MetricChip label="Contextual Precision" result={result.contextualPrecision} /></TableCell>
        <TableCell align="center"><MetricChip label="Contextual Recall"    result={result.contextualRecall}    /></TableCell>
        <TableCell align="center"><MetricChip label="Hallucination"        result={result.hallucination}       inverted /></TableCell>
        <TableCell align="center"><MetricChip label="G-Eval Quality"       result={result.gEvalQuality}        /></TableCell>
        <TableCell align="center"><MetricChip label="Coverage"             result={result.coverageScore}       /></TableCell>
        <TableCell align="center"><MetricChip label="Actionability"        result={result.actionability}       /></TableCell>
        <TableCell align="center"><MetricChip label="Step Specificity"     result={result.stepSpecificity}     /></TableCell>

        {/* Overall */}
        <TableCell align="center">
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>
            {(result.overallScore * 100).toFixed(0)}%
          </Typography>
        </TableCell>

        {/* Verdict */}
        <TableCell align="center">
          <VerdictChip verdict={result.verdict} />
        </TableCell>
      </TableRow>

      {/* Expanded breakdown */}
      {open && <ExpandedRow evalResult={result} colSpan={12} />}
    </>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
const EvalSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <Box sx={{ mt: 2 }}>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} variant="rectangular" height={52} sx={{ borderRadius: '8px', mb: 1 }} />
    ))}
  </Box>
);

// ── Main DeepEvalTab ──────────────────────────────────────────────────────────
interface DeepEvalTabProps {
  testCases: TestCase[];
  evalResults: EvalResponse | null;
  isEvaluating: boolean;
  evalError: string | null;
  onRunEval: () => void;
}

const HEADER_STYLE = {
  fontWeight: 700,
  fontSize: '0.78rem',
  color: '#4f46e5',
  whiteSpace: 'nowrap' as const,
  backgroundColor: 'rgba(99,102,241,0.06)',
};

export const DeepEvalTab: React.FC<DeepEvalTabProps> = ({
  testCases,
  evalResults,
  isEvaluating,
  evalError,
  onRunEval,
}) => {
  const hasResults = evalResults && evalResults.evaluations.length > 0;
  const s = evalResults?.summary;

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#4f46e5' }}>
            🧪 Deep Eval — LLM-as-Judge
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            9 industry-standard metrics evaluated per test case via Groq LLM
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onRunEval}
          disabled={isEvaluating || testCases.length === 0}
          sx={{
            fontWeight: 700,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            px: 3,
            '&:hover': { background: 'linear-gradient(135deg, #4338ca, #6d28d9)', transform: 'translateY(-1px)' },
            '&:disabled': { background: 'rgba(99,102,241,0.4)', color: 'white' },
            transition: 'all 0.2s',
          }}
        >
          {isEvaluating ? 'Evaluating…' : hasResults ? '🔄 Re-evaluate' : '▶ Run Evaluation'}
        </Button>
      </Box>

      {/* Error */}
      {evalError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
          {evalError}
        </Alert>
      )}

      {/* Empty state before first run */}
      {!isEvaluating && !hasResults && !evalError && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed rgba(99,102,241,0.25)',
            borderRadius: '14px',
            background: 'rgba(99,102,241,0.02)',
          }}
        >
          <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🧪</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#4f46e5', mb: 0.5 }}>
            Ready to Evaluate
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
            Click "▶ Run Evaluation" to score all {testCases.length} test case{testCases.length !== 1 ? 's' : ''} across 9 metrics
          </Typography>
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
            Faithfulness · Answer Relevancy · Contextual Precision · Contextual Recall ·
            Hallucination · G-Eval Quality · Coverage · Actionability · Step Specificity
          </Typography>
        </Paper>
      )}

      {/* Skeleton while loading */}
      {isEvaluating && <EvalSkeleton rows={testCases.length || 5} />}

      {/* Results */}
      {hasResults && s && (
        <>
          {/* Summary banner */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              p: 2,
              mb: 2,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              alignItems: 'center',
            }}
          >
            <Tooltip title="Weighted average across all test cases">
              <Chip
                label={`📈 Avg Score: ${(s.averageOverallScore * 100).toFixed(0)}%`}
                sx={{ fontWeight: 700, backgroundColor: '#ede9fe', color: '#4f46e5', border: '1px solid #a78bfa' }}
              />
            </Tooltip>

            {s.hallucinationFree ? (
              <Chip
                label="✅ Hallucination-Free"
                sx={{ fontWeight: 700, backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #10b981' }}
              />
            ) : (
              <Chip
                label="⚠️ Hallucination Detected"
                sx={{ fontWeight: 700, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b' }}
              />
            )}

            <Chip label={`✅ ${s.passed} PASS`}  size="small" sx={{ backgroundColor: '#d1fae5', color: '#065f46',  fontWeight: 700 }} />
            <Chip label={`⚠️ ${s.warned} WARN`}  size="small" sx={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 700 }} />
            <Chip label={`❌ ${s.failed} FAIL`}  size="small" sx={{ backgroundColor: '#fee2e2', color: '#991b1b',  fontWeight: 700 }} />
            <Typography variant="caption" sx={{ color: '#6b7280', ml: 'auto' }}>
              {s.totalEvaluated} test case{s.totalEvaluated !== 1 ? 's' : ''} evaluated
            </Typography>
          </Box>

          {/* Evaluation table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', overflow: 'hidden' }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...HEADER_STYLE, width: 40 }} />
                  <TableCell sx={HEADER_STYLE}>Test Case</TableCell>
                  <TableCell sx={{ ...HEADER_STYLE, textAlign: 'center' }}>Fth</TableCell>
                  <TableCell sx={{ ...HEADER_STYLE, textAlign: 'center' }}>Rel</TableCell>
                  <TableCell sx={{ ...HEADER_STYLE, textAlign: 'center' }}>CPr</TableCell>
                  <TableCell sx={{ ...HEADER_STYLE, textAlign: 'center' }}>CRc</TableCell>
                  <TableCell sx={{ ...HEADER_STYLE, textAlign: 'center' }}>Hall↓</TableCell>
                  <TableCell sx={{ ...HEADER_STYLE, textAlign: 'center' }}>GEv</TableCell>
                  <TableCell sx={{ ...HEADER_STYLE, textAlign: 'center' }}>Cov</TableCell>
                  <TableCell sx={{ ...HEADER_STYLE, textAlign: 'center' }}>Act</TableCell>
                  <TableCell sx={{ ...HEADER_STYLE, textAlign: 'center' }}>Spc</TableCell>
                  <TableCell sx={{ ...HEADER_STYLE, textAlign: 'center' }}>Score</TableCell>
                  <TableCell sx={{ ...HEADER_STYLE, textAlign: 'center' }}>Verdict</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {evalResults.evaluations.map(r => (
                  <EvalTableRow key={r.testCaseId} result={r} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Legend */}
          <Box sx={{ mt: 1.5, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Fth=Faithfulness · Rel=Answer Relevancy · CPr=Contextual Precision · CRc=Contextual Recall
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Hall↓=Hallucination (lower=better) · GEv=G-Eval Quality · Cov=Coverage · Act=Actionability · Spc=Step Specificity
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DeepEvalTab;
