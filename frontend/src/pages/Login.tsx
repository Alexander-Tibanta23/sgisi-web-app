import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';
import { supabase } from '../utils/supabaseClient';


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

const Login: React.FC = () => {
  const [step, setStep] = useState<'login' | 'auth'>('login');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Llamada a Supabase Auth
    const { data, error: supaError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (supaError || !data.user) {
      setError('Usuario o contraseña inválidos');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3500);
      return;
    }
    setUserId(data.user.id);
    setStep('auth');
  };

  return step === 'login' ? (
    <div style={{ minHeight: '100vh', background: githubColors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleLogin} style={{ maxWidth: 400, width: '100%', background: githubColors.card, border: `1.5px solid ${githubColors.border}`, borderRadius: 12, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)', padding: 32, color: githubColors.text }}>
        <h2 style={{ color: githubColors.primary, marginBottom: 24, fontWeight: 700, fontSize: '1.7rem', textAlign: 'center', letterSpacing: '-0.03em' }}>Iniciar sesión en SGISI</h2>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, color: githubColors.text, fontWeight: 600 }}>Correo electrónico</label>
          <input type="email" required placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: `1.5px solid ${githubColors.border}`, background: githubColors.input, color: githubColors.text, fontSize: '1rem', outline: 'none', marginBottom: 2 }} />
        </div>
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: 8, color: githubColors.text, fontWeight: 600 }}>Contraseña</label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: `1.5px solid ${githubColors.border}`, background: githubColors.input, color: githubColors.text, fontSize: '1rem', outline: 'none', marginBottom: 2, paddingRight: 44 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{ position: 'absolute', right: 12, top: 38, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5c-7 0-9 7-9 7s2 7 9 7 9-7 9-7-2-7-9-7zm0 12c-4.418 0-7.364-3.053-8.484-5C4.636 8.053 7.582 5 12 5s7.364 3.053 8.484 5c-1.12 1.947-4.066 5-8.484 5zm0-9a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="#c9d1d9"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5c-7 0-9 7-9 7s2 7 9 7c1.93 0 3.68-.39 5.13-1.07l1.57 1.57a1 1 0 0 0 1.41-1.41l-16-16a1 1 0 0 0-1.41 1.41l2.13 2.13C4.636 8.053 7.582 5 12 5c2.21 0 4.21.72 5.87 1.93l1.43 1.43A1 1 0 0 0 20.71 7.7l-1.43-1.43C17.21 5.72 15.21 5 12 5zm0 12c-4.418 0-7.364-3.053-8.484-5C4.636 8.053 7.582 5 12 5c2.21 0 4.21.72 5.87 1.93l1.43 1.43A1 1 0 0 0 20.71 7.7l-1.43-1.43C17.21 5.72 15.21 5 12 5zm0-9a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="#c9d1d9"/></svg>
            )}
          </button>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 8, background: githubColors.primary, color: '#fff', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 8 }}>
          {loading ? 'Verificando...' : 'Iniciar sesión'}
        </button>
        {error && <div style={{ color: githubColors.error, marginTop: 18, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
        {showPopup && (
          <div style={{ position: 'fixed', top: 32, left: '50%', transform: 'translateX(-50%)', background: githubColors.error, color: '#fff', padding: '12px 32px', borderRadius: 8, fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.18)', zIndex: 9999 }}>
            Usuario o contraseña inválidos
          </div>
        )}
      </form>
    </div>
  ) : (
    <AuthForm email={email} userId={userId} />
  );
};

export default Login;