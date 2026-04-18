import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Collapse,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { TestCase } from '../types/index';
import { formatConfidenceScore, getConfidenceColor } from '../utils/helpers';

// ── Edit Dialog ──────────────────────────────────────────────────────────────
interface EditDialogProps {
  open: boolean;
  testCase: TestCase;
  onClose: () => void;
  onSave: (updated: TestCase) => void;
}

const EditTestCaseDialog: React.FC<EditDialogProps> = ({ open, testCase, onClose, onSave }) => {
  const [form, setForm] = useState<TestCase>({ ...testCase });

  useEffect(() => {
    if (open) setForm({ ...testCase });
  }, [open, testCase]);

  const setArrayField = (field: 'preconditions' | 'testSteps' | 'testData', value: string) => {
    setForm(prev => ({ ...prev, [field]: value.split('\n').filter(l => l.trim().length > 0) }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e5e7eb' }}>
        ✏️ Edit Test Case — {form.testCaseId}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="Title"
            fullWidth
            value={form.testCaseTitle}
            onChange={e => setForm(p => ({ ...p, testCaseTitle: e.target.value }))}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Type"
              sx={{ flex: 1 }}
              value={form.testType}
              onChange={e => setForm(p => ({ ...p, testType: e.target.value as TestCase['testType'] }))}
            >
              {['Functional', 'Positive', 'Negative', 'Boundary Validation'].map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Priority"
              sx={{ flex: 1 }}
              value={form.priority}
              onChange={e => setForm(p => ({ ...p, priority: e.target.value as TestCase['priority'] }))}
            >
              {['Low', 'Medium', 'High', 'Critical'].map(p => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          </Box>
          <TextField
            label="Preconditions (one per line)"
            multiline
            rows={3}
            fullWidth
            value={form.preconditions.join('\n')}
            onChange={e => setArrayField('preconditions', e.target.value)}
          />
          <TextField
            label="Test Steps (one per line)"
            multiline
            rows={5}
            fullWidth
            value={form.testSteps.join('\n')}
            onChange={e => setArrayField('testSteps', e.target.value)}
          />
          <TextField
            label="Test Data (one per line)"
            multiline
            rows={2}
            fullWidth
            value={form.testData.join('\n')}
            onChange={e => setArrayField('testData', e.target.value)}
          />
          <TextField
            label="Expected Result"
            multiline
            rows={2}
            fullWidth
            value={form.expectedResult}
            onChange={e => setForm(p => ({ ...p, expectedResult: e.target.value }))}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} color="inherit" variant="outlined">Cancel</Button>
        <Button
          variant="contained"
          onClick={() => { onSave(form); onClose(); }}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            fontWeight: 700,
            '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Row ──────────────────────────────────────────────────────────────────────
interface TestCaseRowProps {
  testCase: TestCase;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onEdit?: (updated: TestCase) => void;
  showApprovalActions?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  onApprovalChange?: (testCaseId: string, status: 'approved' | 'rejected') => void;
}

const TestCaseRow: React.FC<TestCaseRowProps> = ({
  testCase,
  showCheckbox = false,
  isSelected = false,
  onSelect,
  onEdit,
  showApprovalActions = false,
  approvalStatus = 'pending',
  onApprovalChange,
}) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [localTestCase, setLocalTestCase] = useState<TestCase>(testCase);

  useEffect(() => { setLocalTestCase(testCase); }, [testCase]);

  const getPriorityColor = (priority: string): 'default' | 'warning' | 'error' => {
    const colors: Record<string, 'default' | 'warning' | 'error'> = {
      Low: 'default',
      Medium: 'warning',
      High: 'error',
      Critical: 'error',
    };
    return colors[priority] ?? 'default';
  };

  const getTypeColor = (type: string): 'primary' | 'success' | 'error' | 'warning' | 'default' => {
    const colors: Record<string, 'primary' | 'success' | 'error' | 'warning' | 'default'> = {
      Functional: 'primary',
      Positive: 'success',
      Negative: 'error',
      'Boundary Validation': 'warning',
    };
    return colors[type] ?? 'default';
  };

  const handleSave = (updated: TestCase) => {
    setLocalTestCase(updated);
    onEdit?.(updated);
  };

  return (
    <>
      <TableRow sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
        {showCheckbox && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={isSelected}
              onChange={e => onSelect?.(localTestCase.testCaseId, e.target.checked)}
            />
          </TableCell>
        )}
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>{localTestCase.testCaseId}</TableCell>
        <TableCell sx={{ maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {localTestCase.testCaseTitle}
        </TableCell>
        <TableCell>
          <Chip label={localTestCase.testType} color={getTypeColor(localTestCase.testType)} size="small" />
        </TableCell>
        <TableCell>
          <Chip label={localTestCase.priority} color={getPriorityColor(localTestCase.priority)} size="small" />
        </TableCell>
        <TableCell>
          <Box
            sx={{
              bgcolor: getConfidenceColor(localTestCase.confidenceScore),
              color: 'white',
              py: 0.5,
              px: 1,
              borderRadius: 1,
              textAlign: 'center',
              fontWeight: 'bold',
              width: 'fit-content',
            }}
          >
            {formatConfidenceScore(localTestCase.confidenceScore)}
          </Box>
        </TableCell>
        <TableCell>
          <IconButton
            size="small"
            title="Edit test case"
            onClick={() => setEditOpen(true)}
            sx={{ color: '#6366f1', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)' } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </TableCell>
        {showApprovalActions && (
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {approvalStatus === 'approved' && (
                <Chip label="Approved" size="small" sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: '0.7rem' }} />
              )}
              {approvalStatus === 'rejected' && (
                <Chip label="Rejected" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: '0.7rem' }} />
              )}
              {approvalStatus === 'pending' && (
                <Chip label="Pending" size="small" sx={{ bgcolor: '#f3f4f6', color: '#6b7280', fontWeight: 700, fontSize: '0.7rem' }} />
              )}
              <IconButton
                size="small"
                title="Approve"
                onClick={() => onApprovalChange?.(localTestCase.testCaseId, 'approved')}
                sx={{ color: approvalStatus === 'approved' ? '#10b981' : '#d1d5db', '&:hover': { color: '#10b981' } }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                title="Reject"
                onClick={() => onApprovalChange?.(localTestCase.testCaseId, 'rejected')}
                sx={{ color: approvalStatus === 'rejected' ? '#ef4444' : '#d1d5db', '&:hover': { color: '#ef4444' } }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Box>
          </TableCell>
        )}
      </TableRow>

      {/* Expanded details */}
      <TableRow>
        <TableCell colSpan={(showCheckbox ? 8 : 7) + (showApprovalActions ? 1 : 0)} sx={{ py: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Details</Typography>

              {localTestCase.preconditions?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>Preconditions:</Typography>
                  <List sx={{ pl: 2 }}>
                    {localTestCase.preconditions.map((p, i) => (
                      <ListItem key={i} sx={{ py: 0.5 }}>
                        <ListItemText primary={`• ${p}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {localTestCase.testSteps?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>Test Steps:</Typography>
                  <List sx={{ pl: 2 }}>
                    {localTestCase.testSteps.map((step, i) => (
                      <ListItem key={i} sx={{ py: 0.5 }}>
                        <ListItemText primary={`${i + 1}. ${step}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {localTestCase.testData?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>Test Data:</Typography>
                  <Box sx={{ bgcolor: '#f0f0f0', p: 1, borderRadius: 1 }}>
                    {localTestCase.testData.map((d, i) => (
                      <Typography key={i} variant="body2" sx={{ py: 0.25 }}>{d}</Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {localTestCase.expectedResult && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>Expected Result:</Typography>
                  <Typography variant="body2">{localTestCase.expectedResult}</Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <EditTestCaseDialog
        open={editOpen}
        testCase={localTestCase}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />
    </>
  );
};

interface TestCaseTableProps {
  testCases: TestCase[];
  showCheckboxes?: boolean;
  autoSelectAll?: boolean;
  onSelectionChange?: (selected: TestCase[]) => void;
  onTestCaseEdit?: (updated: TestCase) => void;
  showApprovalActions?: boolean;
  approvalMap?: Record<string, 'pending' | 'approved' | 'rejected'>;
  onApprovalChange?: (testCaseId: string, status: 'approved' | 'rejected') => void;
}

export const TestCaseTable: React.FC<TestCaseTableProps> = ({
  testCases,
  showCheckboxes = false,
  autoSelectAll = false,
  onSelectionChange,
  onTestCaseEdit,
  showApprovalActions = false,
  approvalMap = {},
  onApprovalChange,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [localTestCases, setLocalTestCases] = useState<TestCase[]>(testCases);

  // Sync when parent passes new test cases; auto-select all if requested
  useEffect(() => {
    setLocalTestCases(testCases);
    if (autoSelectAll && testCases.length > 0) {
      const allIds = new Set(testCases.map(tc => tc.testCaseId));
      setSelectedIds(allIds);
      onSelectionChange?.([...testCases]);
    } else {
      setSelectedIds(new Set());
    }
  }, [testCases, autoSelectAll]);

  const handleSelect = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    checked ? next.add(id) : next.delete(id);
    setSelectedIds(next);
    onSelectionChange?.(localTestCases.filter(tc => next.has(tc.testCaseId)));
  };

  const handleSelectAll = (checked: boolean) => {
    const next = checked ? new Set(localTestCases.map(tc => tc.testCaseId)) : new Set<string>();
    setSelectedIds(next);
    onSelectionChange?.(checked ? [...localTestCases] : []);
  };

  const handleEdit = (updated: TestCase) => {
    const next = localTestCases.map(tc => tc.testCaseId === updated.testCaseId ? updated : tc);
    setLocalTestCases(next);
    // Keep selection in sync with the updated list
    if (selectedIds.has(updated.testCaseId)) {
      onSelectionChange?.(next.filter(tc => selectedIds.has(tc.testCaseId)));
    }
    onTestCaseEdit?.(updated);
  };

  if (!localTestCases || localTestCases.length === 0) return null;

  const allSelected = localTestCases.length > 0 && selectedIds.size === localTestCases.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < localTestCases.length;

  return (
    <Card sx={{ mb: 3 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              {showCheckboxes && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={someSelected}
                    checked={allSelected}
                    onChange={e => handleSelectAll(e.target.checked)}
                    title="Select all"
                  />
                </TableCell>
              )}
              <TableCell style={{ width: 50 }} />
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Confidence</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Edit</TableCell>
              {showApprovalActions && <TableCell sx={{ fontWeight: 'bold' }}>Approval</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {localTestCases.map(tc => (
              <TestCaseRow
                key={tc.testCaseId}
                testCase={tc}
                showCheckbox={showCheckboxes}
                isSelected={selectedIds.has(tc.testCaseId)}
                onSelect={handleSelect}
                onEdit={handleEdit}
                showApprovalActions={showApprovalActions}
                approvalStatus={approvalMap[tc.testCaseId] || 'pending'}
                onApprovalChange={onApprovalChange}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default TestCaseTable;
