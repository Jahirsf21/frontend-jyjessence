import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (configuracion) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodificado = jwtDecode(token);
        const ahora = Date.now() / 1000;
        
        // Verificar si el token está expirado
        if (decodificado.exp < ahora) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Solo redirigir si estamos en una ruta protegida
          const rutaActual = window.location.pathname;
          if (!rutaActual.includes('/auth/login') && 
              !rutaActual.includes('/auth/register') && 
              rutaActual !== '/') {
            window.location.href = '/auth/login';
          }
          return Promise.reject(new Error('Token expirado'));
        }
        
        configuracion.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error decodificando token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return configuracion;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    // Solo redirigir al login si:
    // 1. El error es 401 (no autorizado)
    // 2. No estamos ya en las rutas de autenticación
    // 3. El backend respondió (no es un error de red)
    if (error.response?.status === 401) {
      const rutaActual = window.location.pathname;
      
      if (!rutaActual.includes('/auth/login') && !rutaActual.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    // Si es un error de red (sin response), no redirigir
    // El componente manejará el error
    return Promise.reject(error);
  }
);

export default api;
