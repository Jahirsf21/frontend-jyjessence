import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import ModalPerfil from '../ModalPerfil';
import { useAuth } from '../../context/AuthContext';
import { useSearchPanel } from '../../context/SearchPanelContext';
import { useTranslation } from 'react-i18next';
import Ecommerce from '../../patterns/EcommerceFacade';
import guestCartService from '../../services/guestCartService';

export default function ButtonNav(props) {
  const { openSearch } = useSearchPanel();
  const navigate = useNavigate();
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const { usuario, estaAutenticado } = useAuth();
  const { t } = useTranslation();
  const [cartItemCount, setCartItemCount] = useState(0);

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

    // Escuchar cambios en el carrito
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [estaAutenticado]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-50 md:hidden">
      <button onClick={() => navigate('/')}
        className="flex flex-col items-center justify-center transition-colors hover:bg-gray-100 rounded-full w-14 h-14 mb-1">
        <img
          src="https://res.cloudinary.com/drec8g03e/image/upload/v1762713857/inicio_x1zmf8.svg"
          alt={t('nav.home', { defaultValue: 'Inicio' })}
          className="h-6 w-6 mb-1"
        />
        <div className="text-xs">{t('nav.home', { defaultValue: 'Inicio' })}</div>
      </button>
      <button 
        className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors"
        onClick={() => {
          openSearch();
        }}
      >
        <img
          src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/search_mntlda.svg"
          alt={t('nav.search', { defaultValue: 'Buscar' })}
          className="h-6 w-6 mb-1"
        />
        <span className="text-xs mt-1">{t('nav.search', { defaultValue: 'Buscar' })}</span>
      </button>
      <button onClick={() => navigate('/cart')} className="bg-[#2563eb] rounded-full p-3 -mt-8 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg w-16 h-16 relative">
        <img
          src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/carrito_idlvij.svg"
          alt={t('nav.cart', { defaultValue: 'Carrito' })}
          className="h-6 w-6"
          style={{ filter: 'invert(1)' }}
        />
        
        {/* Badge con contador de items */}
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
      </button>
      <button onClick={() => navigate('/orders')} className="flex flex-col items-center justify-center transition-colors hover:bg-gray-100 rounded-full w-14 h-14 mb-1">
        <img
          src="https://res.cloudinary.com/drec8g03e/image/upload/v1762986237/pedidos_xdpj84.svg"
          alt={t('orders', { defaultValue: 'Pedidos' })}
          className="h-6 w-6 mb-1"
        />
        <div className="text-xs">{t('orders', { defaultValue: 'Pedidos' })}</div>
      </button>
      <button onClick={() => setMostrarModalPerfil(true)} className="flex flex-col items-center justify-center transition-colors hover:bg-gray-100 rounded-full w-14 h-14 mb-1">
        <img
          src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/account_r3kxej.svg"
          alt={t('profile', { defaultValue: 'Perfil' })}
          className="h-6 w-6 mb-1"
        />
        <div className="text-xs">{t('profile', { defaultValue: 'Perfil' })}</div>
      </button>
      {mostrarModalPerfil && (
        <ModalPerfil
          onClose={() => setMostrarModalPerfil(false)}
          estaAutenticado={estaAutenticado}
          usuario={usuario}
          navegar={navigate}
          t={t}
        />
      )}
    </div>
  );
}