
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
import { supabase } from '../utils/supabaseClient';

type IncidentType = {
  id: string;
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

// ...existing code...

// ...existing code...

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
  const [incidentesState, setIncidentesState] = useState<IncidentType[]>([]);
  // Card filtering
  const filteredIncidentes = incidentesState.filter(
    (inc: IncidentType) =>
      filtroEstado.includes(inc.estado) &&
      filtroSeveridad.includes(inc.nivel) &&
      tiposIncidente.includes(inc.tipo)
  );
  // Move card handler
  const handleMoveCard = (id: string, newEstado: string) => {
    setIncidentesState((prev: IncidentType[]) => prev.map((inc: IncidentType) => inc.id === id ? { ...inc, estado: newEstado } : inc));
  };

  // Modal handlers
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  // Sanitization helpers
  const sanitizeInput = (value: string) => {
    // Whitelist: allow letters, numbers, basic punctuation, spaces
    return value.replace(/[^\w\s.,;:!?@\-áéíóúÁÉÍÓÚñÑ]/gi, '');
  };

  // Sanitized change handler for text fields
  const handleFormChangeSanitized = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'imagen' && e.target instanceof HTMLInputElement && e.target.files && e.target.files.length > 0) {
      setFormData({ ...formData, imagen: e.target.files[0], imagenUrl: URL.createObjectURL(e.target.files[0]) });
    } else {
      setFormData({ ...formData, [name]: sanitizeInput(value) });
    }
  };

  // Sanitized change handler for tipo select
  const handleTipoChangeSanitized = (event: SelectChangeEvent<string>) => {
    setFormData({ ...formData, tipo: sanitizeInput(event.target.value) });
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para crear el incidente
    handleCloseModal();
  };

  // Obtener rol y datos del usuario
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || '');
        const { data: roleData } = await supabase.rpc('get_my_role');
        setUserRole(roleData);
      }
    };
    fetchUser();
  }, []);

  React.useEffect(() => {
    const fetchIncidentes = async () => {
      let query = supabase.from('incidentes').select('*');
      if (userRole === 'Jefe de seguridad') {
        // No filter, get all
      } else if (userRole === 'Analista') {
        query = query.or(`team.eq.${userId},responsable.eq.${userId}`);
      } else {
        query = query.eq('dueño', userId);
      }
      const { data } = await query;
      setIncidentesState(data || []);
    };
    if (userRole && userId) fetchIncidentes();
  }, [userRole, userId]);

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
                  <Box
                    key={inc.id}
                    sx={{
                      background: '#161b22',
                      borderRadius: 2,
                      p: 2,
                      mb: 1,
                      boxShadow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      border: `2px solid ${colorEstado[estado]}`,
                      position: 'relative',
                    }}
                    onContextMenu={e => {
                      e.preventDefault();
                      // Mostrar menú contextual para editar/asignar responsable
                      // Implementar lógica de menú contextual aquí
                      // Puedes usar un estado para mostrar el menú y guardar el incidente seleccionado
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="caption" sx={{ background: '#21262d', color: '#f0f6fc', px: 1, py: 0.5, borderRadius: 1, fontWeight: 600 }}>{inc.tipo}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ background: colorSeveridad[inc.nivel], color: '#fff', px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 700 }}>{inc.nivel}</Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f0f6fc', mb: 0.5 }}>{inc.titulo}</Typography>
                    <Typography variant="body2" sx={{ color: '#7d8590', mb: 0.5 }}>{inc.descripcion}</Typography>
                    <Typography variant="caption" sx={{ color: '#7d8590', mb: 0.5 }}>Activo afectado: {inc.activo_afectado}</Typography>
                    <Typography variant="caption" sx={{ color: '#7d8590', mb: 0.5 }}>Evidencia: {inc.evidencia}</Typography>
                    <Typography variant="caption" sx={{ color: '#7d8590', mb: 0.5 }}>Dueño: {inc.dueño}</Typography>
                    <Typography variant="caption" sx={{ color: '#7d8590', mb: 0.5 }}>Estado: {inc.estado}</Typography>
                    <Typography variant="caption" sx={{ color: '#7d8590', mb: 0.5 }}>Nivel: {inc.nivel}</Typography>
                    <Typography variant="caption" sx={{ color: '#7d8590', mb: 0.5 }}>Equipo: {inc.team}</Typography>
                    {/* Mostrar responsable solo para CISO */}
                    {userRole === 'Jefe de seguridad' && (
                      <Typography variant="caption" sx={{ color: '#7d8590', mb: 0.5 }}>Responsable: {inc.responsable}</Typography>
                    )}
                    {/* Move card buttons solo para CISO y Analista */}
                    {(userRole === 'Jefe de seguridad' || userRole === 'Analista') && (
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
                    )}
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
                    onChange={handleTipoChangeSanitized}
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
                  <TextField fullWidth label="Especificar tipo incidente" name="otroTipo" value={formData.otroTipo} onChange={handleFormChangeSanitized} sx={{ mb: 2 }} />
              )}
              <TextField fullWidth label="Título" name="titulo" value={formData.titulo} onChange={handleFormChangeSanitized} sx={{ mb: 2 }} />
              <TextField fullWidth label="Descripción" name="descripcion" value={formData.descripcion} onChange={handleFormChangeSanitized} sx={{ mb: 2 }} multiline minRows={4} />
              <TextField fullWidth label="Departamento" name="departamento" value={formData.departamento} onChange={handleFormChangeSanitized} sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="Fecha"
                name="fecha"
                type="date"
                value={formData.fecha ? formData.fecha : ''}
                onChange={handleFormChangeSanitized}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button variant="outlined" component="label" sx={{ color: '#f0f6fc', borderColor: '#30363d' }}>
                  Subir imagen
                  <input type="file" name="imagen" accept="image/*" hidden onChange={handleFormChangeSanitized} />
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
        {/* User info and logout at bottom */}
        <Box sx={{ width: '100%', px: 2, pb: 2, mt: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#f0f6fc', fontWeight: 700 }}>
            {userId ? `Usuario: ${userId}` : 'Usuario no logeado'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#f0f6fc', fontWeight: 700 }}>
            {userEmail ? `Email: ${userEmail.split('@')[0]}` : ''}
          </Typography>
          <Typography variant="caption" sx={{ color: '#7d8590', fontWeight: 600 }}>
            {userRole ? `Rol: ${userRole}` : 'Rol desconocido'}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 1, color: '#ef4444', borderColor: '#ef4444', fontWeight: 700 }}
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}

export default Dashboard;
