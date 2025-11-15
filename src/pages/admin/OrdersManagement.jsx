import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ecommerceFacade from '../../patterns/EcommerceFacade';
import Button from '../../components/ui/Button.jsx';

export default function OrdersManagement() {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  const estados = [t('admin.orders.status.pending'), t('admin.orders.status.processing'), t('admin.orders.status.shipped'), t('admin.orders.status.delivered'), t('admin.orders.status.cancelled')];

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const data = await ecommerceFacade.getAllOrders();
      setPedidos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
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
            {pedidos.map((pedido) => (
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

        {pedidos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t('admin.orders.noOrders')}
          </div>
        )}
      </div>
    </div>
  );
}
