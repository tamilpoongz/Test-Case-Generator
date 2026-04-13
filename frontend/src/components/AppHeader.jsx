import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';

export const AppHeader = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        color: 'white',
        py: 4,
        mb: 4,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        },
      }}
    >
      <Container sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <AutoAwesome sx={{ fontSize: 40, animation: 'spin 3s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: '-1px' }}>
            Test Case Generation Agent
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.95, fontSize: '1.05rem', fontWeight: 500 }}>
          ✨ Automatically generate comprehensive test cases from user stories using AI
        </Typography>
      </Container>
    </Box>
  );
};

export default AppHeader;
