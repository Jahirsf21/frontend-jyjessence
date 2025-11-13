import React, { createContext, useContext, useState } from 'react';

const SearchPanelContext = createContext();

export function SearchPanelProvider({ children }) {
  const [openSearchPanel, setOpenSearchPanel] = useState(false);

  const openSearch = () => setOpenSearchPanel(true);
  const closeSearch = () => setOpenSearchPanel(false);

  return (
    <SearchPanelContext.Provider value={{
      openSearchPanel,
      openSearch,
      closeSearch
    }}>
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
