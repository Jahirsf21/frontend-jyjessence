import React, { useEffect, useState, useRef } from 'react';
import { useVoiceReader } from '../hooks/useVoiceReader';
import ButtonNav from '../components/ui/ButtonNav';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../context/DarkModeContext';

import ecommerceFacade from '../patterns/EcommerceFacade';
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
				<h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors duration-200">{t('filters.title')}</h2>
				<button className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200" onClick={limpiarFiltros}>
					{t('filters.clearFilters')}
				</button>
			</div>

			<div className="mb-6">
				<h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('search.title')}</h3>
				<div className="flex gap-2">
					<input
						type="text"
						placeholder={t('search.placeholder')}
						className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
						value={busqueda}
						onChange={e => {
							setBusqueda(e.target.value);
							setPagina(1);
						}}
					/>

					{typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition) ? (
						<VoiceButton setBusqueda={setBusqueda} setPagina={setPagina} compact />
					) : null}
				</div>
			</div>

			<div className="mb-6">
				<h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('product.category')}</h3>
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
				<h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('product.gender')}</h3>
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
				<h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('product.price')}</h3>
				<div className="flex gap-2">
					<input type="number" min={minPrecio} max={maxPrecio} value={precioMin} onChange={e => setPrecioMin(e.target.value)} className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={minPrecio.toString()} />
					<input type="number" min={minPrecio} max={maxPrecio} value={precioMax} onChange={e => setPrecioMax(e.target.value)} className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder={maxPrecio.toString()} />
				</div>
			</div>

			<div>
				<h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('product.volume')}</h3>
				<div className="flex gap-2">
					<input
						type="number"
						value={mililitrosMin}
						onChange={e => setMililitrosMin(e.target.value)}
						className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
						placeholder={t('common.min')}
					/>
					<input
						type="number"
						value={mililitrosMax}
						onChange={e => setMililitrosMax(e.target.value)}
						className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
						placeholder={t('common.max')}
					/>
				</div>
			</div>
		</>
	);
}

