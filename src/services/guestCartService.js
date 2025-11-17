class GuestCartService {
  constructor() {
    this.CART_KEY = 'guestCart';
    this.GUEST_INFO_KEY = 'guestInfo';
    this.HISTORY_KEY = 'guestCartHistory';
    this.HISTORY_POS_KEY = 'guestCartHistoryPos';
    this.HISTORY_LIMIT = 10;
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
      this._pushSnapshot();
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
      this._pushSnapshot();
      const cart = this.getCart();
      
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
      this._pushSnapshot();
      const cart = this.getCart();
      
      const index = cart.items.findIndex(item => item.productoId === productoId);
      
      if (index === -1) {
        throw new Error('Producto no encontrado en el carrito');
      }

      cart.items.splice(index, 1);
      cart.total = cart.items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
      cart.cantidadItems = cart.items.length;

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
      this._pushSnapshot();
      localStorage.removeItem(this.CART_KEY);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      return { items: [], total: 0, cantidadItems: 0 };
    } catch (error) {
      console.error('Error clearing guest cart:', error);
      throw error;
    }
  }

  // -------------------------
  // Historial / Mementos
  // -------------------------
  _clone(obj) {
    try {
      return structuredClone ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
    } catch (e) {
      return JSON.parse(JSON.stringify(obj));
    }
  }

  _getHistory() {
    try {
      const raw = localStorage.getItem(this.HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  _getHistoryPos() {
    const p = localStorage.getItem(this.HISTORY_POS_KEY);
    return p !== null ? Number(p) : -1;
  }

  _saveHistory(history, pos) {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      localStorage.setItem(this.HISTORY_POS_KEY, String(pos));
    } catch (e) {
      console.error('Error saving guest cart history:', e);
    }
  }

  _pushSnapshot() {
    try {
      const cart = this.getCart();
      const snapshot = { timestamp: new Date().toISOString(), cart: this._clone(cart) };
      const history = this._getHistory();
      let pos = this._getHistoryPos();
      // discard forward history
      const newHist = history.slice(0, pos + 1);
      newHist.push(snapshot);
      if (newHist.length > this.HISTORY_LIMIT) {
        newHist.shift();
      }
      pos = newHist.length - 1;
      this._saveHistory(newHist, pos);
    } catch (e) {
      console.error('Error pushing guest cart snapshot:', e);
    }
  }

  listSnapshots() {
    return this._getHistory();
  }

  canUndo() {
    const pos = this._getHistoryPos();
    return pos > 0;
  }

  canRedo() {
    const history = this._getHistory();
    const pos = this._getHistoryPos();
    return pos < history.length - 1 && pos >= 0;
  }

  undo() {
    try {
      const history = this._getHistory();
      let pos = this._getHistoryPos();
      if (pos <= 0) throw new Error('No hay acciones para deshacer');
      pos = pos - 1;
      const snapshot = history[pos];
      if (!snapshot) throw new Error('Snapshot no encontrado');
      this.saveCart(snapshot.cart);
      this._saveHistory(history, pos);
      return snapshot.cart;
    } catch (e) {
      throw e;
    }
  }

  redo() {
    try {
      const history = this._getHistory();
      let pos = this._getHistoryPos();
      if (pos >= history.length - 1) throw new Error('No hay acciones para rehacer');
      pos = pos + 1;
      const snapshot = history[pos];
      if (!snapshot) throw new Error('Snapshot no encontrado');
      this.saveCart(snapshot.cart);
      this._saveHistory(history, pos);
      return snapshot.cart;
    } catch (e) {
      throw e;
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
