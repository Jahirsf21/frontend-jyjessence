import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return contexto;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const usuarioActual = authService.getCurrentUser();
    if (usuarioActual && authService.isAuthenticated()) {
      setUsuario(usuarioActual);
    }
    setCargando(false);
  }, []);

  const iniciarSesion = async (email, contrasena) => {
    try {
      const { user: datosUsuario } = await authService.login(email, contrasena);
      setUsuario(datosUsuario);
      return datosUsuario;
    } catch (error) {
      // Extraer el mensaje de error del backend
      const mensaje = error.response?.data?.mensaje || 
                      error.response?.data?.error || 
                      'Credenciales incorrectas. Por favor verifica tu email y contraseña.';
      // Lanzar error con mensaje para que Login.jsx lo maneje con SweetAlert
      const nuevoError = new Error(mensaje);
      nuevoError.response = error.response;
      throw nuevoError;
    }
  };

  const registrar = async (datosUsuario) => {
    try {
      await authService.register(datosUsuario);
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 
                      error.response?.data?.error || 
                      'Error al registrarse. Por favor intenta de nuevo.';
      const nuevoError = new Error(mensaje);
      nuevoError.response = error.response;
      throw nuevoError;
    }
  };

  const cerrarSesion = () => {
    authService.logout();
    setUsuario(null);
  };

  const esAdmin = () => {
    return usuario?.role === 'ADMIN';
  };

  const valor = {
    usuario,
    cargando,
    iniciarSesion,
    registrar,
    cerrarSesion,
    esAdmin,
    estaAutenticado: !!usuario
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
};
