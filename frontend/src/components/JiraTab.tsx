import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Settings as SettingsIcon, Refresh as RefreshIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { JiraConfig, JiraStory, TestCase } from '../types/index';
import JiraConfigModal from './JiraConfigModal';
import JiraStoriesPanel from './JiraStoriesPanel';
import JiraStoryWorkflowPanel from './JiraStoryWorkflowPanel';
import { validateJiraConnection, fetchJiraStories } from '../services/jiraService';
import { generateTestCases } from '../services/testcaseService';

interface JiraTabProps {
  mongoConnected: boolean;
}

const JiraTab: React.FC<JiraTabProps> = ({ mongoConnected }) => {
  // Config / connection
  const [configOpen, setConfigOpen] = useState(false);
  const [jiraConfig, setJiraConfig] = useState<JiraConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAs, setConnectedAs] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Stories
  const [stories, setStories] = useState<JiraStory[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [storiesFetched, setStoriesFetched] = useState(false);

  // Active story workflow
  const [selectedStory, setSelectedStory] = useState<JiraStory | null>(null);
  const [generatedTestCases, setGeneratedTestCases] = useState<TestCase[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStoryKey, setGeneratingStoryKey] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // ── Save config & validate ─────────────────────────────────────────────────
  const handleSaveConfig = async (config: JiraConfig) => {
    setConfigOpen(false);
    setJiraConfig(config);
    setIsValidating(true);
    setIsConnected(false);
    setStoriesFetched(false);
    setStories([]);
    setSelectedStory(null);
    try {
      const result = await validateJiraConnection(config);
      if (result.connected) {
        setIsConnected(true);
        setConnectedAs(result.displayName || config.email);
      }
    } catch {
      setIsConnected(false);
    } finally {
      setIsValidating(false);
    }
  };

  // ── Fetch stories ──────────────────────────────────────────────────────────
  const handleFetchStories = async () => {
    if (!jiraConfig) return;
    setIsLoadingStories(true);
    setStoriesError(null);
    try {
      const result = await fetchJiraStories(jiraConfig);
      if (result.status === 'success') {
        setStories(result.stories);
        setStoriesFetched(true);
      } else {
        setStoriesError(result.error || 'Failed to fetch stories');
      }
    } catch (err: any) {
      setStoriesError(err.message || 'Failed to fetch stories');
    } finally {
      setIsLoadingStories(false);
    }
  };

  // ── Generate test cases for a story ───────────────────────────────────────
  const handleGenerateForStory = async (story: JiraStory) => {
    setGeneratingStoryKey(story.key);
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedTestCases([]);
    setSelectedStory(story);

    try {
      const result = await generateTestCases({
        title: story.summary,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria,
      });
      setGeneratedTestCases(result.draftTestCases || []);
    } catch (err: any) {
      setGenerationError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
      setGeneratingStoryKey(null);
    }
  };

  const handleBackToStories = () => {
    setSelectedStory(null);
    setGeneratedTestCases([]);
    setGenerationError(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
          p: 2.5,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.06) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(99,102,241,0.15)',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#4f46e5' }}>
            🔗 Jira Integration
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            Fetch stories → Generate test cases → Review → DeepEval gate → Ingest → Upload as subtasks
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {isValidating && <CircularProgress size={18} />}
          {isConnected && !isValidating && (
            <Chip
              icon={<CheckCircleIcon />}
              label={`Connected · ${connectedAs}`}
              size="small"
              sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: '0.75rem' }}
            />
          )}
          {!isConnected && !isValidating && jiraConfig && (
            <Chip
              label="Not Connected"
              size="small"
              sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: '0.75rem' }}
            />
          )}
          {isConnected && storiesFetched && (
            <Button
              size="small"
              startIcon={<RefreshIcon fontSize="small" />}
              onClick={handleFetchStories}
              disabled={isLoadingStories}
              variant="outlined"
              sx={{ borderColor: '#6366f1', color: '#6366f1' }}
            >
              Refresh Stories
            </Button>
          )}
          <Button
            size="small"
            startIcon={<SettingsIcon fontSize="small" />}
            onClick={() => setConfigOpen(true)}
            variant="contained"
            sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700 }}
          >
            {jiraConfig ? 'Edit Config' : 'Configure Jira'}
          </Button>
        </Box>
      </Box>

      {/* Not yet configured */}
      {!jiraConfig && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            border: '2px dashed #e5e7eb',
            borderRadius: '16px',
            color: '#9ca3af',
          }}
        >
          <Typography variant="h2" sx={{ mb: 2 }}>🔗</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#4b5563', mb: 1 }}>
            Connect Your Jira Project
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            Enter your Jira credentials to fetch user stories and automatically upload generated test cases as subtasks.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setConfigOpen(true)}
            sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700 }}
          >
            Configure Jira
          </Button>
        </Box>
      )}

      {/* Connected — not yet fetched stories */}
      {jiraConfig && isConnected && !storiesFetched && !selectedStory && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" sx={{ mb: 2, color: '#4b5563' }}>
            Connected to <strong>{jiraConfig.baseUrl}</strong> · Project: <strong>{jiraConfig.projectKey}</strong>
          </Typography>
          <Button
            variant="contained"
            onClick={handleFetchStories}
            disabled={isLoadingStories}
            startIcon={isLoadingStories ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700 }}
          >
            {isLoadingStories ? 'Fetching Stories…' : 'Fetch Stories'}
          </Button>
          {storiesError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: '10px', maxWidth: 500, mx: 'auto' }}>
              {storiesError}
            </Alert>
          )}
        </Box>
      )}

      {/* Stories panel */}
      {jiraConfig && isConnected && storiesFetched && !selectedStory && (
        <>
          <Divider sx={{ mb: 3 }} />
          <JiraStoriesPanel
            stories={stories}
            isLoading={isLoadingStories}
            error={storiesError}
            onGenerate={handleGenerateForStory}
            isGenerating={isGenerating}
            generatingStoryKey={generatingStoryKey}
          />
        </>
      )}

      {/* Per-story workflow */}
      {jiraConfig && selectedStory && (
        <>
          <Divider sx={{ mb: 3 }} />
          <JiraStoryWorkflowPanel
            story={selectedStory}
            testCases={generatedTestCases}
            isGenerating={isGenerating}
            generationError={generationError}
            jiraConfig={jiraConfig}
            mongoConnected={mongoConnected}
            onClose={handleBackToStories}
          />
        </>
      )}

      {/* Config modal */}
      <JiraConfigModal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        onSaved={handleSaveConfig}
        initialConfig={jiraConfig}
      />
    </Box>
  );
};

export default JiraTab;
