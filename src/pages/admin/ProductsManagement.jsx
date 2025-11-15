import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ecommerceFacade from '../../patterns/EcommerceFacade';
import Button from '../../components/ui/Button.jsx';

export default function ProductsManagement() {
  const { t } = useTranslation();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [subiendoImagenes, setSubiendoImagenes] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Parfum',
    genero: 'Unisex',
    mililitros: '',
    precio: '',
    stock: '',
    imagenesUrl: [],
    imagenesUrlInput: '' 
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const data = await ecommerceFacade.getCatalog();
      setProductos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUrlInputChange = (e) => {
    const value = e.target.value;
    setFormulario(prev => ({
      ...prev,
      imagenesUrlInput: value,
      imagenesUrl: mergeImageUrls(value, prev.imagenesUrl)
    }));
  };

  function mergeImageUrls(urlInput, uploadedUrls) {
    const urlsFromInput = urlInput
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(Boolean);
    const allUrls = Array.from(new Set([...uploadedUrls, ...urlsFromInput]));
    return allUrls;
  }

  const handleImageUpload = async (e) => {
    const archivos = Array.from(e.target.files);
    if (archivos.length === 0) return;

    for (const archivo of archivos) {
      const validacion = ecommerceFacade.images.validateImage(archivo);
      if (!validacion.isValid) {
        alert(validacion.error);
        return;
      }
    }

    try {
      setSubiendoImagenes(true);
      const resultado = await ecommerceFacade.uploadProductImages(archivos);
      const nuevasUrls = resultado.images.map(img => img.url || img.secure_url || img.url_secure).filter(Boolean);
      setFormulario(prev => ({
        ...prev,
        imagenesUrl: [...prev.imagenesUrl, ...nuevasUrls], 
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setSubiendoImagenes(false);
    }
  };

  const handleRemoveImage = async (url, index) => {
    const publicId = ecommerceFacade.images.extractPublicId(url);
    if (publicId) {
      try {
        await ecommerceFacade.deleteProductImages(publicId);
      } catch (err) {
        console.error('Error al eliminar imagen de Cloudinary:', err);
      }
    }
    setFormulario(prev => {
      const newUrls = prev.imagenesUrl.filter((_, i) => i !== index);
      const urlList = prev.imagenesUrlInput
        .split(/[,\n]+/)
        .map(u => u.trim())
        .filter(Boolean)
        .filter(u => u !== url);
      return {
        ...prev,
        imagenesUrl: newUrls,
        imagenesUrlInput: urlList.join('\n')
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const sanitizeUrl = (u) => typeof u === 'string' ? u.trim().replace(/^['\"]+|['\"]+$/g, '') : u;
      const datosProducto = {
        ...formulario,
        mililitros: parseInt(formulario.mililitros),
        precio: parseFloat(formulario.precio),
        stock: parseInt(formulario.stock),
        imagenesUrl: Array.isArray(formulario.imagenesUrl) ? formulario.imagenesUrl.map(sanitizeUrl).filter(Boolean) : []
      };

      if (productoEditando) {
        await ecommerceFacade.updateProduct(productoEditando.idProducto, datosProducto);
      } else {
        await ecommerceFacade.createProduct(datosProducto);
      }

      await cargarProductos();
      cerrarFormulario();
      alert(productoEditando ? t('admin.products.updated') : t('admin.products.created'));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (producto) => {
    setProductoEditando(producto);
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      genero: producto.genero,
      mililitros: producto.mililitros.toString(),
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
      imagenesUrl: Array.isArray(producto.imagenesUrl) ? producto.imagenesUrl.filter(Boolean) : [],
      imagenesUrlInput: Array.isArray(producto.imagenesUrl) ? producto.imagenesUrl.filter(Boolean).join('\n') : ''
    });
    setMostrarFormulario(true);
  };

  const handleDelete = async (idProducto) => {
    if (!confirm(t('admin.products.deleteConfirm'))) return;

    try {
      await ecommerceFacade.deleteProduct(idProducto);
      await cargarProductos();
      alert(t('admin.products.deleted'));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleClone = async (idProducto) => {
    try {
      await ecommerceFacade.cloneProduct(idProducto);
      await cargarProductos();
      alert(t('admin.products.cloned'));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStockUpdate = async (idProducto, stockActual) => {
    const nuevoStock = prompt(t('admin.products.stockUpdatePrompt'), stockActual);
    if (nuevoStock === null) return;

    const stock = parseInt(nuevoStock);
    if (isNaN(stock) || stock < 0) {
      alert(t('admin.products.invalidStock'));
      return;
    }

    try {
      await ecommerceFacade.updateProductStock(idProducto, stock);
      await cargarProductos();
      alert(t('admin.products.stockUpdated'));
    } catch (err) {
      alert(err.message);
    }
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setProductoEditando(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      categoria: 'Parfum',
      genero: 'Unisex',
      mililitros: '',
      precio: '',
      stock: '',
      imagenesUrl: [],
      imagenesUrlInput: ''
    });
  };

  if (cargando) {
    return <div className="text-center py-8">{t('admin.loadingProducts')}</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{t('admin.errorPrefix')}: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('admin.products.title')}</h2>
        <Button onClick={() => setMostrarFormulario(true)} variant="primary">+ {t('admin.products.newProduct')}</Button>
      </div>

      {/* Formulario Modal */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">
              {productoEditando ? t('admin.products.editProduct') : t('admin.products.newProduct')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('product.name')}
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('product.description')}
                </label>
                <textarea
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('product.category')}
                  </label>
                  <select
                    name="categoria"
                    value={formulario.categoria}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Parfum">Parfum</option>
                    <option value="Elixir">Elixir</option>
                    <option value="Eau de Parfum">Eau de Parfum</option>
                    <option value="Eau de Toilette">Eau de Toilette</option>
                    <option value="Eau Fraiche">Eau Fraiche</option>
                    <option value="Extrait de Parfum">Extrait de Parfum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('product.gender')}
                  </label>
                  <select
                    name="genero"
                    value={formulario.genero}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('product.mililiters')}
                  </label>
                  <input
                    type="number"
                    name="mililitros"
                    value={formulario.mililitros}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('product.price')}
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formulario.precio}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('product.stock')}
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formulario.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('product.images')}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={subiendoImagenes}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                {subiendoImagenes && (
                  <p className="text-sm text-gray-500 mt-1">{t('admin.products.uploadingImages')}</p>
                )}

                <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
                  {t('admin.products.imageUrlsLabel')}
                </label>
                <textarea
                  name="imagenesUrlInput"
                  value={formulario.imagenesUrlInput}
                  onChange={handleImageUrlInputChange}
                  rows="3"
                  placeholder={t('admin.products.imageUrlsPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />

                {formulario.imagenesUrl.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {formulario.imagenesUrl.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(url, index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" variant="primary">{productoEditando ? t('common.update') : t('common.create')} {t('product.product')}</Button>
                <Button type="button" onClick={cerrarFormulario} className="flex-1" variant="secondary">{t('common.cancel')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Productos */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.products.tableHeaders.product')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.products.tableHeaders.category')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.products.tableHeaders.price')}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">{t('admin.products.tableHeaders.stock')}</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">{t('admin.products.tableHeaders.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productos.map((producto) => (
              <tr key={producto.idProducto} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {producto.imagenesUrl?.[0] && (
                      <img
                        src={producto.imagenesUrl[0]}
                        alt={producto.nombre}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{producto.nombre}</div>
                      <div className="text-sm text-gray-500">{producto.mililitros}ml - {producto.genero}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{producto.categoria}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{producto.precioFormateado}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleStockUpdate(producto.idProducto, producto.stock)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {producto.stock} {t('admin.products.units')}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="info" onClick={() => handleEdit(producto)}>{t('admin.products.edit')}</Button>
                    <Button size="sm" variant="success" onClick={() => handleClone(producto.idProducto)}>{t('admin.products.clone')}</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(producto.idProducto)}>{t('admin.products.delete')}</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {productos.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t('products.empty')}
          </div>
        )}
      </div>
    </div>
  );
}
