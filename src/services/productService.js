import api from './api';

export const productService = {
  async getAll(parametros = {}) {
    const respuesta = await api.get('/productos', { params: parametros });
    return respuesta.data;
  },

  async getById(id) {
    const respuesta = await api.get(`/productos/${id}`);
    return respuesta.data;
  },

  async create(datosProducto) {
    const respuesta = await api.post('/productos', datosProducto);
    return respuesta.data;
  },

  async update(id, datosProducto) {
    const respuesta = await api.put(`/productos/${id}`, datosProducto);
    return respuesta.data;
  },

  async delete(id) {
    const respuesta = await api.delete(`/productos/${id}`);
    return respuesta.data;
  },

  async search(consulta) {
    const respuesta = await api.get('/productos/buscar', { 
      params: { q: consulta } 
    });
    return respuesta.data;
  },

  async getByCategory(categoria) {
    const respuesta = await api.get('/productos', { 
      params: { categoria } 
    });
    return respuesta.data;
  },

  async getByGender(genero) {
    const respuesta = await api.get('/productos', { 
      params: { genero } 
    });
    return respuesta.data;
  },

  async clone(id, modificaciones = {}) {
    const respuesta = await api.post(`/productos/${id}/clonar`, modificaciones);
    return respuesta.data;
  },

  async updateStock(id, stock) {
    const respuesta = await api.patch(`/productos/${id}/stock`, { stock });
    return respuesta.data;
  }
};
