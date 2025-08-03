import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const CreateUserModal = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Usuario_normal');
  const [team, setTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [password, setPassword] = useState('');
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    // Crear usuario en Supabase Auth y en profiles
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    const userId = data.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from('profiles').insert([{ id: userId, role, team }]);
      if (profileError) {
        setError(profileError.message);
      } else {
        setSuccess('Usuario creado correctamente');
        setEmail('');
        setRole('Usuario_normal');
        setTeam('');
        setPassword('');
      }
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={() => setOpen(true)} style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 8, padding: '8px 18px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Crear usuario</button>
      {open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(13,17,23,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <form onSubmit={handleCreate} style={{ background: 'var(--color-background)', color: 'var(--color-text)', padding: 32, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', minWidth: 320 }}>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: 18 }}>Crear usuario</h3>
            <label style={{ display: 'block', marginBottom: 8 }}>Correo</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-subtle-background)', color: 'var(--color-text)', marginBottom: 12 }} />
            <label style={{ display: 'block', marginBottom: 8 }}>Contraseña</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-subtle-background)', color: 'var(--color-text)', marginBottom: 12 }} />
            <label style={{ display: 'block', marginBottom: 8 }}>Rol</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-subtle-background)', color: 'var(--color-text)', marginBottom: 12 }}>
              <option value="Jefe de seguridad">Jefe de seguridad</option>
              <option value="Analista">Analista</option>
              <option value="Usuario_normal">Usuario normal</option>
            </select>
            <label style={{ display: 'block', marginBottom: 8 }}>Equipo (UUID)</label>
            <input type="text" value={team} onChange={e => setTeam(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-subtle-background)', color: 'var(--color-text)', marginBottom: 12 }} />
            {error && <div style={{ color: 'var(--color-error)', marginBottom: 10 }}>{error}</div>}
            {success && <div style={{ color: 'var(--color-primary)', marginBottom: 10 }}>{success}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <button type="submit" disabled={loading} style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 8, padding: '8px 18px', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>Guardar</button>
              <button type="button" onClick={() => setOpen(false)} style={{ background: 'var(--color-secondary)', color: '#fff', borderRadius: 8, padding: '8px 18px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateUserModal;
