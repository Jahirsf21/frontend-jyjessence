import api from './api';

export const orderService = {
  async getMyOrders() {
    const respuesta = await api.get('/pedidos/historial');
    return respuesta.data;
  },

  async getById(id) {
    const respuesta = await api.get(`/pedidos/${id}`);
    return respuesta.data;
  },

  async getAllOrders() {
    const respuesta = await api.get('/pedidos');
    return respuesta.data;
  },

  async updateStatus(id, estado) {
    const respuesta = await api.put(`/pedidos/${id}/estado`, { estado });
    return respuesta.data;
  }
};
