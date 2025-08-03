import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setSecureItem, getSecureItem } from '../utils/secureStorage';

interface AuthFormProps {
  email: string;
  userId: string;
}

const CODE_LENGTH = 6;
const TIME_LIMIT = 300; // segundos

const AuthForm: React.FC<AuthFormProps> = ({ email, userId }) => {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [timer, setTimer] = useState(TIME_LIMIT);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Solo envía el código cuando el componente se monta o el email cambia
    (async () => {
      // Genera código aleatorio
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSecureItem('auth_code', generatedCode);
      try {
        await axios.post('/api/send-code', {
          to: email,
          code: generatedCode,
        });
        setError('');
      } catch (err) {
        setError('Error enviando el código. Intenta de nuevo.');
      }
    })();
    const interval = setInterval(() => {
      setTimer(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [email]);


  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedCode = getSecureItem('auth_code');
    const codeStr = code.join('');
    if (codeStr === storedCode && timer > 0) {
      setSuccess(true);
      setError('');
      setTimeout(() => navigate('/Dashboard'), 1200);
    } else {
      setError('Código incorrecto o expirado');
    }
  };

  const githubColors = {
    background: '#0d1117',
    card: '#161b22',
    border: '#30363d',
    input: '#161b22',
    primary: '#58a6ff',
    secondary: '#7d8590',
    error: '#cf222e',
    text: '#f0f6fc',
    textSecondary: '#7d8590',
  };

  return (
    <div style={{ minHeight: '100vh', background: githubColors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, width: '100%', background: githubColors.card, border: `1.5px solid ${githubColors.border}`, borderRadius: 12, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)', padding: 32, color: githubColors.text, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ color: githubColors.primary, marginBottom: 24, fontWeight: 700, fontSize: '1.5rem', textAlign: 'center', letterSpacing: '-0.03em' }}>Verificación de código</h2>
        <div style={{ marginBottom: 18, width: '100%' }}>
          <label style={{ display: 'block', marginBottom: 12, color: githubColors.textSecondary, fontWeight: 600, textAlign: 'center' }}>Ingresa el código de 6 dígitos enviado a tu correo</label>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length > 1) return;
                  const newCode = [...code];
                  newCode[idx] = val;
                  setCode(newCode);
                  // Focus siguiente input
                  if (val && idx < CODE_LENGTH - 1) {
                    const next = document.getElementById(`code-input-${idx + 1}`);
                    if (next) (next as HTMLInputElement).focus();
                  }
                }}
                id={`code-input-${idx}`}
                style={{ width: 40, height: 48, fontSize: '2rem', textAlign: 'center', borderRadius: 8, border: `2px solid ${githubColors.border}`, background: githubColors.input, color: githubColors.text, outline: 'none', fontWeight: 700 }}
                autoFocus={idx === 0}
              />
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontWeight: 'bold', color: timer > 60 ? githubColors.primary : githubColors.error }}>Tiempo restante: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
        </div>
        {error && <div style={{ color: githubColors.error, marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: githubColors.primary, marginBottom: 12 }}>¡Autenticación exitosa!</div>}
        <button type="submit" disabled={timer === 0} style={{ width: '100%', padding: 14, borderRadius: 8, background: githubColors.primary, color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', cursor: timer === 0 ? 'not-allowed' : 'pointer', opacity: timer === 0 ? 0.6 : 1 }}>
          Verificar
        </button>
      </form>
    </div>
  );
};

export default AuthForm;