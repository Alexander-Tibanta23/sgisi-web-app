import React, { useState } from 'react';
import { Modal, TextField, Select, MenuItem as MuiMenuItem, FormControl, InputLabel, OutlinedInput, ListItemText } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Menu,
  MenuItem,
  Checkbox,
  Button,
  Divider,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GroupIcon from '@mui/icons-material/Group';

// Mock data for Kanban cards
const incidentes = [
  {
    id: 1,
    tipo: ['Malware/Virus'],
    severidad: 'Alto',
    titulo: 'Usabilidad Testing',
    descripcion: 'Malware detectado en estación de trabajo.',
    ubicacion: 'TI',
    fecha: '2025-08-02 09:30',
    imagen: 'https://placehold.co/80x40',
    estado: 'A analizar',
  },
  {
    id: 2,
    tipo: ['Acceso no autorizado'],
    severidad: 'Medio',
    titulo: 'Acceso no autorizado',
    descripcion: 'Intento de acceso no autorizado detectado.',
    ubicacion: 'Seguridad',
    fecha: '2025-08-01 15:10',
    imagen: 'https://placehold.co/80x40',
    estado: 'En revisión',
  },
  {
    id: 3,
    tipo: ['Fuga de datos'],
    severidad: 'Bajo',
    titulo: 'Fuga de datos',
    descripcion: 'Posible fuga de datos en departamento legal.',
    ubicacion: 'Legal',
    fecha: '2025-07-30 11:00',
    imagen: 'https://placehold.co/80x40',
    estado: 'Completado',
  },
];

const estados = ['A analizar', 'En revisión', 'Completado'];
const severidades = ['Alto', 'Medio', 'Bajo'];
const tiposIncidente = [
  'Malware/Virus',
  'Acceso no autorizado',
  'Fuga de datos',
  'Denegación de servicio',
  'Phishing/Ingeniería social',
  'Vulnerabilidad de sistema',
  'Incidente físico',
  'Otro',
];

const colorEstado: Record<string, string> = {
  'A analizar': '#2563eb',
  'En revisión': '#6b7280',
  'Completado': '#22c55e',
};
const colorSeveridad: Record<string, string> = {
  'Alto': '#ef4444',
  'Medio': '#f59e42',
  'Bajo': '#22d3ee',
};

