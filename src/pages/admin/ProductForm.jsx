import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ecommerceFacade from '../../patterns/EcommerceFacade';
import Button from '../../components/ui/Button';

export default function ProductForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [cargando, setCargando] = useState(!!id);
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
    if (id) {
      cargarProducto();
    }
  }, [id]);

  const cargarProducto = async () => {
    try {
      const producto = await ecommerceFacade.getProductById(id);
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
    } catch (err) {
      alert(err.message);
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
    return Array.from(new Set([...uploadedUrls, ...urlsFromInput]));
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
      const sanitizeUrl = (u) => typeof u === 'string' ? u.trim().replace(/^['"]+|['"]+$/g, '') : u;
      const datosProducto = {
        ...formulario,
        mililitros: parseInt(formulario.mililitros),
        precio: parseFloat(formulario.precio),
        stock: parseInt(formulario.stock),
        imagenesUrl: Array.isArray(formulario.imagenesUrl) ? formulario.imagenesUrl.map(sanitizeUrl).filter(Boolean) : []
      };

      if (id) {
        await ecommerceFacade.updateProduct(id, datosProducto);
        alert(t('admin.products.updated'));
      } else {
        await ecommerceFacade.createProduct(datosProducto);
        alert(t('admin.products.created'));
      }
      
      navigate('/admin/products');
    } catch (err) {
      alert(err.message);
    }
  };

  if (cargando) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {id ? t('admin.products.editProduct') : t('admin.products.newProduct')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('product.name')} <span className="text-red-500">*</span>
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
              {t('product.description')} <span className="text-red-500">*</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('product.mililiters')} <span className="text-red-500">*</span>
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
                {t('product.price')} <span className="text-red-500">*</span>
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
                {t('product.stock')} <span className="text-red-500">*</span>
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
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {t('admin.products.chooseImages', 'Elegir fotos')}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={subiendoImagenes}
                  className="sr-only"
                />
              </label>
              {subiendoImagenes && (
                <span className="ml-2 text-sm text-gray-500">{t('admin.products.uploadingImages')}</span>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              {/* Si la clave no existe, muestra ayuda por defecto */}
            </div>

            {formulario.imagenesUrl.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {t('admin.products.preview')}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {formulario.imagenesUrl.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`${formulario.nombre || 'Producto'} - Imagen ${index + 1}`}
                        className="h-24 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url, index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title={t('common.delete')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="submit" 
            variant="primary"
          >
            {id ? t('common.update') : t('common.create')} {t('product.product')}
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => navigate('/admin/products')}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}
