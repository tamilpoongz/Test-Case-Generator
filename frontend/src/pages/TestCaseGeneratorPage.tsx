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
import { TestCase, GenerationResponse } from '../types/index';

export const TestCaseGeneratorPage: React.FC = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Response state
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [summary, setSummary] = useState<GenerationResponse['summary'] | null>(null);

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Approval state
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  // Check backend health on mount
  useEffect(() => {
    checkHealth().catch((err: Error) => {
      console.error('Backend not available:', err.message);
      setError('⚠️ Warning: Backend service is not available. Please ensure the backend is running on http://localhost:3001');
    });
  }, []);

  // Handle form submission — fixes: wraps args into object, uses draftTestCases (camelCase)
  const handleGenerateTestCases = async (
    formTitle: string,
    formDescription: string,
    formAcceptanceCriteria: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      setStatus('loading');
      setStatusMessage('Analyzing user story and generating test cases...');
      setApprovalStatus(null);

      const criteriaArray = formAcceptanceCriteria
        .split('\n')
        .map((line) => line.trim().replace(/^[\d+.)\-•*]\s*/, '').trim())
        .filter((line) => line.length > 0);

      const response = await generateTestCases({
        title: formTitle,
        description: formDescription,
        acceptanceCriteria: criteriaArray,
      });

      if (response.status === 'success') {
        setTestCases(response.draftTestCases || []);
        setSummary(response.summary);
        setStatus('success');
        setStatusMessage(`✅ Successfully generated ${response.draftTestCases?.length || 0} test cases!`);
      } else {
        throw new Error(response.error || 'Failed to generate test cases');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Error generating test cases:', err);
      setError(message);
      setStatus('error');
      setStatusMessage(`❌ Error: ${message}`);
      setTestCases([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle CSV upload
  const handleUploadCSV = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setStatus('loading');
      setStatusMessage('Parsing CSV and generating test cases for all stories...');
      setApprovalStatus(null);

      const response = await uploadUserStories(file);

      if (response.status === 'success') {
        setTestCases(response.draftTestCases || []);
        setSummary(response.summary);
        setStatus('success');
        setStatusMessage(`✅ Successfully generated ${response.draftTestCases?.length || 0} test cases from CSV!`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Upload error:', err);
      setError(message);
      setStatus('error');
      setStatusMessage(`❌ Error: ${message}`);
      setTestCases([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form clear
  const handleClearForm = () => {
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
      const message = err instanceof Error ? err.message : String(err);
      console.error('Error downloading CSV:', err);
      setDownloadError(message);
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
      const message = err instanceof Error ? err.message : String(err);
      console.error('Error downloading JSON:', err);
      setDownloadError(message);
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
            onChange={(_, v: number) => setActiveTab(v)}
            sx={{
              mb: 3,
              '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(135deg, #6366f1, #10b981)',
                height: 3,
                borderRadius: 2,
              },
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
            <UploadStories onUpload={handleUploadCSV} isLoading={isLoading} />
          )}
        </Box>

        {/* Status / Loading State */}
        <GenerationStatus status={status} message={statusMessage} isLoading={isLoading} />

        {/* Summary Section */}
        {summary && (
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
        )}

        {/* Test Cases Table */}
        {testCases.length > 0 && (
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
        )}

        {/* Review and Download Actions */}
        {testCases.length > 0 && (
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
        )}
      </Container>
    </Box>
  );
};

export default TestCaseGeneratorPage;
