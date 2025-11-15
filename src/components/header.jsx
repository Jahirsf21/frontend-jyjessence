import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ModalPerfil from './ModalPerfil';
import LanguageDropdown from './LanguageDropdown';
import Ecommerce from '../patterns/EcommerceFacade';
import guestCartService from '../services/guestCartService';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navegar = useNavigate();
  const location = useLocation();
  const { usuario, estaAutenticado } = useAuth();
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  const cambiarIdioma = (codigo) => {
    i18n.changeLanguage(codigo);
    // No debug info needed
  }

  // Cargar contador de items del carrito
  useEffect(() => {
    const loadCartCount = async () => {
      try {
        if (estaAutenticado) {
          // Usuario autenticado - obtener del backend
          const cartSummary = await Ecommerce.getCartSummary();
          setCartItemCount(cartSummary.itemCount || 0);
        } else {
          // Usuario invitado - obtener del localStorage
          const guestCart = guestCartService.getCart();
          const itemCount = guestCart.items.reduce((sum, item) => sum + item.cantidad, 0);
          setCartItemCount(itemCount);
        }
      } catch (error) {
        console.error('Error loading cart count:', error);
        setCartItemCount(0);
      }
    };

    loadCartCount();

    // Escuchar cambios en el carrito (para actualizaciones en tiempo real)
    const handleCartUpdate = () => {
      loadCartCount();
    };

    // Escuchar eventos de actualización del carrito
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [estaAutenticado]);

  const nombrePerfil = estaAutenticado
    ? `${usuario?.nombre || ''} ${usuario?.apellido || ''}`.trim() || t('profile')
    : t('account');

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-[1000] border-b border-gray-200 bg-white/90 backdrop-blur font-['Lato',sans-serif]">
        {/* Removed debug info for current language */}
        {/* Contenedor principal del header */}
        <div className="mx-auto flex w-full items-center gap-2 px-3 py-2 md:gap-4 md:px-6 md:py-3 max-w-[1280px]">
          {/* Logo */}
          <Link to="/" className="no-underline flex-shrink-0">
            <h1 className="flex items-center gap-2 m-0 text-blue-600 text-xl sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold">
              <img
                src="https://res.cloudinary.com/drec8g03e/image/upload/v1762655746/jyjessence_y75wqc.webp"
                alt="JyJ Essence Logo"
                className="h-12 w-12 sm:h-9 sm:w-9 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16"
              />
              <span className="inline sm:inline md:inline">JyJ Essence</span>
            </h1>
          </Link>
          
          {/* Botones de la derecha */}
          <div className="ml-auto flex flex-shrink-0 items-center gap-1 sm:gap-2 md:gap-2 lg:gap-3">
            {/* Language dropdown */}
            <LanguageDropdown 
              value={i18n.language} 
              onChange={cambiarIdioma} 
            />

            {/* Cart button - oculto en móvil */}
            <Link 
              to="/cart" 
              className="hidden md:flex bg-white border border-gray-300 rounded-full px-2 py-1.5 items-center gap-1 transition-all hover:shadow-sm hover:border-gray-400 h-8 sm:h-9 md:h-10 no-underline md:gap-2 md:px-3 lg:px-4 relative" 
              aria-label="Carrito"
            >
              <img
                src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/carrito_idlvij.svg"
                alt="Carrito"
                className="h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5 object-contain flex-shrink-0"
              />
              <span className="hidden lg:inline font-semibold text-gray-800 text-xs lg:text-sm whitespace-nowrap">{t('nav.cart')}</span>
              
              {/* Badge con contador de items */}
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Profile button - oculto en móvil */}
            <button
              className="hidden md:flex bg-white border border-gray-300 rounded-full px-2 py-1.5 items-center gap-1 transition-all hover:shadow-sm hover:border-gray-400 h-8 sm:h-9 md:h-10 md:gap-2 md:px-3 lg:px-4"
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