import React, { useState, useEffect } from 'react';
import { fetchEnums } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function SearchPanel({
  open,
  onClose,
  busqueda,
  setBusqueda,
  categoriaFiltro,
  setCategoriaFiltro,
  generoFiltro,
  setGeneroFiltro,
  precioMin,
  setPrecioMin,
  precioMax,
  setPrecioMax,
  limpiarFiltros
}) {
  const { t } = useTranslation();
  const [categorias, setCategorias] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [minPrecio, setMinPrecioLocal] = useState(0);
  const [maxPrecio, setMaxPrecioLocal] = useState(0);

  useEffect(() => {
    const cargarEnums = async () => {
      try {
        const enums = await fetchEnums();
        setCategorias(enums?.CategoriaPerfume || []);
        setGeneros(enums?.Genero || []);
      } catch (err) {
        console.error('Error al obtener enums:', err);
      }
    };
    if (open) cargarEnums();
  }, [open]);

  // Cierra el panel si la resolución es tablet o mayor
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768 && open) {
        onClose();
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, onClose]);

  return (
    <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[1002] transition-all duration-300 ${open ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-lg font-bold">{t('filters.title', { defaultValue: 'Filtros' })}</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200" aria-label={t('search.close', { defaultValue: 'Cerrar filtros' })}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('search.placeholder', { defaultValue: 'Buscar productos...' })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <button
            type="button"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            onClick={limpiarFiltros}
          >
            {t('filters.clearFilters', { defaultValue: 'Limpiar filtros' })}
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            {t('product.category', { defaultValue: 'Categoría' })}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaFiltro([])}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                categoriaFiltro.length === 0
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('nav.all', { defaultValue: 'Todas' })}
            </button>
            {categorias.map(cat => {
              const selected = categoriaFiltro.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoriaFiltro(selected
                      ? categoriaFiltro.filter(c => c !== cat)
                      : [...categoriaFiltro, cat]
                    );
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(`category.${cat}`, { defaultValue: cat })}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            {t('product.gender', { defaultValue: 'Género' })}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setGeneroFiltro([])}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                generoFiltro.length === 0 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('nav.all', { defaultValue: 'Todos' })}
            </button>
            {generos.map(gen => (
              <button
                key={gen}
                onClick={() => setGeneroFiltro(generoFiltro.includes(gen) ? generoFiltro.filter(g => g !== gen) : [...generoFiltro, gen])}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  generoFiltro.includes(gen) 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t(`gender.${gen}`, { defaultValue: gen })}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t('product.priceMin', { defaultValue: 'Precio mín.' })}</label>
            <input
              type="number"
              value={precioMin}
              onChange={e => setPrecioMin(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={minPrecio.toString()}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t('product.priceMax', { defaultValue: 'Precio máx.' })}</label>
            <input
              type="number"
              value={precioMax}
              onChange={e => setPrecioMax(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={maxPrecio.toString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}