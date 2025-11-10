import api from './api';
import { jwtDecode } from 'jwt-decode';

export const authService = {
  async login(email, contrasena) {
    try {
      const respuesta = await api.post('/clientes/login', { email, contrasena });
      const { token } = respuesta.data;
      
      localStorage.setItem('token', token);
      
      const decodificado = jwtDecode(token);
      const usuario = {
        idCliente: decodificado.idCliente,
        email: decodificado.email,
        role: decodificado.role
      };
      localStorage.setItem('user', JSON.stringify(usuario));
      
      return { token, user: usuario };
    } catch (error) {
      console.error('Error en authService.login:', error);
      // Re-lanzar el error para que AuthContext lo maneje
      throw error;
    }
  },

  async register(datosUsuario) {
    const respuesta = await api.post('/clientes/registro', datosUsuario);
    return respuesta.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const cadenaUsuario = localStorage.getItem('user');
    return cadenaUsuario ? JSON.parse(cadenaUsuario) : null;
  },

  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decodificado = jwtDecode(token);
      const ahora = Date.now() / 1000;
      return decodificado.exp > ahora;
    } catch {
      return false;
    }
  },

  isAdmin() {
    const usuario = this.getCurrentUser();
    return usuario?.role === 'ADMIN';
  },

  async getProfile() {
    const respuesta = await api.get('/clientes/perfil');
    return respuesta.data;
  },

  async updateProfile(datosUsuario) {
    const respuesta = await api.put('/clientes/perfil', datosUsuario);
    return respuesta.data;
  },

  async deleteAccount() {
    const respuesta = await api.delete('/clientes/perfil');
    return respuesta.data;
  },

  async consultarCedula(cedula) {
    const respuesta = await api.get(`/clientes/consulta-cedula/${cedula}`);
    return respuesta.data;
  },

  async addAddress(datosDireccion) {
    const respuesta = await api.post('/clientes/direcciones', datosDireccion);
    return respuesta.data;
  },

  async updateAddress(idDireccion, datosDireccion) {
    const respuesta = await api.put(`/clientes/direcciones/${idDireccion}`, datosDireccion);
    return respuesta.data;
  },

  async deleteAddress(idDireccion) {
    const respuesta = await api.delete(`/clientes/direcciones/${idDireccion}`);
    return respuesta.data;
  }
};
