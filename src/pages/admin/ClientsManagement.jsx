import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ecommerceFacade from '../../patterns/EcommerceFacade';
import Button from '../../components/ui/Button.jsx';

export default function ClientsManagement() {
  const { t } = useTranslation();
  const [clientes, setClientes] = useState([]);
  const [filtros, setFiltros] = useState({ nombre: '', email: '', cedula: '', rol: '' });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'USER' });
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 10;

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const data = await ecommerceFacade.getAllClients();
      setClientes(data);
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

  const clientesFiltrados = clientes.filter((cliente) => {
    const nombreCompleto = `${cliente.nombre || ''} ${cliente.apellido || ''}`.toLowerCase();
    const correo = (cliente.email || '').toLowerCase();
    const cedula = (cliente.cedula || '').toString();
    const rol = (cliente.role || cliente.rol || '').toLowerCase();

    const nombreMatch = nombreCompleto.includes(filtros.nombre.trim().toLowerCase());
    const emailMatch = correo.includes(filtros.email.trim().toLowerCase());
    const cedulaMatch = cedula.includes(filtros.cedula.trim());
    const rolMatch = rol.includes(filtros.rol.trim().toLowerCase());

    return nombreMatch && emailMatch && cedulaMatch && rolMatch;
  });

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / clientesPorPagina));
  const indiceInicial = (paginaActual - 1) * clientesPorPagina;
  const clientesPagina = clientesFiltrados.slice(indiceInicial, indiceInicial + clientesPorPagina);

  const handlePaginaChange = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const handleViewDetails = async (idCliente) => {
    try {
      const detalles = await ecommerceFacade.getClientDetails(idCliente);
      setClienteSeleccionado(detalles);
      setForm({ email: detalles.email || '', role: detalles.role || 'USER' });
      setMostrarDetalles(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const iniciarEdicion = () => {
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    if (clienteSeleccionado) {
      setForm({ email: clienteSeleccionado.email || '', role: clienteSeleccionado.role || 'USER' });
    }
  };

  const guardarCambios = async () => {
    try {
      const payload = {};
      if (form.email !== clienteSeleccionado.email) payload.email = form.email;
      if (form.role !== clienteSeleccionado.role) payload.role = form.role;
      if (Object.keys(payload).length === 0) {
        setEditando(false);
        return;
      }
      const resp = await ecommerceFacade.updateClient(clienteSeleccionado.idCliente, payload);
      setClienteSeleccionado(resp.client);
      await cargarClientes();
      setEditando(false);
      alert(t('admin.clients.updated'));
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async (idCliente) => {
    if (!confirm(t('admin.clients.deleteConfirm'))) {
      return;
    }

    try {
      await ecommerceFacade.deleteClient(idCliente);
      await cargarClientes();
      alert(t('admin.clients.deleted'));
    } catch (err) {
      alert(err.message);
    }
  };

  const cerrarDetalles = () => {
    setMostrarDetalles(false);
    setClienteSeleccionado(null);
  };

  if (cargando) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('admin.loadingClients')}</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400 text-center py-8 transition-colors duration-200">{t('admin.errorPrefix')}: {error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('admin.clients.title')}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-200">{t('admin.clients.total')}: {clientes.length}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-lg dark:shadow-gray-900/50 p-4 mb-6 transition-colors duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200" htmlFor="filtro-cliente-nombre">
              {t('admin.clients.filter.name')}
            </label>
            <input
              id="filtro-cliente-nombre"
              name="nombre"
              type="text"
              value={filtros.nombre}
              onChange={handleFiltroChange}
              placeholder={t('admin.clients.filter.namePlaceholder')}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200" htmlFor="filtro-cliente-email">
              {t('admin.clients.filter.email')}
            </label>
            <input
              id="filtro-cliente-email"
              name="email"
              type="text"
              value={filtros.email}
              onChange={handleFiltroChange}
              placeholder={t('admin.clients.filter.emailPlaceholder')}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200" htmlFor="filtro-cliente-cedula">
              {t('admin.clients.filter.idCard')}
            </label>
            <input
              id="filtro-cliente-cedula"
              name="cedula"
              type="text"
              value={filtros.cedula}
              onChange={handleFiltroChange}
              placeholder={t('admin.clients.filter.idCardPlaceholder')}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200" htmlFor="filtro-cliente-rol">
              {t('admin.clients.filter.role')}
            </label>
            <input
              id="filtro-cliente-rol"
              name="rol"
              type="text"
              value={filtros.rol}
              onChange={handleFiltroChange}
              placeholder={t('admin.clients.filter.rolePlaceholder')}
              className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {mostrarDetalles && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl dark:shadow-gray-900/50 transition-colors duration-200">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('admin.clients.details')}</h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('admin.clients.fullName')}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('admin.clients.idCard')}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{clienteSeleccionado.cedula}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('admin.clients.email')}</p>
                  {editando ? (
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{clienteSeleccionado.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('admin.clients.phone')}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{clienteSeleccionado.telefono || t('admin.clients.notProvided')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('admin.clients.gender')}</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{clienteSeleccionado.genero}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('admin.clients.role')}</p>
                  {editando ? (
                    <select
                      value={form.role}
                      onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                      className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded text-xs transition-colors duration-200 ${
                        (clienteSeleccionado.role || clienteSeleccionado.rol) === 'ADMIN' 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}>
                        {clienteSeleccionado.role || clienteSeleccionado.rol}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* El modelo no tiene fecha de registro, y la dirección se lista abajo */}

              {clienteSeleccionado.direcciones && clienteSeleccionado.direcciones.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">{t('admin.clients.addresses')}</p>
                  <div className="space-y-2">
                    {clienteSeleccionado.direcciones.map((dir, index) => (
                      <div key={dir.idDireccion || index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600 transition-colors duration-200">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{t('admin.clients.address')} {index + 1}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-200">
                          {dir.provincia}, {dir.canton}, {dir.distrito}
                          {dir.barrio ? `, ${dir.barrio}` : ''}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('admin.clientDirections')}: {dir.senas}</p>
                        {dir.referencia && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('admin.clientReference')}: {dir.referencia}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              {editando ? (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={guardarCambios} className="flex-1" variant="success">{t('common.save')}</Button>
                  <Button onClick={cancelarEdicion} className="flex-1" variant="secondary">{t('common.cancel')}</Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={iniciarEdicion} className="flex-1" variant="primary">{t('common.edit')}</Button>
                  <Button onClick={cerrarDetalles} className="flex-1" variant="secondary">{t('admin.clients.close')}</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Clientes */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 transition-colors duration-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('admin.clients.tableHeaders.name')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('admin.clients.tableHeaders.email')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('admin.clients.tableHeaders.idCard')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('admin.clients.tableHeaders.role')}</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200">{t('admin.clients.tableHeaders.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
            {clientesPagina.map((cliente) => (
              <tr key={cliente.idCliente} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                    {cliente.nombre} {cliente.apellido}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{cliente.genero}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">{cliente.email}</td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">{cliente.cedula}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                    (cliente.role || cliente.rol) === 'ADMIN' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {cliente.role || cliente.rol}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="info" onClick={() => handleViewDetails(cliente.idCliente)}>{t('admin.clients.viewDetails')}</Button>
                    {(cliente.role || cliente.rol) !== 'ADMIN' && (
                      <Button size="sm" variant="danger" onClick={() => handleDelete(cliente.idCliente)}>{t('admin.clients.delete')}</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clientesFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 transition-colors duration-200">
            {t('admin.clients.noClients')}
          </div>
        )}
      </div>

      {clientesFiltrados.length > clientesPorPagina && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            onClick={() => handlePaginaChange(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            {t('pagination.prev', 'Anterior')}
          </button>
          {[...Array(totalPaginas)].map((_, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                paginaActual === idx + 1 
                  ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => handlePaginaChange(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
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
