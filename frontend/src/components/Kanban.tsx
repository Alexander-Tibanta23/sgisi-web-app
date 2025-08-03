
import React, { useState } from 'react';
import IncidentModal from './IncidentModal';
import { sgisiPalette } from '../theme/palette';

type Incident = {
  id: string;
  created_at: string;
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

type KanbanProps = {
  incidentes: Incident[];
  role: string;
  userId: string;
};

const estados = ['Nuevo', 'En Revisión', 'Terminado', 'Cerrado'];

const Kanban: React.FC<KanbanProps> = ({ incidentes, role, userId }) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setModalOpen(true);
  };

  const handleNewIncident = () => {
    setSelectedIncident(null);
    setModalOpen(true);
  };

  // Agrupa incidentes por estado
  const grouped = estados.map(estado => ({
    estado,
    items: incidentes.filter((i: Incident) => i.estado === estado)
  }));

  return (
    <div style={{ display: 'flex', flex: 1, gap: 24, padding: 32, background: sgisiPalette.background }}>
      {grouped.map(col => (
        <div key={col.estado} style={{ flex: 1, background: sgisiPalette.subtleBackground, borderRadius: 8, border: `1px solid ${sgisiPalette.border}`, padding: 16 }}>
          <h3 style={{ color: sgisiPalette.primary, marginBottom: 12 }}>{col.estado}</h3>
          {col.items.map((incident: Incident) => (
            <div key={incident.id} onClick={() => handleCardClick(incident)} style={{ background: sgisiPalette.card, color: sgisiPalette.text, border: `1px solid ${sgisiPalette.border}`, borderRadius: 8, padding: 14, marginBottom: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: sgisiPalette.primary }}>{incident.titulo}</div>
              <div style={{ color: sgisiPalette.textSecondary, fontSize: '0.95rem', marginBottom: 6 }}>Activo afectado: {incident.activo_afectado}</div>
              <div style={{ color: sgisiPalette.textSecondary, fontSize: '0.95rem', marginBottom: 6 }}>Tipo: {incident.tipo}</div>
              <div style={{ color: sgisiPalette.textSecondary, fontSize: '0.95rem', marginBottom: 6 }}>Responsable: {incident.responsable}</div>
              <div style={{ color: sgisiPalette.textSecondary, fontSize: '0.95rem', marginBottom: 6 }}>Evidencia: {incident.evidencia}</div>
              <div style={{ color: sgisiPalette.textSecondary, fontSize: '0.95rem', marginBottom: 6 }}>Dueño: {incident.dueño}</div>
              <div style={{ color: sgisiPalette.textSecondary, fontSize: '0.95rem', marginBottom: 6 }}>Estado: {incident.estado}</div>
              <div style={{ color: sgisiPalette.textSecondary, fontSize: '0.95rem', marginBottom: 6 }}>Descripción: {incident.descripcion}</div>
              <div style={{ color: sgisiPalette.textSecondary, fontSize: '0.95rem', marginBottom: 6 }}>Nivel: {incident.nivel}</div>
              <div style={{ color: sgisiPalette.textSecondary, fontSize: '0.95rem', marginBottom: 6 }}>Equipo: {incident.team}</div>
            </div>
          ))}
          {/* Botón para crear incidente si el rol lo permite */}
          {(role === 'Jefe de seguridad' || role === 'Analista' || role === 'Usuario_normal') && col.estado === 'Nuevo' && (
            <button onClick={handleNewIncident} style={{ width: '100%', background: sgisiPalette.primary, color: '#fff', borderRadius: 8, padding: '10px 0', border: 'none', fontWeight: 600, marginTop: 8, cursor: 'pointer' }}>+ Nuevo incidente</button>
          )}
        </div>
      ))}
      {modalOpen && (
        <IncidentModal open={modalOpen} onClose={() => setModalOpen(false)} incident={selectedIncident} userId={userId} />
      )}
    </div>
  );
};

export default Kanban;
