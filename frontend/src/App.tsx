import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import TestCaseGeneratorPage from './pages/TestCaseGeneratorPage';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
    },
    success: { main: '#10b981', light: '#6ee7b7', dark: '#059669' },
    error:   { main: '#ef4444', light: '#fca5a5', dark: '#dc2626' },
    info:    { main: '#06b6d4', light: '#67e8f9', dark: '#0891b2' },
    warning: { main: '#f59e0b', light: '#fcd34d', dark: '#d97706' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #111827 100%)',
          minHeight: '100vh',
        }}
      >
        <TestCaseGeneratorPage />
      </Box>
    </ThemeProvider>
  );
};

export default App;
