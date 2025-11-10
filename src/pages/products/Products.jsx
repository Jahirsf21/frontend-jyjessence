import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Ecommerce from '../../patterns/EcommerceFacade';

const Products = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [generoFiltro, setGeneroFiltro] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [mililitrosMin, setMililitrosMin] = useState('');
  const [mililitrosMax, setMililitrosMax] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await Ecommerce.getCatalog();
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: 'Error al cargar productos',
      });
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = async (productoId, nombreProducto) => {
    try {
      await Ecommerce.addToCart(productoId, 1);
      Swal.fire({
        icon: 'success',
        title: t('message.success'),
        text: `${nombreProducto} agregado al carrito`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'warning',
          title: 'Inicia sesión',
          text: 'Debes iniciar sesión para agregar productos al carrito',
          confirmButtonText: 'Ir a Login',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/auth/login');
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: t('error'),
          text: error.response?.data?.error || 'Error al agregar al carrito',
        });
      }
    }
  };

  const productosFiltrados = productos.filter((producto) => {
    // Filtro de búsqueda
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

    // Filtro de categoría
    const coincideCategoria = !categoriaFiltro || producto.categoria === categoriaFiltro;

    // Filtro de género
    const coincideGenero = !generoFiltro || producto.genero === generoFiltro;

    // Filtro de precio
    const precio = producto.precio;
    const coincidePrecioMin = !precioMin || precio >= parseFloat(precioMin);
    const coincidePrecioMax = !precioMax || precio <= parseFloat(precioMax);

    // Filtro de mililitros
    const ml = producto.mililitros;
    const coincideMlMin = !mililitrosMin || ml >= parseFloat(mililitrosMin);
    const coincideMlMax = !mililitrosMax || ml <= parseFloat(mililitrosMax);

    return coincideBusqueda && coincideCategoria && coincideGenero && 
           coincidePrecioMin && coincidePrecioMax && coincideMlMin && coincideMlMax;
  });

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoriaFiltro('');
    setGeneroFiltro('');
    setPrecioMin('');
    setPrecioMax('');
    setMililitrosMin('');
    setMililitrosMax('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('products.catalogTitle')}</h1>
          <p className="text-gray-600">{t('products.catalogSubtitle')}</p>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Búsqueda */}
          <div className="mb-4">
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtros en Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('product.category')}</label>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('common.clear')}</option>
                <option value="EauDeParfum">Eau de Parfum</option>
                <option value="Parfum">Parfum</option>
                <option value="EauDeToilette">Eau de Toilette</option>
                <option value="Colonia">Colonia</option>
              </select>
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('product.gender')}</label>
              <select
                value={generoFiltro}
                onChange={(e) => setGeneroFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('common.clear')}</option>
                <option value="Female">Mujer</option>
                <option value="Male">Hombre</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('product.price')}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Mililitros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mililitros</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={mililitrosMin}
                  onChange={(e) => setMililitrosMin(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={mililitrosMax}
                  onChange={(e) => setMililitrosMax(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Botón Limpiar */}
            <div className="flex items-end md:col-span-2 lg:col-span-1">
              <button
                onClick={limpiarFiltros}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                {t('filters.clearFilters')}
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-gray-600">
            {t('products.foundCount', { count: productosFiltrados.length })}
          </div>
        </div>

        {/* Grid de Productos */}
        {productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-600 text-lg">{t('products.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <div key={producto.idProducto} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                {/* Imagen */}
                <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  {producto.imagenesUrl && producto.imagenesUrl.length > 0 ? (
                    <img
                      src={producto.imagenesUrl[0]}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-24 h-24 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>

                {/* Información */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{producto.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{producto.descripcion}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{producto.mililitros} ml</span>
                    <span className="text-sm text-gray-500">{producto.genero === 'Female' ? t('gender.FEMENINO') : producto.genero === 'Male' ? t('gender.MASCULINO') : t('gender.UNISEX')}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">₡{producto.precio.toFixed(2)}</span>
                    <span className={`text-sm px-2 py-1 rounded ${producto.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {producto.stock > 0 ? t('products.stock', { stock: producto.stock }) : t('product.outOfStock')}
                    </span>
                  </div>

                  <button
                    onClick={() => agregarAlCarrito(producto.idProducto, producto.nombre)}
                    disabled={producto.stock === 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {producto.stock === 0 ? t('product.outOfStock') : t('product.addToCart')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
