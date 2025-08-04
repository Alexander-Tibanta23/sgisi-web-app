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
  ManageAccounts as ManageAccountsIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../contexts/UserContext';

interface Profile {
  id: string;
  nombre: string;
  role: string;
  team: string | null;
  team_info?: Team | null;
}

interface Team {
  id: string;
  nombre: string;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const { userRole, loading: userLoading, userId, userEmail } = useUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Filtros
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterTeam, setFilterTeam] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Check if user has permission to manage users
  const canManageUsers = userRole === 'Jefe de seguridad';

  const roles = ['Usuario normal', 'Analista', 'Jefe de seguridad'];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profiles with team information
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          team_info:team!team(id, nombre)
        `)
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

      setProfiles(profilesData || []);
      setTeams(teamsData || []);
      setDebugInfo({
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

  const handleEditClick = (profile: Profile) => {
    setSelectedProfile(profile);
    setSelectedRole(profile.role);
    setSelectedTeam(profile.team || '');
    setEditDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedProfile) return;

    try {
      setSaving(true);
      setError(null);

      const updateData: any = {
        role: selectedRole
      };

      if (selectedTeam) {
        updateData.team = selectedTeam;
      } else {
        updateData.team = null;
      }

      console.log('Updating profile:', selectedProfile.id, updateData);

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', selectedProfile.id)
        .select(`
          *,
          team_info:team!team(id, nombre)
        `);

      if (error) {
        console.error('Error updating profile:', error);
        setError(`Error al actualizar usuario: ${error.message}`);
        return;
      }

      console.log('Update successful:', data);

      // Update local state
      setProfiles(prev => prev.map(profile => 
        profile.id === selectedProfile.id ? { ...profile, ...data[0] } : profile
      ));

      setEditDialogOpen(false);
      setSelectedProfile(null);
      setSelectedRole('');
      setSelectedTeam('');

    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedProfile(null);
    setSelectedRole('');
    setSelectedTeam('');
  };

  // Filter profiles
  const filteredProfiles = profiles.filter(profile => {
    const matchesRole = !filterRole || profile.role === filterRole;
    const matchesTeam = !filterTeam || profile.team === filterTeam;
    const matchesSearch = !searchTerm || 
      profile.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.role.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesRole && matchesTeam && matchesSearch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Jefe de seguridad': return 'error';
      case 'Analista': return 'warning';
      case 'Usuario normal': return 'info';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Jefe de seguridad': return <SecurityIcon sx={{ fontSize: 16 }} />;
      case 'Analista': return <BadgeIcon sx={{ fontSize: 16 }} />;
      case 'Usuario normal': return <PersonIcon sx={{ fontSize: 16 }} />;
      default: return <PersonIcon sx={{ fontSize: 16 }} />;
    }
  };

  useEffect(() => {
    if (!userLoading && canManageUsers) {
      fetchData();
    }
  }, [userLoading, canManageUsers]);

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
            Cargando usuarios...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!canManageUsers) {
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
              No tienes permisos para gestionar usuarios. Solo el Jefe de Seguridad puede acceder a esta funcionalidad.
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
            Debug Info - Usuario: {userEmail}, Rol: "{userRole}", Usuarios: {filteredProfiles.length}/{profiles.length}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Permisos:</strong> canManageUsers: {canManageUsers ? 'SÍ' : 'NO'}
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
            <ManageAccountsIcon sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h4" component="h1" color="text.primary">
            Gestión de Usuarios
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Administra los roles y asignaciones de equipos de los usuarios del sistema
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Rol</InputLabel>
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  label="Rol"
                >
                  <MenuItem value="">Todos los roles</MenuItem>
                  {roles.map(role => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Equipo</InputLabel>
                <Select
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  label="Equipo"
                >
                  <MenuItem value="">Todos los equipos</MenuItem>
                  <MenuItem value="null">Sin equipo</MenuItem>
                  {teams.map(team => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {(filterRole || filterTeam || searchTerm) && (
            <Box sx={{ mt: 2 }}>
              <Button
                onClick={() => {
                  setFilterRole('');
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

      {/* Users table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" component="h2">
              Usuarios del Sistema
            </Typography>
            <Chip 
              label={`${filteredProfiles.length} de ${profiles.length} usuarios`}
              color="primary"
              variant="outlined"
            />
          </Box>
          
          {filteredProfiles.length === 0 && !error ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <ManageAccountsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.primary" gutterBottom>
                No hay usuarios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profiles.length === 0 
                  ? 'No hay usuarios registrados en el sistema.'
                  : 'No hay usuarios que coincidan con los filtros aplicados.'
                }
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Usuario</strong></TableCell>
                    <TableCell><strong>Rol</strong></TableCell>
                    <TableCell><strong>Equipo</strong></TableCell>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProfiles.map((profile) => (
                    <TableRow key={profile.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 2, fontSize: '0.875rem' }}>
                            {profile.nombre?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {profile.nombre || 'Sin nombre'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {profile.id.substring(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={profile.role} 
                          size="small" 
                          color={getRoleColor(profile.role) as any}
                          icon={getRoleIcon(profile.role)}
                        />
                      </TableCell>
                      <TableCell>
                        {profile.team_info ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <GroupIcon sx={{ width: 16, height: 16, mr: 1, color: 'primary.main' }} />
                            <Typography variant="caption">
                              {profile.team_info.nombre}
                            </Typography>
                          </Box>
                        ) : (
                          <Chip label="Sin equipo" size="small" variant="outlined" color="default" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            bgcolor: 'grey.100', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1 
                          }}
                        >
                          {profile.id.substring(0, 12)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Editar usuario">
                          <IconButton
                            onClick={() => handleEditClick(profile)}
                            size="small"
                            color="primary"
                            disabled={profile.id === userId} // Prevent editing own profile
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ManageAccountsIcon sx={{ mr: 1, color: 'primary.main' }} />
            Editar Usuario
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProfile && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 48, height: 48, mr: 2 }}>
                  {selectedProfile.nombre?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedProfile.nombre || 'Usuario sin nombre'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {selectedProfile.id.substring(0, 16)}...
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Rol del Usuario</InputLabel>
                    <Select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      label="Rol del Usuario"
                    >
                      {roles.map(role => (
                        <MenuItem key={role} value={role}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getRoleIcon(role)}
                            <Box sx={{ ml: 1 }}>
                              {role}
                            </Box>
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
                        <em>Sin equipo</em>
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
            onClick={handleSaveChanges} 
            variant="contained" 
            disabled={saving || !selectedRole}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
