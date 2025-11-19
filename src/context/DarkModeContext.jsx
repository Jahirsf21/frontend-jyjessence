import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext(null);

export const useDarkMode = () => {
  const contexto = useContext(DarkModeContext);
  if (!contexto) {
    throw new Error('useDarkMode debe usarse dentro de DarkModeProvider');
  }
  return contexto;
};

export const DarkModeProvider = ({ children }) => {
  // Obtener preferencia inicial del localStorage o del sistema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Aplicar inmediatamente antes de que React renderice para evitar flash
    const saved = localStorage.getItem('darkMode');
    let initialMode;
    if (saved !== null) {
      initialMode = saved === 'true';
    } else {
      // Si no hay preferencia guardada, usar la preferencia del sistema
      initialMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Aplicar clase inmediatamente
    if (initialMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return initialMode;
  });

  // Aplicar clase dark al documento cuando cambia el modo
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Escuchar cambios en la preferencia del sistema (opcional)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Solo actualizar si no hay preferencia guardada
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const enableDarkMode = () => {
    setIsDarkMode(true);
  };

  const disableDarkMode = () => {
    setIsDarkMode(false);
  };

  const valor = {
    isDarkMode,
    toggleDarkMode,
    enableDarkMode,
    disableDarkMode,
  };

  return (
    <DarkModeContext.Provider value={valor}>
      {children}
    </DarkModeContext.Provider>
  );
};

