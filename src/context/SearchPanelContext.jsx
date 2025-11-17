import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

export const SearchPanelContext = createContext();

const initialFiltersState = {
  busqueda: '',
  categoriaFiltro: [],
  generoFiltro: [],
  precioMin: '',
  precioMax: '',
  mililitrosMin: '',
  mililitrosMax: ''
};

export function SearchPanelProvider({ children }) {
  const [openSearchPanel, setOpenSearchPanel] = useState(false);
  const [filters, setFilters] = useState(initialFiltersState);

  const openSearch = () => setOpenSearchPanel(true);
  const closeSearch = () => setOpenSearchPanel(false);

  const setBusqueda = value => setFilters(prev => ({ ...prev, busqueda: value }));
  const setCategoriaFiltro = value => setFilters(prev => ({ ...prev, categoriaFiltro: Array.isArray(value) ? value : [] }));
  const setGeneroFiltro = value => setFilters(prev => ({ ...prev, generoFiltro: Array.isArray(value) ? value : [] }));
  const setPrecioMin = value => setFilters(prev => ({ ...prev, precioMin: value }));
  const setPrecioMax = value => setFilters(prev => ({ ...prev, precioMax: value }));
  const setMililitrosMin = value => setFilters(prev => ({ ...prev, mililitrosMin: value }));
  const setMililitrosMax = value => setFilters(prev => ({ ...prev, mililitrosMax: value }));

  const limpiarFiltros = useCallback(() => {
    setFilters(initialFiltersState);
  }, []);

  const replaceFilters = useCallback(newValues => {
    setFilters({ ...initialFiltersState, ...newValues });
  }, []);

  const value = useMemo(() => ({
    openSearchPanel,
    openSearch,
    closeSearch,
    filters,
    setBusqueda,
    setCategoriaFiltro,
    setGeneroFiltro,
    setPrecioMin,
    setPrecioMax,
    setMililitrosMin,
    setMililitrosMax,
    limpiarFiltros,
    replaceFilters
  }), [openSearchPanel, filters, limpiarFiltros, replaceFilters]);

  return (
    <SearchPanelContext.Provider value={value}>
      {children}
    </SearchPanelContext.Provider>
  );
}

export function useSearchPanel() {
  const context = useContext(SearchPanelContext);
  if (!context) {
    throw new Error('useSearchPanel must be used within a SearchPanelProvider');
  }
  return context;
}
