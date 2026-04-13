import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Stack,
  Chip,
} from '@mui/material';
import { CloudUpload, InsertDriveFile, Close } from '@mui/icons-material';

interface UploadStoriesProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const UploadStories: React.FC<UploadStoriesProps> = ({ onUpload, isLoading }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!file) return 'No file selected.';
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) return 'Only CSV and Excel (.xlsx, .xls) files are supported.';
    if (file.size > 5 * 1024 * 1024) return 'File must be smaller than 5 MB.';
    return null;
  };

  const handleFileSelect = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setFileError(err);
      setSelectedFile(null);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = () => {
    if (selectedFile) onUpload(selectedFile);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mb: 1,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CloudUpload sx={{ color: '#10b981' }} />
          Bulk Upload User Stories
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontSize: '0.95rem' }}>
          Upload a CSV or Excel file with multiple user stories to generate test cases in bulk.
        </Typography>
      </Box>

      {/* CSV Format Guide */}
      <Box
        sx={{
          bgcolor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          p: 2,
          mb: 3,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#065f46', mb: 1 }}>
          📋 Required CSV / Excel Format
        </Typography>
        <Typography variant="body2" sx={{ color: '#064e3b', fontFamily: 'monospace', fontSize: '0.82rem', mb: 1 }}>
          Title, Description, Acceptance Criteria
        </Typography>
        <Typography variant="body2" sx={{ color: '#065f46', fontSize: '0.82rem' }}>
          • <strong>Title</strong> — User story title<br />
          • <strong>Description</strong> — Full user story description<br />
          • <strong>Acceptance Criteria</strong> — Criteria separated by <code>|</code> (pipe) or new lines
        </Typography>
        <Button
          size="small"
          variant="outlined"
          sx={{ mt: 1.5, borderColor: '#10b981', color: '#065f46', borderRadius: '8px', fontSize: '0.78rem' }}
          onClick={() => {
            const sample = `Title,Description,Acceptance Criteria\n"Guest User Checkout","As a guest user, I want to checkout without logging in.","Given a guest has items in cart | When user proceeds to checkout | Then system allows guest checkout"\n"User Login","As a registered user, I want to log in with my credentials.","Given user is on login page | When valid credentials are entered | Then user is redirected to dashboard"`;
            const blob = new Blob([sample], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sample_user_stories.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          ⬇ Download Sample CSV / Excel Template
        </Button>
      </Box>

      {/* Drop Zone */}
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !selectedFile && inputRef.current?.click()}
        sx={{
          border: `2px dashed ${dragOver ? '#10b981' : selectedFile ? '#10b981' : '#cbd5e1'}`,
          borderRadius: '14px',
          p: 4,
          textAlign: 'center',
          cursor: selectedFile ? 'default' : 'pointer',
          bgcolor: dragOver ? '#f0fdf4' : selectedFile ? '#f0fdf4' : '#fafafa',
          transition: 'all 0.2s ease',
          '&:hover': !selectedFile ? { borderColor: '#10b981', bgcolor: '#f0fdf4' } : {},
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        {selectedFile ? (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <InsertDriveFile sx={{ color: '#10b981', fontSize: 32 }} />
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#065f46' }}>
                {selectedFile.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </Typography>
            </Box>
            <Chip
              label="Remove"
              size="small"
              icon={<Close fontSize="small" />}
              onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
              sx={{ ml: 1, bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 600 }}
            />
          </Stack>
        ) : (
          <>
            <CloudUpload sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 600, color: '#374151' }}>
              Drag &amp; drop your CSV or Excel file here
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af', mt: 0.5 }}>
              or click to browse — CSV, XLSX, XLS — max 5 MB
            </Typography>
          </>
        )}
      </Box>

      {/* File Error */}
      {fileError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: '10px' }}>
          {fileError}
        </Alert>
      )}

      {/* Upload Button */}
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          disabled={!selectedFile || isLoading}
          onClick={handleUpload}
          startIcon={isLoading ? undefined : <CloudUpload />}
          sx={{
            minWidth: 220,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 700,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
            },
          }}
        >
          {isLoading ? 'Generating...' : '🚀 Generate from File'}
        </Button>
      </Stack>

      {isLoading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            sx={{
              borderRadius: 4,
              height: 6,
              bgcolor: '#d1fae5',
              '& .MuiLinearProgress-bar': { bgcolor: '#10b981' },
            }}
          />
          <Typography variant="body2" sx={{ color: '#065f46', mt: 1, textAlign: 'center' }}>
            Processing stories and generating test cases — this may take a moment...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UploadStories;
