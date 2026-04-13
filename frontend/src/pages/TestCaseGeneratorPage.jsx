import React, { useState, useEffect } from 'react';
import { Container, Box, Tabs, Tab } from '@mui/material';
import AppHeader from '../components/AppHeader';
import StoryInputForm from '../components/StoryInputForm';
import GenerationStatus from '../components/GenerationStatus';
import TestCaseSummary from '../components/TestCaseSummary';
import TestCaseTable from '../components/TestCaseTable';
import ReviewActionBar from '../components/ReviewActionBar';
import UploadStories from '../components/UploadStories';
import {
  generateTestCases,
  uploadUserStories,
  downloadTestCasesAsCSV,
  downloadTestCasesAsJSON,
  checkHealth,
} from '../services/testcaseService';
import { downloadFile } from '../utils/helpers';

export const TestCaseGeneratorPage = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');

  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  // Response state
  const [generationResponse, setGenerationResponse] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [summary, setSummary] = useState(null);

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  // Approval state
  const [approvalStatus, setApprovalStatus] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const health = await checkHealth();
        console.log('Backend health:', health);
      } catch (err) {
        console.error('Backend not available:', err.message);
        setError('⚠️ Warning: Backend service is not available. Please ensure the backend is running on http://localhost:3001');
      }
    };

    checkBackendHealth();
  }, []);

  // Handle form submission
  const handleGenerateTestCases = async (formTitle, formDescription, formAcceptanceCriteria) => {
    try {
      setIsLoading(true);
      setError(null);
      setStatus('loading');
      setStatusMessage('Analyzing user story and generating test cases...');
      setApprovalStatus(null);

      // Save form data
      setTitle(formTitle);
      setDescription(formDescription);
      setAcceptanceCriteria(formAcceptanceCriteria);

      // Call API
      const response = await generateTestCases(
        formTitle,
        formDescription,
        formAcceptanceCriteria
      );

      if (response.status === 'success') {
        setGenerationResponse(response);
        setTestCases(response.draft_test_cases || []);
        setSummary(response.summary);
        setStatus('success');
        setStatusMessage(`✅ Successfully generated ${response.draft_test_cases?.length || 0} test cases!`);
      } else {
        throw new Error(response.error || 'Failed to generate test cases');
      }
    } catch (err) {
      console.error('Error generating test cases:', err);
      setError(err.message);
      setStatus('error');
      setStatusMessage(`❌ Error: ${err.message}`);
      setTestCases([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle CSV upload
  const handleUploadCSV = async (file) => {
    try {
      setIsLoading(true);
      setError(null);
      setStatus('loading');
      setStatusMessage('Parsing CSV and generating test cases for all stories...');
      setApprovalStatus(null);

      const response = await uploadUserStories(file);

      if (response.status === 'success') {
        setGenerationResponse(response);
        setTestCases(response.draft_test_cases || []);
        setSummary(response.summary);
        setStatus('success');
        const warnings = response.warnings?.length ? ` (${response.warnings.length} rows skipped)` : '';
        setStatusMessage(`✅ Successfully generated ${response.draft_test_cases?.length || 0} test cases from CSV${warnings}!`);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      setStatus('error');
      setStatusMessage(`❌ Error: ${err.message}`);
      setTestCases([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form clear
  const handleClearForm = () => {
    setTitle('');
    setDescription('');
    setAcceptanceCriteria('');
    setGenerationResponse(null);
    setTestCases([]);
    setSummary(null);
    setStatus('idle');
    setStatusMessage('');
    setError(null);
    setApprovalStatus(null);
  };

  // Handle approve
  const handleApprove = () => {
    setApprovalStatus('✅ Test cases approved successfully!');
    setTimeout(() => setApprovalStatus(null), 3000);
  };

  // Handle reject
  const handleReject = () => {
    setApprovalStatus('❌ Test cases rejected. You can generate new ones.');
    setTimeout(() => setApprovalStatus(null), 3000);
  };

  // Handle CSV download
  const handleDownloadCSV = async () => {
    try {
      setIsDownloading(true);
      setDownloadError(null);
      const blob = await downloadTestCasesAsCSV(testCases);
      downloadFile(blob, 'generated_test_cases.csv');
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setDownloadError(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle JSON download
  const handleDownloadJSON = async () => {
    try {
      setIsDownloading(true);
      setDownloadError(null);
      const blob = await downloadTestCasesAsJSON(testCases);
      downloadFile(blob, 'generated_test_cases.json');
    } catch (err) {
      console.error('Error downloading JSON:', err);
      setDownloadError(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Box sx={{ background: 'transparent', minHeight: '100vh', pb: 6, pt: 1 }}>
      <AppHeader />
      <Container maxWidth="lg">
        {/* Input Form Section */}
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            p: 3,
            mb: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Mode Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              mb: 3,
              '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' },
              '& .MuiTabs-indicator': { background: 'linear-gradient(135deg, #6366f1, #10b981)', height: 3, borderRadius: 2 },
            }}
          >
            <Tab label="✍️ Manual Input" />
            <Tab label="📂 Bulk Upload (CSV)" />
          </Tabs>

          {activeTab === 0 && (
            <StoryInputForm
              onSubmit={handleGenerateTestCases}
              isLoading={isLoading}
              error={error}
              onClear={handleClearForm}
            />
          )}
          {activeTab === 1 && (
            <UploadStories
              onUpload={handleUploadCSV}
              isLoading={isLoading}
            />
          )}
        </Box>

        {/* Status / Loading State */}
        <GenerationStatus
          status={status}
          message={statusMessage}
          isLoading={isLoading}
        />

        {/* Summary Section */}
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            p: 3,
            mb: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <TestCaseSummary summary={summary} />
        </Box>

        {/* Test Cases Table */}
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            p: 3,
            mb: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <TestCaseTable testCases={testCases} />
        </Box>

        {/* Review and Download Actions */}
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            p: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <ReviewActionBar
            testCases={testCases}
            onApprove={handleApprove}
            onReject={handleReject}
            onDownloadCSV={handleDownloadCSV}
            onDownloadJSON={handleDownloadJSON}
            isDownloading={isDownloading}
            downloadError={downloadError}
            approvalStatus={approvalStatus}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default TestCaseGeneratorPage;
