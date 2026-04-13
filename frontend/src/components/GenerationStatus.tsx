import React from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { styled, keyframes } from '@mui/material/styles';

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.05); opacity: 0.8; }
`;

const LoadingCard = styled(Card)(() => ({
  background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
  borderRadius: '16px',
  border: '2px solid #818cf8',
  boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
  animation: `${pulse} 2s ease-in-out infinite`,
}));

interface GenerationStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  isLoading?: boolean;
}

export const GenerationStatus: React.FC<GenerationStatusProps> = ({ status, message, isLoading }) => {
  if (status === 'idle') return null;

  if (status === 'loading' || isLoading) {
    return (
      <LoadingCard sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
          <CircularProgress
            size={40}
            sx={{
              color: '#6366f1',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Box>
            <Typography
              variant="body1"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
              }}
            >
              {message || 'Generating test cases...'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 600 }}>
              Using AI to analyze your requirements
            </Typography>
          </Box>
        </CardContent>
      </LoadingCard>
    );
  }

  if (status === 'success') {
    return (
      <Alert
        severity="success"
        icon={<CheckCircleIcon sx={{ fontSize: '1.5rem' }} />}
        sx={{
          mb: 3,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          border: '2px solid #10b981',
          color: '#065f46',
          fontSize: '1rem',
          fontWeight: 600,
          '& .MuiAlert-icon': { color: '#10b981' },
        }}
      >
        {message || 'Test cases generated successfully!'}
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert
        severity="error"
        icon={<ErrorIcon sx={{ fontSize: '1.5rem' }} />}
        sx={{
          mb: 3,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          border: '2px solid #ef4444',
          color: '#7f1d1d',
          fontSize: '1rem',
          fontWeight: 600,
          '& .MuiAlert-icon': { color: '#ef4444' },
        }}
      >
        {message || 'Failed to generate test cases. Please try again.'}
      </Alert>
    );
  }

  return null;
};

export default GenerationStatus;
