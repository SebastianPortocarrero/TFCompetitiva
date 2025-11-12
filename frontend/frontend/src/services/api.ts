import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base URL del API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Cliente Axios configurado
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor de peticiones - Agregar token JWT automáticamente
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas - Manejo de errores global
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Si el token expiró o es inválido, limpiar localStorage y redirigir a login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Solo redirigir si no estamos ya en login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Extraer mensaje de error del backend
    const errorMessage =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Error desconocido';

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
