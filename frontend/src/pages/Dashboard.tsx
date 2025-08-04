import React, { useState } from 'react';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Button,
  Divider,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GroupIcon from '@mui/icons-material/Group';
import BugReportIcon from '@mui/icons-material/BugReport';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../contexts/UserContext';
import Teams from './Teams';
import IncidentAssignment from './IncidentAssignment';
import UserManagement from './UserManagement';
import DatabaseTester from '../components/DatabaseTester';
import KanbanBoard from '../components/KanbanBoard';
import debugDatabase from '../utils/debugDatabase';

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

const Dashboard: React.FC<{ isDarkMode?: boolean; toggleTheme?: () => void }> = ({ isDarkMode, toggleTheme }) => {
  const { userRole, userId, userEmail, loading: userLoading } = useUser();
  
  // Sidebar navigation
  const [selectedMenu, setSelectedMenu] = useState('kanban');
  
  // Card state for moving between columns
  const [incidentesState, setIncidentesState] = useState<IncidentType[]>([]);

  // Handler for updating incidents from KanbanBoard
  const handleIncidentsUpdate = (updatedIncidents: IncidentType[]) => {
    setIncidentesState(updatedIncidents);
  };

  // Sidebar right width
  const sidebarWidth = 160;

  React.useEffect(() => {
    const fetchIncidentes = async () => {
      if (!userId || !userRole || userLoading) return;
      
      try {
        let query = supabase.from('incidentes').select('*');
        if (userRole === 'Jefe de seguridad') {
          // No filter, get all
        } else if (userRole === 'Analista') {
          query = query.or(`team.eq.${userId},responsable.eq.${userId},dueño.eq.${userId}`);
        } else {
          query = query.eq('dueño', userId);
        }
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching incidents:', error);
        } else {
          setIncidentesState(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching incidents:', error);
      }
    };
    
    fetchIncidentes();
  }, [userRole, userId, userLoading]);

  // Render different components based on selected menu
  const renderMainContent = () => {
    switch (selectedMenu) {
      case 'teams':
        return (
          <Box sx={{ flex: 1, overflow: 'auto', background: '#f5f5f5', p: 3 }}>
            <Teams />
          </Box>
        );
      case 'assignment':
        return (
          <Box sx={{ flex: 1, overflow: 'auto', background: '#f5f5f5', p: 3 }}>
            <IncidentAssignment />
          </Box>
        );
      case 'users':
        return (
          <Box sx={{ flex: 1, overflow: 'auto', background: '#f5f5f5', p: 3 }}>
            <UserManagement />
          </Box>
        );
      case 'debug':
        return (
          <Box sx={{ flex: 1, overflow: 'auto', background: '#f5f5f5', p: 3 }}>
            <DatabaseTester />
          </Box>
        );
      case 'notificaciones':
        return (
          <Box sx={{ p: 4, color: '#f0f6fc' }}>
            <Typography variant="h4">Notificaciones</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Esta sección está en desarrollo.
            </Typography>
          </Box>
        );
      case 'kanban':
      default:
        return (
          <KanbanBoard 
            incidentes={incidentesState} 
            onIncidentsUpdate={handleIncidentsUpdate} 
          />
        );
    }
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex', backgroundColor: 'background.default', overflow: 'hidden' }}>
      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {renderMainContent()}
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
            {userRole === 'Jefe de seguridad' && (
              <ListItem button selected={selectedMenu === 'assignment'} onClick={() => setSelectedMenu('assignment')} sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1, px: 2, gap: 1 }}>
                <ListItemIcon sx={{ minWidth: 0, mr: 1 }}><AssignmentIcon sx={{ color: selectedMenu === 'assignment' ? '#8b5cf6' : '#58a6ff' }} /></ListItemIcon>
                <Typography variant="caption" sx={{ color: '#7d8590', fontWeight: 600 }}>Asignaciones</Typography>
              </ListItem>
            )}
            {userRole === 'Jefe de seguridad' && (
              <ListItem button selected={selectedMenu === 'users'} onClick={() => setSelectedMenu('users')} sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1, px: 2, gap: 1 }}>
                <ListItemIcon sx={{ minWidth: 0, mr: 1 }}><ManageAccountsIcon sx={{ color: selectedMenu === 'users' ? '#f59e0b' : '#58a6ff' }} /></ListItemIcon>
                <Typography variant="caption" sx={{ color: '#7d8590', fontWeight: 600 }}>Usuarios</Typography>
              </ListItem>
            )}
            <ListItem button selected={selectedMenu === 'debug'} onClick={() => setSelectedMenu('debug')} sx={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', py: 1, px: 2, gap: 1 }}>
              <ListItemIcon sx={{ minWidth: 0, mr: 1 }}><BugReportIcon sx={{ color: selectedMenu === 'debug' ? '#ff6b6b' : '#58a6ff' }} /></ListItemIcon>
              <Typography variant="caption" sx={{ color: '#7d8590', fontWeight: 600 }}>Debug</Typography>
            </ListItem>
          </List>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Divider sx={{ width: '60%', mb: 1, background: '#30363d' }} />
        </Box>
        {/* User info and logout at bottom */}
        <Box sx={{ width: '100%', px: 2, pb: 2, mt: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#f0f6fc', fontWeight: 700 }}>
            {userId ? `Usuario: ${userId.substring(0, 8)}...` : 'Usuario no logeado'}
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
