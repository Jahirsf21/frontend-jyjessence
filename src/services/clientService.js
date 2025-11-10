import api from './api';

/**
 * Servicio para gestión de clientes (solo administradores)
 */
export const clientService = {
  /**
   * Obtener todos los clientes (admin only)
   */
  async getAll() {
    const respuesta = await api.get('/clientes');
    return respuesta.data;
  },

  /**
   * Obtener un cliente por ID (admin only)
   */
  async getById(id) {
    const respuesta = await api.get(`/clientes/${id}`);
    return respuesta.data;
  },

  /**
   * Eliminar un cliente (admin only)
   * Nota: El endpoint puede no existir en backend por ahora
   */
  async delete(id) {
    const respuesta = await api.delete(`/clientes/${id}`);
    return respuesta.data;
  },

  /**
   * Actualizar datos de cliente por administrador (email y role)
   */
  async updateAdmin(id, datos) {
    const respuesta = await api.patch(`/clientes/${id}/admin`, datos);
    return respuesta.data;
  }
};