const Dashboard: React.FC<{ isDarkMode?: boolean; toggleTheme?: () => void }> = ({ isDarkMode, toggleTheme }) => {
  // Sidebar navigation
  const [selectedMenu, setSelectedMenu] = useState('kanban');
  // Filters
  const [anchorEstado, setAnchorEstado] = useState<null | HTMLElement>(null);
  const [anchorSeveridad, setAnchorSeveridad] = useState<null | HTMLElement>(null);
  const [filtroEstado, setFiltroEstado] = useState<string[]>(estados);
  const [filtroSeveridad, setFiltroSeveridad] = useState<string[]>(severidades);
  // Modal state
  const [openModal, setOpenModal] = useState(false);
  // Form state
  type FormDataType = {
    tipo: string;
    otroTipo: string;
    severidad: string;
    titulo: string;
    descripcion: string;
    departamento: string;
    fecha: string;
    imagen: File | null;
    imagenUrl: string;
  };
  const [formData, setFormData] = useState<FormDataType>({
    tipo: '',
    otroTipo: '',
    severidad: '',
    titulo: '',
    descripcion: '',
    departamento: '',
    fecha: '',
    imagen: null,
    imagenUrl: '',
  });

  // Sidebar right
  const sidebarWidth = 160;

  // Filter handlers
  const handleEstadoClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEstado(event.currentTarget);
  };
  const handleSeveridadClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorSeveridad(event.currentTarget);
  };
  const handleEstadoClose = () => setAnchorEstado(null);
  const handleSeveridadClose = () => setAnchorSeveridad(null);

  // Card state for moving between columns
  const [incidentesState, setIncidentesState] = useState(incidentes);
  // Card filtering
  const filteredIncidentes = incidentesState.filter(
    (inc) =>
      filtroEstado.includes(inc.estado) &&
      filtroSeveridad.includes(inc.severidad) &&
      inc.tipo.some((t) => tiposIncidente.includes(t))
  );
  // Move card handler
  const handleMoveCard = (id: number, newEstado: string) => {
    setIncidentesState(prev => prev.map(inc => inc.id === id ? { ...inc, estado: newEstado } : inc));
  };

  // Modal handlers
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'imagen' && e.target instanceof HTMLInputElement && e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, imagen: e.target.files[0], imagenUrl: URL.createObjectURL(e.target.files[0]) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  const handleTipoChange = (event: SelectChangeEvent<string>) => {
    setFormData({ ...formData, tipo: event.target.value });
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para crear el incidente
    handleCloseModal();
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', backgroundColor: 'background.default', overflow: 'hidden' }}>
      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header with filters */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3, pb: 2, borderBottom: '1px solid #30363d', background: '#161b22', position: 'sticky', top: 0, zIndex: 10 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            SGISI Kanban
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={handleEstadoClick} sx={{ background: '#21262d', color: '#f0f6fc', borderColor: '#30363d', '&:hover': { background: '#30363d' } }}>
              Por Estado
            </Button>
            <Menu anchorEl={anchorEstado} open={Boolean(anchorEstado)} onClose={handleEstadoClose}>
              {estados.map((estado) => (
                <MenuItem key={estado} onClick={() => {
                  setFiltroEstado((prev) => prev.includes(estado) ? prev.filter(e => e !== estado) : [...prev, estado]);
                }}>
                  <Checkbox checked={filtroEstado.includes(estado)} />
                  {estado}
                </MenuItem>
              ))}
            </Menu>
            <Button variant="outlined" onClick={handleSeveridadClick} sx={{ background: '#21262d', color: '#f0f6fc', borderColor: '#30363d', '&:hover': { background: '#30363d' } }}>
              Por Severidad
            </Button>
            <Menu anchorEl={anchorSeveridad} open={Boolean(anchorSeveridad)} onClose={handleSeveridadClose}>
              {severidades.map((sev) => (
                <MenuItem key={sev} onClick={() => {
                  setFiltroSeveridad((prev) => prev.includes(sev) ? prev.filter(s => s !== sev) : [...prev, sev]);
                }}>
                  <Checkbox checked={filtroSeveridad.includes(sev)} />
                  {sev}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>
        {/* Kanban Columns - ordered: A analizar (left), En revisión (center), Completado (right) */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 4, px: 4, py: 3, background: '#0d1117', overflowX: 'auto' }}>
          {filtroEstado.length === 0 ? (
            <Typography variant="h6" sx={{ color: '#f0f6fc' }}>Selecciona al menos una columna en "Por Estado"</Typography>
          ) : (
            estados.filter(e => filtroEstado.includes(e)).map((estado, colIdx) => (
              <Box key={estado} sx={{ minWidth: 380, maxWidth: 420, flex: 1, background: '#161b22', borderRadius: 3, boxShadow: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 2, transition: 'width 0.3s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colorEstado[estado], fontSize: 16 }}>
                    {filteredIncidentes.filter(i => i.estado === estado).length} {estado}
                  </Typography>
                  {estado === 'A analizar' && (
                    <Button size="small" sx={{ ml: 'auto', background: colorEstado[estado], color: '#fff', minWidth: 32, borderRadius: 2, fontWeight: 700 }} onClick={handleOpenModal}>+</Button>
                  )}
                </Box>
                {/* Cards */}
                {filteredIncidentes.filter(i => i.estado === estado).map((inc) => (
                  <Box key={inc.id} sx={{
                    background: '#161b22',
                    borderRadius: 2,
                    p: 2,
                    mb: 1,
                    boxShadow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    border: `2px solid ${colorEstado[estado]}`,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {inc.tipo.map((tipo) => (
                          <Typography key={tipo} variant="caption" sx={{ background: '#21262d', color: '#f0f6fc', px: 1, py: 0.5, borderRadius: 1, fontWeight: 600 }}>{tipo}</Typography>
                        ))}
                      </Box>
                      <Typography variant="caption" sx={{ background: colorSeveridad[inc.severidad], color: '#fff', px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 700 }}>{inc.severidad}</Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f0f6fc', mb: 0.5 }}>{inc.titulo}</Typography>
                    <Typography variant="body2" sx={{ color: '#7d8590', mb: 0.5 }}>{inc.descripcion}</Typography>
                    <Typography variant="caption" sx={{ color: '#7d8590', mb: 0.5 }}>Ubicación: {inc.ubicacion}</Typography>
                    <Typography variant="caption" sx={{ color: '#7d8590', mb: 0.5 }}>Fecha detección: {inc.fecha}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <img src={inc.imagen} alt="referencial" style={{ borderRadius: 4, width: 80, height: 40, objectFit: 'cover', background: '#333' }} />
                    </Box>
                    {/* Move card buttons */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {colIdx > 0 && (
                        <Button size="small" variant="outlined" sx={{ color: colorEstado[estados[colIdx-1]], borderColor: colorEstado[estados[colIdx-1]] }} onClick={() => handleMoveCard(inc.id, estados[colIdx-1])}>
                          ← {estados[colIdx-1]}
                        </Button>
                      )}
                      {colIdx < estados.length - 1 && (
                        <Button size="small" variant="outlined" sx={{ color: colorEstado[estados[colIdx+1]], borderColor: colorEstado[estados[colIdx+1]] }} onClick={() => handleMoveCard(inc.id, estados[colIdx+1])}>
                          {estados[colIdx+1]} →
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ))
          )}
        </Box>

        {/* Modal para crear incidente */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, bgcolor: '#161b22', borderRadius: 3, boxShadow: 24, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ color: '#f0f6fc', mb: 2 }}>Crear Incidente</Typography>
            <form onSubmit={handleFormSubmit}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#7d8590' }}>Tipo incidente</InputLabel>
                  <Select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleTipoChange}
                    input={<OutlinedInput label="Tipo incidente" />}
                    sx={{ color: '#f0f6fc' }}
                  >
                    {tiposIncidente.map((tipo) => (
                      <MuiMenuItem key={tipo} value={tipo}>
                        <ListItemText primary={tipo} />
                      </MuiMenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#7d8590' }}>Severidad</InputLabel>
                  <Select
                    name="severidad"
                    value={formData.severidad}
                    onChange={(e: SelectChangeEvent<string>) => setFormData({ ...formData, severidad: e.target.value })}
                    input={<OutlinedInput label="Severidad" />}
                    sx={{ color: '#f0f6fc' }}
                  >
                    <MuiMenuItem value="Alto">Alto</MuiMenuItem>
                    <MuiMenuItem value="Medio">Medio</MuiMenuItem>
                    <MuiMenuItem value="Bajo">Bajo</MuiMenuItem>
                  </Select>
                </FormControl>
              </Box>
              {/* Mostrar campo Otro si se selecciona "Otro" */}
              {formData.tipo === 'Otro' && (
                <TextField fullWidth label="Especificar tipo incidente" name="otroTipo" value={formData.otroTipo} onChange={handleFormChange} sx={{ mb: 2 }} />
              )}
              <TextField fullWidth label="Título" name="titulo" value={formData.titulo} onChange={handleFormChange} sx={{ mb: 2 }} />
              <TextField fullWidth label="Descripción" name="descripcion" value={formData.descripcion} onChange={handleFormChange} sx={{ mb: 2 }} multiline minRows={4} />
              <TextField fullWidth label="Departamento" name="departamento" value={formData.departamento} onChange={handleFormChange} sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="Fecha"
                name="fecha"
                type="date"
                value={formData.fecha ? formData.fecha : ''}
                onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button variant="outlined" component="label" sx={{ color: '#f0f6fc', borderColor: '#30363d' }}>
                  Subir imagen
                  <input type="file" name="imagen" accept="image/*" hidden onChange={handleFormChange} />
                </Button>
                {formData.imagenUrl && (
                  <img src={formData.imagenUrl} alt="preview" style={{ width: 80, height: 40, borderRadius: 4, objectFit: 'cover', background: '#333' }} />
                )}
              </Box>
              <Button type="submit" variant="contained" color="primary" fullWidth>Crear</Button>
            </form>
          </Box>
        </Modal>
      </Box>
      {/* Sidebar navigation (right) with section titles */}
      <Drawer
        anchor="right"
        variant="permanent"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: sidebarWidth,
            boxSizing: 'border-box',
            background: '#161b22',
            borderLeft: '1px solid #30363d',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100vh',
            py: 2,
          },
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#f0f6fc', fontWeight: 700, mb: 1, mt: 1 }}>SECCIONES</Typography>
          <List>
            <ListItem button selected={selectedMenu === 'kanban'} onClick={() => setSelectedMenu('kanban')} sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1, px: 2, gap: 1 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: 1 }}><HomeIcon sx={{ color: selectedMenu === 'kanban' ? '#2563eb' : '#58a6ff' }} /></ListItemIcon>
              <Typography variant="caption" sx={{ color: '#7d8590', fontWeight: 600 }}>Kanban</Typography>
            </ListItem>
            <ListItem button selected={selectedMenu === 'notificaciones'} onClick={() => setSelectedMenu('notificaciones')} sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1, px: 2, gap: 1 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: 1 }}><NotificationsIcon sx={{ color: selectedMenu === 'notificaciones' ? '#f59e42' : '#58a6ff' }} /></ListItemIcon>
              <Typography variant="caption" sx={{ color: '#7d8590', fontWeight: 600 }}>Notificaciones</Typography>
            </ListItem>
            <ListItem button selected={selectedMenu === 'teams'} onClick={() => setSelectedMenu('teams')} sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1, px: 2, gap: 1 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: 1 }}><GroupIcon sx={{ color: selectedMenu === 'teams' ? '#22c55e' : '#58a6ff' }} /></ListItemIcon>
              <Typography variant="caption" sx={{ color: '#7d8590', fontWeight: 600 }}>Teams</Typography>
            </ListItem>
          </List>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Divider sx={{ width: '60%', mb: 1, background: '#30363d' }} />
        </Box>
      </Drawer>
    </Box>
  );
};

export default Dashboard;
