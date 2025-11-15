/**
 * PATRÓN FACHADA (FACADE)
 * 
 * Proporciona una interfaz unificada y simplificada para un conjunto de interfaces
 * más complejas en el subsistema de e-commerce.
 * 
 * La fachada coordina múltiples servicios (auth, products, cart, orders) para
 * ejecutar operaciones de negocio complejas de forma simple.
 * 
 * Ventajas:
 * - Simplifica operaciones complejas
 * - Reduce acoplamiento entre componentes y servicios
 * - Centraliza lógica de negocio
 * - Facilita testing
 */

import { authService } from '../services/authService';
import { productService } from '../services/productService';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { addressService } from '../services/addressService';
import { imageService } from '../services/imageService';
import { clientService } from '../services/clientService';
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

  // ==========================================
  // == OPERACIONES DE AUTENTICACIÓN
  // ==========================================

  /**
   * Consultar datos de cédula costarricense usando API real del backend
   */
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
      // Preservar la respuesta completa del error para que Register.jsx pueda acceder al código
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

  /**
   * Logout con limpieza de caché
   */
  async logoutUser() {
    this.auth.logout();
    // Limpiar cualquier caché local si es necesario
    return { success: true };
  }

  // ==========================================
  // == OPERACIONES DE CATÁLOGO
  // ==========================================

  /**
   * Obtener catálogo con filtros aplicados
   */
  async getCatalog(filtros = {}) {
    try {
      const productos = await this.products.getAll(filtros);
      // Normalizar y sanitizar posibles URLs con comillas/espacios y formatos variados
      const sanitizeUrl = (u) => typeof u === 'string' ? u.trim().replace(/^['"]+|['"]+$/g, '') : u;
      const normalizeImagenes = (raw) => {
        try {
          if (Array.isArray(raw)) {
            return raw.map(sanitizeUrl).filter(Boolean);
          }
          if (typeof raw === 'string') {
            const s = raw.trim();
            if (!s) return [];
            // Si viene como JSON en string
            if (s.startsWith('[') && s.endsWith(']')) {
              const arr = JSON.parse(s);
              return Array.isArray(arr) ? arr.map(sanitizeUrl).filter(Boolean) : [];
            }
            // Caso: una sola URL en string
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

  // ==========================================
  // == OPERACIONES DE CARRITO
  // ==========================================

  /**
   * Agregar producto al carrito con validaciones (soporta invitados)
   */
  async addToCart(idProducto, cantidad = 1) {
    try {
      const producto = await this.products.getById(idProducto);
      
      if (producto.stock < cantidad) {
        throw new Error(`Solo hay ${producto.stock} unidades disponibles`);
      }

      // Verificar si el usuario está autenticado
      const isAuthenticated = this.auth.isAuthenticated();
      
      if (isAuthenticated) {
        // Usuario autenticado - usar carrito normal
        const resultado = await this.cart.addItem(idProducto, cantidad);
        const carritoActualizado = await this.cart.getCart();
        
        return {
          success: true,
          message: `${producto.nombre} agregado al carrito`,
          cart: carritoActualizado
        };
      } else {
        // Usuario invitado - usar localStorage
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
      // Emitir evento para actualizar el contador del carrito en el header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }

  async updateCartItem(idProducto, cantidad) {
    try {
      const producto = await this.products.getById(idProducto);
      if (producto.stock < cantidad) {
        throw new Error(`Solo hay ${producto.stock} unidades disponibles`);
      }
      
      // Verificar si el usuario está autenticado
      const isAuthenticated = this.auth.isAuthenticated();
      
      if (isAuthenticated) {
        // Usuario autenticado - usar carrito normal
        const resultado = await this.cart.updateQuantity(idProducto, cantidad);
        const carritoActualizado = await this.cart.getCart();
        return {
          success: true,
          cart: carritoActualizado
        };
      } else {
        // Usuario invitado - usar localStorage
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
      // Verificar si el usuario está autenticado
      const isAuthenticated = this.auth.isAuthenticated();
      
      if (isAuthenticated) {
        // Usuario autenticado - usar carrito normal
        await this.cart.removeItem(idProducto);
        const carritoActualizado = await this.cart.getCart();
        
        return {
          success: true,
          message: 'Producto eliminado del carrito',
          cart: carritoActualizado
        };
      } else {
        // Usuario invitado - usar localStorage
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

  /**
   * Obtener resumen del carrito (soporta invitados)
   */
  async getCartSummary() {
    try {
      // Verificar si el usuario está autenticado
      const isAuthenticated = this.auth.isAuthenticated();
      
      let carrito;
      if (isAuthenticated) {
        // Usuario autenticado - usar carrito normal
        carrito = await this.cart.getCart();
      } else {
        // Usuario invitado - usar localStorage
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

  // ==========================================
  // == OPERACIONES DE COMPRA
  // ==========================================

  /**
   * Finalizar compra validando stock y perfil (soporta invitados)
   */
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

      // Verificar si el usuario está autenticado
      const isAuthenticated = this.auth.isAuthenticated();
      
      if (isAuthenticated) {
        // Usuario autenticado - usar flujo normal
        if (!direccionId) {
          throw new Error('Debes seleccionar una dirección de envío');
        }

        const pedido = await this.cart.finalize(direccionId);

        return {
          success: true,
          message: 'Pedido realizado exitosamente',
          order: {
            ...pedido.pedido,
            totalFormateado: `₡${(pedido.pedido?.montoTotal || pedido.pedido?.total || 0).toFixed(2)}`
          }
        };
      } else {
        // Usuario invitado - requiere información de invitado
        if (!guestInfo || !guestInfo.email || !guestInfo.nombre || !guestInfo.direccion) {
          throw new Error('Para continuar como invitado, debes proporcionar tu email, nombre y dirección');
        }

        // Crear pedido de invitado
        const pedido = await this.cart.finalizeGuestOrder(guestInfo, resumenCarrito.items);

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

  // ==========================================
  // == OPERACIONES DE PEDIDOS
  // ==========================================

  /**
   * Obtener historial de pedidos con detalles formateados
   */
  async getOrderHistory() {
    try {
      const pedidos = await this.orders.getMyOrders();

      // Backend devuelve campos: idPedido, fecha, estado, montoTotal, articulos[]
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
      const pedido = await this.orders.getById(idPedido);

      return {
        ...pedido,
        fechaFormateada: new Date(pedido.fecha).toLocaleDateString('es-CR'),
        totalFormateado: `₡${(pedido.montoTotal ?? 0).toFixed(2)}`,
        articulos: (pedido.articulos || []).map(art => ({
          ...art,
          subtotalFormateado: `₡${(art.precioUnitario * art.cantidad).toFixed(2)}`
        }))
      };
    } catch (error) {
      throw new Error('Pedido no encontrado');
    }
  }

  // ==========================================
  // == OPERACIONES DE DIRECCIONES
  // ==========================================

  /**
   * Agregar una dirección al perfil del usuario
   */
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

  // ==========================================
  // == OPERACIONES DE DIRECCIONES (LISTADO)
  // ==========================================
  async getAddresses() {
    try {
      const direcciones = await addressService.getAddresses();
      return direcciones || [];
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

  // ==========================================
  // == OPERACIONES DE ADMINISTRACIÓN - PRODUCTOS
  // ==========================================

  /**
   * Crear un nuevo producto (admin only)
   */
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

  /**
   * Actualizar un producto existente (admin only)
   */
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

  /**
   * Eliminar un producto (admin only)
   */
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

  /**
   * Clonar un producto (admin only)
   */
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

  /**
   * Actualizar solo el stock de un producto (admin only)
   */
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

  /**
   * Subir imágenes para productos (admin only)
   */
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

  /**
   * Eliminar imágenes de productos (admin only)
   */
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

  // ==========================================
  // == OPERACIONES DE ADMINISTRACIÓN - CLIENTES
  // ==========================================

  /**
   * Obtener todos los clientes (admin only)
   */
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

  /**
   * Obtener detalles de un cliente (admin only)
   */
  async getClientDetails(idCliente) {
    try {
      const cliente = await this.clients.getById(idCliente);
      return cliente;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Cliente no encontrado');
    }
  }

  /**
   * Eliminar un cliente (admin only)
   * Nota: puede no estar implementado en backend
   */
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

  /**
   * Actualizar datos de un cliente (admin only): email y role
   */
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

  // ==========================================
  // == OPERACIONES DE ADMINISTRACIÓN - PEDIDOS
  // ==========================================

  /**
   * Obtener todos los pedidos (admin only)
   */
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

  /**
   * Actualizar estado de un pedido (admin only)
   */
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
}

// Exportar instancia única (Singleton)
export default new EcommerceFacade();
