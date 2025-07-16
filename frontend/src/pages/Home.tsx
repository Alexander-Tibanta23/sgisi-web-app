import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [isShieldHovered, setIsShieldHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        pt: { xs: 8, sm: 10 },
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)'
          : 'linear-gradient(135deg, #f6f8fa 0%, #eaeef2 100%)',
        transition: 'background 0.4s',
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: { xs: 8, sm: 12 },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 4, sm: 8 },
            background: theme.palette.background.paper,
            borderRadius: 5,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px 0 rgba(20,30,40,0.25)'
              : '0 8px 32px 0 rgba(9,105,218,0.08)',
            maxWidth: 1000,
            width: '100%',
            mb: 4,
            transition: 'background 0.4s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Título con ícono de escudo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              gap: 2,
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <Security
              sx={{
                fontSize: isMobile ? '2.5rem' : '3.5rem',
                color: 'primary.main',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                transform: isShieldHovered ? 'scale(1.12) rotate(-6deg)' : 'scale(1)',
                filter: isShieldHovered ? 'drop-shadow(0 6px 16px rgba(9,105,218,0.18))' : 'none',
              }}
              onMouseEnter={() => setIsShieldHovered(true)}
              onMouseLeave={() => setIsShieldHovered(false)}
            />
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.6rem', sm: '2.2rem', md: '2.7rem' },
                lineHeight: 1.2,
                color: 'text.primary',
                letterSpacing: '-0.025em',
                mt: isMobile ? 2 : 0,
              }}
            >
              SGISI: Gestión Centralizada de Incidentes
            </Typography>
          </Box>

          {/* Descripción */}
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1.15rem', sm: '1.35rem' },
              lineHeight: 1.7,
              color: 'text.secondary',
              mb: 5,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Controla y resuelve incidentes de seguridad desde una interfaz unificada
          </Typography>

          {/* Botón de Iniciar Sesión */}
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              sx={{
                px: 6,
                py: 2.2,
                fontSize: '1.18rem',
                fontWeight: 700,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: isButtonHovered
                  ? '0 6px 24px 0 rgba(9,105,218,0.18)'
                  : '0 2px 8px 0 rgba(9,105,218,0.08)',
                transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mx: 'auto',
                '&:hover': {
                  filter: 'brightness(1.07)',
                  transform: 'translateY(-2px) scale(1.04)',
                },
                '&:active': {
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                  transform: 'translateY(0) scale(1)',
                },
              }}
            >
              
              Iniciar Sesión
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home; 