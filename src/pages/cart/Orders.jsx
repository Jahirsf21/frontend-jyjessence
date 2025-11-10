import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EcommerceFacade from '../../patterns/EcommerceFacade';

const Orders = () => {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // todos, pendiente, procesando, enviado, entregado, cancelado

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const data = await EcommerceFacade.getOrderHistory();
      setPedidos(data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtro === 'todos') return true;
    return pedido.estado.toLowerCase() === filtro.toLowerCase();
  });

  const obtenerColorEstado = (estado) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'procesando':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enviado':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('orders.title')}</h1>
          <p className="text-gray-600">
            {pedidos.length > 0 
              ? t('orders.count', { count: pedidos.length })
              : t('orders.none')}
          </p>
        </div>

        {pedidos.length === 0 ? (
          // Sin Pedidos
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('orders.none')}</h2>
            <p className="text-gray-600 mb-6">{t('cart.emptySubtitle')}</p>
          </div>
        ) : (
          <>
            {/* Filtros */}
            <div className="mb-6 flex flex-wrap gap-2">
              {['todos', 'pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltro(estado)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filtro === estado
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {t(`orders.filter.${estado}`)}
                </button>
              ))}
            </div>

            {/* Lista de Pedidos */}
            <div className="space-y-4">
              {pedidosFiltrados.map((pedido) => (
                <div key={pedido.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Header del Pedido */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-600">{t('orders.order', { id: pedido.idPedido || pedido.id })}</p>
                          <p className="text-xs text-gray-500">
                            {pedido.fechaFormateada}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${obtenerColorEstado(pedido.estado)}`}>
                          {t(`orders.filter.${pedido.estado.toLowerCase()}`)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detalles del Pedido */}
                  <div className="p-6">
                    {/* Dirección de Envío */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">📍 {t('orders.shippingAddress')}</h4>
                      <p className="text-sm text-gray-600">
                        {pedido.direccion ? `${pedido.direccion.provincia}, ${pedido.direccion.canton}, ${pedido.direccion.distrito}${pedido.direccion.barrio ? ' - ' + pedido.direccion.barrio : ''}` : t('address.noAddresses')}
                      </p>
                    </div>

                    {/* Información de Pago */}
                    {pedido.montoTotal && (
                      <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">💰 {t('orders.amountTotal')}:</span>
                          <span className="text-lg font-bold text-purple-600">₡{pedido.montoTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Productos del Pedido */}
                    {pedido.detalles && pedido.detalles.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">📦 {t('orders.products')}</h4>
                        <div className="space-y-2">
                          {pedido.detalles.map((detalle, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {detalle.producto?.nombre || `Producto #${detalle.productoId}`}
                                  </p>
                                  <p className="text-xs text-gray-500">{t('orders.quantity')}: {detalle.cantidad}</p>
                                </div>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                ₡{(detalle.precioUnitario * detalle.cantidad).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {pedidosFiltrados.length === 0 && (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-600">{t('orders.emptyFilter', { estado: t(`orders.filter.${filtro}`) })}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
