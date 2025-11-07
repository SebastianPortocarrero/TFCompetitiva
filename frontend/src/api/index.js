import axios from 'axios';

// Base URL configurable - use environment variable or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
};

// Sospechosos API
export const sospechosos = {
  getAll: (page = 1, limit = 10) => api.get(`/sospechosos?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/sospechosos/${id}`),
  create: (sospechosoData) => api.post('/sospechosos', sospechosoData),
  update: (id, sospechosoData) => api.put(`/sospechosos/${id}`, sospechosoData),
  delete: (id) => api.delete(`/sospechosos/${id}`),
  uploadCsv: (file) => {
    const formData = new FormData();
    formData.append('csv', file);
    return api.post('/sospechosos/carga-masiva', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Busquedas API
export const busquedas = {
  execute: (searchData) => api.post('/busquedas/ejecutar', searchData),
  getHistory: (page = 1, limit = 10) => api.get(`/busquedas/historial?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/busquedas/${id}`),
};

// Reportes API
export const reportes = {
  getStats: () => api.get('/estadisticas'),
  getReport: (reportData) => api.post('/reportes', reportData),
};

export default api;