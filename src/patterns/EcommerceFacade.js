import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { imageService } from '../services/imageService';
import { clientService } from '../services/clientService';
import { fetchEnums } from '../services/api';
import guestCartService from '../services/guestCartService';

class EcommerceFacade {
  constructor() {
    this.auth = authService;
    this.products = productService;
    this.cart = cartService;
    this.orders = orderService;
    this.images = imageService;
    this.clients = clientService;
  }

  async consultarCedula(cedula) {
    try {
      const limpia = cedula.replace(/\D/g, '');
      if (limpia.length !== 9) {
        throw new Error('La cédula debe tener exactamente 9 dígitos');
      }

      const datos = await this.auth.consultarCedula(limpia);

      if (!datos) {
        throw new Error('Cédula no encontrada');
      }

      return {
        cedula: datos.cedula || cedula,
        nombre: datos.nombre || '',
        apellidos: datos.apellido || '',
        telefono: datos.telefono || '',
        valida: true,
        ...datos
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Error al consultar cédula');
    }
  }

  async registerUser(datosUsuario) {
    try {
      if (datosUsuario.cedula) {
        const datosCedula = await this.consultarCedula(datosUsuario.cedula);
        if (!datosCedula) {
          throw new Error('Cédula inválida o no encontrada en TSE');
        }
      }

      const usuario = await this.auth.register(datosUsuario);

      return {
        success: true,
        message: 'Usuario registrado exitosamente',
        user: usuario
      };
    } catch (error) {
      const nuevoError = new Error(error.response?.data?.error || error.message || 'Error al registrarse');
      nuevoError.response = error.response;
      throw nuevoError;
    }
  }

  async loginUser(email, password) {
    try {
      const resultado = await this.auth.login(email, password);

      const carrito = await this.cart.getCart();

      return {
        success: true,
        user: resultado.user,
        cart: carrito
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Credenciales inválidas');
    }
  }


  async logoutUser() {
    this.auth.logout();
    return { success: true };
  }

  async getCatalog(filtros = {}) {
    try {
      const productos = await this.products.getAll(filtros);

      const sanitizeUrl = (u) => typeof u === 'string' ? u.trim().replace(/^['"]+|['"]+$/g, '') : u;
      const normalizeImagenes = (raw) => {
        try {
          if (Array.isArray(raw)) {
            return raw.map(sanitizeUrl).filter(Boolean);
          }
          if (typeof raw === 'string') {
            const s = raw.trim();
            if (!s) return [];
            if (s.startsWith('[') && s.endsWith(']')) {
              const arr = JSON.parse(s);
              return Array.isArray(arr) ? arr.map(sanitizeUrl).filter(Boolean) : [];
            }
            return [sanitizeUrl(s)].filter(Boolean);
          }
          return [];
        } catch (_) {
          return [];
        }
      };

      const productosEnriquecidos = productos.map(producto => {
        const imgs = normalizeImagenes(producto.imagenesUrl);
        return {
          ...producto,
          imagenesUrl: imgs,
          primaryImage: imgs[0] || null,
          disponible: producto.stock > 0,
          precioFormateado: `₡${producto.precio.toFixed(2)}`,
          stockStatus: this._getStockStatus(producto.stock)
        };
      });

      return productosEnriquecidos;
    } catch (error) {
      throw new Error('Error al cargar el catálogo');
    }
  }

  async searchProducts(consulta) {
    try {
      if (!consulta || consulta.trim().length < 2) {
        return [];
      }

      const resultados = await this.products.search(consulta);
      return resultados;
    } catch (error) {
      console.error('Error en búsqueda:', error);
      return [];
    }
  }

  async getProductDetails(idProducto) {
    try {
      const producto = await this.products.getById(idProducto);
      const sanitizeUrl = (u) => typeof u === 'string' ? u.trim().replace(/^['"]+|['"]+$/g, '') : u;
      const normalizeImagenes = (raw) => {
        try {
          if (Array.isArray(raw)) {
            return raw.map(sanitizeUrl).filter(Boolean);
          }
          if (typeof raw === 'string') {
            const s = raw.trim();
            if (!s) return [];
            if (s.startsWith('[') && s.endsWith(']')) {
              const arr = JSON.parse(s);
              return Array.isArray(arr) ? arr.map(sanitizeUrl).filter(Boolean) : [];
            }
            return [sanitizeUrl(s)].filter(Boolean);
          }
          return [];
        } catch (_) {
          return [];
        }
      };
      const imgs = normalizeImagenes(producto.imagenesUrl);
      return {
        ...producto,
        imagenesUrl: imgs,
        primaryImage: imgs[0] || null,
        disponible: producto.stock > 0,
        precioFormateado: `₡${producto.precio.toFixed(2)}`,
        stockStatus: this._getStockStatus(producto.stock),
        relatedProducts: await this._getRelatedProducts(producto)
      };
    } catch (error) {
      throw new Error('Producto no encontrado');
    }
  }


  async addToCart(idProducto, cantidad = 1) {
    try {
      const producto = await this.products.getById(idProducto);

      if (producto.stock < cantidad) {
        throw new Error(`Solo hay ${producto.stock} unidades disponibles`);
      }

      const isAuthenticated = this.auth.isAuthenticated();

      if (isAuthenticated) {

        const resultado = await this.cart.addItem(idProducto, cantidad);
        const carritoActualizado = await this.cart.getCart();

        return {
          success: true,
          message: `${producto.nombre} agregado al carrito`,
          cart: carritoActualizado
        };
      } else {

        const carritoActualizado = guestCartService.addItem(idProducto, cantidad, producto);

        return {
          success: true,
          message: `${producto.nombre} agregado al carrito`,
          cart: carritoActualizado
        };
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    } finally {

      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }

  async updateCartItem(idProducto, cantidad) {
    try {
      const producto = await this.products.getById(idProducto);
      if (producto.stock < cantidad) {
        throw new Error(`Solo hay ${producto.stock} unidades disponibles`);
      }


      const isAuthenticated = this.auth.isAuthenticated();

      if (isAuthenticated) {

        const resultado = await this.cart.updateQuantity(idProducto, cantidad);
        const carritoActualizado = await this.cart.getCart();
        return {
          success: true,
          cart: carritoActualizado
        };
      } else {

        const carritoActualizado = guestCartService.updateQuantity(idProducto, cantidad);
        return {
          success: true,
          cart: carritoActualizado
        };
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    } finally {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }

  async removeFromCart(idProducto) {
    try {

      const isAuthenticated = this.auth.isAuthenticated();

      if (isAuthenticated) {

        await this.cart.removeItem(idProducto);
        const carritoActualizado = await this.cart.getCart();

        return {
          success: true,
          message: 'Producto eliminado del carrito',
          cart: carritoActualizado
        };
      } else {

        const carritoActualizado = guestCartService.removeItem(idProducto);
        return {
          success: true,
          message: 'Producto eliminado del carrito',
          cart: carritoActualizado
        };
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    } finally {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }

  async undoCart() {
    try {
      const isAuthenticated = this.auth.isAuthenticated();
      if (isAuthenticated) {
        const resultado = await this.cart.undo();
        const carritoActualizado = await this.cart.getCart();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return {
          success: true,
          cart: carritoActualizado
        };
      } else {
        const cart = await guestCartService.undo();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return { success: true, cart };
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Error al deshacer');
    }
  }

  async redoCart() {
    try {
      const isAuthenticated = this.auth.isAuthenticated();
      if (isAuthenticated) {
        const resultado = await this.cart.redo();
        const carritoActualizado = await this.cart.getCart();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return {
          success: true,
          cart: carritoActualizado
        };
      } else {
        const cart = await guestCartService.redo();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        return { success: true, cart };
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Error al rehacer');
    }
  }


  async getCartSummary() {
    try {

      const isAuthenticated = this.auth.isAuthenticated();

      let carrito;
      if (isAuthenticated) {

        carrito = await this.cart.getCart();
      } else {
        carrito = guestCartService.getCart();
      }

      if (!carrito.items || carrito.items.length === 0) {
        return {
          items: [],
          itemCount: 0,
          subtotal: 0,
          total: 0,
          isEmpty: true
        };
      }

      const subtotal = carrito.items.reduce((suma, item) => {
        const precio = item.precioUnitario || (item.producto && item.producto.precio) || 0;
        return suma + (precio * item.cantidad);
      }, 0);

      return {
        items: carrito.items,
        itemCount: carrito.items.reduce((suma, item) => suma + item.cantidad, 0),
        subtotal: subtotal,
        total: subtotal,
        subtotalFormateado: `₡${subtotal.toFixed(2)}`,
        totalFormateado: `₡${subtotal.toFixed(2)}`,
        isEmpty: false
      };
    } catch (error) {
      console.error('Error getting cart summary:', error);
      return {
        items: [],
        itemCount: 0,
        subtotal: 0,
        total: 0,
        isEmpty: true
      };
    }
  }

  async completePurchase(direccionId, guestInfo = null) {
    try {
      const resumenCarrito = await this.getCartSummary();

      if (resumenCarrito.isEmpty) {
        throw new Error('El carrito está vacío');
      }

      for (const item of resumenCarrito.items) {
        const producto = await this.products.getById(item.productoId);
        if (producto.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para ${producto.nombre}. Solo hay ${producto.stock} unidades disponibles.`
          );
        }
      }
      const isAuthenticated = this.auth.isAuthenticated();

      if (isAuthenticated) {
        if (!direccionId) {
          throw new Error('Debes seleccionar una dirección de envío');
        }

        const pedido = await this.cart.finalize(direccionId);

        window.dispatchEvent(new CustomEvent('cartUpdated'));

        return {
          success: true,
          message: 'Pedido realizado exitosamente',
          order: {
            ...pedido.pedido,
            totalFormateado: `₡${(pedido.pedido?.montoTotal || pedido.pedido?.total || 0).toFixed(2)}`
          }
        };
      } else {
        if (!guestInfo || !guestInfo.email || !guestInfo.nombre || !guestInfo.direccion) {
          throw new Error('Para continuar como invitado, debes proporcionar tu email, nombre y dirección');
        }
        const pedido = await this.cart.finalizeGuestOrder(guestInfo, resumenCarrito.items);

        window.dispatchEvent(new CustomEvent('cartUpdated'));

        return {
          success: true,
          message: 'Pedido realizado exitosamente',
          order: {
            ...pedido.pedido,
            totalFormateado: `₡${(pedido.pedido?.montoTotal || pedido.pedido?.total || 0).toFixed(2)}`
          }
        };
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async getOrderHistory() {
    try {
      const pedidos = await this.orders.getMyOrders();

      return pedidos.map(pedido => ({
        ...pedido,
        fechaFormateada: new Date(pedido.fecha).toLocaleDateString('es-CR'),
        totalFormateado: `₡${(pedido.montoTotal ?? 0).toFixed(2)}`,
        itemCount: pedido.articulos?.length || 0
      }));
    } catch (error) {
      throw new Error('Error al cargar el historial de pedidos');
    }
  }

  async getOrderDetails(idPedido) {
    try {
      const data = await this.orders.getById(idPedido);

      const pedidoBase = data?.pedido || data || {};
      const cliente = data?.cliente || pedidoBase?.cliente || {};
      const articulos = data?.items || pedidoBase?.articulos || [];

      const fecha = pedidoBase.fecha ? new Date(pedidoBase.fecha) : null;
      const montoTotal = pedidoBase.montoTotal ?? 0;

      return {
        ...pedidoBase,
        idPedido: pedidoBase.idPedido || pedidoBase.id,
        cliente,
        articulos: articulos.map(art => ({
          ...art,
          subtotalFormateado: `₡${((art.precioUnitario ?? 0) * (art.cantidad ?? 0)).toFixed(2)}`
        })),
        fechaFormateada: fecha ? fecha.toLocaleDateString('es-CR') : '',
        totalFormateado: `₡${montoTotal.toFixed(2)}`
      };
    } catch (error) {
      throw new Error('Pedido no encontrado');
    }
  }

  async agregarDireccion(datosDireccion) {
    try {
      const response = await this.auth.addAddress(datosDireccion);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al agregar dirección');
    }
  }

  async actualizarDireccion(idDireccion, datosDireccion) {
    try {
      const response = await this.auth.updateAddress(idDireccion, datosDireccion);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al actualizar dirección');
    }
  }

  async eliminarDireccion(idDireccion) {
    try {
      await this.auth.deleteAddress(idDireccion);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al eliminar dirección');
    }
  }

  async getAddresses() {
    try {
      const perfil = await this.auth.getProfile();
      return perfil?.direcciones || [];
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al cargar direcciones');
    }
  }

  _getStockStatus(stock) {
    if (stock === 0) return 'agotado';
    if (stock < 5) return 'pocasUnidades';
    return 'disponible';
  }

  async _getRelatedProducts(producto) {
    try {
      const relacionados = await this.products.getByCategory(producto.categoria);
      return relacionados
        .filter(p => p.idProducto !== producto.idProducto)
        .slice(0, 4);
    } catch (error) {
      return [];
    }
  }

  async createProduct(datosProducto) {
    try {
      const producto = await this.products.create(datosProducto);
      return {
        success: true,
        message: 'Producto creado exitosamente',
        product: producto
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al crear producto');
    }
  }

  async updateProduct(idProducto, datosProducto) {
    try {
      const producto = await this.products.update(idProducto, datosProducto);
      return {
        success: true,
        message: 'Producto actualizado exitosamente',
        product: producto
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al actualizar producto');
    }
  }

  async deleteProduct(idProducto) {
    try {
      await this.products.delete(idProducto);
      return {
        success: true,
        message: 'Producto eliminado exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al eliminar producto');
    }
  }

  async cloneProduct(idProducto, modificaciones = {}) {
    try {
      const producto = await this.products.clone(idProducto, modificaciones);
      return {
        success: true,
        message: 'Producto clonado exitosamente',
        product: producto
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al clonar producto');
    }
  }

  async updateProductStock(idProducto, stock) {
    try {
      const producto = await this.products.updateStock(idProducto, stock);
      return {
        success: true,
        message: 'Stock actualizado exitosamente',
        product: producto
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al actualizar stock');
    }
  }

  async uploadProductImages(archivos) {
    try {
      const resultado = await this.images.uploadImage(archivos);
      return {
        success: true,
        images: Array.isArray(resultado) ? resultado : [resultado]
      };
    } catch (error) {
      throw new Error(error.message || 'Error al subir imágenes');
    }
  }

  async deleteProductImages(publicIds) {
    try {
      await this.images.deleteImage(publicIds);
      return {
        success: true,
        message: 'Imágenes eliminadas exitosamente'
      };
    } catch (error) {
      throw new Error(error.message || 'Error al eliminar imágenes');
    }
  }

  async getAllClients() {
    try {
      const clientes = await this.clients.getAll();
      return clientes.map(cliente => ({
        ...cliente
      }));
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al cargar clientes');
    }
  }

  async getClientDetails(idCliente) {
    try {
      const cliente = await this.clients.getById(idCliente);
      return cliente;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Cliente no encontrado');
    }
  }

  async deleteClient(idCliente) {
    try {
      await this.clients.delete(idCliente);
      return {
        success: true,
        message: 'Cliente eliminado exitosamente'
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al eliminar cliente');
    }
  }

  async updateClient(idCliente, datos) {
    try {
      const actualizado = await this.clients.updateAdmin(idCliente, datos);
      return {
        success: true,
        message: 'Cliente actualizado exitosamente',
        client: actualizado
      };
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Error al actualizar cliente';
      const err = new Error(msg);
      err.response = error.response;
      throw err;
    }
  }

  async getAllOrders() {
    try {
      const pedidos = await this.orders.getAllOrders();
      return pedidos.map(pedido => ({
        ...pedido,
        fechaFormateada: new Date(pedido.fecha).toLocaleDateString('es-CR'),
        totalFormateado: `₡${(pedido.montoTotal ?? 0).toFixed(2)}`,
        itemCount: pedido.articulos?.length || 0
      }));
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al cargar pedidos');
    }
  }

  async updateOrderStatus(idPedido, nuevoEstado) {
    try {
      const pedido = await this.orders.updateStatus(idPedido, nuevoEstado);
      return {
        success: true,
        message: 'Estado del pedido actualizado',
        order: pedido
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error al actualizar estado del pedido');
    }
  }
  async getEnums() {
    try {
      return await fetchEnums();
    } catch (error) {
      console.error('Error fetching enums:', error);
      return {};
    }
  }

  async clearCart() {
    try {
      const isAuthenticated = this.auth.isAuthenticated();
      if (isAuthenticated) {
        await this.cart.clearCart();
      } else {
        guestCartService.clearCart();
      }
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      return { success: true };
    } catch (error) {
      throw new Error('Error al limpiar el carrito');
    }
  }

  async clearGuestData() {
    try {
      guestCartService.clearGuestInfo();
      return { success: true };
    } catch (error) {
      console.error('Error clearing guest info:', error);
    }
  }
}


export default new EcommerceFacade();
