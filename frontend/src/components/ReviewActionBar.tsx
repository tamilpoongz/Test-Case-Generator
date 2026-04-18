import React from 'react';
import {
  Card,
  CardContent,
  Stack,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import { Storage as StorageIcon } from '@mui/icons-material';
import { ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon } from '@mui/icons-material';
import LinkIcon from '@mui/icons-material/Link';
import { TestCase } from '../types/index';

interface ReviewActionBarProps {
  testCases: TestCase[];
  onApprove: () => void;
  onReject: () => void;
  onDownloadCSV: () => void;
  onDownloadJSON: () => void;
  isDownloading: boolean;
  downloadError?: string | null;
  approvalStatus?: string | null;
  // RAG ingestion props
  selectedCount?: number;
  onIngest?: () => void;
  isIngesting?: boolean;
  ingestStatus?: string | null;
  mongoConnected?: boolean;
  // DeepEval gate
  evalHasFailVerdicts?: boolean;
  // Jira upload
  onUploadToJira?: () => void;
  isUploadingToJira?: boolean;
  jiraUploadEnabled?: boolean;
}

export const ReviewActionBar: React.FC<ReviewActionBarProps> = ({
  testCases,
  onApprove,
  onReject,
  onDownloadCSV,
  onDownloadJSON,
  isDownloading,
  downloadError,
  approvalStatus,
  selectedCount = 0,
  onIngest,
  isIngesting = false,
  ingestStatus,
  mongoConnected = false,
  evalHasFailVerdicts = false,
  onUploadToJira,
  isUploadingToJira = false,
  jiraUploadEnabled = false,
}) => {
  if (!testCases || testCases.length === 0) return null;

  return (
    <Card
      sx={{
        mb: 3,
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          ✅ Review &amp; Actions
        </Typography>

        {downloadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {downloadError}
          </Alert>
        )}

        {approvalStatus && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {approvalStatus}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Approval Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<ThumbUpIcon />}
              onClick={onApprove}
              disabled={isDownloading}
              sx={{
                py: 1,
                px: 3,
                fontWeight: 700,
                fontSize: '0.95rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                },
              }}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              startIcon={<ThumbDownIcon />}
              onClick={onReject}
              disabled={isDownloading}
              sx={{
                py: 1,
                px: 3,
                fontWeight: 700,
                fontSize: '0.95rem',
                borderRadius: '12px',
                borderWidth: '2px',
                borderColor: '#ef4444',
                color: '#ef4444',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: '2px',
                  borderColor: '#dc2626',
                  color: '#dc2626',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Reject
            </Button>
          </Box>

          {/* Download Buttons */}
          <Box sx={{ display: 'flex', gap: 2, ml: { xs: 0, sm: 'auto' }, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={isDownloading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <GetAppIcon />}
              onClick={onDownloadCSV}
              disabled={isDownloading}
              sx={{
                py: 1,
                px: 3,
                fontWeight: 700,
                fontSize: '0.95rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(236, 72, 153, 0.4)',
                  background: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
                },
              }}
            >
              {isDownloading ? 'Downloading...' : '📊 CSV'}
            </Button>
            <Button
              variant="outlined"
              startIcon={isDownloading ? <CircularProgress size={20} sx={{ color: '#06b6d4' }} /> : <GetAppIcon />}
              onClick={onDownloadJSON}
              disabled={isDownloading}
              sx={{
                py: 1,
                px: 3,
                fontWeight: 700,
                fontSize: '0.95rem',
                borderRadius: '12px',
                borderWidth: '2px',
                borderColor: '#06b6d4',
                color: '#06b6d4',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: '2px',
                  borderColor: '#0891b2',
                  color: '#0891b2',
                  backgroundColor: 'rgba(6, 182, 212, 0.05)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {isDownloading ? 'Downloading...' : '📋 JSON'}
            </Button>

            {/* Ingest button — only shown when MongoDB is connected */}
            {mongoConnected && onIngest && (
              <Button
                variant="contained"
                startIcon={isIngesting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <StorageIcon />}
                onClick={onIngest}
                disabled={isIngesting || selectedCount === 0 || evalHasFailVerdicts}
                title={evalHasFailVerdicts ? 'Fix FAIL DeepEval verdicts before ingesting' : undefined}
                sx={{
                  py: 1,
                  px: 3,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6d28d9, #7e22ce)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(124,58,237,0.4)',
                    color: 'white',
                  },
                }}
              >
                {isIngesting ? 'Ingesting...' : `💾 Ingest (${selectedCount})`}
              </Button>
            )}

            {/* Jira upload button */}
            {onUploadToJira && (
              <Button
                variant="contained"
                startIcon={isUploadingToJira ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <LinkIcon />}
                onClick={onUploadToJira}
                disabled={!jiraUploadEnabled || isUploadingToJira}
                sx={{
                  py: 1,
                  px: 3,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(99,102,241,0.4)',
                    color: 'white',
                  },
                }}
              >
                {isUploadingToJira ? 'Uploading...' : '🔗 Upload to Jira'}
              </Button>
            )}
          </Box>
        </Stack>

        {/* Ingest status alert */}
        {ingestStatus && (
          <Alert
            severity={ingestStatus.toLowerCase().includes('error') || ingestStatus.toLowerCase().includes('fail') ? 'error' : 'success'}
            sx={{ mt: 2, borderRadius: '10px' }}
          >
            {ingestStatus}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewActionBar;
