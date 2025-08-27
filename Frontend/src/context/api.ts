
// // src/services/api.js
// import axios from 'axios';

// // Create axios instance
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('doctorToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token expired or invalid
//       localStorage.removeItem('doctorToken');
//       localStorage.removeItem('doctorData');
//       window.location.href = '/doctor';
//     }
//     return Promise.reject(error);
//   }
// );

// // API endpoints
// export const apiService = {
//  getClinicSettings: async (params) => {
//     const response = await api.get('/clinic-settings', { params });
//     return response.data;
//   },

//   updateClinicSettings: async (settings) => {
//     const response = await api.put('/clinic-settings', settings);
//     return response.data;
//   },

//   resetTokens: async (options = {}) => {
//     const response = await api.post('/dashboard/reset-tokens', options);
//     return response.data;
//   },


//   // Authentication
//   login: async (credentials) => {
//     const response = await api.post('/auth/login', credentials);
//     return response.data;
//   },

//   // Appointments
//   bookAppointment: async (appointmentData) => {
//     const response = await api.post('/appointments/book', appointmentData);
//     return response.data;
//   },

//   checkAppointmentStatus: async (phone) => {
//     const response = await api.get(`/appointments/status/${phone}`);
//     return response.data;
//   },

//   // Dashboard
//   getDashboardStats: async () => {
//     const response = await api.get('/dashboard/stats');
//     return response.data;
//   },

//   resetTokens: async () => {
//     const response = await api.post('/dashboard/reset-tokens');
//     return response.data;
//   },

//   updateAppointmentStatus: async (appointmentId, status) => {
//     const response = await api.put(`/dashboard/appointment/${appointmentId}/status`, {
//       status
//     });
//     return response.data;
//   }
// };

// export default api;


import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BACKEND 

console.log("API_BASE =", API_BASE);
export const apiService = {
  getClinicSettings: async (params: Record<string, unknown>) => {
    const res = await axios.get(`${API_BASE}/clinic/settings`, { params });
    return res.data;
  },

  updateClinicSettings: async (settings: Record<string, unknown>) => {
    const res = await axios.put(`${API_BASE}/clinic/settings`, settings);
    return res.data;
  },

  login: async (credentials: { doctorId: string; password: string }) => {
    const res = await axios.post(`${API_BASE}/login`, credentials);
    return res.data;
  },

  bookAppointment: async (appointmentData: Record<string, unknown>) => {
    const res = await axios.post(`${API_BASE}/appointments`, appointmentData);
    return res.data;
  },

  checkAppointmentStatus: async (phone: string) => {
    const res = await axios.get(`${API_BASE}/appointments/status`, {
      params: { phone }
    });
    return res.data;
  },

  resetTokens: async () => {
    const res = await axios.post(`${API_BASE}/tokens/reset`);
    return res.data;
  },

  updateAppointmentStatus: async (
    appointmentId: string,
    status: string
  ) => {
    const res = await axios.put(`${API_BASE}/appointments/${appointmentId}`, {
      status
    });
    return res.data;
  }
};
