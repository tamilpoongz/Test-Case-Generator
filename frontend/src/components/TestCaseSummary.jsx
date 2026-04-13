import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Paper } from '@mui/material';
import { BarChart, CheckCircle, TrendingUp, Warning, Flag } from '@mui/icons-material';

export const TestCaseSummary = ({ summary }) => {
  if (!summary) {
    return null;
  }

  const stats = [
    {
      label: 'Total Test Cases',
      value: summary.total_test_cases || 0,
      color: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      icon: BarChart,
    },
    {
      label: 'Functional',
      value: summary.by_type?.Functional || 0,
      color: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      icon: CheckCircle,
    },
    {
      label: 'Positive',
      value: summary.by_type?.Positive || 0,
      color: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      icon: TrendingUp,
    },
    {
      label: 'Negative',
      value: summary.by_type?.Negative || 0,
      color: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      icon: Warning,
    },
    {
      label: 'Boundary',
      value: summary.by_type?.['Boundary Validation'] || 0,
      color: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
      icon: Flag,
    },
  ];

  return (
    <Card
      sx={{
        mb: 3,
        background: 'Linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
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
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          📊 Generation Summary
        </Typography>
        <Grid container spacing={2}>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Grid item xs={12} sm={6} md={2.4} key={index}>
                <Paper
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    background: stat.color,
                    color: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <IconComponent sx={{ fontSize: 28, mb: 1, opacity: 0.9 }} />
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        {summary.generation_timestamp && (
          <Typography
            variant="caption"
            sx={{ mt: 2.5, display: 'block', color: '#666', fontSize: '0.9rem' }}
          >
            ⏰ Generated: {new Date(summary.generation_timestamp).toLocaleString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TestCaseSummary;
