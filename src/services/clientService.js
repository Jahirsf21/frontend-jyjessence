import api from './api';


export const clientService = {

  async getAll() {
    const respuesta = await api.get('/clientes');
    return respuesta.data;
  },


  async getById(id) {
    const respuesta = await api.get(`/clientes/${id}`);
    return respuesta.data;
  },


  async delete(id) {
    const respuesta = await api.delete(`/clientes/${id}`);
    return respuesta.data;
  },

  async updateAdmin(id, datos) {
    const respuesta = await api.patch(`/clientes/${id}/admin`, datos);
    return respuesta.data;
  }
};
