import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ecommerceFacade from '../../patterns/EcommerceFacade';


const Products = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [generoFiltro, setGeneroFiltro] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [mililitrosMin, setMililitrosMin] = useState('');
  const [mililitrosMax, setMililitrosMax] = useState('');


  useEffect(() => {
    const cargarDatos = async () => {
      const [data, enums] = await Promise.all([
        ecommerceFacade.getCatalog(),
        ecommerceFacade.getEnums()
      ]);
      setProductos(data);
      setCategorias(enums.CategoriaPerfume || []);
      setGeneros(enums.Genero || []);
    };
    cargarDatos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await ecommerceFacade.getCatalog();
      setProductos(data);

      try {

        console.table(
          (Array.isArray(data) ? data : []).map(p => ({
            id: p.idProducto,
            nombre: p.nombre,
            imagenesLen: Array.isArray(p.imagenesUrl) ? p.imagenesUrl.length : (typeof p.imagenesUrl),
            first: Array.isArray(p.imagenesUrl) ? p.imagenesUrl[0] : null,
            primaryImage: p.primaryImage || null
          }))
        );
      } catch { }
    } catch (error) {
      console.error(t('error.loadingProducts'), error);
      Swal.fire({
        icon: 'error',
        title: t('message.error'),
        text: t('error.loadProducts'),
      });
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = async (productoId, nombreProducto) => {
    try {
      await ecommerceFacade.addToCart(productoId, 1);
      Swal.fire({
        icon: 'success',
        title: t('message.success'),
        text: t('success.addedToCart', { productName: nombreProducto }),
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(t('error.addToCart'), error);
      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'warning',
          title: t('auth.loginRequired'),
          text: t('auth.loginRequiredForCart'),
          confirmButtonText: t('auth.goToLogin'),
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/auth/login');
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: t('message.error'),
          text: error.response?.data?.error || t('error.addToCart'),
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">{t('products.catalogTitle')}</h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('products.catalogSubtitle')}</p>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg dark:shadow-gray-900/50 p-6 mb-8 transition-colors duration-200">
          {/* Búsqueda */}
          <div className="mb-4">
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
            />
          </div>

          {/* Filtros en Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">{t('product.category')}</label>
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              >
                <option value="">{t('common.clear')}</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{t(`category.${cat}`)}</option>
                ))}
              </select>
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">{t('product.gender')}</label>
              <select
                value={generoFiltro}
                onChange={(e) => setGeneroFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              >
                <option value="">{t('common.clear')}</option>
                {generos.map(gen => (
                  <option key={gen} value={gen}>{t(`gender.${gen.toUpperCase()}`)}</option>
                ))}
              </select>
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">{t('product.price')}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={t('common.min')}
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                />
                <input
                  type="number"
                  placeholder={t('common.max')}
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Mililitros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">{t('product.volume')}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={t('common.min')}
                  value={mililitrosMin}
                  onChange={(e) => setMililitrosMin(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                />
                <input
                  type="number"
                  placeholder={t('common.max')}
                  value={mililitrosMax}
                  onChange={(e) => setMililitrosMax(e.target.value)}
                  className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Botón Limpiar */}
            <div className="flex items-end md:col-span-2 lg:col-span-1">
              <button
                onClick={limpiarFiltros}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 font-medium"
              >
                {t('filters.clearFilters')}
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
            {t('products.foundCount', { count: productosFiltrados.length })}
          </div>
        </div>

        {/* Grid de Productos */}
        {productosFiltrados.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg dark:shadow-gray-900/50 p-12 text-center transition-colors duration-200">
            <svg className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-4 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg transition-colors duration-200">{t('products.noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <div key={producto.idProducto} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-200">
                {/* Imagen */}
                <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  {(() => {
                    const firstImage = (producto.imagenesUrl && producto.imagenesUrl.length > 0)
                      ? producto.imagenesUrl[0]
                      : (producto.primaryImage || null);
                    return firstImage ? (
                      <img
                        src={firstImage}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-24 h-24 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    );
                  })()}
                </div>

                {/* Información */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 truncate transition-colors duration-200">{producto.nombre}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 transition-colors duration-200">{producto.descripcion}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{producto.mililitros} ml</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">{producto.genero === 'Female' ? t('gender.FEMENINO') : producto.genero === 'Male' ? t('gender.MASCULINO') : t('gender.UNISEX')}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-200">₡{producto.precio.toFixed(2)}</span>
                    <span className={`text-sm px-2 py-1 rounded transition-colors duration-200 ${producto.stock > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                      {producto.stock > 0 ? t('products.stock', { stock: producto.stock }) : t('product.outOfStock')}
                    </span>
                  </div>

                  <button
                    onClick={() => agregarAlCarrito(producto.idProducto, producto.nombre)}
                    disabled={producto.stock === 0}
                    className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 font-medium disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
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
