import axios from 'axios';

// Configuración base de Axios para SGISI
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sgisi-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('sgisi-token');
      // TODO: Redirigir a login
      window.location.href = '/login';
    }
    
    // Manejar errores de servidor
    if (error.response?.status >= 500) {
      console.error('Error del servidor:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Endpoints específicos para SGISI
export const sgisiAPI = {
  // Autenticación
  auth: {
    login: (credentials: { email: string; password: string }) =>
      api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
    me: () => api.get('/auth/me'),
  },
  
  // Incidentes
  incidents: {
    getAll: (params?: any) => api.get('/incidents', { params }),
    getById: (id: string) => api.get(`/incidents/${id}`),
    create: (data: any) => api.post('/incidents', data),
    update: (id: string, data: any) => api.put(`/incidents/${id}`, data),
    delete: (id: string) => api.delete(`/incidents/${id}`),
    updateStatus: (id: string, status: string) =>
      api.patch(`/incidents/${id}/status`, { status }),
  },
  
  // Evidencias
  evidence: {
    upload: (incidentId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post(`/incidents/${incidentId}/evidence`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    getByIncident: (incidentId: string) =>
      api.get(`/incidents/${incidentId}/evidence`),
    delete: (evidenceId: string) =>
      api.delete(`/evidence/${evidenceId}`),
  },
  
  // Usuarios
  users: {
    getAll: () => api.get('/users'),
    getById: (id: string) => api.get(`/users/${id}`),
    create: (data: any) => api.post('/users', data),
    update: (id: string, data: any) => api.put(`/users/${id}`, data),
    delete: (id: string) => api.delete(`/users/${id}`),
  },
  
  // Dashboard y métricas
  dashboard: {
    getMetrics: () => api.get('/dashboard/metrics'),
    getRecentIncidents: () => api.get('/dashboard/recent-incidents'),
    getCharts: () => api.get('/dashboard/charts'),
  },
  
  // Auditoría
  audit: {
    getLogs: (params?: any) => api.get('/audit/logs', { params }),
    exportLogs: (params?: any) =>
      api.get('/audit/export', { params, responseType: 'blob' }),
  },
};

export default api; 