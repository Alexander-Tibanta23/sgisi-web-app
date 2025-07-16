import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, Refresh } from '@mui/icons-material';

// Helper para validaciones
const suspiciousPattern = /['";=]|--/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const codePattern = /^\d{6}$/;

const MAX_USER_LENGTH = 64;
const MAX_PASS_LENGTH = 64;

const Login: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Login state
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ user: '', password: '' });
  const [errors, setErrors] = useState<{ user?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  // 2FA state
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSubmitting, setCodeSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const resendInterval = useRef<NodeJS.Timeout | null>(null);

  // Validación de campos
  const validate = () => {
    const newErrors: typeof errors = {};
    const user = form.user.trim();
    const password = form.password.trim();

    if (!user) newErrors.user = 'El usuario/correo es obligatorio.';
    else if (user.length > MAX_USER_LENGTH) newErrors.user = 'Máximo 64 caracteres.';
    else if (suspiciousPattern.test(user)) newErrors.user = 'Caracteres no permitidos.';
    else if (user.includes(' ')) newErrors.user = 'No debe contener espacios.';
    else if (user.includes('@') && !emailPattern.test(user)) newErrors.user = 'Formato de correo inválido.';

    if (!password) newErrors.password = 'La contraseña es obligatoria.';
    else if (password.length > MAX_PASS_LENGTH) newErrors.password = 'Máximo 64 caracteres.';
    else if (suspiciousPattern.test(password)) newErrors.password = 'Caracteres no permitidos.';
    else if (password.includes(' ')) newErrors.password = 'No debe contener espacios.';

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSubmitting(true);
    try {
      // Aquí iría la llamada a la API de login (NO almacenar password)
      // await sgisiAPI.auth.login({ ... });
      // Simulación de éxito
      setTimeout(() => {
        setSubmitting(false);
        setShow2FA(true);
        setResendTimer(60);
      }, 1200);
    } catch (err) {
      setSubmitting(false);
      setSubmitError('Usuario o contraseña incorrectos.');
    }
  };

  // 2FA handlers
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCode(val);
    setCodeError('');
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codePattern.test(code)) {
      setCodeError('El código debe ser de 6 números.');
      return;
    }
    setCodeSubmitting(true);
    setTimeout(() => {
      setCodeSubmitting(false);
      // Aquí iría la verificación real del código
      // Redirigir o mostrar éxito
    }, 1200);
  };

  // Temporizador para reenviar código
  useEffect(() => {
    if (!show2FA) return;
    if (resendTimer === 0 && resendInterval.current) {
      clearInterval(resendInterval.current);
      resendInterval.current = null;
      return;
    }
    if (resendTimer > 0 && !resendInterval.current) {
      resendInterval.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1 && resendInterval.current) {
            clearInterval(resendInterval.current);
            resendInterval.current = null;
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (resendInterval.current) clearInterval(resendInterval.current);
    };
  }, [show2FA, resendTimer]);

  const handleResend = () => {
    setResendTimer(60);
    setCode('');
    setCodeError('');
    // Aquí iría la llamada a la API para reenviar el código
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
          maxWidth: 480,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: { xs: 8, sm: 12 },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 4, sm: 6 },
            background: theme.palette.background.paper,
            borderRadius: 5,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 8px 32px 0 rgba(20,30,40,0.25)'
              : '0 8px 32px 0 rgba(9,105,218,0.08)',
            width: '100%',
            mb: 4,
            transition: 'background 0.4s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {!show2FA ? (
            <>
              <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" fontWeight={700} mb={2} color="text.primary">
                Iniciar Sesión
              </Typography>
              <Box component="form" onSubmit={handleSubmit} autoComplete="off" sx={{ width: '100%', mt: 1 }}>
                <TextField
                  label="Usuario o correo electrónico"
                  name="user"
                  value={form.user}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                  autoFocus
                  inputProps={{
                    maxLength: MAX_USER_LENGTH,
                    autoComplete: 'username',
                    spellCheck: false,
                    'aria-label': 'Usuario o correo electrónico',
                  }}
                  margin="normal"
                  error={!!errors.user}
                  helperText={errors.user}
                />
                <TextField
                  label="Contraseña"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                  type={showPassword ? 'text' : 'password'}
                  inputProps={{
                    maxLength: MAX_PASS_LENGTH,
                    autoComplete: 'off',
                    spellCheck: false,
                    'aria-label': 'Contraseña',
                  }}
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          onClick={() => setShowPassword((v) => !v)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          tabIndex={-1}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {submitError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {submitError}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  sx={{ mt: 3, fontWeight: 700, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
                  disabled={submitting}
                >
                  {submitting ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </Box>
            </>
          ) : (
            <>
              <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" fontWeight={700} mb={2} color="text.primary">
                Verificación en dos pasos
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Ingresa el código de 6 dígitos enviado a tu correo o app de autenticación.
              </Typography>
              <Box component="form" onSubmit={handleCodeSubmit} autoComplete="off" sx={{ width: '100%' }}>
                <TextField
                  label="Código de verificación"
                  name="code"
                  value={code}
                  onChange={handleCodeChange}
                  variant="outlined"
                  fullWidth
                  required
                  autoFocus
                  inputProps={{
                    maxLength: 6,
                    inputMode: 'numeric',
                    pattern: '\\d{6}',
                    autoComplete: 'one-time-code',
                    'aria-label': 'Código de verificación',
                  }}
                  margin="normal"
                  error={!!codeError}
                  helperText={codeError || ' '}
                />
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ fontWeight: 700, py: 1.2, borderRadius: 2, fontSize: '1.1rem' }}
                    disabled={codeSubmitting}
                  >
                    {codeSubmitting ? 'Verificando...' : 'Verificar'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Refresh />}
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                    sx={{ minWidth: 140, ml: 2, fontWeight: 600 }}
                  >
                    {resendTimer > 0 ? `Reenviar (${resendTimer}s)` : 'Reenviar código'}
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 