import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Swal from 'sweetalert2';
import Button from './ui/Button.jsx';
import { useDarkMode } from '../context/DarkModeContext';

const ModalPerfil = ({ onClose, estaAutenticado, usuario: usuarioProp, navegar, t }) => {

  const location = window.location.pathname;
  const noEsHome = location !== '/' && location !== '/home';
  const { cerrarSesion } = useAuth();
  const { isDarkMode } = useDarkMode();
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
          Swal.fire(t('swal.error'), t('swal.profileLoadError'), 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [estaAutenticado]);


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
       
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
   
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }


      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    

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


  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await authService.updateProfile({ email });
      setUsuario(updated);
      Swal.fire(t('swal.success'), t('swal.emailUpdated'), 'success');
    } catch {
      Swal.fire(t('swal.error'), t('swal.emailUpdateError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTelefonoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await authService.updateProfile({ telefono });
      setUsuario(updated);
      Swal.fire(t('swal.success'), t('swal.phoneUpdated'), 'success');
    } catch {
      Swal.fire(t('swal.error'), t('swal.phoneUpdateError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  
  const handleDireccionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      
      const direcciones = usuario?.direcciones || [];
      const direccionObj = direcciones.find(d => d.idDireccion === selectedDireccion);
      const nuevaDireccion = { ...direccionObj, senas: direccionEdit };
      
      const updated = await authService.updateProfile({ direccion: nuevaDireccion });
      setUsuario(updated);
      Swal.fire(t('swal.success'), t('swal.addressUpdated'), 'success');
    } catch {
      Swal.fire(t('swal.error'), t('swal.addressUpdateError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await authService.updateProfile({ contrasena: password });
      setUsuario(updated);
      setPassword('');
      Swal.fire(t('swal.success'), t('swal.passwordUpdated'), 'success');
    } catch {
      Swal.fire(t('swal.error'), t('swal.passwordUpdateError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] font-['Lato',sans-serif] transition-colors duration-200"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-900/50 flex flex-col transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center px-5 py-4 gap-4 justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 m-0 transition-colors duration-200">
            {t('profile', { defaultValue: 'Perfil' })}
          </h1>
          <button
            onClick={onClose}
            className="bg-none border-none cursor-pointer p-2 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-all hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
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
            <Button
              onClick={() => { navegar('/'); onClose(); }}
              variant="light"
              block
              className="flex items-center justify-start gap-4 !py-3"
            >
              <img
                src={isDarkMode ? "https://res.cloudinary.com/drec8g03e/image/upload/v1763528569/home-modo-oscuro_m2aygh.svg" : "https://res.cloudinary.com/drec8g03e/image/upload/v1763528569/home_xudymm.svg"}
                alt={t('home.button')}
                className="w-6 h-6"
              />
              <span>{t('home.button')}</span>
            </Button>
          )}
          {!estaAutenticado ? (
            <>
              <Button
                onClick={irALogin}
                variant="light"
                block
                className="flex items-center justify-start gap-4 !py-3"
              >
                <img
                  src={isDarkMode ? "https://res.cloudinary.com/drec8g03e/image/upload/v1763528571/usuario-modo-oscuro_dhn30k.svg" : "https://res.cloudinary.com/drec8g03e/image/upload/v1763528571/usuario_gfurqs.svg"}
                  alt=""
                  className="w-6 h-6"
                />
                <span>{t('nav.login') || 'Iniciar Sesión'}</span>
              </Button>

              <Button
                onClick={irARegistro}
                variant="light"
                block
                className="flex items-center justify-start gap-4 !py-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                <span>{t('nav.register') || 'Crear Cuenta'}</span>
              </Button>

              <h2 className="text-base font-semibold text-gray-600 dark:text-gray-400 m-0 mb-2.5 uppercase px-2.5 transition-colors duration-200">
                {t('profile.general') || 'General'}
              </h2>
              <Button
                onClick={() => { navegar('/accessibility'); onClose(); }}
                variant="light"
                block
                className="flex items-center justify-start gap-4 !py-3"
              >
                <img
                  src={isDarkMode ? "https://res.cloudinary.com/drec8g03e/image/upload/v1763528964/accesibilidad-modo-oscuro_x2u1hf.svg" : "https://res.cloudinary.com/drec8g03e/image/upload/v1763528964/accesibilidad_tlcoco.svg"}
                  alt="Accesibilidad"
                  className="w-6 h-6"
                />
                <span>{t('accessibility', { defaultValue: 'Accesibilidad' })}</span>
              </Button>
            </>
          ) : (
            <>
              <div className="border-t border-gray-300 dark:border-gray-700 pt-4 flex flex-col gap-6 transition-colors duration-200">
                <Button
                  onClick={() => { navegar('/account/mi-informacion'); onClose(); }}
                  variant="light"
                  block
                  className="flex items-center justify-start gap-4 !py-3"
                >
                  <img
                    src={isDarkMode ? "https://res.cloudinary.com/drec8g03e/image/upload/v1763528571/usuario-modo-oscuro_dhn30k.svg" : "https://res.cloudinary.com/drec8g03e/image/upload/v1763528571/usuario_gfurqs.svg"}
                    alt="Perfil"
                    className="w-6 h-6"
                  />
                  <span>{t('profile', { defaultValue: 'Perfil' })}</span>
                </Button>

                <Button
                  onClick={manejarCierreSesion}
                  variant="light"
                  block
                  className="flex items-center justify-start gap-4 !py-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>{t('nav.logout') || 'Cerrar Sesión'}</span>
                </Button>

                <h2 className="text-base font-semibold text-gray-600 m-0 mb-2.5 uppercase px-2.5 mt-4">
                  {t('profile.general') || 'General'}
                </h2>
                <Button
                  onClick={() => { navegar('/orders'); onClose(); }}
                  variant="light"
                  block
                  className="flex items-center justify-start gap-4 !py-3"
                >
                  <img
                    src={isDarkMode ? "https://res.cloudinary.com/drec8g03e/image/upload/v1763529006/pedidos-modo-oscuro_y11hne.svg" : "https://res.cloudinary.com/drec8g03e/image/upload/v1763529006/pedidos_zwfp2i.svg"}
                    alt="Pedidos"
                    className="w-6 h-6"
                  />
                  <span>{t('orders')}</span>
                </Button>

                <Button
                  onClick={() => { navegar('/accessibility'); onClose(); }}
                  variant="light"
                  block
                  className="flex items-center justify-start gap-4 !py-3"
                >
                  <img
                    src={isDarkMode ? "https://res.cloudinary.com/drec8g03e/image/upload/v1763528964/accesibilidad-modo-oscuro_x2u1hf.svg" : "https://res.cloudinary.com/drec8g03e/image/upload/v1763528964/accesibilidad_tlcoco.svg"}
                    alt="Accesibilidad"
                    className="w-6 h-6"
                  />
                  <span>{t('accessibility', { defaultValue: 'Accesibilidad' })}</span>
                </Button>
              </div>

              {(usuario?.rol === 'ADMIN' || usuario?.role === 'ADMIN') && (
                <div className="border-t border-gray-300 dark:border-gray-700 pt-4 transition-colors duration-200">
                  <Button
                    onClick={() => { navegar('/admin'); onClose(); }}
                    variant="light"
                    block
                    className="flex items-center gap-4 !py-3 justify-start"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>{t('nav.admin') || 'Administración'}</span>
                  </Button>
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
