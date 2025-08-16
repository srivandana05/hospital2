import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  getProfile: () =>
    api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getDoctors: () =>
    api.get('/users/doctors'),
  
  getUsers: (params?: any) =>
    api.get('/users', { params }),
  
  getUserById: (id: string) =>
    api.get(`/users/${id}`),
  
  updateUser: (id: string, userData: any) =>
    api.put(`/users/${id}`, userData),
  
  deactivateUser: (id: string) =>
    api.delete(`/users/${id}`),
  
  activateUser: (id: string) =>
    api.post(`/users/${id}/activate`),
  
  getUserStats: () =>
    api.get('/users/stats/overview'),
};

// Appointments API
export const appointmentsAPI = {
  bookAppointment: (appointmentData: any) =>
    api.post('/appointments', appointmentData),
  
  getAppointments: () =>
    api.get('/appointments'),
  
  getAppointmentById: (id: string) =>
    api.get(`/appointments/${id}`),
  
  updateAppointmentStatus: (id: string, status: string, notes?: string) =>
    api.put(`/appointments/${id}/status`, { status, notes }),
  
  updateAppointment: (id: string, appointmentData: any) =>
    api.put(`/appointments/${id}`, appointmentData),
  
  cancelAppointment: (id: string) =>
    api.delete(`/appointments/${id}`),
  
  getAppointmentStats: () =>
    api.get('/appointments/stats/overview'),
};

export default api;