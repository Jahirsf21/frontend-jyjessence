import { useState, useEffect } from 'react';
import ecommerceFacade from '../../patterns/EcommerceFacade';
import Button from '../../components/ui/Button.jsx';

export default function ClientsManagement() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'USER' });

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
      alert('Cliente actualizado');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async (idCliente) => {
    if (!confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await ecommerceFacade.deleteClient(idCliente);
      await cargarClientes();
      alert('Cliente eliminado exitosamente');
    } catch (err) {
      alert(err.message);
    }
  };

  const cerrarDetalles = () => {
    setMostrarDetalles(false);
    setClienteSeleccionado(null);
  };

  if (cargando) {
    return <div className="text-center py-8">Cargando clientes...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
        <p className="text-sm text-gray-600 mt-1">Total de clientes: {clientes.length}</p>
      </div>

      {/* Modal de Detalles */}
      {mostrarDetalles && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">Detalles del Cliente</h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre completo</p>
                  <p className="font-medium">{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cédula</p>
                  <p className="font-medium">{clienteSeleccionado.cedula}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  {editando ? (
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      className="mt-1 w-full border rounded px-2 py-1"
                    />
                  ) : (
                    <p className="font-medium">{clienteSeleccionado.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{clienteSeleccionado.telefono || 'No proporcionado'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Género</p>
                  <p className="font-medium">{clienteSeleccionado.genero}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rol</p>
                  {editando ? (
                    <select
                      value={form.role}
                      onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                      className="mt-1 w-full border rounded px-2 py-1"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded text-xs ${
                        (clienteSeleccionado.role || clienteSeleccionado.rol) === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
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
                  <p className="text-sm text-gray-600 mb-2">Direcciones de envío</p>
                  <div className="space-y-2">
                    {clienteSeleccionado.direcciones.map((dir, index) => (
                      <div key={dir.idDireccion || index} className="p-3 bg-gray-50 rounded border">
                        <p className="text-sm font-medium">{`Dirección ${index + 1}`}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {dir.provincia}, {dir.canton}, {dir.distrito}
                          {dir.barrio ? `, ${dir.barrio}` : ''}
                        </p>
                        <p className="text-xs text-gray-600">Señas: {dir.senas}</p>
                        {dir.referencia && (
                          <p className="text-xs text-gray-600">Ref: {dir.referencia}</p>
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
                  <Button onClick={guardarCambios} className="flex-1" variant="success">Guardar</Button>
                  <Button onClick={cancelarEdicion} className="flex-1" variant="secondary">Cancelar</Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={iniciarEdicion} className="flex-1" variant="primary">Editar</Button>
                  <Button onClick={cerrarDetalles} className="flex-1" variant="secondary">Cerrar</Button>
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
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cédula</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rol</th>
              {/* Sin fecha de registro en el modelo */}
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clientes.map((cliente) => (
              <tr key={cliente.idCliente} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {cliente.nombre} {cliente.apellido}
                  </div>
                  <div className="text-sm text-gray-500">{cliente.genero}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{cliente.email}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{cliente.cedula}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${
                    (cliente.role || cliente.rol) === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {cliente.role || cliente.rol}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="info" onClick={() => handleViewDetails(cliente.idCliente)}>Ver detalles</Button>
                    {(cliente.role || cliente.rol) !== 'ADMIN' && (
                      <Button size="sm" variant="danger" onClick={() => handleDelete(cliente.idCliente)}>Eliminar</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clientes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay clientes registrados.
          </div>
        )}
      </div>
    </div>
  );
}
