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
import { ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon } from '@mui/icons-material';
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
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ReviewActionBar;
