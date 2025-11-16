import { useState, useEffect, useMemo } from 'react';
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
  const [paginaActual, setPaginaActual] = useState(1);
  const pedidosPorPagina = 10;
  const [vistaDetalle, setVistaDetalle] = useState(false);

  const estados = useMemo(() => ([
    { value: 'pending', label: t('admin.orders.status.pending', 'Pendiente') },
    { value: 'processing', label: t('admin.orders.status.processing', 'Procesando') },
    { value: 'shipped', label: t('admin.orders.status.shipped', 'Enviado') },
    { value: 'delivered', label: t('admin.orders.status.delivered', 'Entregado') },
    { value: 'cancelled', label: t('admin.orders.status.cancelled', 'Cancelado') }
  ]), [t]);

  const normalizeEstadoValue = (estado) => {
    if (!estado) return estados[0]?.value ?? 'pending';

    const raw = typeof estado === 'string' ? estado : '';
    const lower = raw.toLowerCase();

    const byValue = estados.find(opt => opt.value === raw || opt.value === lower);
    if (byValue) return byValue.value;

    const byLabel = estados.find(opt => opt.label?.toLowerCase() === lower);
    if (byLabel) return byLabel.value;

    const byKey = estados.find(opt => raw.includes(opt.value));
    if (byKey) return byKey.value;

    return raw;
  };

  const getEstadoLabel = (estado) => {
    const normalized = normalizeEstadoValue(estado);
    const option = estados.find(opt => opt.value === normalized);
    if (option) return option.label;
    return estado || t('admin.orders.status.unknown', 'Desconocido');
  };

  const getEstadoColor = (estado) => {
    const value = normalizeEstadoValue(estado);
    const colores = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colores[value] || 'bg-gray-100 text-gray-800';
  };

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
    const estadoTexto = getEstadoLabel(pedido.estado).toLowerCase();
    const estadoMatch = estadoTexto.includes(filtros.estado.trim().toLowerCase());
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
      setVistaDetalle(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (idPedido, nuevoEstado) => {
    try {
      const estadoNormalizado = normalizeEstadoValue(nuevoEstado);
      await ecommerceFacade.updateOrderStatus(idPedido, estadoNormalizado);
      await cargarPedidos();
      if (pedidoSeleccionado?.idPedido === idPedido) {
        const detallesActualizados = await ecommerceFacade.getOrderDetails(idPedido);
        setPedidoSeleccionado(detallesActualizados);
      }
      alert(t('admin.orders.statusUpdated'));
    } catch (err) {
      alert(err.message);
    }
  };

  const cerrarDetalles = () => {
    setVistaDetalle(false);
    setPedidoSeleccionado(null);
  };

  if (cargando) {
    return <div className="text-center py-8">{t('admin.loadingOrders')}</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{t('admin.errorPrefix')}: {error}</div>;
  }

  const renderListaPedidos = () => (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('admin.orders.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('admin.orders.total')}: {pedidos.length}</p>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'id', label: t('admin.orders.filter.id'), placeholder: t('admin.orders.filter.idPlaceholder') },
            { name: 'cliente', label: t('admin.orders.filter.client'), placeholder: t('admin.orders.filter.clientPlaceholder') },
            { name: 'fecha', label: t('admin.orders.filter.date'), placeholder: t('admin.orders.filter.datePlaceholder') },
            { name: 'estado', label: t('admin.orders.filter.status'), placeholder: t('admin.orders.filter.statusPlaceholder') },
            { name: 'total', label: t('admin.orders.filter.total'), placeholder: t('admin.orders.filter.totalPlaceholder') },
            { name: 'items', label: t('admin.orders.filter.items'), placeholder: t('admin.orders.filter.itemsPlaceholder') }
          ].map((campo) => (
            <div key={campo.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`filtro-${campo.name}`}>
                {campo.label}
              </label>
              <input
                id={`filtro-${campo.name}`}
                name={campo.name}
                type="text"
                value={filtros[campo.name]}
                onChange={handleFiltroChange}
                placeholder={campo.placeholder}
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          ))}
        </div>
      </div>

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
                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{pedido.idPedido}</td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{pedido.cliente?.nombre} {pedido.cliente?.apellido}</div>
                  <div className="text-xs text-gray-500">{pedido.cliente?.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{pedido.fechaFormateada}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${getEstadoColor(pedido.estado)}`}>
                    {getEstadoLabel(pedido.estado)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{pedido.totalFormateado}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {pedido.itemCount} {t('admin.orders.article')}{pedido.itemCount !== 1 ? 's' : ''}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="info" onClick={() => handleViewDetails(pedido.idPedido)}>{t('admin.orders.viewDetails')}</Button>
                    <select
                      value={normalizeEstadoValue(pedido.estado)}
                      onChange={(e) => handleUpdateStatus(pedido.idPedido, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      {estados.map(estado => (
                        <option key={estado.value} value={estado.value}>{estado.label}</option>
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
    </>
  );

  const renderDetallePedido = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={cerrarDetalles}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ← {t('admin.orders.backToList', 'Volver a la lista')}
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            {t('admin.orders.details')} #{pedidoSeleccionado?.idPedido}
          </h2>
        </div>
        <Button variant="secondary" onClick={cerrarDetalles}>
          {t('admin.orders.close')}
        </Button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
            <div>
              <p className="text-sm text-gray-600">{t('admin.orders.date')}</p>
              <p className="font-semibold text-gray-900 text-lg">{pedidoSeleccionado?.fechaFormateada || ''}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('admin.orders.status')}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`px-2 py-1 text-xs rounded ${getEstadoColor(pedidoSeleccionado?.estado)}`}>
                  {getEstadoLabel(pedidoSeleccionado?.estado)}
                </span>
                <select
                  value={normalizeEstadoValue(pedidoSeleccionado?.estado)}
                  onChange={(e) => handleUpdateStatus(pedidoSeleccionado.idPedido, e.target.value)}
                  className="text-sm border border-gray-300 rounded px-3 py-2"
                >
                  {estados.map(estado => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">{t('admin.orders.client')}</p>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="font-semibold text-gray-900">{pedidoSeleccionado?.cliente?.nombre} {pedidoSeleccionado?.cliente?.apellido}</p>
              <p className="text-sm text-gray-600">{pedidoSeleccionado?.cliente?.email}</p>
              {pedidoSeleccionado?.cliente?.cedula && (
                <p className="text-sm text-gray-500">{t('admin.orders.idCard')}: {pedidoSeleccionado?.cliente?.cedula}</p>
              )}
              {pedidoSeleccionado?.cliente?.telefono && (
                <p className="text-sm text-gray-500">{t('admin.orders.phone')}: {pedidoSeleccionado?.cliente?.telefono}</p>
              )}
            </div>
          </div>

          {pedidoSeleccionado?.direccion && (
            <div>
              <p className="text-sm text-gray-600 mb-2">{t('admin.orders.shippingAddress')}</p>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="font-semibold text-gray-800">{t('admin.orders.selectedAddress')}</p>
                <p className="text-sm text-gray-600">
                  {pedidoSeleccionado.direccion.provincia}, {pedidoSeleccionado.direccion.canton}, {pedidoSeleccionado.direccion.distrito}{pedidoSeleccionado.direccion.barrio ? `, ${pedidoSeleccionado.direccion.barrio}` : ''}
                </p>
                <p className="text-sm text-gray-500">{t('admin.clientDirections')}: {pedidoSeleccionado.direccion.senas}</p>
                {pedidoSeleccionado.direccion.referencia && (
                  <p className="text-sm text-gray-500">{t('admin.clientReference')}: {pedidoSeleccionado.direccion.referencia}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600 mb-2">{t('admin.orders.items')} ({pedidoSeleccionado?.articulos?.length || 0})</p>
            <div className="space-y-3">
              {(pedidoSeleccionado?.articulos || []).map((articulo, index) => (
                <div key={index} className="flex flex-wrap justify-between items-center p-4 rounded-lg border bg-gray-50">
                  <div>
                    <p className="font-semibold text-gray-900">{articulo.producto?.nombre || `Producto #${articulo.productoId}`}</p>
                    <p className="text-sm text-gray-500">
                      {articulo.cantidad} × ₡{(articulo.precioUnitario ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">₡{((articulo.precioUnitario ?? 0) * (articulo.cantidad ?? 0)).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex flex-wrap justify-between items-center">
              <p className="text-xl font-bold text-gray-900">{t('admin.orders.total')}</p>
              <p className="text-3xl font-extrabold text-indigo-600">{pedidoSeleccionado?.totalFormateado || `₡${(pedidoSeleccionado?.montoTotal ?? 0).toFixed(2)}`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {vistaDetalle ? renderDetallePedido() : renderListaPedidos()}
    </div>
  );
}
