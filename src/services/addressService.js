import api from './api';

export const addressService = {
  async addAddress(datosDireccion) {
    const respuesta = await api.post('/clientes/direcciones', datosDireccion);
    return respuesta.data;
  },

  async getAddresses() {
    const respuesta = await api.get('/clientes/direcciones');
    return respuesta.data;
  },

  async getAddress(id) {
    const respuesta = await api.get(`/clientes/direcciones/${id}`);
    return respuesta.data;
  },

  async updateAddress(id, datosDireccion) {
    const respuesta = await api.put(`/clientes/direcciones/${id}`, datosDireccion);
    return respuesta.data;
  },

  async deleteAddress(id) {
    const respuesta = await api.delete(`/clientes/direcciones/${id}`);
    return respuesta.data;
  }
};
