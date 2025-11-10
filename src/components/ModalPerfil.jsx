import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Swal from 'sweetalert2';

const ModalPerfil = ({ onClose, estaAutenticado, usuario: usuarioProp, navegar, t }) => {
  // Detectar si no está en la página principal
  const location = window.location.pathname;
  const noEsHome = location !== '/' && location !== '/home';
  const { cerrarSesion } = useAuth();
  const [usuario, setUsuario] = useState(usuarioProp || null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccionEdit, setDireccionEdit] = useState('');
  const [selectedDireccion, setSelectedDireccion] = useState('');
  const [password, setPassword] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    if (estaAutenticado) {
      setLoading(true);
      authService.getProfile()
        .then((data) => {
          setUsuario(data);
          setEmail(data.email || '');
          setTelefono(data.telefono || '');
          if (data.direcciones && Array.isArray(data.direcciones) && data.direcciones.length > 0) {
            setSelectedDireccion(data.direcciones[0].idDireccion);
            setDireccionEdit(data.direcciones[0].senas || '');
          }
        })
        .catch(() => {
          Swal.fire('Error', 'No se pudo cargar el perfil', 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [estaAutenticado]);

  // Focus trap - mantener el foco dentro del modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Si Shift+Tab en el primer elemento, ir al último
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Si Tab en el último elemento, ir al primero
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }

      // Cerrar modal con Escape
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Enfocar el primer elemento al abrir el modal
    const firstFocusable = modalRef.current?.querySelector('button');
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const manejarCierreSesion = () => {
    cerrarSesion();
    onClose();
    navegar('/');
  };

  const irALogin = () => {
    navegar('/auth/login');
    onClose();
  };

  const irARegistro = () => {
    navegar('/auth/register');
    onClose();
  };

  // Actualizar email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await authService.updateProfile({ email });
      setUsuario(updated);
      Swal.fire('Éxito', 'Correo actualizado', 'success');
    } catch {
      Swal.fire('Error', 'No se pudo actualizar el correo', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar teléfono
  const handleTelefonoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await authService.updateProfile({ telefono });
      setUsuario(updated);
      Swal.fire('Éxito', 'Teléfono actualizado', 'success');
    } catch {
      Swal.fire('Error', 'No se pudo actualizar el teléfono', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar dirección
  const handleDireccionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Solo actualiza la dirección seleccionada
      const direcciones = usuario?.direcciones || [];
      const direccionObj = direcciones.find(d => d.idDireccion === selectedDireccion);
      const nuevaDireccion = { ...direccionObj, senas: direccionEdit };
      // Enviar solo la dirección editada
      const updated = await authService.updateProfile({ direccion: nuevaDireccion });
      setUsuario(updated);
      Swal.fire('Éxito', 'Dirección actualizada', 'success');
    } catch {
      Swal.fire('Error', 'No se pudo actualizar la dirección', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await authService.updateProfile({ contrasena: password });
      setUsuario(updated);
      setPassword('');
      Swal.fire('Éxito', 'Contraseña actualizada', 'success');
    } catch {
      Swal.fire('Error', 'No se pudo actualizar la contraseña', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[2000] font-['Lato',sans-serif]"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-[500px] bg-[#F9F6F2] rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center px-5 py-4 gap-4 justify-between">
          <h1 className="text-2xl font-bold text-gray-800 m-0">
            {t('nav.myAccount') || 'Mi Cuenta'}
          </h1>
          <button
            onClick={onClose}
            className="bg-none border-none cursor-pointer p-2 text-gray-500 flex items-center justify-center transition-all hover:bg-gray-200 rounded-full"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <main className="px-5 pb-5 flex flex-col gap-4">
          {noEsHome && (
            <button
              onClick={() => { navegar('/'); onClose(); }}
              className="flex items-center w-full p-3 bg-none border-none text-left rounded-lg cursor-pointer transition-colors hover:bg-gray-200"
            >
              <div className="flex items-center gap-4 text-base text-gray-800">
                <img
                  src="https://res.cloudinary.com/drec8g03e/image/upload/v1762713857/inicio_x1zmf8.svg"
                  alt="Inicio"
                  className="w-6 h-6"
                />
                <span>Inicio</span>
              </div>
            </button>
          )}
          {!estaAutenticado ? (
            <>
              <button
                onClick={irALogin}
                className="flex items-center w-full p-3 bg-none border-none text-left rounded-lg cursor-pointer transition-colors hover:bg-gray-200"
              >
                <div className="flex items-center gap-4 text-base text-gray-800">
                  <img
                    src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/account_r3kxej.svg"
                    alt=""
                    className="w-6 h-6"
                  />
                  <span>{t('nav.login') || 'Iniciar Sesión'}</span>
                </div>
              </button>

              <button
                onClick={irARegistro}
                className="flex items-center w-full p-3 bg-none border-none text-left rounded-lg cursor-pointer transition-colors hover:bg-gray-200"
              >
                <div className="flex items-center gap-4 text-base text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                  </svg>
                  <span>{t('nav.register') || 'Crear Cuenta'}</span>
                </div>
              </button>

              <h2 className="text-base font-semibold text-gray-600 m-0 mb-2.5 uppercase px-2.5">
                {t('profile.general') || 'General'}
              </h2>
            </>
          ) : (
            <>
              <div className="border-t border-gray-300 pt-4 flex flex-col gap-6">
                <button
                  onClick={() => { navegar('/account/mi-informacion'); onClose(); }}
                  className="flex items-center w-full p-3 bg-none border-none text-left rounded-lg cursor-pointer transition-colors hover:bg-gray-200"
                >
                  <div className="flex items-center gap-4 text-base text-gray-800">
                    <img
                      src="https://res.cloudinary.com/drec8g03e/image/upload/v1762674408/account_r3kxej.svg"
                      alt="Perfil"
                      className="w-6 h-6"
                    />
                    <span>Mi Información</span>
                  </div>
                </button>

                <button
                  onClick={manejarCierreSesion}
                  className="flex items-center w-full p-3 bg-none border-none text-left rounded-lg cursor-pointer transition-colors hover:bg-gray-200"
                >
                  <div className="flex items-center gap-4 text-base text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>{t('nav.logout') || 'Cerrar Sesión'}</span>
                  </div>
                </button>

                <h2 className="text-base font-semibold text-gray-600 m-0 mb-2.5 uppercase px-2.5 mt-4">
                  {t('profile.general') || 'General'}
                </h2>
                <button
                  onClick={() => { navegar('/orders'); onClose(); }}
                  className="flex items-center w-full p-3 bg-none border-none text-left rounded-lg cursor-pointer transition-colors hover:bg-gray-200"
                >
                  <div className="flex items-center gap-4 text-base text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    <span>{t('nav.orders') || 'Mis Pedidos'}</span>
                  </div>
                </button>
              </div>

              {usuario?.rol === 'ADMIN' && (
                <div className="border-t border-gray-300 pt-4">
                  <button
                    onClick={() => { navegar('/admin'); onClose(); }}
                    className="flex items-center justify-between w-full p-3 bg-none border-none text-left rounded-lg cursor-pointer transition-colors hover:bg-gray-200"
                  >
                    <div className="flex items-center gap-4 text-base text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span>{t('nav.admin') || 'Administración'}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ModalPerfil;
