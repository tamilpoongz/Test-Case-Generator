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
import { formatConfidenceScore, getConfidenceColor } from '../utils/helpers';

const TestCaseRow = ({ testCase }) => {
  const [open, setOpen] = useState(false);

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'default',
      'Medium': 'warning',
      'High': 'error',
      'Critical': 'error',
    };
    return colors[priority] || 'default';
  };

  const getTypeColor = (type) => {
    const colors = {
      'Functional': 'primary',
      'Positive': 'success',
      'Negative': 'error',
      'Boundary Validation': 'warning',
    };
    return colors[type] || 'default';
  };

  return (
    <>
      <TableRow sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 'bold' }}>{testCase.test_case_id}</TableCell>
        <TableCell sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {testCase.test_case_title}
        </TableCell>
        <TableCell>
          <Chip label={testCase.test_type} color={getTypeColor(testCase.test_type)} size="small" />
        </TableCell>
        <TableCell>
          <Chip label={testCase.priority} color={getPriorityColor(testCase.priority)} size="small" />
        </TableCell>
        <TableCell>
          <Box
            sx={{
              bgcolor: getConfidenceColor(testCase.confidence_score),
              color: 'white',
              py: 0.5,
              px: 1,
              borderRadius: 1,
              textAlign: 'center',
              fontWeight: 'bold',
              width: 'fit-content',
            }}
          >
            {formatConfidenceScore(testCase.confidence_score)}
          </Box>
        </TableCell>
        <TableCell>
          <Chip 
            label={testCase.review_status} 
            color={testCase.review_status === 'Approved' ? 'success' : 'warning'}
            size="small" 
            variant="outlined"
          />
        </TableCell>
      </TableRow>

      {/* Expanded row with details */}
      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: '#f9f9f9' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Details
              </Typography>

              {testCase.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                    Description:
                  </Typography>
                  <Typography variant="body2">{testCase.description}</Typography>
                </Box>
              )}

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

              {testCase.test_steps && testCase.test_steps.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                    Test Steps:
                  </Typography>
                  <List sx={{ pl: 2 }}>
                    {testCase.test_steps.map((step, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemText primary={`${idx + 1}. ${step}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {testCase.test_data && Object.keys(testCase.test_data).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                    Test Data:
                  </Typography>
                  <Box sx={{ backgroundColor: '#f0f0f0', p: 1, borderRadius: 1 }}>
                    {Object.entries(testCase.test_data).map(([key, value]) => (
                      <Typography key={key} variant="body2" sx={{ py: 0.25 }}>
                        <strong>{key}:</strong> {JSON.stringify(value)}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              {testCase.expected_result && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#666' }}>
                    Expected Result:
                  </Typography>
                  <Typography variant="body2">{testCase.expected_result}</Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const TestCaseTable = ({ testCases }) => {
  if (!testCases || testCases.length === 0) {
    return null;
  }

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
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testCases.map((testCase) => (
              <TestCaseRow key={testCase.test_case_id} testCase={testCase} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default TestCaseTable;
