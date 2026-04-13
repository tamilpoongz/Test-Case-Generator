import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AutoAwesome,
  Download,
  CheckCircle,
  BarChart,
  TrendingUp,
} from '@mui/icons-material';
import testcaseService from './services/testcaseService';
import './App.css';
import { TestCase } from './types/index';

// Validation schema - LENIENT to allow all submissions
const storySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  acceptanceCriteria: z.string().min(1, 'At least one criteria required'),
});

type StoryFormData = z.infer<typeof storySchema>;

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#ec4899',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default function App() {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit = async (data: StoryFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      console.log('📝 Form data received:', data);
      console.log('Form data type:', typeof data);
      console.log('Form data keys:', Object.keys(data));

      console.log('Raw acceptanceCriteria:', data.acceptanceCriteria);
      console.log('Raw acceptanceCriteria type:', typeof data.acceptanceCriteria);

      const criteria = data.acceptanceCriteria
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);

      console.log('✂️ Parsed criteria:', criteria);
      console.log('Criteria type:', typeof criteria);
      console.log('Criteria is array?:', Array.isArray(criteria));
      console.log('Criteria length:', criteria.length);

      const payload = {
        title: data.title,
        description: data.description,
        acceptanceCriteria: criteria
      };

      console.log('📤 Sending payload:', payload);
      console.log('Payload type:', typeof payload);
      console.log('Payload JSON:', JSON.stringify(payload));
      console.log('Service available:', !!testcaseService);
      console.log('generateTestCases available:', !!testcaseService.generateTestCases);

      // Use proper testcaseService
      console.log('🔄 Calling testcaseService.generateTestCases...');
      const response = await testcaseService.generateTestCases(payload);
      
      console.log('✅ Response received successfully');
      console.log('Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'NULL');
      console.log('Response.draftTestCases:', response?.draftTestCases);
      console.log('draftTestCases type:', typeof response?.draftTestCases);
      console.log('draftTestCases is array:', Array.isArray(response?.draftTestCases));

      const testCasesData = response?.draftTestCases || [];
      console.log('🧪 Test cases array:', testCasesData);
      console.log('📊 Test cases count:', testCasesData.length);
      console.log('Array check - is it really an array?:', Array.isArray(testCasesData));

      if (testCasesData && testCasesData.length > 0) {
        console.log('🎉 Setting state with', testCasesData.length, 'test cases');
        setTestCases(testCasesData);
        setSummary(response.summary);
        setSuccessMessage(`✅ Successfully generated ${testCasesData.length} test cases!`);
        console.log('✅ State updated successfully');
      } else {
        console.warn('⚠️ WARNING: Test cases array is empty or undefined');
        console.warn('testCasesData:', testCasesData);
        console.warn('testCasesData?.length:', testCasesData?.length);
        console.warn('Full response:', JSON.stringify(response, null, 2));
        setError(`❌ No test cases generated. Expected array with items, got: ${JSON.stringify(testCasesData)}`);
      }
      
      reset();
    } catch (err: any) {
      console.error('💥 FULL ERROR CAUGHT:', err);
      console.error('Error type:', typeof err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error stack:', err.stack);
      console.error('Is axios error?:', err.isAxiosError);
      setError(`❌ Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: 'csv' | 'json') => {
    try {
      const blob = format === 'csv' 
        ? await testcaseService.downloadTestCasesAsCSV(testCases)
        : await testcaseService.downloadTestCasesAsJSON(testCases);
      testcaseService.downloadFile(blob, `test-cases.${format}`);
      setSuccessMessage(`Downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      setError(`Download failed: ${err}`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #111827 100%)',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
              <AutoAwesome sx={{ fontSize: 40, animation: 'spin 3s linear infinite' }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Test Case Generation Agent
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              AI-Powered Test Case Generator using Groq LLM
            </Typography>
          </Box>

          {/* Alerts */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

          {/* Form */}
          <Card sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Enter User Story Details
              </Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        id="title"
                        name="title"
                        label="User Story Title"
                        placeholder="E.g., User login functionality"
                        fullWidth
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        disabled={isLoading}
                      />
                    )}
                  />

                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        id="description"
                        name="description"
                        label="Description"
                        placeholder="Describe the feature in detail..."
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        disabled={isLoading}
                      />
                    )}
                  />

                  <Controller
                    name="acceptanceCriteria"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        id="acceptanceCriteria"
                        name="acceptanceCriteria"
                        label="Acceptance Criteria"
                        placeholder="Enter each criterion on a new line..."
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.acceptanceCriteria}
                        helperText={errors.acceptanceCriteria?.message}
                        disabled={isLoading}
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      py: 1.5,
                      fontWeight: 'bold',
                    }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Generate Test Cases'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>

          {/* Summary */}
          {summary && (
            <Card sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.95)' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <BarChart sx={{ fontSize: 40, color: '#6366f1', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
                        {summary.totalTestCases}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Test Cases
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <TrendingUp sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981' }}>
                        {(summary.averageConfidence * 100).toFixed(0)}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Confidence
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <CheckCircle sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
                        {Object.keys(summary.byType).length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Test Types
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Test Cases Table */}
          {testCases.length > 0 && (
            <Card sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.95)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                  Generated Test Cases
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)' }}>
                        <TableCell><strong>ID</strong></TableCell>
                        <TableCell><strong>Title</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Priority</strong></TableCell>
                        <TableCell><strong>Confidence</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testCases.map((tc) => (
                        <TableRow key={tc.testCaseId}>
                          <TableCell>{tc.testCaseId}</TableCell>
                          <TableCell>{tc.testCaseTitle}</TableCell>
                          <TableCell>
                            <Chip label={tc.testType} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={tc.priority}
                              size="small"
                              color={tc.priority === 'Critical' ? 'error' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {((tc.confidenceScore || 0) * 100).toFixed(0)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Download Buttons */}
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleDownload('csv')}
                    sx={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}
                  >
                    Download CSV
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={() => handleDownload('json')}
                    sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}
                  >
                    Download JSON
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </ThemeProvider>
  );
}
