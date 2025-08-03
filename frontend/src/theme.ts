import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#f59e42',
    },
    error: {
      main: '#ef4444',
    },
    info: {
      main: '#22d3ee',
    },
    success: {
      main: '#22c55e',
    },
    text: {
      primary: '#f0f6fc',
      secondary: '#7d8590',
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f6f8fa',
      paper: '#fff',
    },
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#f59e42',
    },
    error: {
      main: '#ef4444',
    },
    info: {
      main: '#22d3ee',
    },
    success: {
      main: '#22c55e',
    },
    text: {
      primary: '#161b22',
      secondary: '#6b7280',
    },
  },
});
