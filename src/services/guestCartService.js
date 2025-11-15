class GuestCartService {
  constructor() {
    this.CART_KEY = 'guestCart';
    this.GUEST_INFO_KEY = 'guestInfo';
  }

  // Obtener carrito de invitado del localStorage
  getCart() {
    try {
      const cart = localStorage.getItem(this.CART_KEY);
      return cart ? JSON.parse(cart) : { items: [], total: 0, cantidadItems: 0 };
    } catch (error) {
      console.error('Error getting guest cart:', error);
      return { items: [], total: 0, cantidadItems: 0 };
    }
  }

  // Guardar carrito de invitado en localStorage
  saveCart(cart) {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
      // Emitir evento para actualizar el contador en el header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  }

  // Agregar producto al carrito de invitado
  addItem(productoId, cantidad, producto) {
    try {
      const cart = this.getCart();
      const itemExistente = cart.items.find(item => item.productoId === productoId);
      
      if (itemExistente) {
        itemExistente.cantidad += cantidad;
      } else {
        cart.items.push({
          productoId,
          nombre: producto.nombre,
          cantidad,
          precioUnitario: producto.precio,
          imagen: producto.primaryImage || producto.imagen
        });
      }

      // Recalcular total
      cart.total = cart.items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
      cart.cantidadItems = cart.items.length;

      this.saveCart(cart);
      return cart;
    } catch (error) {
      console.error('Error adding item to guest cart:', error);
      throw error;
    }
  }

  // Actualizar cantidad de un producto
  updateQuantity(productoId, nuevaCantidad) {
    try {
      console.log('Updating guest cart quantity:', { productoId, nuevaCantidad });
      const cart = this.getCart();
      console.log('Current cart:', cart);
      
      const item = cart.items.find(item => item.productoId === productoId);
      
      if (!item) {
        throw new Error('Producto no encontrado en el carrito');
      }

      if (nuevaCantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      item.cantidad = nuevaCantidad;
      cart.total = cart.items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
      cart.cantidadItems = cart.items.length;

      console.log('Updated cart:', cart);
      this.saveCart(cart);
      return cart;
    } catch (error) {
      console.error('Error updating guest cart quantity:', error);
      throw error;
    }
  }

  // Eliminar producto del carrito
  removeItem(productoId) {
    try {
      console.log('Removing item from guest cart:', { productoId });
      const cart = this.getCart();
      console.log('Current cart:', cart);
      
      const index = cart.items.findIndex(item => item.productoId === productoId);
      
      if (index === -1) {
        throw new Error('Producto no encontrado en el carrito');
      }

      cart.items.splice(index, 1);
      cart.total = cart.items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
      cart.cantidadItems = cart.items.length;

      console.log('Updated cart after removal:', cart);
      this.saveCart(cart);
      return cart;
    } catch (error) {
      console.error('Error removing item from guest cart:', error);
      throw error;
    }
  }

  // Limpiar carrito de invitado
  clearCart() {
    try {
      localStorage.removeItem(this.CART_KEY);
      return { items: [], total: 0, cantidadItems: 0 };
    } catch (error) {
      console.error('Error clearing guest cart:', error);
      throw error;
    }
  }

  // Guardar información del invitado
  saveGuestInfo(guestInfo) {
    try {
      localStorage.setItem(this.GUEST_INFO_KEY, JSON.stringify(guestInfo));
    } catch (error) {
      console.error('Error saving guest info:', error);
      throw error;
    }
  }

  // Obtener información del invitado
  getGuestInfo() {
    try {
      const info = localStorage.getItem(this.GUEST_INFO_KEY);
      return info ? JSON.parse(info) : null;
    } catch (error) {
      console.error('Error getting guest info:', error);
      return null;
    }
  }

  // Limpiar información del invitado
  clearGuestInfo() {
    try {
      localStorage.removeItem(this.GUEST_INFO_KEY);
    } catch (error) {
      console.error('Error clearing guest info:', error);
    }
  }

  // Transferir carrito de invitado a usuario autenticado
  transferToUserCart() {
    try {
      const guestCart = this.getCart();
      this.clearCart();
      return guestCart;
    } catch (error) {
      console.error('Error transferring guest cart:', error);
      throw error;
    }
  }
}

export default new GuestCartService();
