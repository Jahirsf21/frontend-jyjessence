import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Ecommerce from '../patterns/EcommerceFacade';
import Swal from 'sweetalert2';

function Home() {
	const navigate = useNavigate();
	const { estaAutenticado } = useAuth();
	const { t } = useTranslation();
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
		} finally {
			setLoading(false);
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

	const agregarAlCarrito = async (productoId, nombreProducto) => {
		if (!estaAutenticado) {
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
			return;
		}

		try {
			await Ecommerce.addToCart(productoId, 1);
			Swal.fire({
				icon: 'success',
				title: '¡Agregado!',
				text: `${nombreProducto} se agregó a tu carrito`,
				timer: 2000,
				showConfirmButton: false,
			});
		} catch (error) {
			console.error('Error al agregar al carrito:', error);
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: error.response?.data?.error || 'No se pudo agregar el producto',
			});
		}
	};

	const limpiarFiltros = () => {
		setBusqueda('');
		setCategoriaFiltro('');
		setGeneroFiltro('');
		setPrecioMin('');
		setPrecioMax('');
		setMililitrosMin('');
		setMililitrosMax('');
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
				<div className="max-w-4xl mx-auto text-center">
								<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
									{t('home.welcome')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">JyJ Essence</span>
								</h1>
								<p className="text-lg text-gray-600 mb-6">
									{t('home.heroSubtitle')}
								</p>
				</div>
			</div>

			{/* Catálogo de Productos */}
			<div className="max-w-7xl mx-auto px-4 py-8">
			<h2 className="text-3xl font-bold text-gray-900 mb-6">{t('products.catalogTitle')}</h2>

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
						{productosFiltrados.length} {productosFiltrados.length === 1 ? 'producto encontrado' : 'productos encontrados'}
					</div>
				</div>

				{/* Grid de Productos */}
				{loading ? (
					<div className="flex items-center justify-center py-20">
						<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
					</div>
				) : productosFiltrados.length === 0 ? (
					<div className="bg-white rounded-lg shadow-md p-12 text-center">
						<p className="text-gray-600 text-lg">{t('products.noResults')}</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{productosFiltrados.map((producto) => (
							<div key={producto.idProducto} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
								{/* Imagen */}
								<div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
									<svg className="w-24 h-24 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
									</svg>
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

			{/* Features Section */}
			<div className="bg-white py-16 px-4 mt-12">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center p-6">
							<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
							  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.featureQualityTitle')}</h3>
							  <p className="text-gray-600">{t('home.featureQualityText')}</p>
						</div>

						<div className="text-center p-6">
							<div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.featureShippingTitle')}</h3>
							  <p className="text-gray-600">{t('home.featureShippingText')}</p>
						</div>

						<div className="text-center p-6">
							<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
							</div>
							  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.featureOrderTitle')}</h3>
							  <p className="text-gray-600">{t('home.featureOrderText')}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;
