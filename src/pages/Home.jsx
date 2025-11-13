import React, { useEffect, useState } from 'react';
import ButtonNav from '../components/ui/ButtonNav';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { fetchEnums } from '../services/api';
import Ecommerce from '../patterns/EcommerceFacade';
import SearchPanel from '../components/ui/SearchPanel';
import { useSearchPanel } from '../context/SearchPanelContext';

const PRODUCTS_PER_PAGE = 20;
const SORT_OPTIONS = [
	{ value: 'relevancia', label: 'products.sort.relevance', defaultValue: 'Relevancia' },
	{ value: 'precio-asc', label: 'products.sort.priceAsc', defaultValue: 'Precio: menor a mayor' },
	{ value: 'precio-desc', label: 'products.sort.priceDesc', defaultValue: 'Precio: mayor a menor' },
	{ value: 'categoria', label: 'products.sort.category', defaultValue: 'Categoría' }
];

// --- Componente de Filtros Extraído para Evitar Pérdida de Foco ---
// Se define fuera del componente Home y recibe todo por props.
function FiltrosContent({
	t,
	limpiarFiltros,
	busqueda,
	setBusqueda,
	setPagina,
	categorias,
	categoriaFiltro,
	setCategoriaFiltro,
	marcas,
	marcaFiltro,
	setMarcaFiltro,
	generos,
	generoFiltro,
	setGeneroFiltro,
	precioMin,
	setPrecioMin,
	precioMax,
	setPrecioMax,
	minPrecio,
	maxPrecio
}) {
	return (
		<>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold text-gray-800">{t('filters.title', { defaultValue: 'Filtros' })}</h2>
				<button className="text-blue-600 font-semibold text-sm" onClick={limpiarFiltros}>
					{t('filters.clearFilters', { defaultValue: 'Limpiar' })}
				</button>
			</div>

			<div className="mb-6">
				<h3 className="font-semibold mb-2">{t('search.title', { defaultValue: 'Búsqueda' })}</h3>
				<input
					type="text"
					placeholder={t('search.placeholder', { defaultValue: 'Buscar productos...' })}
					className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					value={busqueda}
					onChange={e => {
						setBusqueda(e.target.value);
						setPagina(1);
					}}
				/>
			</div>

			<div className="mb-6">
				<h3 className="font-semibold mb-2">{t('product.category', { defaultValue: 'Categoría' })}</h3>
				<div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
					<button onClick={() => setCategoriaFiltro([])} className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${categoriaFiltro.length === 0 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
						{t('nav.all', { defaultValue: 'Todas' })}
					</button>
					{categorias.map(cat => (
						<button key={cat} onClick={() => setCategoriaFiltro(categoriaFiltro.includes(cat) ? categoriaFiltro.filter(c => c !== cat) : [...categoriaFiltro, cat])} className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${categoriaFiltro.includes(cat) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
							{t(`category.${cat}`, { defaultValue: cat })}
						</button>
					))}
				</div>
			</div>

			<div className="mb-6">
				<h3 className="font-semibold mb-2">{t('product.brand', { defaultValue: 'Marca' })}</h3>
				<div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
					<button onClick={() => setMarcaFiltro([])} className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${marcaFiltro.length === 0 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
						{t('nav.all', { defaultValue: 'Todas' })}
					</button>
					{marcas.map(marca => (
						<button key={marca} onClick={() => setMarcaFiltro(marcaFiltro.includes(marca) ? marcaFiltro.filter(m => m !== marca) : [...marcaFiltro, marca])} className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${marcaFiltro.includes(marca) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
							{marca}
						</button>
					))}
				</div>
			</div>

			<div className="mb-6">
				<h3 className="font-semibold mb-2">{t('product.gender', { defaultValue: 'Género' })}</h3>
				<div className="flex flex-col gap-2">
					<button onClick={() => setGeneroFiltro([])} className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${generoFiltro.length === 0 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
						{t('nav.all', { defaultValue: 'Todos' })}
					</button>
					{generos.map(gen => (
						<button key={gen} onClick={() => setGeneroFiltro(generoFiltro.includes(gen) ? generoFiltro.filter(g => g !== gen) : [...generoFiltro, gen])} className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${generoFiltro.includes(gen) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
							{t(`gender.${gen}`, { defaultValue: gen })}
						</button>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-2">{t('product.price', { defaultValue: 'Precio' })}</h3>
				<div className="flex gap-2">
					<input type="number" min={minPrecio} max={maxPrecio} value={precioMin} onChange={e => setPrecioMin(e.target.value)} className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={minPrecio.toString()} />
					<input type="number" min={minPrecio} max={maxPrecio} value={precioMax} onChange={e => setPrecioMax(e.target.value)} className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={maxPrecio.toString()} />
				</div>
			</div>
		</>
	);
}

function Home() {
	const { t } = useTranslation();
	const { openSearchPanel, closeSearch } = useSearchPanel();
	const [productos, setProductos] = useState([]);
	const [busqueda, setBusqueda] = useState("");
	const [categorias, setCategorias] = useState([]);
	const [marcas, setMarcas] = useState([]);
	const [generos, setGeneros] = useState([]);
	const [categoriaFiltro, setCategoriaFiltro] = useState([]);
	const [marcaFiltro, setMarcaFiltro] = useState([]);
	const [generoFiltro, setGeneroFiltro] = useState([]);
	const [precioMin, setPrecioMin] = useState('');
	const [precioMax, setPrecioMax] = useState('');
	const [minPrecio, setMinPrecio] = useState(0);
	const [maxPrecio, setMaxPrecio] = useState(0);
	const [pagina, setPagina] = useState(1);
	const [orden, setOrden] = useState('relevancia');
		const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	useEffect(() => {
		const cargarDatos = async () => {
			const [data, enums] = await Promise.all([
				Ecommerce.getCatalog(),
				fetchEnums()
			]);
			setProductos(data);
			setCategorias(enums?.CategoriaPerfume || []);
			setGeneros(enums?.Genero || []);
			setMarcas([...new Set(data.map(p => p.marca).filter(Boolean))].sort());
			const precios = data.map(p => p.precio).filter(p => typeof p === 'number');
			const min = Math.min(...precios);
			const max = Math.max(...precios);
			setMinPrecio(isFinite(min) ? min : 0);
			setMaxPrecio(isFinite(max) ? max : 0);
		};
		cargarDatos();
	}, []);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	
	let productosFiltrados = productos.filter(producto => {
		const coincideBusqueda = busqueda.trim() === "" || (producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || producto.marca?.toLowerCase().includes(busqueda.toLowerCase()) || producto.categoria?.toLowerCase().includes(busqueda.toLowerCase()));
		const coincideCategoria = categoriaFiltro.length === 0 || categoriaFiltro.includes(producto.categoria);
		const coincideMarca = marcaFiltro.length === 0 || marcaFiltro.includes(producto.marca);
		const coincideGenero = generoFiltro.length === 0 || generoFiltro.includes(producto.genero);
		const coincidePrecioMin = !precioMin || producto.precio >= parseFloat(precioMin);
		const coincidePrecioMax = !precioMax || producto.precio <= parseFloat(precioMax);
		return coincideBusqueda && coincideCategoria && coincideMarca && coincideGenero && coincidePrecioMin && coincidePrecioMax;
	});

	if (orden === 'precio-asc') {
		productosFiltrados.sort((a, b) => a.precio - b.precio);
	} else if (orden === 'precio-desc') {
		productosFiltrados.sort((a, b) => b.precio - a.precio);
	} else if (orden === 'categoria') {
		productosFiltrados.sort((a, b) => a.categoria.localeCompare(b.categoria));
	}

	const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTS_PER_PAGE);
	const productosPagina = productosFiltrados.slice((pagina - 1) * PRODUCTS_PER_PAGE, pagina * PRODUCTS_PER_PAGE);

	const limpiarFiltros = () => {
		setBusqueda('');
		setCategoriaFiltro([]);
		setMarcaFiltro([]);
		setGeneroFiltro([]);
		setPrecioMin('');
		setPrecioMax('');
		setPagina(1);
	};

	const filtroProps = { t, limpiarFiltros, busqueda, setBusqueda, setPagina, categorias, categoriaFiltro, setCategoriaFiltro, marcas, marcaFiltro, setMarcaFiltro, generos, generoFiltro, setGeneroFiltro, precioMin, setPrecioMin, precioMax, setPrecioMax, minPrecio, maxPrecio };

return (
  <div className="min-h-screen bg-white flex flex-col">
    
    {/* CONTENIDO PRINCIPAL */}
    <div className="flex flex-1 max-w-7xl mx-auto w-full pt-4 md:pt-8 gap-4 md:gap-8 px-4 md:px-0">
      {/* Sidebar de filtros (solo escritorio) */}
      <aside className="w-72 bg-white rounded-xl shadow-md p-6 sticky top-0 h-fit self-start hidden md:block">
        <FiltrosContent {...filtroProps} />
      </aside>

      {/* Listado de productos */}
      <section className="flex-1 flex flex-col">
        <div className="bg-white rounded-xl shadow-md px-4 md:px-8 py-4 md:py-6 sticky top-0 z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {t('products.catalogTitle', { defaultValue: 'Todos los Productos' })}
            </h1>
            <span className="text-gray-500 text-xs md:text-sm">
              ({productosFiltrados.length}{' '}
              {t('products.productCount', { defaultValue: 'productos' })})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium whitespace-nowrap">
              {t('products.sortBy', { defaultValue: 'Ordenar:' })}
            </label>
            <select
              className="border rounded-lg px-3 py-2 text-sm flex-1 md:flex-initial"
              value={orden}
              onChange={e => {
                setOrden(e.target.value);
                setPagina(1);
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.label, { defaultValue: opt.defaultValue })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* GRID de productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8 py-4 md:py-8">
          {productosPagina.map(producto => (
            <div
              key={producto.idProducto}
              className="bg-white rounded-xl shadow-md p-3 md:p-4 flex flex-col"
            >
              <img
                src={producto.imagenesUrl?.[0] || producto.primaryImage}
                alt={producto.nombre}
                className="w-full h-32 md:h-48 object-cover rounded mb-2 md:mb-4"
              />
              <div className="font-bold text-gray-800 text-sm md:text-lg mb-1 md:mb-2 line-clamp-2">
                {producto.nombre}
              </div>
              <div className="text-xs text-gray-500 mb-1 md:mb-2 hidden md:block">
                {producto.marca}
              </div>
              <div className="text-xs text-gray-500 mb-1 hidden md:block">
                {t(`category.${producto.categoria}`, { defaultValue: producto.categoria })}
              </div>
              <div className="text-xs text-gray-500 mb-2 hidden md:block">
                {t(`gender.${producto.genero}`, { defaultValue: producto.genero })}
              </div>
              <div className="font-bold text-blue-600 text-lg md:text-xl mb-2">
                ₡{producto.precio.toLocaleString('es-CR')}
              </div>
              <button
                className="mt-auto bg-blue-600 text-white py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-blue-700 transition-colors"
                onClick={async e => {
                  e.stopPropagation();
                  try {
                    await Ecommerce.addToCart(producto.idProducto, 1);
                    Swal.fire({
                      icon: 'success',
                      title: t('cart.added', { defaultValue: 'Producto agregado al carrito' }),
                      text: producto.nombre,
                      timer: 1500,
                      showConfirmButton: false
                    });
                  } catch (error) {
                    Swal.fire({
                      icon: 'error',
                      title: t('cart.addError', { defaultValue: 'No se pudo agregar al carrito' }),
                      text: error.message || 'Error desconocido'
                    });
                  }
                }}
              >
                {t('product.addToCart', { defaultValue: 'Agregar' })}
              </button>
            </div>
          ))}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-1 md:gap-2 pb-4 md:pb-8 flex-wrap px-2">
            <button
              className="px-3 md:px-4 py-2 rounded-lg border bg-gray-100 text-gray-700 text-sm font-semibold disabled:opacity-50"
              onClick={() => setPagina(pagina - 1)}
              disabled={pagina === 1}
            >
              {t('pagination.prev', { defaultValue: 'Anterior' })}
            </button>

            {[...Array(totalPaginas)].map((_, i) => {
              const pageNum = i + 1;
              const isCurrent = pagina === pageNum;
              const isAdjacent = Math.abs(pagina - pageNum) <= 1;
              const isFirstOrLast = pageNum === 1 || pageNum === totalPaginas;
              const isEllipsis = Math.abs(pagina - pageNum) === 2;

              if (isMobile && !isCurrent && !isAdjacent && !isFirstOrLast) {
                if (isEllipsis)
                  return (
                    <span key={`dots-${i}`} className="px-2 py-2 text-gray-500">
                      ...
                    </span>
                  );
                return null;
              }

              return (
                <button
                  key={i}
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setPagina(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className="px-3 md:px-4 py-2 rounded-lg border bg-gray-100 text-gray-700 text-sm font-semibold disabled:opacity-50"
              onClick={() => setPagina(pagina + 1)}
              disabled={pagina === totalPaginas}
            >
              {t('pagination.next', { defaultValue: 'Siguiente' })}
            </button>
          </div>
        )}
      </section>
    </div>

    {/* 🔍 Panel lateral de búsqueda */}
    <SearchPanel
      open={openSearchPanel}
      onClose={closeSearch}
      busqueda={busqueda}
      setBusqueda={setBusqueda}
      categoriaFiltro={categoriaFiltro}
      setCategoriaFiltro={setCategoriaFiltro}
      marcaFiltro={marcaFiltro}
      setMarcaFiltro={setMarcaFiltro}
      generoFiltro={generoFiltro}
      setGeneroFiltro={setGeneroFiltro}
      precioMin={precioMin}
      setPrecioMin={setPrecioMin}
      precioMax={precioMax}
      setPrecioMax={setPrecioMax}
      limpiarFiltros={limpiarFiltros}
    />

      </div>
);
}
export default Home;