import React, { useState, useCallback } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import { WarningAmber as WarningAmberIcon, AutoAwesome as AutoAwesomeIcon, Science as ScienceIcon } from '@mui/icons-material';
import { TestCase, StoredTestCase, EvalResponse } from '../types/index';
import { TestCaseTable } from './TestCaseTable';
import { DeepEvalTab } from './DeepEvalTab';

interface ImpactAnalysisResultsProps {
  newTestCases: TestCase[];
  impactedTestCases: StoredTestCase[];
  impactReasons: Record<string, string>;
  onSelectionChange: (selected: TestCase[]) => void;
  onTestCaseEdit?: (updated: TestCase) => void;
  // Deep Eval props
  evalResults: EvalResponse | null;
  isEvaluating: boolean;
  evalError: string | null;
  onRunEval: () => void;
}

export const ImpactAnalysisResults: React.FC<ImpactAnalysisResultsProps> = ({
  newTestCases,
  impactedTestCases,
  impactReasons,
  onSelectionChange,
  onTestCaseEdit,
  evalResults,
  isEvaluating,
  evalError,
  onRunEval,
}) => {
  const [tab, setTab] = useState<number>(impactedTestCases.length > 0 ? 0 : 1);

  // Track selections from each tab independently
  const [impactedSelected, setImpactedSelected] = useState<TestCase[]>([]);
  const [newSelected, setNewSelected] = useState<TestCase[]>([]);

  const handleImpactedSelect = useCallback(
    (selected: TestCase[]) => {
      setImpactedSelected(selected);
      onSelectionChange([...selected, ...newSelected]);
    },
    [newSelected, onSelectionChange]
  );

  const handleNewSelect = useCallback(
    (selected: TestCase[]) => {
      setNewSelected(selected);
      onSelectionChange([...impactedSelected, ...selected]);
    },
    [impactedSelected, onSelectionChange]
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '16px',
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#4f46e5' }}>
          🧠 Impact Analysis Results
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' },
              '& .Mui-selected': { color: '#6366f1 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#6366f1' },
            }}
          >
            <Tab
              icon={<WarningAmberIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Impacted Test Cases
                  <Chip
                    label={impactedTestCases.length}
                    size="small"
                    color={impactedTestCases.length > 0 ? 'warning' : 'default'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
              }
            />
            <Tab
              icon={<AutoAwesomeIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  New Test Cases
                  <Chip
                    label={newTestCases.length}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
              }
            />
            <Tab
              icon={<ScienceIcon />}
              iconPosition="start"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Deep Eval
                  {evalResults && (
                    <Chip
                      label={`${evalResults.summary.passed}/${evalResults.summary.totalEvaluated} PASS`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: evalResults.summary.hallucinationFree ? '#d1fae5' : '#fef3c7',
                        color: evalResults.summary.hallucinationFree ? '#065f46' : '#92400e',
                      }}
                    />
                  )}
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* Tab 0 — Impacted test cases */}
        {tab === 0 && (
          <Box>
            {impactedTestCases.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '1px dashed #d1d5db',
                  borderRadius: '12px',
                  color: '#6b7280',
                }}
              >
                <WarningAmberIcon sx={{ fontSize: 48, mb: 1, color: '#d1d5db' }} />
                <Typography>No existing test cases are impacted by this user story.</Typography>
              </Paper>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 2, color: '#78350f', bgcolor: '#fef3c7', p: 1.5, borderRadius: '8px', border: '1px solid #fbbf24' }}>
                  ⚠️ The following existing test cases may need to be updated based on your new user story. Select them and click <strong>Ingest</strong> to save the updated versions.
                </Typography>
                {impactedTestCases.map(tc => (
                  <Box key={tc.testCaseId} sx={{ mb: 1 }}>
                    {impactReasons[tc.testCaseId] && (
                      <Paper
                        elevation={0}
                        sx={{
                          px: 2,
                          py: 1,
                          mb: 0.5,
                          bgcolor: '#fffbeb',
                          border: '1px solid #fbbf24',
                          borderRadius: '8px 8px 0 0',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600 }}>
                          Impact reason for <strong>{tc.testCaseId}</strong>: {impactReasons[tc.testCaseId]}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                ))}
                <TestCaseTable
                  testCases={impactedTestCases}
                  showCheckboxes
                  autoSelectAll
                  onSelectionChange={handleImpactedSelect}
                  onTestCaseEdit={onTestCaseEdit}
                />
              </>
            )}
          </Box>
        )}

        {/* Tab 2 — Deep Eval */}
        {tab === 2 && (
          <DeepEvalTab
            testCases={newTestCases}
            evalResults={evalResults}
            isEvaluating={isEvaluating}
            evalError={evalError}
            onRunEval={onRunEval}
          />
        )}

        {/* Tab 1 — New test cases */}
        {tab === 1 && (
          <Box>
            {newTestCases.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '1px dashed #d1d5db',
                  borderRadius: '12px',
                  color: '#6b7280',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 48, mb: 1, color: '#d1d5db' }} />
                <Typography>No new test cases were generated.</Typography>
              </Paper>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 2, color: '#1e3a5f', bgcolor: '#eff6ff', p: 1.5, borderRadius: '8px', border: '1px solid #93c5fd' }}>
                  ✨ These are freshly generated test cases for your user story. Select them and click <strong>Ingest</strong> to store them in MongoDB.
                </Typography>
                <TestCaseTable
                  testCases={newTestCases}
                  showCheckboxes
                  autoSelectAll
                  onSelectionChange={handleNewSelect}
                  onTestCaseEdit={onTestCaseEdit}
                />
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ImpactAnalysisResults;
