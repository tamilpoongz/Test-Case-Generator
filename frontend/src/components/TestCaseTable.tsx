import React, { useState } from 'react';
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
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { TestCase } from '../types/index';
import { formatConfidenceScore, getConfidenceColor } from '../utils/helpers';

interface TestCaseRowProps {
  testCase: TestCase;
}

const TestCaseRow: React.FC<TestCaseRowProps> = ({ testCase }) => {
  const [open, setOpen] = useState(false);

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

  return (
    <>
      <TableRow sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>{testCase.testCaseId}</TableCell>
        <TableCell sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {testCase.testCaseTitle}
        </TableCell>
        <TableCell>
          <Chip label={testCase.testType} color={getTypeColor(testCase.testType)} size="small" />
        </TableCell>
        <TableCell>
          <Chip label={testCase.priority} color={getPriorityColor(testCase.priority)} size="small" />
        </TableCell>
        <TableCell>
          <Box
            sx={{
              bgcolor: getConfidenceColor(testCase.confidenceScore),
              color: 'white',
              py: 0.5,
              px: 1,
              borderRadius: 1,
              textAlign: 'center',
              fontWeight: 'bold',
              width: 'fit-content',
            }}
          >
            {formatConfidenceScore(testCase.confidenceScore)}
          </Box>
        </TableCell>
      </TableRow>

      {/* Expanded row */}
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Details</Typography>

              {testCase.preconditions && testCase.preconditions.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                    Preconditions:
                  </Typography>
                  <List sx={{ pl: 2 }}>
                    {testCase.preconditions.map((precond, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemText primary={`• ${precond}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {testCase.testSteps && testCase.testSteps.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                    Test Steps:
                  </Typography>
                  <List sx={{ pl: 2 }}>
                    {testCase.testSteps.map((step, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemText primary={`${idx + 1}. ${step}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {testCase.testData && testCase.testData.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                    Test Data:
                  </Typography>
                  <Box sx={{ backgroundColor: '#f0f0f0', p: 1, borderRadius: 1 }}>
                    {testCase.testData.map((item, idx) => (
                      <Typography key={idx} variant="body2" sx={{ py: 0.25 }}>
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {testCase.expectedResult && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                    Expected Result:
                  </Typography>
                  <Typography variant="body2">{testCase.expectedResult}</Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

interface TestCaseTableProps {
  testCases: TestCase[];
}

export const TestCaseTable: React.FC<TestCaseTableProps> = ({ testCases }) => {
  if (!testCases || testCases.length === 0) return null;

  return (
    <Card sx={{ mb: 3 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell style={{ width: 50 }} />
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Confidence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testCases.map((testCase) => (
              <TestCaseRow key={testCase.testCaseId} testCase={testCase} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default TestCaseTable;
