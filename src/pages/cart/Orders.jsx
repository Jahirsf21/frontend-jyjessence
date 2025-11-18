import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ecommerceFacade from '../../patterns/EcommerceFacade';

const statusOptions = ['todos', 'pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

const statusMeta = {
  pendiente: { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  procesando: { badge: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  enviado: { badge: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500' },
  entregado: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  cancelado: { badge: 'bg-rose-100 text-rose-800 border-rose-200', dot: 'bg-rose-500' },
  default: { badge: 'bg-gray-100 text-gray-800 border-gray-200', dot: 'bg-gray-400' }
};

const Orders = () => {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const data = await ecommerceFacade.getOrderHistory();
        setPedidos(data);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  const pedidosFiltrados = useMemo(() => (
    pedidos.filter(pedido => (filtro === 'todos' ? true : pedido.estado?.toLowerCase() === filtro))
  ), [pedidos, filtro]);

  const stats = useMemo(() => {
    const base = statusOptions.reduce((acc, estado) => ({ ...acc, [estado]: 0 }), {});
    pedidos.forEach(pedido => {
      const estado = pedido.estado?.toLowerCase();
      if (estado && base[estado] !== undefined) {
        base[estado] += 1;
      }
    });
    base.todos = pedidos.length;
    return base;
  }, [pedidos]);

  const formatCurrency = valor => `₡${Number(valor || 0).toLocaleString('es-CR', { minimumFractionDigits: 2 })}`;

  const renderEmptyState = () => (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-12 text-center border border-gray-100">
      <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
        <svg className="h-10 w-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('orders.none')}</h2>
      <p className="text-gray-500 max-w-md mx-auto">{t('cart.emptySubtitle')}</p>
    </div>
  );

  const renderLoader = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
      <p className="text-sm text-gray-500">{t('common.loading')}</p>
    </div>
  );

  const countText = t('orders.countSimple', { count: pedidos.length });

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-blue-400 font-semibold">{t('orders.sectionLabel', { defaultValue: 'Historial' })}</p>
          <div className="flex flex-wrap items-end gap-4 justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900">{t('orders.title')}</h1>
              <p className="text-gray-500">{countText}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltro('todos')}
                className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                {t('orders.showAll', { defaultValue: 'Ver todos' })}
              </button>
              <button
                onClick={() => setFiltro('pendiente')}
                className="px-4 py-2 text-sm font-semibold text-blue-700 bg-white rounded-full border border-blue-100 hover:border-blue-300 transition-colors"
              >
                {t('orders.resume', { defaultValue: 'Pendientes' })}
              </button>
            </div>
          </div>
        </header>

        {/* Resumen */}
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {statusOptions.filter(estado => estado !== 'todos').map(estado => {
            const meta = statusMeta[estado] || statusMeta.default;
            const isActive = filtro === estado;
            return (
              <button
                key={estado}
                onClick={() => setFiltro(estado)}
                className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${isActive ? 'border-purple-500 bg-white shadow-lg' : 'border-gray-100 bg-white/80'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${meta.badge}`}>
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    {t(`orders.filter.${estado}`)}
                  </span>
                  <span className="text-xs text-gray-400">{t('orders.statusLabel', { defaultValue: 'Estado' })}</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{stats[estado]}</p>
                <p className="text-xs text-gray-500 mt-1">{t('orders.cards', { defaultValue: 'Pedidos' })}</p>
              </button>
            );
          })}
        </section>

        {/* Chips de filtro */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(estado => (
            <button
              key={estado}
              onClick={() => setFiltro(estado)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${filtro === estado
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
            >
              {t(`orders.filter.${estado}`)}
            </button>
          ))}
        </div>

        <section className="space-y-5">
          {loading && renderLoader()}

          {!loading && pedidos.length === 0 && renderEmptyState()}

          {!loading && pedidos.length > 0 && (
            <div className="space-y-6">
              {pedidosFiltrados.length === 0 && (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                  <p className="text-gray-500">{t('orders.emptyFilter', { estado: t(`orders.filter.${filtro}`) })}</p>
                </div>
              )}

              {pedidosFiltrados.map(pedido => {
                const estado = pedido.estado?.toLowerCase();
                const meta = statusMeta[estado] || statusMeta.default;
                // Soporta distintas claves para los artículos dentro del pedido
                const detalles = pedido.detalles || pedido.articulos || pedido.items || pedido.detallesPedido || pedido.detalle || [];
                return (
                  <article key={pedido.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-4 bg-white">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{t('orders.orderLabel', { defaultValue: 'Pedido' })}</p>
                        <p className="text-lg font-semibold text-gray-900">#{pedido.idPedido || pedido.id}</p>
                        <p className="text-sm text-gray-500">{pedido.fechaFormateada}</p>
                      </div>
                      <div className="text-right">
                        {!!pedido.montoTotal && (
                          <p className="text-sm text-gray-400">{t('orders.amountTotal')}</p>
                        )}
                        <p className="text-2xl font-black text-gray-900">{formatCurrency(pedido.montoTotal)}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${meta.badge}`}>
                        {t(`orders.filter.${estado}`)}
                      </span>
                    </div>

                    <div className="px-6 py-5 space-y-6">
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{t('orders.shippingAddress')}</p>
                          <p className="text-sm text-gray-700">
                            {pedido.direccion
                              ? `${pedido.direccion.provincia}, ${pedido.direccion.canton}, ${pedido.direccion.distrito}${pedido.direccion.barrio ? ' - ' + pedido.direccion.barrio : ''}`
                              : t('address.noAddresses')}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-gray-400">{t('orders.statusLabel', { defaultValue: 'Estado' })}</p>
                            <p className="text-lg font-semibold text-gray-800">{t(`orders.filter.${estado}`)}</p>
                          </div>
                          <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-gray-900 font-black ${meta.badge.split(' ')[0]}`}>{stats[estado] || 1}</span>
                        </div>
                      </div>

                      {detalles.length > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">{t('orders.products')}</p>
                          <div className="space-y-3">
                            {detalles.map((detalle, index) => {
                              const imageSrc = detalle.producto?.primaryImage || detalle.producto?.primaryImageUrl || detalle.producto?.imagenesUrl?.[0] || detalle.producto?.imagen || detalle.imagen || detalle.imagenUrl || null;
                              const nombreProducto = detalle.producto?.nombre || detalle.nombre || `Producto #${detalle.productoId || detalle.productoId}`;
                              const precioUnit = (detalle.precioUnitario ?? detalle.precio ?? 0);
                              return (
                                <div key={`${pedido.id}-${index}`} className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-100 bg-white/70">
                                  <div className="flex items-center gap-4">
                                    {imageSrc ? (
                                      <img src={imageSrc} alt={nombreProducto} className="w-12 h-12 rounded-2xl object-cover" />
                                    ) : (
                                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                                        <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 3h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                                        </svg>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">{nombreProducto}</p>
                                      <p className="text-xs text-gray-500">₡{precioUnit.toLocaleString('es-CR')} • {t('orders.quantity')} {detalle.cantidad}</p>
                                    </div>
                                  </div>
                                  <p className="text-base font-bold text-gray-900">{formatCurrency(precioUnit * (detalle.cantidad ?? 0))}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Orders;
