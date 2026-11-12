import axios from 'axios';

// Base API client connected to our Spring Boot backend
export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Automatically attaches Bearer JWT token if user is logged in
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('syncspace_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: If a 401 is returned (e.g. server restarted or token expired),
// clear the stale session so user can log in cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('syncspace_token');
      localStorage.removeItem('syncspace_user');
      // Redirect to login only if not already on login/register/home
      if (
        window.location.pathname.startsWith('/dashboard')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
