import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import ecommerceFacade from '../../patterns/EcommerceFacade';
import Button from '../../components/ui/Button.jsx';

export default function ProductsManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 10;
  const [filtros, setFiltros] = useState({ nombre: '', categoria: '', precio: '' });
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

    // Filtrar productos según los filtros
    const productosFiltrados = productos.filter(producto => {
      const nombreMatch = producto.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
      const categoriaMatch = filtros.categoria === '' || producto.categoria.toLowerCase().includes(filtros.categoria.toLowerCase());
      const precioMatch = filtros.precio === '' || (producto.precio && producto.precio.toString().includes(filtros.precio));
      return nombreMatch && categoriaMatch && precioMatch;
    });

    // Paginación
    const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
    const indiceInicial = (paginaActual - 1) * productosPorPagina;
    const productosPagina = productosFiltrados.slice(indiceInicial, indiceInicial + productosPorPagina);

    const handleFiltroChange = (e) => {
      const { name, value } = e.target;
      setFiltros(prev => ({ ...prev, [name]: value }));
      setPaginaActual(1); // Resetear a la primera página al filtrar
    };

    const handlePaginaChange = (nuevaPagina) => {
      if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
        setPaginaActual(nuevaPagina);
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


  const handleEdit = (producto) => {
    navigate(`/admin/products/edit/${producto.idProducto}`);
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


  if (cargando) {
    return <div className="text-center py-8">{t('admin.loadingProducts')}</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{t('admin.errorPrefix')}: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.products.title')}</h2>
      <div className="flex flex-wrap gap-4 mb-4 items-end justify-between">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filtro-nombre">{t('products.filter.name')}</label>
            <input
              id="filtro-nombre"
              name="nombre"
              type="text"
              value={filtros.nombre}
              onChange={handleFiltroChange}
              placeholder={t('products.filter.namePlaceholder')}
              className="border rounded px-3 py-2 w-40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filtro-categoria">{t('products.filter.category')}</label>
            <input
              id="filtro-categoria"
              name="categoria"
              type="text"
              value={filtros.categoria}
              onChange={handleFiltroChange}
              placeholder={t('products.filter.categoryPlaceholder')}
              className="border rounded px-3 py-2 w-40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="filtro-precio">{t('products.filter.price')}</label>
            <input
              id="filtro-precio"
              name="precio"
              type="text"
              value={filtros.precio}
              onChange={handleFiltroChange}
              placeholder={t('products.filter.pricePlaceholder')}
              className="border rounded px-3 py-2 w-40"
            />
          </div>
        </div>
        <Link to="/admin/products/new">
          <Button variant="primary">+ {t('admin.products.newProduct')}</Button>
        </Link>
      </div>

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
            {productosPagina.map((producto) => (
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
                    <Button size="sm" variant="secondary" onClick={() => handleClone(producto.idProducto)}>{t('admin.products.clone')}</Button>
                    <Button size="sm" variant="light" onClick={() => handleDelete(producto.idProducto)}>{t('admin.products.delete')}</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t('products.empty')}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
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
