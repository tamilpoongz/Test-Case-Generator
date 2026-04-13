import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit, Refresh, CheckCircle } from '@mui/icons-material';
import { storyFormSchema } from '../schemas/storyFormSchema';

export const StoryInputForm = ({ onSubmit, isLoading, error, onClear }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      title: '',
      description: '',
      acceptanceCriteria: '',
    },
  });

  const handleClear = () => {
    reset();
    if (onClear) {
      onClear();
    }
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    onSubmit(data.title, data.description, data.acceptanceCriteria);
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mb: 1,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Edit sx={{ color: '#6366f1' }} />
          Input Your User Story
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.95rem' }}>
          Provide the user story details and acceptance criteria for test case generation
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleFormSubmit}>
        <Stack spacing={2.5}>
          {/* Title Field */}
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  label="User Story Title"
                  placeholder="e.g., User Registration with Email Validation"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  disabled={isLoading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                        borderWidth: '2px',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                      fontWeight: 500,
                    },
                  }}
                />
              </Box>
            )}
          />

          {/* Description Field */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  label="Description"
                  placeholder="Describe what the user wants to achieve and why"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  disabled={isLoading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#8b5cf6',
                        borderWidth: '2px',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8b5cf6',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                    },
                  }}
                />
              </Box>
            )}
          />

          {/* Acceptance Criteria Field */}
          <Controller
            name="acceptanceCriteria"
            control={control}
            render={({ field }) => (
              <Box>
                <TextField
                  {...field}
                  label="Acceptance Criteria"
                  placeholder={`Enter each criterion on a new line:\n1. Email must be valid format\n2. Password minimum 8 characters\n3. System should send confirmation email`}
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.acceptanceCriteria}
                  helperText={errors.acceptanceCriteria?.message || 'One criterion per line'}
                  disabled={isLoading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#ec4899',
                        borderWidth: '2px',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ec4899',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '1rem',
                    },
                  }}
                />
              </Box>
            )}
          />

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                minWidth: 220,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                },
              }}
              startIcon={isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CheckCircle />}
            >
              {isLoading ? 'Generating...' : '✨ Generate Test Cases'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={handleClear}
              disabled={isLoading}
              sx={{
                minWidth: 160,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '12px',
                borderWidth: '2px',
                borderColor: '#ec4899',
                color: '#ec4899',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: '2px',
                  borderColor: '#db2777',
                  color: '#db2777',
                  backgroundColor: 'rgba(236, 72, 153, 0.05)',
                  transform: 'translateY(-2px)',
                },
              }}
              startIcon={<Refresh />}
            >
              Clear Form
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};

export default StoryInputForm;
