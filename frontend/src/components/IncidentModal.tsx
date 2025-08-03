
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { sgisiPalette } from '../theme/palette';

type Incident = {
  id?: string;
  created_at?: string;
  titulo: string;
  activo_afectado: string;
  tipo: string;
  responsable: string;
  evidencia: string;
  dueño: string;
  estado: string;
  descripcion: string;
  nivel: string;
  team: string;
};

type IncidentModalProps = {
  open: boolean;
  onClose: () => void;
  incident: Incident | null;
  userId: string;
};

const initialState: Incident = {
  titulo: '',
  activo_afectado: '',
  tipo: '',
  responsable: '',
  evidencia: '',
  dueño: '',
  estado: 'Nuevo',
  descripcion: '',
  nivel: '',
  team: '',
};

const IncidentModal: React.FC<IncidentModalProps> = ({ open, onClose, incident, userId }) => {
  const [form, setForm] = useState<Incident>(incident || { ...initialState, dueño: userId });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (incident && incident.id) {
      // Update
      const { error: updateError } = await supabase.from('incidentes').update(form).eq('id', incident.id);
      if (updateError) setError(updateError.message);
      else setSuccess('Incidente actualizado');
    } else {
      // Insert
      const { error: insertError } = await supabase.from('incidentes').insert([form]);
      if (insertError) setError(insertError.message);
      else setSuccess('Incidente creado');
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(13,17,23,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <form onSubmit={handleSubmit} style={{ background: sgisiPalette.background, color: sgisiPalette.text, padding: 32, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', minWidth: 340 }}>
        <h3 style={{ color: sgisiPalette.primary, marginBottom: 18 }}>{incident ? 'Editar incidente' : 'Nuevo incidente'}</h3>
        {Object.keys(initialState).map(key => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6, color: sgisiPalette.textSecondary }}>{key.replace('_', ' ').toUpperCase()}</label>
            <input name={key} value={form[key as keyof Incident]} onChange={handleChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${sgisiPalette.border}`, background: sgisiPalette.subtleBackground, color: sgisiPalette.text }} />
          </div>
        ))}
        {error && <div style={{ color: sgisiPalette.error, marginBottom: 10 }}>{error}</div>}
        {success && <div style={{ color: sgisiPalette.primary, marginBottom: 10 }}>{success}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button type="submit" disabled={loading} style={{ background: sgisiPalette.primary, color: '#fff', borderRadius: 8, padding: '8px 18px', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>{incident ? 'Guardar' : 'Crear'}</button>
          <button type="button" onClick={onClose} style={{ background: sgisiPalette.secondary, color: '#fff', borderRadius: 8, padding: '8px 18px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default IncidentModal;
