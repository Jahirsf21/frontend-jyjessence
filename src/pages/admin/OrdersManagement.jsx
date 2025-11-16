import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ecommerceFacade from '../../patterns/EcommerceFacade';
import Button from '../../components/ui/Button.jsx';

export default function OrdersManagement() {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState([]);
  const [filtros, setFiltros] = useState({ id: '', cliente: '', fecha: '', estado: '', total: '', items: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 10;

  const estados = [t('admin.orders.status.pending'), t('admin.orders.status.processing'), t('admin.orders.status.shipped'), t('admin.orders.status.delivered'), t('admin.orders.status.cancelled')];

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const data = await ecommerceFacade.getAllOrders();
      setPedidos(data);
      setPaginaActual(1);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaActual(1);
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const idMatch = String(pedido.idPedido || '').toLowerCase().includes(filtros.id.trim().toLowerCase());
    const clienteCadena = `${pedido.cliente?.nombre || ''} ${pedido.cliente?.apellido || ''} ${pedido.cliente?.email || ''}`.toLowerCase();
    const clienteMatch = clienteCadena.includes(filtros.cliente.trim().toLowerCase());
    const fechaMatch = (pedido.fechaFormateada || '').toLowerCase().includes(filtros.fecha.trim().toLowerCase());
    const estadoMatch = (pedido.estado || '').toLowerCase().includes(filtros.estado.trim().toLowerCase());
    const totalMatch = (pedido.totalFormateado || '').toLowerCase().includes(filtros.total.trim().toLowerCase());
    const itemsMatch = String(pedido.itemCount ?? '').toLowerCase().includes(filtros.items.trim().toLowerCase());

    return idMatch && clienteMatch && fechaMatch && estadoMatch && totalMatch && itemsMatch;
  });

  const totalPaginas = Math.max(1, Math.ceil(pedidosFiltrados.length / pedidosPorPagina));
  const indiceInicial = (paginaActual - 1) * pedidosPorPagina;
  const pedidosPagina = pedidosFiltrados.slice(indiceInicial, indiceInicial + pedidosPorPagina);

  const handlePaginaChange = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const handleViewDetails = async (idPedido) => {
    try {
      const detalles = await ecommerceFacade.getOrderDetails(idPedido);
      setPedidoSeleccionado(detalles);
      setMostrarDetalles(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (idPedido, nuevoEstado) => {
    try {
      await ecommerceFacade.updateOrderStatus(idPedido, nuevoEstado);
      await cargarPedidos();
      if (mostrarDetalles && pedidoSeleccionado?.idPedido === idPedido) {
        const detallesActualizados = await ecommerceFacade.getOrderDetails(idPedido);
        setPedidoSeleccionado(detallesActualizados);
      }
      alert(t('admin.orders.statusUpdated'));
    } catch (err) {
      alert(err.message);
    }
  };

  const cerrarDetalles = () => {
    setMostrarDetalles(false);
    setPedidoSeleccionado(null);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      [t('admin.orders.status.pending')]: 'bg-yellow-100 text-yellow-800',
      [t('admin.orders.status.processing')]: 'bg-blue-100 text-blue-800',
      [t('admin.orders.status.shipped')]: 'bg-indigo-100 text-indigo-800',
      [t('admin.orders.status.delivered')]: 'bg-green-100 text-green-800',
      [t('admin.orders.status.cancelled')]: 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  if (cargando) {
    return <div className="text-center py-8">{t('admin.loadingOrders')}</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{t('admin.errorPrefix')}: {error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('admin.orders.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('admin.orders.total')}: {pedidos.length}</p>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filtro-pedido-id">
              {t('admin.orders.filter.id')}
            </label>
            <input
              id="filtro-pedido-id"
              name="id"
              type="text"
              value={filtros.id}
              onChange={handleFiltroChange}
              placeholder={t('admin.orders.filter.idPlaceholder')}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filtro-pedido-cliente">
              {t('admin.orders.filter.client')}
            </label>
            <input
              id="filtro-pedido-cliente"
              name="cliente"
              type="text"
              value={filtros.cliente}
              onChange={handleFiltroChange}
              placeholder={t('admin.orders.filter.clientPlaceholder')}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filtro-pedido-fecha">
              {t('admin.orders.filter.date')}
            </label>
            <input
              id="filtro-pedido-fecha"
              name="fecha"
              type="text"
              value={filtros.fecha}
              onChange={handleFiltroChange}
              placeholder={t('admin.orders.filter.datePlaceholder')}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filtro-pedido-estado">
              {t('admin.orders.filter.status')}
            </label>
            <input
              id="filtro-pedido-estado"
              name="estado"
              type="text"
              value={filtros.estado}
              onChange={handleFiltroChange}
              placeholder={t('admin.orders.filter.statusPlaceholder')}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filtro-pedido-total">
              {t('admin.orders.filter.total')}
            </label>
            <input
              id="filtro-pedido-total"
              name="total"
              type="text"
              value={filtros.total}
              onChange={handleFiltroChange}
              placeholder={t('admin.orders.filter.totalPlaceholder')}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filtro-pedido-items">
              {t('admin.orders.filter.items')}
            </label>
            <input
              id="filtro-pedido-items"
              name="items"
              type="text"
              value={filtros.items}
              onChange={handleFiltroChange}
              placeholder={t('admin.orders.filter.itemsPlaceholder')}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {mostrarDetalles && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">{t('admin.orders.details')} #{pedidoSeleccionado.idPedido}</h3>

            <div className="space-y-4">
              {/* Info General */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-600">{t('admin.orders.date')}</p>
                  <p className="font-medium">{pedidoSeleccionado.fechaFormateada}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('admin.orders.status')}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${getEstadoColor(pedidoSeleccionado.estado)}`}>
                      {pedidoSeleccionado.estado}
                    </span>
                    <select
                      value={pedidoSeleccionado.estado}
                      onChange={(e) => handleUpdateStatus(pedidoSeleccionado.idPedido, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Cliente */}
              <div>
                <p className="text-sm text-gray-600 mb-2">{t('admin.orders.client')}</p>
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="font-medium">{pedidoSeleccionado.cliente?.nombre} {pedidoSeleccionado.cliente?.apellido}</p>
                  <p className="text-sm text-gray-600">{pedidoSeleccionado.cliente?.email}</p>
                  {pedidoSeleccionado.cliente?.cedula && (
                    <p className="text-sm text-gray-600">{t('admin.orders.idCard')}: {pedidoSeleccionado.cliente?.cedula}</p>
                  )}
                  {pedidoSeleccionado.cliente?.telefono && (
                    <p className="text-sm text-gray-600">{t('admin.orders.phone')}: {pedidoSeleccionado.cliente?.telefono}</p>
                  )}
                </div>
              </div>

              {/* Dirección de envío */}
              {pedidoSeleccionado.direccion && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">{t('admin.orders.shippingAddress')}</p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="font-medium">{t('admin.orders.selectedAddress')}</p>
                    <p className="text-sm text-gray-600">
                      {pedidoSeleccionado.direccion.provincia}, {pedidoSeleccionado.direccion.canton}, {pedidoSeleccionado.direccion.distrito}{pedidoSeleccionado.direccion.barrio ? `, ${pedidoSeleccionado.direccion.barrio}` : ''}
                    </p>
                    <p className="text-sm text-gray-600">{t('admin.clientDirections')}: {pedidoSeleccionado.direccion.senas}</p>
                    {pedidoSeleccionado.direccion.referencia && (
                      <p className="text-sm text-gray-600">{t('admin.clientReference')}: {pedidoSeleccionado.direccion.referencia}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Artículos */}
              <div>
                <p className="text-sm text-gray-600 mb-2">{t('admin.orders.items')} ({pedidoSeleccionado.articulos?.length || 0})</p>
                <div className="space-y-2">
                  {(pedidoSeleccionado.articulos || []).map((articulo, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                      <div>
                        <p className="font-medium">{articulo.producto?.nombre || `Producto #${articulo.productoId}`}</p>
                        <p className="text-sm text-gray-600">
                          {articulo.cantidad} × ₡{articulo.precioUnitario.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">₡{(articulo.precioUnitario * articulo.cantidad).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold">{t('admin.orders.total')}</p>
                  <p className="text-2xl font-bold text-indigo-600">₡{(pedidoSeleccionado.montoTotal ?? 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={cerrarDetalles}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t('admin.orders.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Pedidos */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.orders.tableHeaders.id')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.orders.tableHeaders.client')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.orders.tableHeaders.date')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.orders.tableHeaders.status')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.orders.tableHeaders.total')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.orders.tableHeaders.items')}</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t('admin.orders.tableHeaders.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pedidosPagina.map((pedido) => (
              <tr key={pedido.idPedido} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  #{pedido.idPedido}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {pedido.cliente?.nombre} {pedido.cliente?.apellido}
                  </div>
                  <div className="text-xs text-gray-500">{pedido.cliente?.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {pedido.fechaFormateada}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${getEstadoColor(pedido.estado)}`}>
                    {pedido.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {pedido.totalFormateado}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {pedido.itemCount} {t('admin.orders.article')}{pedido.itemCount !== 1 ? 's' : ''}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="info" onClick={() => handleViewDetails(pedido.idPedido)}>{t('admin.orders.viewDetails')}</Button>
                    <select
                      value={pedido.estado}
                      onChange={(e) => handleUpdateStatus(pedido.idPedido, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pedidosFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t('admin.orders.noOrders')}
          </div>
        )}
      </div>

      {pedidosFiltrados.length > pedidosPorPagina && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            onClick={() => handlePaginaChange(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            {t('pagination.prev', 'Anterior')}
          </button>
          {[...Array(totalPaginas)].map((_, idx) => (
            <button
              key={idx}
              className={`px-3 py-1 rounded ${paginaActual === idx + 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => handlePaginaChange(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            onClick={() => handlePaginaChange(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            {t('pagination.next', 'Siguiente')}
          </button>
        </div>
      )}
    </div>
  );
}
