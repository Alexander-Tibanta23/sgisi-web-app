import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../contexts/UserContext';

interface Team {
  id: string;
  created_at: string;
  nombre: string;
}

const Teams: React.FC = () => {
  const { userRole, loading: userLoading, userId, userEmail } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Check if user has permission to manage teams
  const canManageTeams = userRole === 'Jefe de seguridad';

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching teams with user:', { userId, userRole, userEmail });
      
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Teams fetch result:', { data, error });

      if (error) {
        console.error('Error fetching teams:', error);
        setError(`Error al cargar los equipos: ${error.message}`);
        setDebugInfo({
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint
        });
      } else {
        setTeams(data || []);
        setDebugInfo({ teamsCount: data?.length || 0 });
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los equipos');
      setDebugInfo({ 
        catchError: err instanceof Error ? err.message : 'Error desconocido',
        errorType: typeof err
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      setError('El nombre del equipo es requerido');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      console.log('Creating team with user:', { userId, userRole });
      
      const { data, error } = await supabase
        .from('team')
        .insert([{ nombre: newTeamName.trim() }])
        .select();

      console.log('Team creation result:', { data, error });

      if (error) {
        console.error('Error creating team:', error);
        setError(`Error al crear el equipo: ${error.message}`);
      } else {
        setTeams([data[0], ...teams]);
        setNewTeamName('');
        setError(null);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al crear el equipo');
    } finally {
      setIsCreating(false);
    }
  };

  const updateTeam = async (teamId: string) => {
    if (!editName.trim()) {
      setError('El nombre del equipo es requerido');
      return;
    }

    try {
      const { error } = await supabase
        .from('team')
        .update({ nombre: editName.trim() })
        .eq('id', teamId);

      if (error) {
        console.error('Error updating team:', error);
        setError('Error al actualizar el equipo');
      } else {
        setTeams(teams.map(team => 
          team.id === teamId ? { ...team, nombre: editName.trim() } : team
        ));
        setEditingTeam(null);
        setEditName('');
        setError(null);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar el equipo');
    }
  };

  const startEdit = (team: Team) => {
    setEditingTeam(team);
    setEditName(team.nombre);
  };

  const cancelEdit = () => {
    setEditingTeam(null);
    setEditName('');
  };

  useEffect(() => {
    if (!userLoading) {
      fetchTeams();
    }
  }, [userLoading]);

  // Enhanced debugging information
  useEffect(() => {
    console.log('Teams Page Debug Info:', {
      userLoading,
      userRole,
      userId,
      userEmail,
      canManageTeams,
      teamsLength: teams.length,
      error,
      debugInfo
    });
  }, [userLoading, userRole, userId, userEmail, canManageTeams, teams.length, error, debugInfo]);

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
            Cargando equipos...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Enhanced debug information */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" color="primary">
            Debug Info - Usuario: {userEmail}, Rol: "{userRole}", Equipos: {teams.length}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Permisos:</strong> canManageTeams: {canManageTeams ? 'SÍ' : 'NO'}
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

      {/* Access control check */}
      {!canManageTeams ? (
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
                <WarningIcon sx={{ fontSize: 32, color: 'error.main' }} />
              </Box>
              
              <Typography variant="h6" gutterBottom color="text.primary">
                Acceso Restringido
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                No tienes permisos para gestionar equipos. Solo el Jefe de Seguridad puede acceder a esta funcionalidad.
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
      ) : (
        <>
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
                <PeopleIcon sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h4" component="h1" color="text.primary">
                Gestión de Equipos
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Administra los equipos de seguridad de la organización
            </Typography>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                debugInfo && (
                  <Accordion sx={{ mt: 1 }}>
                    <AccordionSummary>
                      <Typography variant="caption">Detalles técnicos</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography 
                        variant="caption" 
                        component="pre" 
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {JSON.stringify(debugInfo, null, 2)}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                )
              }
            >
              {error}
            </Alert>
          )}

          {/* Create new team section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: 2, 
                    bgcolor: 'success.light', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mr: 2 
                  }}
                >
                  <AddIcon sx={{ color: 'success.main' }} />
                </Box>
                <Typography variant="h6" component="h2">
                  Crear Nuevo Equipo
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Nombre del equipo"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createTeam()}
                  variant="outlined"
                  size="medium"
                />
                <Button
                  onClick={createTeam}
                  disabled={isCreating || !newTeamName.trim()}
                  variant="contained"
                  startIcon={isCreating ? <CircularProgress size={16} /> : <AddIcon />}
                  sx={{ minWidth: 140 }}
                >
                  {isCreating ? 'Creando...' : 'Crear Equipo'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Teams list */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" component="h2">
                  Equipos Registrados
                </Typography>
                <Chip 
                  label={`${teams.length} ${teams.length === 1 ? 'equipo' : 'equipos'}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              {teams.length === 0 && !error ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    No hay equipos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comienza creando tu primer equipo de seguridad.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {teams.map((team, index) => (
                    <Box key={team.id}>
                      <Box sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ flex: 1 }}>
                            {editingTeam?.id === team.id ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <TextField
                                  fullWidth
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && updateTeam(team.id)}
                                  autoFocus
                                  variant="outlined"
                                  size="small"
                                />
                                <IconButton
                                  onClick={() => updateTeam(team.id)}
                                  color="success"
                                  size="small"
                                >
                                  <SaveIcon />
                                </IconButton>
                                <IconButton
                                  onClick={cancelEdit}
                                  color="default"
                                  size="small"
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box 
                                  sx={{ 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: 2, 
                                    bgcolor: 'primary.light', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    mr: 2 
                                  }}
                                >
                                  <PeopleIcon sx={{ color: 'primary.main' }} />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1" component="h3">
                                    {team.nombre}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Creado el {new Date(team.created_at).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Box>
                          
                          {editingTeam?.id !== team.id && (
                            <Button
                              onClick={() => startEdit(team)}
                              variant="outlined"
                              startIcon={<EditIcon />}
                              size="small"
                            >
                              Editar
                            </Button>
                          )}
                        </Box>
                      </Box>
                      {index < teams.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default Teams;
