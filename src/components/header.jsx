import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ModalPerfil from './ModalPerfil';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navegar = useNavigate();
  const location = useLocation();
  const { usuario, estaAutenticado } = useAuth();
  const [mostrarMenuIdioma, setMostrarMenuIdioma] = useState(false);
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const idiomaRef = useRef(null);

  // Detectar si estamos en la página principal
  const esHome = location.pathname === '/' || location.pathname === '/home';

  // Cerrar dropdown de idioma al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (idiomaRef.current && !idiomaRef.current.contains(event.target)) {
        setMostrarMenuIdioma(false);
      }
    };

    if (mostrarMenuIdioma) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarMenuIdioma]);

  const cambiarIdioma = (codigo) => {
    i18n.changeLanguage(codigo);
    setMostrarMenuIdioma(false);
  };

  const nombrePerfil = estaAutenticado
    ? `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim() || 'Mi Perfil'
    : 'Cuenta';

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-[1000] border-b border-gray-200 bg-white/90 backdrop-blur font-['Lato',sans-serif]">
        {/* Contenedor principal del header */}
        <div className="mx-auto flex w-full items-center gap-2 px-3 py-2 md:gap-4 md:px-6 md:py-3 max-w-[1280px]">
          {/* Logo */}
          <Link to="/" className="no-underline flex-shrink-0">
            <h1 className="flex items-center gap-1.5 sm:gap-2 md:gap-3 m-0 text-blue-600 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold">
              <img
                src="https://res.cloudinary.com/drec8g03e/image/upload/v1762655746/jyjessence_y75wqc.webp"
                alt="JyJ Essence Logo"
                className="h-8 sm:h-9 md:h-12 lg:h-14 xl:h-16"
              />
              <span className="hidden sm:inline">JyJ Essence</span>
            </h1>
          </Link>

          {/* --- Barra de búsqueda centrada en pantallas medianas en adelante --- */}
          {esHome && (
            <div className="hidden flex-1 lg:flex lg:justify-center lg:px-4">
              <form className="flex w-full max-w-[480px] xl:max-w-[520px] items-center rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-sm transition-shadow hover:shadow-md">
                <input
                  type="text"
                  className="min-w-0 flex-grow border-none bg-transparent px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  placeholder={t('header.searchPlaceholder', { defaultValue: 'Buscar productos...' })}
                />
                <button
                  type="submit"
                  className="flex h-8 w-8 xl:h-9 xl:w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
                  aria-label="Buscar"
                >
                  <img
                    src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/search_mntlda.svg"
                    alt="Buscar"
                    className="w-4 h-4 xl:w-5 xl:h-5 invert"
                  />
                </button>
              </form>
            </div>
          )}

          {/* Botones de la derecha */}
          <div className="ml-auto flex flex-shrink-0 items-center gap-1 sm:gap-2 md:gap-2 lg:gap-3">
            {/* Language dropdown */}
            <div className="relative inline-block" ref={idiomaRef}>
              <button
                className="flex h-8 sm:h-9 md:h-10 items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-1.5 transition-all hover:border-gray-400 hover:shadow-sm md:gap-2 md:px-3 lg:px-4"
                onClick={() => setMostrarMenuIdioma(!mostrarMenuIdioma)}
                aria-label="Cambiar idioma"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20" />
                </svg>
                <span className="hidden lg:inline font-semibold text-gray-800 text-xs lg:text-sm whitespace-nowrap">
                  {i18n.language === 'es' ? 'Español' : 'English'}
                </span>
              </button>
              {mostrarMenuIdioma && (
                <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px] md:min-w-[180px] z-[1001] mt-2 overflow-hidden">
                  <button 
                    onClick={() => cambiarIdioma('es')} 
                    className={`block w-full px-4 md:px-5 py-2 md:py-3 text-left bg-none border-none text-gray-700 text-sm md:text-base cursor-pointer transition-colors hover:bg-gray-100 ${
                      i18n.language === 'es' ? 'bg-blue-50 font-semibold' : ''
                    }`}
                  >
                    {i18n.language === 'es' && '✓ '}Español
                  </button>
                  <button 
                    onClick={() => cambiarIdioma('en')} 
                    className={`block w-full px-4 md:px-5 py-2 md:py-3 text-left bg-none border-none text-gray-700 text-sm md:text-base cursor-pointer transition-colors hover:bg-gray-100 ${
                      i18n.language === 'en' ? 'bg-blue-50 font-semibold' : ''
                    }`}
                  >
                    {i18n.language === 'en' && '✓ '}English
                  </button>
                </div>
              )}
            </div>

            {/* Cart button */}
            <Link 
              to="/cart" 
              className="bg-white border border-gray-300 rounded-full px-2 py-1.5 flex items-center gap-1 transition-all hover:shadow-sm hover:border-gray-400 h-8 sm:h-9 md:h-10 no-underline md:gap-2 md:px-3 lg:px-4" 
              aria-label="Carrito"
            >
              <img
                src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/carrito_idlvij.svg"
                alt="Carrito"
                className="h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5 object-contain flex-shrink-0"
              />
              <span className="hidden lg:inline font-semibold text-gray-800 text-xs lg:text-sm whitespace-nowrap">{t('nav.cart', { defaultValue: 'Carrito' })}</span>
            </Link>

            {/* Profile button */}
            <button
              className="bg-white border border-gray-300 rounded-full px-2 py-1.5 flex items-center gap-1 transition-all hover:shadow-sm hover:border-gray-400 h-8 sm:h-9 md:h-10 md:gap-2 md:px-3 lg:px-4"
              onClick={() => setMostrarModalPerfil(true)}
              aria-label="Menú de usuario"
            >
              <img
                src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/account_r3kxej.svg"
                alt="Perfil"
                className="h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5 object-contain flex-shrink-0"
              />
              <span className="hidden lg:inline font-semibold text-gray-800 text-xs lg:text-sm truncate max-w-[60px] xl:max-w-[80px]">
                {nombrePerfil}
              </span>
            </button>
          </div>
        </div>
        
        {/* Barra de búsqueda móvil/tablet */}
        {esHome && (
          <div className="lg:hidden px-3 pb-2 md:pb-3">
            <form className="flex items-center bg-white border border-gray-300 rounded-full px-2 py-1.5 shadow-sm w-full transition-shadow hover:shadow-md">
              <input
                type="text"
                className="border-none outline-none flex-grow px-3 py-2 text-sm bg-transparent text-gray-700 placeholder-gray-400"
                placeholder={t('header.searchPlaceholder', { defaultValue: 'Buscar productos...' })}
              />
              <button
                type="submit"
                className="bg-blue-600 border-none rounded-full w-8 h-8 sm:w-9 sm:h-9 flex justify-center items-center text-white transition-colors hover:bg-blue-700 flex-shrink-0"
                aria-label="Buscar"
              >
                <img
                  src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/search_mntlda.svg"
                  alt="Buscar"
                  className="w-4 h-4 invert"
                />
              </button>
            </form>
          </div>
        )}
      </header>

      {mostrarModalPerfil && (
        <ModalPerfil
          onClose={() => setMostrarModalPerfil(false)}
          estaAutenticado={estaAutenticado}
          usuario={usuario}
          navegar={navegar}
          t={t}
        />
      )}
    </>
  );
};

export default Header;