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

class EcommerceFacade {
  constructor() {
    this.auth = authService;
    this.products = productService;
    this.cart = cartService;
    this.orders = orderService;
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
      
      const productosEnriquecidos = productos.map(producto => ({
        ...producto,
        disponible: producto.stock > 0,
        precioFormateado: `₡${producto.precio.toFixed(2)}`,
        stockStatus: this._getStockStatus(producto.stock)
      }));

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
      
      return {
        ...producto,
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
   * Agregar producto al carrito con validaciones
   */
  async addToCart(idProducto, cantidad = 1) {
    try {
      const producto = await this.products.getById(idProducto);
      
      if (producto.stock < cantidad) {
        throw new Error(`Solo hay ${producto.stock} unidades disponibles`);
      }

      const resultado = await this.cart.addItem(idProducto, cantidad);

      const carritoActualizado = await this.cart.getCart();

      return {
        success: true,
        message: `${producto.nombre} agregado al carrito`,
        cart: carritoActualizado
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async updateCartItem(idProducto, cantidad) {
    try {
      const producto = await this.products.getById(idProducto);
      
      if (producto.stock < cantidad) {
        throw new Error(`Solo hay ${producto.stock} unidades disponibles`);
      }

      const resultado = await this.cart.updateItem(idProducto, cantidad);
      const carritoActualizado = await this.cart.getCart();

      return {
        success: true,
        cart: carritoActualizado
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  async removeFromCart(idProducto) {
    try {
      await this.cart.removeItem(idProducto);
      const carritoActualizado = await this.cart.getCart();

      return {
        success: true,
        message: 'Producto eliminado del carrito',
        cart: carritoActualizado
      };
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  /**
   * Obtener resumen del carrito
   */
  async getCartSummary() {
    try {
      const carrito = await this.cart.getCart();
      
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
        return suma + (item.producto.precio * item.cantidad);
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
   * Finalizar compra validando stock y perfil (sin pasarela de pago)
   */
  async completePurchase(direccionId) {
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

      // Dirección es obligatoria para el pedido
      if (!direccionId) {
        throw new Error('Debes seleccionar una dirección de envío');
      }

  // Ahora finalizamos el pedido sin pasarela de pago, con dirección
  const pedido = await this.cart.finalize(direccionId);

      return {
        success: true,
        message: 'Pedido realizado exitosamente',
        order: {
          ...pedido.pedido,
          totalFormateado: `₡${(pedido.pedido?.montoTotal || pedido.pedido?.total || 0).toFixed(2)}`
        }
      };
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
}

// Exportar instancia única (Singleton)
export default new EcommerceFacade();
