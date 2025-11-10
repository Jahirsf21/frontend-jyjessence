import api from './api';

export const cartService = {
  async getCart() {
    const respuesta = await api.get('/carrito');
    return respuesta.data;
  },

  async addItem(idProducto, cantidad = 1) {
    const respuesta = await api.post('/carrito/agregar', { 
      productoId: idProducto, 
      cantidad 
    });
    return respuesta.data;
  },

  async updateQuantity(idProducto, cantidad) {
    const respuesta = await api.put('/carrito/modificar', { 
      productoId: idProducto, 
      cantidad 
    });
    return respuesta.data;
  },

  async removeItem(idProducto) {
    const respuesta = await api.delete(`/carrito/eliminar/${idProducto}`);
    return respuesta.data;
  },

  async undo() {
    const respuesta = await api.post('/carrito/deshacer');
    return respuesta.data;
  },

  async redo() {
    const respuesta = await api.post('/carrito/rehacer');
    return respuesta.data;
  },

  async finalize(direccionId) {
    const respuesta = await api.post('/pedidos/finalizar', { direccionId });
    return respuesta.data;
  }
};
