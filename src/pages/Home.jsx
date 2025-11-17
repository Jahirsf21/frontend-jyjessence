import React, { useEffect, useState } from 'react';
import { useVoiceReader } from '../hooks/useVoiceReader';
import ButtonNav from '../components/ui/ButtonNav';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { fetchEnums } from '../services/api';
import Ecommerce from '../patterns/EcommerceFacade';
import { useSearchPanel } from '../context/SearchPanelContext';

const PRODUCTS_PER_PAGE = 20;
const SORT_OPTIONS = [
	{ value: 'relevancia', label: 'products.sort.relevance', defaultValue: 'Relevancia' },
	{ value: 'precio-asc', label: 'products.sort.priceAsc', defaultValue: 'Precio: menor a mayor' },
	{ value: 'precio-desc', label: 'products.sort.priceDesc', defaultValue: 'Precio: mayor a menor' },
	{ value: 'categoria', label: 'products.sort.category', defaultValue: 'Categoría' }
];


function FiltrosContent({
	t,
	limpiarFiltros,
	busqueda,
	setBusqueda,
	setPagina,
	categorias,
	categoriaFiltro,
	setCategoriaFiltro,
	generos,
	generoFiltro,
	setGeneroFiltro,
	precioMin,
	setPrecioMin,
	precioMax,
	setPrecioMax,
	mililitrosMin,
	setMililitrosMin,
	mililitrosMax,
	setMililitrosMax,
	minPrecio,
	maxPrecio
}) {
	return (
		<>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold text-gray-800">{t('filters.title')}</h2>
				<button className="text-blue-600 font-semibold text-sm" onClick={limpiarFiltros}>
					{t('filters.clearFilters')}
				</button>
			</div>

			<div className="mb-6">
				<h3 className="font-semibold mb-2">{t('search.title')}</h3>
				<input
					type="text"
					placeholder={t('search.placeholder')}
					className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					value={busqueda}
					onChange={e => {
						setBusqueda(e.target.value);
						setPagina(1);
					}}
				/>
			</div>

			<div className="mb-6">
				<h3 className="font-semibold mb-2">{t('product.category')}</h3>
				<div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
					<button onClick={() => setCategoriaFiltro([])} className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${categoriaFiltro.length === 0 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
						{t('nav.all')}
					</button>
					{categorias.map(cat => (
						<button key={cat} onClick={() => setCategoriaFiltro(categoriaFiltro.includes(cat) ? categoriaFiltro.filter(c => c !== cat) : [...categoriaFiltro, cat])} className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${categoriaFiltro.includes(cat) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
							{t(`category.${cat}`)}
						</button>
					))}
				</div>
			</div>

			<div className="mb-6">
				<h3 className="font-semibold mb-2">{t('product.gender')}</h3>
				<div className="flex flex-col gap-2">
					<button onClick={() => setGeneroFiltro([])} className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${generoFiltro.length === 0 ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
						{t('nav.all')}
					</button>
					{generos.map(gen => (
						<button key={gen} onClick={() => setGeneroFiltro(generoFiltro.includes(gen) ? generoFiltro.filter(g => g !== gen) : [...generoFiltro, gen])} className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${generoFiltro.includes(gen) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
							{t(`gender.${gen}`)}
						</button>
					))}
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-2">{t('product.price')}</h3>
				<div className="flex gap-2">
					<input type="number" min={minPrecio} max={maxPrecio} value={precioMin} onChange={e => setPrecioMin(e.target.value)} className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={minPrecio.toString()} />
					<input type="number" min={minPrecio} max={maxPrecio} value={precioMax} onChange={e => setPrecioMax(e.target.value)} className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={maxPrecio.toString()} />
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-2">{t('product.volume')}</h3>
				<div className="flex gap-2">
					<input 
						type="number" 
						value={mililitrosMin} 
						onChange={e => setMililitrosMin(e.target.value)} 
						className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
						placeholder={t('common.min')} 
					/>
					<input 
						type="number" 
						value={mililitrosMax} 
						onChange={e => setMililitrosMax(e.target.value)} 
						className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
						placeholder={t('common.max')} 
					/>
				</div>
			</div>
		</>
	);
}

function Home() {
	const { mouseReadingEnabled, speak } = useVoiceReader();
	const { t } = useTranslation();
	const {
		filters,
		setBusqueda,
		setCategoriaFiltro,
		setGeneroFiltro,
		setPrecioMin,
		setPrecioMax,
		setMililitrosMin,
		setMililitrosMax,
		limpiarFiltros: resetFiltros
	} = useSearchPanel();
	const { busqueda, categoriaFiltro, generoFiltro, precioMin, precioMax, mililitrosMin, mililitrosMax } = filters;
	const [productos, setProductos] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [generos, setGeneros] = useState([]);
	const [currentImageIndex, setCurrentImageIndex] = useState({});
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

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentImageIndex(prev => {
				const newIndex = {};
				productos.forEach(producto => {
					const imagenes = producto.imagenesUrl || [];
					if (imagenes.length > 1) {
						const currentIndex = prev[producto.idProducto] || 0;
						newIndex[producto.idProducto] = (currentIndex + 1) % imagenes.length;
					}
				});
				return newIndex;
			});
		}, 3000); 

		return () => clearInterval(interval);
	}, [productos]);

  // Filtrado directo sin agrupar por nombre
  let productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = busqueda.trim() === "" || (producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || producto.categoria?.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideCategoria = categoriaFiltro.length === 0 || categoriaFiltro.includes(producto.categoria);
    const coincideGenero = generoFiltro.length === 0 || generoFiltro.includes(producto.genero);
    const coincidePrecioMin = !precioMin || producto.precio >= parseFloat(precioMin);
    const coincidePrecioMax = !precioMax || producto.precio <= parseFloat(precioMax);
    const coincideMlMin = !mililitrosMin || producto.mililitros >= parseFloat(mililitrosMin);
    const coincideMlMax = !mililitrosMax || producto.mililitros <= parseFloat(mililitrosMax);
    return coincideBusqueda && coincideCategoria && coincideGenero && coincidePrecioMin && coincidePrecioMax && coincideMlMin && coincideMlMax;
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
		resetFiltros();
		setPagina(1);
	};

	useEffect(() => {
		setPagina(1);
	}, [busqueda, categoriaFiltro, generoFiltro, precioMin, precioMax, mililitrosMin, mililitrosMax]);

	const filtroProps = { t, limpiarFiltros, busqueda, setBusqueda, setPagina, categorias, categoriaFiltro, setCategoriaFiltro, generos, generoFiltro, setGeneroFiltro, precioMin, setPrecioMin, precioMax, setPrecioMax, mililitrosMin, setMililitrosMin, mililitrosMax, setMililitrosMax, minPrecio, maxPrecio };

return (
	<div className="min-h-screen bg-white flex flex-col">
		<div className="w-full flex-1 bg-white">
			<div className="max-w-7xl mx-auto w-full px-4 md:px-0 pt-4 md:pt-8 pb-8 md:pb-10 flex flex-col gap-4 md:gap-6 h-full">
				<div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-8 md:min-h-[calc(100vh-180px)]">
					{/* Sidebar de filtros (solo escritorio) */}
					<aside className="hidden md:block w-72 bg-white rounded-xl shadow-md p-6 sticky top-24 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
						<FiltrosContent {...filtroProps} />
					</aside>

					{/* Listado de productos */}
					<section className="flex-1 flex flex-col bg-white rounded-2xl shadow-md overflow-hidden min-h-[60vh] md:max-h-[calc(100vh-160px)]">
						<div className="px-4 md:px-8 py-4 md:py-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div>
								<h1 className="text-xl md:text-2xl font-bold text-gray-900">
									{t('products.catalogTitle')}
								</h1>
								<span className="text-gray-500 text-xs md:text-sm">
									({productosFiltrados.length}{' '}
									{t('products.productCount')})
								</span>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<label className="text-sm text-gray-600 font-medium whitespace-nowrap">
									{t('products.sortBy')}
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
											{t(opt.label)}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto px-1 md:px-8 py-4 md:py-6 scrollbar-elegant">
							{/* GRID de productos */}
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
								{productosPagina.map(producto => (
									<div
										key={producto.idProducto}
										className="bg-white rounded-xl shadow-md p-3 md:p-4 flex flex-col relative h-full"
										tabIndex={0}
										onMouseEnter={() => {
											if (mouseReadingEnabled) {
												const texto = `${producto.nombre}, ${t(`category.${producto.categoria}`, { defaultValue: producto.categoria })}, ${t(`gender.${producto.genero}`, { defaultValue: producto.genero })}, ₡${producto.precio.toLocaleString('es-CR')}`;
												speak(texto);
											}
										}}
									>
										{(() => {
											const imagenes = producto.imagenesUrl || [];
											const imagenActual = imagenes.length > 0 
												? imagenes[currentImageIndex[producto.idProducto] || 0] 
												: producto.primaryImage;
											return (
												<>
													<img
														src={imagenActual}
														alt={producto.nombre}
														className="w-full h-32 md:h-48 object-cover rounded mb-2 md:mb-4 transition-opacity duration-500"
													/>
													{/* Indicadores de imágenes */}
													{imagenes.length > 1 && (
														<div className="absolute top-3 right-3 flex gap-1">
															{imagenes.map((_, index) => (
																<div
																	key={index}
																	className={`w-1.5 h-1.5 rounded-full transition-colors ${
																		index === (currentImageIndex[producto.idProducto] || 0)
																			? 'bg-white'
																			: 'bg-white/50'
																	}`}
																/>
															))}
														</div>
													)}
												</>
											);
										})()}
										<div className="flex-1 flex flex-col">
											<div className="font-bold text-gray-900 text-sm md:text-base mb-1 min-h-[2.5rem] md:min-h-[3rem] line-clamp-2 text-left">
												{producto.nombre}
											</div>
											<div className="text-xs text-gray-600 mb-2 text-left">
												{t(`category.${producto.categoria}`, { defaultValue: producto.categoria })} • {t(`gender.${producto.genero}`, { defaultValue: producto.genero })} • {producto.mililitros} ml
											</div>
										</div>
										<div className="font-bold text-blue-600 text-lg md:text-xl mb-3 text-left">
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
														title: t('cart.added'),
														text: `${producto.nombre} (${producto.mililitros}ml)`,
														timer: 1500,
														showConfirmButton: false
													});
												} catch (error) {
													Swal.fire({
														icon: 'error',
														title: t('cart.addError'),
														text: error.message || t('error.unknown')
													});
												}
											}}
										>
											{t('product.addToCart')}
										</button>
									</div>
								))}
							</div>

							{/* Paginación */}
							{totalPaginas > 1 && (
								<div className="flex justify-center items-center gap-1 md:gap-2 py-6 flex-wrap px-2">
									<button
										className="px-3 md:px-4 py-2 rounded-lg border bg-gray-100 text-gray-700 text-sm font-semibold disabled:opacity-50"
										onClick={() => setPagina(pagina - 1)}
										disabled={pagina === 1}
									>
										{t('pagination.prev')}
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
										{t('pagination.next')}
									</button>
								</div>
							)}
						</div>
					</section>
				</div>
			</div>
		</div>

	</div>
);
}
export default Home;