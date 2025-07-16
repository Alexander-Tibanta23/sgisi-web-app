import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme as useMuiTheme,
  Paper,
} from '@mui/material';

// SVG personalizados para sol y luna
const SunIcon = ({ active }: { active: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ transition: 'all 0.3s', transform: active ? 'rotate(0deg)' : 'rotate(-30deg)' }}>
    <circle cx="12" cy="12" r="5" fill="#FFD600" />
    <g stroke="#FFD600" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>
  </svg>
);

const MoonIcon = ({ active }: { active: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ transition: 'all 0.3s', transform: active ? 'rotate(0deg)' : 'rotate(30deg)' }}>
    <path d="M21 12.79A9 9 0 0 1 12.21 3c-.5 0-.68.64-.27.91A7 7 0 1 0 20.09 12.5c.27.41-.13.97-.59.71Z" fill="#90CAF9" />
  </svg>
);

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, toggleTheme }) => {
  const theme = useMuiTheme();

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        zIndex: 1200,
        borderRadius: 0,
        background: theme.palette.background.paper,
        boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
        borderBottom: `1.5px solid ${theme.palette.divider}`,
        py: { xs: 0.5, sm: 1 },
        px: { xs: 1, sm: 3 },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 48, sm: 64 } }}>
        {/* Logo SGISI */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              letterSpacing: '-0.025em',
              userSelect: 'none',
            }}
          >
            SGISI
          </Typography>
        </Box>

        {/* Botón de cambio de tema */}
        <IconButton
          onClick={toggleTheme}
          color="inherit"
          sx={{
            ml: 1,
            borderRadius: '50%',
            p: 1,
            background: isDarkMode ? 'rgba(88,166,255,0.08)' : 'rgba(9,105,218,0.08)',
            transition: 'all 0.2s',
            '&:hover': {
              background: isDarkMode ? 'rgba(88,166,255,0.18)' : 'rgba(9,105,218,0.18)',
              transform: 'scale(1.08)',
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
            },
          }}
          aria-label="Cambiar tema"
        >
          {isDarkMode ? <SunIcon active={isDarkMode} /> : <MoonIcon active={!isDarkMode} />}
        </IconButton>
      </Toolbar>
    </Paper>
  );
};

export default Navbar; 