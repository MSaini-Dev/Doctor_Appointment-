
// src/services/api.js
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('doctorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('doctorToken');
      localStorage.removeItem('doctorData');
      window.location.href = '/doctor';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiService = {
 getClinicSettings: async (params) => {
    const response = await api.get('/clinic-settings', { params });
    return response.data;
  },

  updateClinicSettings: async (settings) => {
    const response = await api.put('/clinic-settings', settings);
    return response.data;
  },

  resetTokens: async (options = {}) => {
    const response = await api.post('/dashboard/reset-tokens', options);
    return response.data;
  },


  // Authentication
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Appointments
  bookAppointment: async (appointmentData) => {
    const response = await api.post('/appointments/book', appointmentData);
    return response.data;
  },

  checkAppointmentStatus: async (phone) => {
    const response = await api.get(`/appointments/status/${phone}`);
    return response.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  resetTokens: async () => {
    const response = await api.post('/dashboard/reset-tokens');
    return response.data;
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const response = await api.put(`/dashboard/appointment/${appointmentId}/status`, {
      status
    });
    return response.data;
  }
};

export default api;