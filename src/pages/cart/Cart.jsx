import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import Ecommerce from '../../patterns/EcommerceFacade';
import { cartService } from '../../services/cartService';
import guestCartService from '../../services/guestCartService';
import AddressForm from '../../components/AddressForm';

const Cart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { estaAutenticado } = useAuth();
  const [carrito, setCarrito] = useState({ items: [], total: 0, cantidadItems: 0 });
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    email: '',
    nombre: '',
    telefono: '',
    direccion: {
      provincia: '',
      canton: '',
      distrito: '',
      barrio: '',
      senas: '',
      codigoPostal: '',
      referencia: ''
    }
  });
  const [showGuestForm, setShowGuestForm] = useState(false);

  useEffect(() => {
    cargarCarrito();
    if (estaAutenticado) {
      setIsGuest(false);
      cargarDirecciones();
    } else {
      setIsGuest(true);
    }
  }, [estaAutenticado]);

  const cargarCarrito = async () => {
    try {
      setError(null);
      setLoading(true);
      
      let data;
      if (estaAutenticado) {
        data = await Ecommerce.getCartSummary();
      } else {
        data = guestCartService.getCart();
      }
      

      const itemsConImagenYPrecio = await Promise.all((data.items || []).map(async (item) => {
        let imagen = item.imagen;
        let precioUnitario = item.precioUnitario;
        if (!imagen || !precioUnitario) {
          try {
            const producto = await Ecommerce.getProductDetails(item.productoId);
            if (!imagen) imagen = producto.primaryImage;
            if (!precioUnitario) precioUnitario = producto.precio;
          } catch {}
        }
        return { ...item, imagen, precioUnitario };
      }));
      

      const total = itemsConImagenYPrecio.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
      setCarrito({
        items: itemsConImagenYPrecio,
        total,
        cantidadItems: data.cantidadItems || itemsConImagenYPrecio.length
      });
    } catch (error) {
      setError(error.response?.data?.error || t('cart.loadError'));

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
    let data = [];
    let errorPrincipal = null;

    try {
      data = await Ecommerce.getAddresses();
    } catch (err) {
      errorPrincipal = err;
      console.error('Error directo al obtener direcciones:', err);
    }

    if ((!data || data.length === 0) && estaAutenticado) {
      try {
        const perfil = await Ecommerce.auth.getProfile();
        data = perfil?.direcciones || [];
      } catch (perfilError) {
        console.error('Error al obtener direcciones desde el perfil:', perfilError);
        if (!errorPrincipal) {
          errorPrincipal = perfilError;
        }
      }
    }

    if (errorPrincipal && (!data || data.length === 0)) {
      console.warn('No se pudieron cargar direcciones. Se mantiene lista vacía.');
    }

    setDirecciones(data || []);
    if (data && data.length > 0) {
      setDireccionSeleccionada(String(data[0].idDireccion ?? ''));
    } else {
      setDireccionSeleccionada(null);
    }
  };

  const handleGuestAddressChange = (nuevaDireccion) => {
    setGuestInfo(prev => ({
      ...prev,
      direccion: nuevaDireccion
    }));
  };

  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    try {
      if (estaAutenticado) {
        await Ecommerce.updateCartItem(productoId, nuevaCantidad);
      } else {
        guestCartService.updateQuantity(productoId, nuevaCantidad);
      }
      await cargarCarrito();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: error.message || error.response?.data?.error || t('cart.updateQuantityError'),
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
        if (estaAutenticado) {
          await Ecommerce.removeFromCart(productoId);
        } else {
          guestCartService.removeItem(productoId);
        }
        await cargarCarrito();
        Swal.fire({
          icon: 'success',
          title: t('cart.removedTitle'),
          text: t('cart.removedText'),
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Error removing item:', error);
        Swal.fire({
          icon: 'error',
          title: t('error'),
          text: error.message || error.response?.data?.error || t('cart.removeError'),
        });
      }
    }
  };

  const finalizarPedido = async () => {
    try {
      if (estaAutenticado) {
        if (!direccionSeleccionada) {
          return Swal.fire({
            icon: 'warning',
            title: t('error'),
            text: t('cart.addressRequired')
          });
        }
        const direccionIdPayload = /^\d+$/.test(direccionSeleccionada)
          ? Number(direccionSeleccionada)
          : direccionSeleccionada;
        await Ecommerce.completePurchase(direccionIdPayload);
        await cartService.clearCart();
      } else {
        const { email, nombre, telefono, direccion } = guestInfo;
        
        if (!email || !nombre || !telefono) {
          return Swal.fire({
            icon: 'warning',
            title: t('error'),
            text: t('cart.guestInfoRequired')
          });
        }
        
        if (!direccion.provincia || !direccion.canton || !direccion.distrito || !direccion.senas) {
          return Swal.fire({
            icon: 'warning',
            title: t('error'),
            text: t('cart.guestAddressRequired')
          });
        }
        await Ecommerce.completePurchase(null, guestInfo);
        guestCartService.clearCart();
        guestCartService.clearGuestInfo();
      }
      
      Swal.fire({
        icon: 'success',
        title: t('cart.finalizedTitle'),
        text: t('cart.finalizedText'),
        timer: 2500,
        showConfirmButton: false,
      });
      
      if (estaAutenticado) {
        navigate('/orders');
      } else {
        navigate('/');
      }
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

  const isGuestFormValid = () => {
    const { email, nombre, direccion } = guestInfo;
    return email && 
           nombre && 
           direccion.provincia && 
           direccion.canton && 
           direccion.distrito && 
           direccion.senas;
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('cart.title')}</h1>
          <p className="text-gray-600">
            {carrito.cantidadItems > 0
              ? `${carrito.cantidadItems} ${t('cart.itemsInCart')}` 
              : t('cart.emptyTitle')}
          </p>
        </div>

        {carrito.items.length === 0 ? (
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
            <div className="lg:col-span-2">
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-3 bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-inner scrollbar-elegant">
                {carrito.items.map((item) => (
                  <div key={item.productoId} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Imagen */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-gray-200">
                        {item.imagen && (
                          <img src={item.imagen} alt={item.nombre} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg" />
                        )}
                        {!item.imagen && (
                          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        )}
                      </div>

                      {/* Información */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 truncate">{item.nombre}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-3">
                          {t('cart.unitPrice')}: ₡{item.precioUnitario.toFixed(2)}
                        </p>

                        {/* Controles de Cantidad */}
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                              className="px-2 sm:px-3 py-2 hover:bg-gray-100 transition-colors"
                              disabled={item.cantidad <= 1}
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-2 sm:px-4 py-2 text-sm sm:font-medium">{item.cantidad}</span>
                            <button
                              onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                              className="px-2 sm:px-3 py-2 hover:bg-gray-100 transition-colors"
                            >
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          <button
                            onClick={() => eliminarProducto(item.productoId, item.nombre)}
                            className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-left sm:text-right flex-shrink-0 mt-3 sm:mt-0">
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">{t('cart.subtotal')}</p>
                        <p className="text-lg sm:text-2xl font-bold text-blue-600 whitespace-nowrap">
                          ₡{(item.cantidad * item.precioUnitario).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

                {/* Selección de Dirección o Información de Invitado */}
                <div className="mb-6">
                  {estaAutenticado ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('cart.selectAddress')}
                      </label>
                      {direcciones.length === 0 && (
                        <p className="text-sm text-gray-500 mb-2">{t('address.noAddresses')}</p>
                      )}
                      {direcciones.length > 0 && (
                        <select
                          value={direccionSeleccionada ?? ''}
                          onChange={(e) => setDireccionSeleccionada(e.target.value || null)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">--</option>
                          {direcciones.map(dir => (
                            <option key={dir.idDireccion} value={String(dir.idDireccion)}>
                              {dir.provincia}, {dir.canton}, {dir.distrito} {dir.barrio ? `- ${dir.barrio}` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-800 font-medium mb-2">
                          {t('cart.guestCheckout')}
                        </p>
                        <p className="text-sm text-blue-600">
                          {t('cart.guestInstructions')}
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('cart.guestEmail')}
                          </label>
                          <input
                            type="email"
                            value={guestInfo.email}
                            onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('cart.guestEmailPlaceholder')}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('cart.guestName')}
                          </label>
                          <input
                            type="text"
                            value={guestInfo.nombre}
                            onChange={(e) => setGuestInfo({...guestInfo, nombre: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('cart.guestNamePlaceholder')}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('cart.guestPhone')}
                          </label>
                          <input
                            type="tel"
                            value={guestInfo.telefono}
                            onChange={(e) => setGuestInfo({...guestInfo, telefono: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('cart.guestPhonePlaceholder')}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('cart.guestAddress')} *
                          </label>
                          <AddressForm 
                            onAddressChange={handleGuestAddressChange}
                            initialData={guestInfo.direccion}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs text-gray-600">
                          {t('cart.guestLoginPrompt')} <button 
                            onClick={() => navigate('/auth/login')} 
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {t('cart.guestLoginLink')}
                          </button> {t('cart.guestLoginText')}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={finalizarPedido}
                  disabled={estaAutenticado ? !direccionSeleccionada : !isGuestFormValid()}
                  className={`w-full px-6 py-3 rounded-lg font-medium mb-3 transition-colors ${
                    (estaAutenticado ? direccionSeleccionada : isGuestFormValid())
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
