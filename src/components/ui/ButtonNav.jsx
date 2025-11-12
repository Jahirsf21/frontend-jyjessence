
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import ModalPerfil from '../ModalPerfil';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const navigate = useNavigate();
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const { usuario, estaAutenticado } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg flex justify-around items-center h-16 rounded-t-2xl z-50 md:hidden">
        <button onClick={() => navigate('/')}
          className="flex flex-col items-center justify-center transition-colors hover:bg-gray-100 rounded-full w-14 h-14 mb-1">
          <img
            src="https://res.cloudinary.com/drec8g03e/image/upload/v1762713857/inicio_x1zmf8.svg"
            alt="Inicio"
            className="h-6 w-6 mb-1"
          />
          <div className="text-xs">Inicio</div>
        </button>
        <button onClick={() => navigate('/search')} className="flex flex-col items-center justify-center transition-colors hover:bg-gray-100 rounded-full w-14 h-14 mb-1">
          <img
            src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/search_mntlda.svg"
            alt="Buscar"
            className="h-6 w-6 mb-1"
          />
          <div className="text-xs">Buscar</div>
        </button>
        <button onClick={() => navigate('/cart')} className="bg-[#2563eb] rounded-full p-3 -mt-8 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg w-16 h-16">
          <img
            src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/carrito_idlvij.svg"
            alt="Carrito"
            className="h-6 w-6"
            style={{ filter: 'invert(1)' }}
          />
        </button>
        <button onClick={() => navigate('/orders')} className="flex flex-col items-center justify-center transition-colors hover:bg-gray-100 rounded-full w-14 h-14 mb-1">
          <img
            src="https://res.cloudinary.com/drec8g03e/image/upload/v1762986237/pedidos_xdpj84.svg"
            alt="Pedidos"
            className="h-6 w-6 mb-1"
          />
          <div className="text-xs">Pedidos</div>
        </button>
        <button onClick={() => setMostrarModalPerfil(true)} className="flex flex-col items-center justify-center transition-colors hover:bg-gray-100 rounded-full w-14 h-14 mb-1">
          <img
            src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/account_r3kxej.svg"
            alt="Perfil"
            className="h-6 w-6 mb-1"
          />
          <div className="text-xs">Mi perfil</div>
        </button>
      </nav>
      {mostrarModalPerfil && (
        <ModalPerfil
          onClose={() => setMostrarModalPerfil(false)}
          estaAutenticado={estaAutenticado}
          usuario={usuario}
          navegar={navigate}
          t={t}
        />
      )}
    </>
  );
}