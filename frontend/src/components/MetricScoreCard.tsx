import React from 'react';
import { Box, Typography, Tooltip, Chip } from '@mui/material';
import { MetricResult } from '../types/index';

interface MetricScoreCardProps {
  label: string;       // Display name e.g. "Faithfulness"
  abbr?: string;       // Short label for compact table cells e.g. "Fth" (optional)
  result: MetricResult;
  inverted?: boolean;  // true for Hallucination: low score = good
  compact?: boolean;   // true = just a coloured chip, false = full card
}

function getColor(score: number, inverted: boolean): { bg: string; text: string; border: string } {
  const effective = inverted ? 1 - score : score;
  if (effective >= 0.80) return { bg: '#d1fae5', text: '#065f46', border: '#10b981' }; // green
  if (effective >= 0.50) return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' }; // amber
  return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };                         // red
}

function getEmoji(score: number, inverted: boolean): string {
  const effective = inverted ? 1 - score : score;
  if (effective >= 0.80) return '✅';
  if (effective >= 0.50) return '⚠️';
  return '❌';
}

/** Compact chip used inside the evaluation table */
export const MetricChip: React.FC<Omit<MetricScoreCardProps, 'compact'>> = ({
  label,
  result,
  inverted = false,
}) => {
  const c = getColor(result.score, inverted);
  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {label}: {result.score.toFixed(2)}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, maxWidth: 260 }}>
            {result.reason}
          </Typography>
        </Box>
      }
      arrow
    >
      <Chip
        label={result.score.toFixed(2)}
        size="small"
        sx={{
          backgroundColor: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
          fontWeight: 700,
          fontSize: '0.78rem',
          cursor: 'default',
          minWidth: 52,
        }}
      />
    </Tooltip>
  );
};

/** Full card used in expanded row detail */
const MetricScoreCard: React.FC<MetricScoreCardProps> = ({
  label,
  result,
  inverted = false,
}) => {
  const c = getColor(result.score, inverted);
  const emoji = getEmoji(result.score, inverted);

  return (
    <Box
      sx={{
        border: `1px solid ${c.border}`,
        borderRadius: '10px',
        backgroundColor: c.bg,
        p: 1.5,
        minWidth: 160,
        flex: '1 1 160px',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: c.text, fontSize: '0.78rem' }}>
          {emoji} {label}
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: c.text }}>
          {result.score.toFixed(2)}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{ color: c.text, opacity: 0.85, display: 'block', lineHeight: 1.4, fontSize: '0.72rem' }}
      >
        {result.reason}
      </Typography>
      {inverted && (
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 0.5, fontStyle: 'italic', color: c.text, opacity: 0.7, fontSize: '0.7rem' }}
        >
          ↓ lower is better
        </Typography>
      )}
    </Box>
  );
};

export default MetricScoreCard;
