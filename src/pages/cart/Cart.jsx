import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import Ecommerce from '../../patterns/EcommerceFacade';

const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { estaAutenticado } = useAuth();
  const [carrito, setCarrito] = useState({ items: [], total: 0, cantidadItems: 0 });
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Cart component mounted, estaAutenticado:', estaAutenticado);
    if (estaAutenticado) {
      cargarCarrito();
      cargarDirecciones();
    } else {
      setLoading(false);
      setError(t('cart.authRequired'));
    }
  }, [estaAutenticado]);

  const cargarCarrito = async () => {
    try {
      setError(null);
      const data = await Ecommerce.getCartSummary();
      console.log('Datos del carrito recibidos:', data);
      
      // Asegurar que data tiene la estructura correcta
      if (data && typeof data === 'object') {
        setCarrito({
          items: data.items || [],
          total: data.total || 0,
          cantidadItems: data.cantidadItems || (data.items ? data.items.length : 0)
        });
      } else {
        setCarrito({ items: [], total: 0, cantidadItems: 0 });
      }
    } catch (error) {
  console.error('Error al cargar carrito:', error);
  setError(error.response?.data?.error || t('cart.loadError'));
      
      // Si es error 401, redirigir al login
      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'warning',
          title: t('cart.sessionExpiredTitle'),
          text: t('cart.sessionExpiredText'),
        }).then(() => {
          navigate('/auth/login');
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const cargarDirecciones = async () => {
    try {
      const data = await Ecommerce.getAddresses();
      setDirecciones(data || []);
      if (data && data.length === 1) {
        setDireccionSeleccionada(data[0].idDireccion);
      }
    } catch (e) {
      console.error('Error al cargar direcciones:', e);
    }
  };

  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    try {
      await Ecommerce.updateCartItem(productoId, nuevaCantidad);
      await cargarCarrito();
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: error.response?.data?.error || t('cart.updateQuantityError'),
      });
    }
  };

  const eliminarProducto = async (productoId, nombreProducto) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: t('cart.removeConfirmTitle'),
      text: t('cart.removeConfirmText', { nombre: nombreProducto }),
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
    });

    if (result.isConfirmed) {
      try {
        await Ecommerce.removeFromCart(productoId);
        await cargarCarrito();
        Swal.fire({
          icon: 'success',
          title: t('cart.removedTitle'),
          text: t('cart.removedText'),
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        Swal.fire({
          icon: 'error',
          title: t('error'),
          text: error.response?.data?.error || t('cart.removeError'),
        });
      }
    }
  };

  // Finalizar pedido sin pasarela
  const finalizarPedido = async () => {
    try {
      if (!direccionSeleccionada) {
        return Swal.fire({
          icon: 'warning',
          title: t('error'),
          text: t('cart.addressRequired')
        });
      }
  await Ecommerce.completePurchase(direccionSeleccionada);
      Swal.fire({
        icon: 'success',
        title: t('cart.finalizedTitle'),
        text: t('cart.finalizedText'),
        timer: 2500,
        showConfirmButton: false,
      });
      navigate('/orders');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: error.response?.data?.error || t('cart.finalizeError'),
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.loadErrorTitle')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={cargarCarrito}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t('cart.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('cart.title')}</h1>
          <p className="text-gray-600">
            {carrito.cantidadItems > 0 
              ? t('cart.itemCount', { count: carrito.cantidadItems })
              : t('cart.emptyTitle')}
          </p>
        </div>

        {carrito.items.length === 0 ? (
          // Carrito Vacío
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('cart.emptyTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('cart.emptySubtitle')}</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('cart.viewProducts')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Productos */}
            <div className="lg:col-span-2 space-y-4">
              {carrito.items.map((item) => (
                <div key={item.productoId} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-4">
                    {/* Imagen */}
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-12 h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>

                    {/* Información */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.nombre}</h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {t('cart.unitPrice')}: ₡{item.precioUnitario.toFixed(2)}
                      </p>

                      {/* Controles de Cantidad */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition-colors"
                            disabled={item.cantidad <= 1}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-4 py-2 font-medium">{item.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                            className="px-3 py-2 hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        <button
                          onClick={() => eliminarProducto(item.productoId, item.nombre)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">{t('cart.subtotal')}</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₡{(item.cantidad * item.precioUnitario).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('cart.summaryTitle')}</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('cart.subtotal')}</span>
                    <span>₡{carrito.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('cart.shipping')}</span>
                    <span className="text-green-600">{t('cart.shippingFree')}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>{t('cart.total')}</span>
                    <span className="text-blue-600">₡{carrito.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Selección de Dirección */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('cart.selectAddress')}
                  </label>
                  {direcciones.length === 0 && (
                    <p className="text-sm text-gray-500 mb-2">{t('address.noAddresses')}</p>
                  )}
                  {direcciones.length > 0 && (
                    <select
                      value={direccionSeleccionada}
                      onChange={(e) => setDireccionSeleccionada(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">--</option>
                      {direcciones.map(dir => (
                        <option key={dir.idDireccion} value={dir.idDireccion}>
                          {dir.provincia}, {dir.canton}, {dir.distrito} {dir.barrio ? `- ${dir.barrio}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  onClick={finalizarPedido}
                  disabled={!direccionSeleccionada}
                  className={`w-full px-6 py-3 rounded-lg font-medium mb-3 transition-colors ${
                    direccionSeleccionada
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('cart.finalizeButton')}
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {t('cart.keepBuying')}
                </button>

                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {t('cart.securePlaceholderRemoved')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
