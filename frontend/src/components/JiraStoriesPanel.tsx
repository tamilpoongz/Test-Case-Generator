import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Collapse,
  TextField,
  InputAdornment,
  Button,
  Skeleton,
  Tooltip,
  Link,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { JiraStory } from '../types/index';

// ── Status chip colours ───────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'To Do':       { bg: '#e0e7ff', text: '#3730a3' },
  'In Progress': { bg: '#fef3c7', text: '#92400e' },
  'Done':        { bg: '#d1fae5', text: '#065f46' },
  'Blocked':     { bg: '#fee2e2', text: '#991b1b' },
};
function statusColor(s: string) {
  return STATUS_COLORS[s] || { bg: '#f3f4f6', text: '#374151' };
}

// ── Priority chip colours ─────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, string> = {
  Highest: '#ef4444',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#10b981',
  Lowest: '#6b7280',
  Critical: '#ef4444',
};

// ── Single story row ──────────────────────────────────────────────────────────
interface StoryRowProps {
  story: JiraStory;
  onGenerate: (story: JiraStory) => void;
  isGenerating: boolean;
}

const StoryRow: React.FC<StoryRowProps> = ({ story, onGenerate, isGenerating }) => {
  const [open, setOpen] = useState(false);
  const sc = statusColor(story.status);

  return (
    <>
      <TableRow
        hover
        sx={{
          cursor: 'pointer',
          '&:hover': { backgroundColor: 'rgba(99,102,241,0.04)' },
          ...(open && { backgroundColor: 'rgba(99,102,241,0.05)' }),
        }}
      >
        {/* Expand toggle */}
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={() => setOpen(o => !o)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        {/* Key */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#4f46e5' }}>
              {story.key}
            </Typography>
            <Tooltip title="Open in Jira">
              <Link href={story.url} target="_blank" rel="noreferrer" sx={{ display: 'flex', alignItems: 'center' }}>
                <OpenInNewIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
              </Link>
            </Tooltip>
          </Box>
        </TableCell>

        {/* Summary */}
        <TableCell>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{story.summary}</Typography>
        </TableCell>

        {/* Status */}
        <TableCell>
          <Chip
            label={story.status}
            size="small"
            sx={{ backgroundColor: sc.bg, color: sc.text, fontWeight: 700, fontSize: '0.75rem' }}
          />
        </TableCell>

        {/* Priority */}
        <TableCell>
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: PRIORITY_COLORS[story.priority] || '#6b7280',
            }}
          >
            {story.priority}
          </Typography>
        </TableCell>

        {/* Assignee */}
        <TableCell>
          <Typography sx={{ fontSize: '0.8rem', color: '#6b7280' }}>
            {story.assignee || '—'}
          </Typography>
        </TableCell>

        {/* Action */}
        <TableCell align="right">
          <Button
            size="small"
            variant="contained"
            startIcon={<PlayArrowIcon />}
            disabled={isGenerating}
            onClick={() => onGenerate(story)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
            }}
          >
            Generate TCs
          </Button>
        </TableCell>
      </TableRow>

      {/* Expanded detail */}
      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, borderBottom: open ? '2px solid #6366f1' : 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                p: 2.5,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(139,92,246,0.03) 100%)',
              }}
            >
              {story.description && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#4f46e5', mb: 0.5 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#374151' }}>
                    {story.description}
                  </Typography>
                </Box>
              )}
              {story.acceptanceCriteria.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#4f46e5', mb: 0.5 }}>
                    Acceptance Criteria
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                    {story.acceptanceCriteria.map((ac, i) => (
                      <Typography component="li" key={i} variant="body2" sx={{ color: '#374151', mb: 0.25 }}>
                        {ac}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
              {!story.description && story.acceptanceCriteria.length === 0 && (
                <Typography variant="body2" sx={{ color: '#9ca3af', fontStyle: 'italic' }}>
                  No description or acceptance criteria available.
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
const StoriesSkeleton: React.FC = () => (
  <>
    {[1, 2, 3].map(i => (
      <TableRow key={i}>
        <TableCell><Skeleton width={24} height={24} variant="circular" /></TableCell>
        <TableCell><Skeleton width={80} /></TableCell>
        <TableCell><Skeleton width={240} /></TableCell>
        <TableCell><Skeleton width={80} /></TableCell>
        <TableCell><Skeleton width={60} /></TableCell>
        <TableCell><Skeleton width={100} /></TableCell>
        <TableCell><Skeleton width={110} height={32} /></TableCell>
      </TableRow>
    ))}
  </>
);

// ── Main panel ────────────────────────────────────────────────────────────────
interface JiraStoriesPanelProps {
  stories: JiraStory[];
  isLoading: boolean;
  error: string | null;
  onGenerate: (story: JiraStory) => void;
  isGenerating: boolean;
  generatingStoryKey: string | null;
}

const JiraStoriesPanel: React.FC<JiraStoriesPanelProps> = ({
  stories,
  isLoading,
  error,
  onGenerate,
  isGenerating,
  generatingStoryKey,
}) => {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? stories.filter(
        s =>
          s.key.toLowerCase().includes(search.toLowerCase()) ||
          s.summary.toLowerCase().includes(search.toLowerCase())
      )
    : stories;

  return (
    <Box>
      {/* Search bar */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          placeholder="Search by key or summary…"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            ),
          }}
        />
        <Typography variant="caption" sx={{ color: '#6b7280', whiteSpace: 'nowrap' }}>
          {filtered.length} / {stories.length} stories
        </Typography>
      </Box>

      {error && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#fee2e2', borderRadius: '10px' }}>
          <Typography variant="body2" sx={{ color: '#991b1b' }}>❌ {error}</Typography>
        </Box>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: '12px' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell width={40} />
              <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Key</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Summary</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Assignee</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#374151' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <StoriesSkeleton />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#9ca3af' }}>
                  {stories.length === 0 ? 'No stories found in this project.' : 'No stories match your search.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(story => (
                <StoryRow
                  key={story.key}
                  story={story}
                  onGenerate={onGenerate}
                  isGenerating={isGenerating && generatingStoryKey === story.key}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default JiraStoriesPanel;
