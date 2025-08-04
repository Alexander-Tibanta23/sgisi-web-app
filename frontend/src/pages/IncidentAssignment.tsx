import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Grid,
  Avatar
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../contexts/UserContext';

interface Incident {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  nivel: string;
  estado: string;
  activo_afectado: string;
  evidencia: string;
  created_at: string;
  dueño: string;
  responsable: string | null;
  team: string | null;
  responsable_profile?: Profile | null;
  team_profile?: Team | null;
}

interface Profile {
  id: string;
  nombre: string;
  role: string;
  team: string | null;
}

interface Team {
  id: string;
  nombre: string;
  created_at: string;
}

const IncidentAssignment: React.FC = () => {
  const { userRole, loading: userLoading, userId, userEmail } = useUser();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedResponsable, setSelectedResponsable] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Filtros
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [filterResponsable, setFilterResponsable] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Check if user has permission to assign incidents
  const canAssignIncidents = userRole === 'Jefe de seguridad';

  const estados = ['Nuevo', 'En investigacion', 'Contenido', 'Erradicado', 'Cerrado'];
  const niveles = ['Bajo', 'Medio', 'Alto', 'Crítico'];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch incidents with related data
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('incidentes')
        .select(`
          *,
          team_profile:team(id, nombre)
        `)
        .order('created_at', { ascending: false });

      if (incidentsError) {
        console.error('Error fetching incidents:', incidentsError);
        setError(`Error al cargar incidentes: ${incidentsError.message}`);
        setDebugInfo({ incidentsError });
        return;
      }

      // Fetch profiles (analistas and users)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('nombre');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError(`Error al cargar usuarios: ${profilesError.message}`);
        setDebugInfo({ profilesError });
        return;
      }

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('team')
        .select('*')
        .order('nombre');

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        setError(`Error al cargar equipos: ${teamsError.message}`);
        setDebugInfo({ teamsError });
        return;
      }

      // Combine incidents with profile information
      const incidentsWithProfiles = (incidentsData || []).map(incident => {
        const responsableProfile = incident.responsable 
          ? profilesData?.find(profile => profile.id === incident.responsable)
          : null;
        
        return {
          ...incident,
          responsable_profile: responsableProfile
        };
      });

      setIncidents(incidentsWithProfiles);
      setProfiles(profilesData || []);
      setTeams(teamsData || []);
      setDebugInfo({
        incidentsCount: incidentsData?.length || 0,
        profilesCount: profilesData?.length || 0,
        teamsCount: teamsData?.length || 0
      });

    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los datos');
      setDebugInfo({ 
        catchError: err instanceof Error ? err.message : 'Error desconocido',
        errorType: typeof err
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (incident: Incident) => {
    setSelectedIncident(incident);
    setSelectedResponsable(incident.responsable || '');
    setSelectedTeam(incident.team || '');
    setSelectedEstado(incident.estado);
    setAssignDialogOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedIncident) return;

    try {
      setSaving(true);
      setError(null);

      const updateData: any = {
        estado: selectedEstado
      };

      if (selectedResponsable) {
        updateData.responsable = selectedResponsable;
      } else {
        updateData.responsable = null;
      }

      if (selectedTeam) {
        updateData.team = selectedTeam;
      } else {
        updateData.team = null;
      }

      console.log('Updating incident:', selectedIncident.id, updateData);

      const { data, error } = await supabase
        .from('incidentes')
        .update(updateData)
        .eq('id', selectedIncident.id)
        .select(`
          *,
          responsable_profile:profiles(id, nombre, role, team),
          team_profile:team(id, nombre)
        `);

      if (error) {
        console.error('Error updating incident:', error);
        setError(`Error al asignar incidente: ${error.message}`);
        return;
      }

      console.log('Assignment successful:', data);

      // Update local state
      setIncidents(prev => prev.map(inc => 
        inc.id === selectedIncident.id ? { ...inc, ...updateData } : inc
      ));

      setAssignDialogOpen(false);
      setSelectedIncident(null);
      setSelectedResponsable('');
      setSelectedTeam('');
      setSelectedEstado('');

    } catch (err) {
      console.error('Error:', err);
      setError('Error al asignar incidente');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setAssignDialogOpen(false);
    setSelectedIncident(null);
    setSelectedResponsable('');
    setSelectedTeam('');
    setSelectedEstado('');
  };

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    const matchesEstado = !filterEstado || incident.estado === filterEstado;
    const matchesResponsable = !filterResponsable || incident.responsable === filterResponsable;
    const matchesTeam = !filterTeam || incident.team === filterTeam;
    const matchesSearch = !searchTerm || 
      incident.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.tipo.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesEstado && matchesResponsable && matchesTeam && matchesSearch;
  });

  const getAnalistas = () => {
    return profiles.filter(profile => profile.role === 'Analista');
  };

  const getSeverityColor = (nivel: string) => {
    switch (nivel) {
      case 'Crítico': return 'error';
      case 'Alto': return 'warning';
      case 'Medio': return 'info';
      case 'Bajo': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Nuevo': return 'info';
      case 'En investigacion': return 'warning';
      case 'Contenido': return 'secondary';
      case 'Erradicado': return 'primary';
      case 'Cerrado': return 'success';
      default: return 'default';
    }
  };

  useEffect(() => {
    if (!userLoading && canAssignIncidents) {
      fetchData();
    }
  }, [userLoading, canAssignIncidents]);

  if (userLoading || loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Cargando asignaciones...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!canAssignIncidents) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Box 
              sx={{ 
                mx: 'auto', 
                mb: 3, 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                bgcolor: 'error.light', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <SecurityIcon sx={{ fontSize: 32, color: 'error.main' }} />
            </Box>
            
            <Typography variant="h6" gutterBottom color="text.primary">
              Acceso Restringido
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              No tienes permisos para gestionar asignaciones de incidentes. Solo el Jefe de Seguridad puede acceder a esta funcionalidad.
            </Typography>
            
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, textAlign: 'left' }}>
              <Typography variant="caption" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                Debug Info:
              </Typography>
              <Typography variant="caption" component="div">
                Usuario: {userEmail || 'No disponible'}
              </Typography>
              <Typography variant="caption" component="div">
                Rol actual: "{userRole}" (se requiere "Jefe de seguridad")
              </Typography>
              <Typography variant="caption" component="div">
                ID: {userId || 'No disponible'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Enhanced debug information */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" color="primary">
            Debug Info - Usuario: {userEmail}, Rol: "{userRole}", Incidentes: {filteredIncidents.length}/{incidents.length}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Permisos:</strong> canAssignIncidents: {canAssignIncidents ? 'SÍ' : 'NO'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Analistas disponibles:</strong> {getAnalistas().length}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Equipos disponibles:</strong> {teams.length}
            </Typography>
            {debugInfo && (
              <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.200', borderRadius: 1 }}>
                <Typography variant="caption" component="div">
                  <strong>Debug Details:</strong>
                </Typography>
                <Typography 
                  variant="caption" 
                  component="pre" 
                  sx={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}
                >
                  {JSON.stringify(debugInfo, null, 2)}
                </Typography>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: 2, 
              bgcolor: 'primary.main', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mr: 2 
            }}
          >
            <AssignmentIcon sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h4" component="h1" color="text.primary">
            Asignación de Incidentes
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Gestiona la asignación de responsables y equipos a los incidentes de seguridad
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">
              Filtros
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Buscar incidentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  {estados.map(estado => (
                    <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Responsable</InputLabel>
                <Select
                  value={filterResponsable}
                  onChange={(e) => setFilterResponsable(e.target.value)}
                  label="Responsable"
                >
                  <MenuItem value="">Todos los responsables</MenuItem>
                  <MenuItem value="null">Sin asignar</MenuItem>
                  {getAnalistas().map(analista => (
                    <MenuItem key={analista.id} value={analista.id}>
                      {analista.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Equipo</InputLabel>
                <Select
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  label="Equipo"
                >
                  <MenuItem value="">Todos los equipos</MenuItem>
                  <MenuItem value="null">Sin asignar</MenuItem>
                  {teams.map(team => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {(filterEstado || filterResponsable || filterTeam || searchTerm) && (
            <Box sx={{ mt: 2 }}>
              <Button
                onClick={() => {
                  setFilterEstado('');
                  setFilterResponsable('');
                  setFilterTeam('');
                  setSearchTerm('');
                }}
                size="small"
                color="secondary"
              >
                Limpiar filtros
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Incidents table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" component="h2">
              Incidentes
            </Typography>
            <Chip 
              label={`${filteredIncidents.length} de ${incidents.length} incidentes`}
              color="primary"
              variant="outlined"
            />
          </Box>
          
          {filteredIncidents.length === 0 && !error ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.primary" gutterBottom>
                No hay incidentes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {incidents.length === 0 
                  ? 'No hay incidentes registrados en el sistema.'
                  : 'No hay incidentes que coincidan con los filtros aplicados.'
                }
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Título</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell><strong>Severidad</strong></TableCell>
                    <TableCell><strong>Estado</strong></TableCell>
                    <TableCell><strong>Reportado por</strong></TableCell>
                    <TableCell><strong>Responsable</strong></TableCell>
                    <TableCell><strong>Equipo</strong></TableCell>
                    <TableCell><strong>Fecha</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {incident.titulo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {incident.activo_afectado}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={incident.tipo} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={incident.nivel} 
                          size="small" 
                          color={getSeverityColor(incident.nivel) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={incident.estado} 
                          size="small" 
                          color={getStatusColor(incident.estado) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                            U
                          </Avatar>
                          <Typography variant="caption">
                            Usuario
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {incident.responsable_profile ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                              {incident.responsable_profile.nombre.charAt(0)}
                            </Avatar>
                            <Typography variant="caption">
                              {incident.responsable_profile.nombre}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip label="Sin asignar" size="small" variant="outlined" color="warning" />
                        )}
                      </TableCell>
                      <TableCell>
                        {incident.team_profile ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <GroupIcon sx={{ width: 16, height: 16, mr: 1, color: 'primary.main' }} />
                            <Typography variant="caption">
                              {incident.team_profile.nombre}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip label="Sin equipo" size="small" variant="outlined" color="default" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(incident.created_at).toLocaleDateString('es-ES')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Asignar responsable y equipo">
                          <IconButton
                            onClick={() => handleAssignClick(incident)}
                            size="small"
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
            Asignar Incidente
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedIncident && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedIncident.titulo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {selectedIncident.descripcion}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Estado del Incidente</InputLabel>
                    <Select
                      value={selectedEstado}
                      onChange={(e) => setSelectedEstado(e.target.value)}
                      label="Estado del Incidente"
                    >
                      {estados.map(estado => (
                        <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Asignar Responsable (Analista)</InputLabel>
                    <Select
                      value={selectedResponsable}
                      onChange={(e) => setSelectedResponsable(e.target.value)}
                      label="Asignar Responsable (Analista)"
                    >
                      <MenuItem value="">
                        <em>Sin asignar</em>
                      </MenuItem>
                      {getAnalistas().map(analista => (
                        <MenuItem key={analista.id} value={analista.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1, fontSize: '1rem' }} />
                            {analista.nombre}
                            {analista.team && (
                              <Chip 
                                label={teams.find(t => t.id === analista.team)?.nombre || 'Equipo'} 
                                size="small" 
                                sx={{ ml: 1 }} 
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Asignar Equipo</InputLabel>
                    <Select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      label="Asignar Equipo"
                    >
                      <MenuItem value="">
                        <em>Sin asignar</em>
                      </MenuItem>
                      {teams.map(team => (
                        <MenuItem key={team.id} value={team.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <GroupIcon sx={{ mr: 1, fontSize: '1rem' }} />
                            {team.nombre}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            <CancelIcon sx={{ mr: 1 }} />
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveAssignment} 
            variant="contained" 
            disabled={saving || !selectedEstado}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? 'Guardando...' : 'Guardar Asignación'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IncidentAssignment;
