import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { JiraConfig } from '../types/index';
import { validateJiraConnection } from '../services/jiraService';

interface JiraConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (config: JiraConfig) => void;
  initialConfig?: JiraConfig | null;
}

const EMPTY_CONFIG: JiraConfig = {
  baseUrl: '',
  email: '',
  apiToken: '',
  projectKey: '',
  issueType: 'Story',
};

const JiraConfigModal: React.FC<JiraConfigModalProps> = ({ open, onClose, onSaved, initialConfig }) => {
  const [form, setForm] = useState<JiraConfig>(initialConfig || EMPTY_CONFIG);
  const [showToken, setShowToken] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof JiraConfig, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(initialConfig || EMPTY_CONFIG);
      setConnectionStatus('idle');
      setConnectionMessage('');
      setErrors({});
    }
  }, [open, initialConfig]);

  const set = (field: keyof JiraConfig, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setConnectionStatus('idle');
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof JiraConfig, string>> = {};
    if (!form.baseUrl.trim()) newErrors.baseUrl = 'Base URL is required';
    else if (!/^https?:\/\/.+/.test(form.baseUrl.trim())) newErrors.baseUrl = 'Must start with http:// or https://';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.apiToken.trim()) newErrors.apiToken = 'API Token is required';
    if (!form.projectKey.trim()) newErrors.projectKey = 'Project Key is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validate()) return;
    setIsValidating(true);
    setConnectionStatus('idle');
    try {
      const result = await validateJiraConnection(form);
      if (result.connected) {
        setConnectionStatus('success');
        setConnectionMessage(`Connected as ${result.displayName || form.email}`);
      } else {
        setConnectionStatus('error');
        setConnectionMessage(result.error || 'Connection failed');
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setConnectionMessage(err.message || 'Connection failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    if (!validate()) return;
    onSaved({ ...form, baseUrl: form.baseUrl.replace(/\/$/, ''), projectKey: form.projectKey.toUpperCase() });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e5e7eb', pb: 2 }}>
        🔗 Configure Jira Connection
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
          Use your Jira API token for secure authentication. Generate one at{' '}
          <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer">
            Atlassian Account Settings
          </a>
          .
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Jira Base URL"
            placeholder="https://yourorg.atlassian.net"
            fullWidth
            value={form.baseUrl}
            onChange={e => set('baseUrl', e.target.value)}
            error={!!errors.baseUrl}
            helperText={errors.baseUrl}
            size="small"
          />

          <TextField
            label="Email Address"
            placeholder="you@example.com"
            fullWidth
            value={form.email}
            onChange={e => set('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            size="small"
          />

          <TextField
            label="API Token"
            placeholder="Your Jira API token"
            fullWidth
            type={showToken ? 'text' : 'password'}
            value={form.apiToken}
            onChange={e => set('apiToken', e.target.value)}
            error={!!errors.apiToken}
            helperText={errors.apiToken}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowToken(v => !v)}>
                    {showToken ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Project Key"
              placeholder="PROJ"
              sx={{ flex: 1 }}
              value={form.projectKey}
              onChange={e => set('projectKey', e.target.value.toUpperCase())}
              error={!!errors.projectKey}
              helperText={errors.projectKey || 'e.g. "PROJ"'}
              size="small"
            />
            <TextField
              label="Issue Type"
              sx={{ flex: 1 }}
              value={form.issueType}
              onChange={e => set('issueType', e.target.value)}
              helperText="Default: Story"
              size="small"
            />
          </Box>

          {/* Connection status */}
          {connectionStatus === 'success' && (
            <Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: '10px' }}>
              {connectionMessage}
            </Alert>
          )}
          {connectionStatus === 'error' && (
            <Alert severity="error" icon={<CancelIcon />} sx={{ borderRadius: '10px' }}>
              {connectionMessage}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleTestConnection}
          variant="outlined"
          disabled={isValidating}
          startIcon={isValidating ? <CircularProgress size={16} /> : null}
          sx={{ borderColor: '#6366f1', color: '#6366f1' }}
        >
          {isValidating ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={connectionStatus === 'idle' && !initialConfig}
          sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}
        >
          Save & Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JiraConfigModal;