function VoiceButton({ setBusqueda, setPagina, compact = false }) {
	const recognitionRef = useRef(null);
	const [listening, setListening] = useState(false);

	const { t, i18n } = useTranslation();
	const { isDarkMode } = useDarkMode();

	const getSpeechLang = (lang) => {
		if (!lang) return 'es-CR';
		const code = lang.split('-')[0];
		switch (code) {
			case 'es': return 'es-CR';
			case 'en': return 'en-US';
			case 'fr': return 'fr-FR';
			case 'pt': return 'pt-PT';
			case 'zh': return 'zh-CN';
			default: return lang;
		}
	};

	const supportsRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

	const startListening = () => {
		if (!supportsRecognition) return;
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		try {
			if (recognitionRef.current) {
				try { recognitionRef.current.stop(); } catch (err) { }
				recognitionRef.current = null;
			}
			recognitionRef.current = new SpeechRecognition();
			recognitionRef.current.lang = getSpeechLang(i18n.language);
			recognitionRef.current.interimResults = true;
			recognitionRef.current.maxAlternatives = 1;

			recognitionRef.current.onstart = () => setListening(true);

			recognitionRef.current.onresult = (event) => {
				let transcript = '';
				for (let i = event.resultIndex; i < event.results.length; i++) {
					transcript += event.results[i][0].transcript;
				}
				transcript = transcript.trim().replace(/[\.\?,!¡¿]+$/u, '');
				setBusqueda(transcript);
			};

			recognitionRef.current.onend = () => {
				setListening(false);
				setPagina(1);
			};

			recognitionRef.current.onnomatch = () => { };

			recognitionRef.current.onerror = (e) => {
				setListening(false);
				const errCode = e && e.error ? e.error : 'unknown';
				if (errCode === 'network') {
				} else {
					try { Swal.fire({ icon: 'error', title: t('swal.error'), text: (e && e.message) || t('voice.recognitionFailed') }); } catch (swalErr) { }
				}
			};

			recognitionRef.current.start();
			setListening(true);
		} catch (err) {

		}
	};

	const stopListening = () => {
		if (recognitionRef.current) {
			try {
				recognitionRef.current.stop();
			} catch (err) {
			}
		}
		setListening(false);
	};

	const toggleListening = () => {
		if (!supportsRecognition) return;
		if (listening) stopListening(); else startListening();
	};

	useEffect(() => {
		if (!supportsRecognition) return;
		if (listening) {
			try {
				if (recognitionRef.current) {
					try { recognitionRef.current.stop(); } catch (err) { }
					recognitionRef.current = null;
				}
				startListening();
			} catch (err) { }
		}
	}, [i18n.language]);

	if (!supportsRecognition) return null;

		const btnClass = compact
		? `w-8 h-8 p-1 rounded-md border flex items-center justify-center transition-colors duration-200 ${listening ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-500' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'} hover:bg-gray-50 dark:hover:bg-gray-600`
		: `w-12 h-12 rounded-lg flex items-center justify-center border transition-colors duration-200 ${listening ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-500' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'} hover:bg-gray-50 dark:hover:bg-gray-600`;

	const imgClass = compact ? `w-4 h-4 object-contain ${listening ? 'opacity-100' : 'opacity-90'}` : `w-5 h-5 object-contain ${listening ? 'opacity-100' : 'opacity-90'}`;

	return (
		<div className={compact ? 'flex items-center' : 'flex flex-col items-center'}>
			<button
				type="button"
				onClick={toggleListening}
				aria-pressed={listening}
				className={btnClass}
				title={listening ? 'Stop voice search' : 'Voice search'}
			>
				<img src={isDarkMode ? "https://res.cloudinary.com/drec8g03e/image/upload/v1763530306/microfono-modo-oscuro_o987ii.svg" : "https://res.cloudinary.com/drec8g03e/image/upload/v1763530306/microfono_krfs1o.svg"} alt="mic" className={imgClass} />
			</button>
			{listening && !compact && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">Escuchando...</div>}
		</div>
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
				ecommerceFacade.getCatalog(),
				ecommerceFacade.getEnums()
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
		<div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col transition-colors duration-200">
			<div className="w-full flex-1 bg-white dark:bg-gray-900 transition-colors duration-200">
				<div className="max-w-7xl mx-auto w-full px-4 md:px-0 pt-4 md:pt-8 pb-8 md:pb-10 flex flex-col gap-4 md:gap-6 h-full">
					<div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-8 md:min-h-[calc(100vh-180px)]">

						<aside className="hidden md:block w-72 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg dark:shadow-gray-900/50 p-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide transition-colors duration-200">
							<FiltrosContent {...filtroProps} />
						</aside>

						<section className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-lg dark:shadow-gray-900/50 overflow-hidden min-h-[60vh] md:max-h-[calc(100vh-160px)] transition-colors duration-200">
							<div className="px-4 md:px-8 py-4 md:py-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div>
									<h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
										{t('products.catalogTitle')}
									</h1>
									<span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm transition-colors duration-200">
										({productosFiltrados.length}{' '}
										{t('products.productCount')})
									</span>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<label className="text-sm text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap transition-colors duration-200">
										{t('products.sortBy')}
									</label>
									<select
										className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-2 text-sm flex-1 md:flex-initial transition-colors duration-200"
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

								<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
									{productosPagina.map(producto => (
										<div
											key={producto.idProducto}
											className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg dark:shadow-gray-900/50 p-3 md:p-4 flex flex-col relative h-full transition-colors duration-200"
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
													</>
												);
											})()}
											<div className="flex-1 flex flex-col">
												<div className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base mb-1 min-h-[2.5rem] md:min-h-[3rem] line-clamp-2 text-left transition-colors duration-200">
													{producto.nombre}
												</div>
												<div className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-left transition-colors duration-200">
													{t(`category.${producto.categoria}`, { defaultValue: producto.categoria })} • {t(`gender.${producto.genero}`, { defaultValue: producto.genero })} • {producto.mililitros} ml
												</div>
											</div>
											<div className="font-bold text-blue-600 text-lg md:text-xl mb-3 text-left">
												₡{producto.precio.toLocaleString('es-CR')}
											</div>
											<button
												className="mt-auto bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
												onClick={async e => {
													e.stopPropagation();
													try {
														await ecommerceFacade.addToCart(producto.idProducto, 1);
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
											className="px-3 md:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold disabled:opacity-50 transition-colors duration-200"
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
														<span key={`dots-${i}`} className="px-2 py-2 text-gray-500 dark:text-gray-400 transition-colors duration-200">
															...
														</span>
													);
												return null;
											}

											return (
												<button
													key={i}
													className={`px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold transition-colors duration-200 ${isCurrent
														? 'bg-blue-600 dark:bg-blue-500 text-white'
														: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
														}`}
													onClick={() => setPagina(pageNum)}
												>
													{pageNum}
												</button>
											);
										})}

										<button
											className="px-3 md:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold disabled:opacity-50 transition-colors duration-200"
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