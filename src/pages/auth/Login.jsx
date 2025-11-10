import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { t } = useTranslation();
  const navegar = useNavigate();
  const { iniciarSesion } = useAuth();
  
  const [datosFormulario, setDatosFormulario] = useState({
    email: '',
    password: ''
  });
  
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});
  const [indiceCarrusel, setIndiceCarrusel] = useState(0);
  
  const imagenesCarrusel = [
    {
      url: 'https://res.cloudinary.com/drec8g03e/image/upload/v1762667317/perfumes_hrhw7k.jpg',
      texto: 'Descubre tu esencia perfecta'
    },
    {
      url: 'https://res.cloudinary.com/drec8g03e/image/upload/v1762667317/perfumes1_qccydw.jpg',
      texto: 'Fragancias exclusivas para ti'
    },
    {
      url: 'https://res.cloudinary.com/drec8g03e/image/upload/v1762667317/perfumes2_g64pal.jpg',
      texto: 'Elegancia en cada gota'
    }
  ];

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceCarrusel((prevIndice) => (prevIndice + 1) % imagenesCarrusel.length);
    }, 5000);
    
    return () => clearInterval(intervalo);
  }, []);

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!datosFormulario.email) {
      nuevosErrores.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(datosFormulario.email)) {
      nuevosErrores.email = t('auth.emailInvalid');
    }
    
    if (!datosFormulario.password) {
      nuevosErrores.password = t('auth.passwordRequired');
    } else if (datosFormulario.password.length < 6) {
      nuevosErrores.password = t('auth.passwordMinLength');
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatosFormulario(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    setCargando(true);
    
    try {
      const datosUsuario = await iniciarSesion(datosFormulario.email, datosFormulario.password);
      
      await Swal.fire({
        icon: 'success',
        title: t('success.login.title'),
        text: t('success.login.message'),
        confirmButtonColor: '#2563eb',
        timer: 2000,
        showConfirmButton: false
      });
      
      if (datosUsuario.role === 'ADMIN') {
        navegar('/admin');
      } else {
        navegar('/');
      }
      
    } catch (error) {
      console.error('Error en login:', error);
      
      let mensajeError = t('error.login.title');
      let tituloError = t('error.login.title');
      let iconoError = 'error';
      
      const codigoError = error.response?.data?.codigo;
      
      if (codigoError === 'EMAIL_NO_ENCONTRADO') {
        tituloError = t('error.login.emailNotFoundTitle');
        mensajeError = error.response.data.error || t('error.login.emailNotFound');
        iconoError = 'warning';
      } else if (codigoError === 'CONTRASENA_INCORRECTA') {
        tituloError = t('error.login.wrongPasswordTitle');
        mensajeError = error.response.data.error || t('error.login.wrongPassword');
        iconoError = 'error';
      } else if (error.response?.data?.error) {
        mensajeError = error.response.data.error;
      } else if (error.message) {
        mensajeError = error.message;
      } else if (error.response?.status === 401) {
        mensajeError = t('message.loginError');
      } else if (error.response?.status === 404) {
        tituloError = t('error.login.emailNotFoundTitle');
        mensajeError = t('error.login.emailNotFound');
        iconoError = 'warning';
      }
      
      await Swal.fire({
        icon: iconoError,
        title: tituloError,
        text: mensajeError,
        confirmButtonColor: '#2563eb',
        confirmButtonText: t('error.login.tryAgain')
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2 font-['Lato',sans-serif] bg-white">
      {/* Carrusel (solo md+) */}
      <div className="relative hidden md:flex items-end p-10 overflow-hidden">
        {imagenesCarrusel.map((imagen, indice) => (
          <img
            key={indice}
            src={imagen.url}
            alt={`Perfume ${indice + 1}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              indice === indiceCarrusel ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="relative z-10">
          <h2 className="font-['Merriweather',serif] font-bold text-4xl text-white mb-4 drop-shadow-lg">
            {imagenesCarrusel[indiceCarrusel].texto}
          </h2>
          <div className="flex gap-3">
            {imagenesCarrusel.map((_, indice) => (
              <span
                key={indice}
                onClick={() => setIndiceCarrusel(indice)}
                className={`w-3.5 h-3.5 rounded-full border-2 border-white cursor-pointer transition-all ${
                  indice === indiceCarrusel ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Columna del formulario */}
      <div className="flex flex-col p-4 sm:p-6 md:p-8 relative">
        <button
          onClick={() => navegar('/')}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Ir a inicio"
        >
          <img
            src="https://res.cloudinary.com/drec8g03e/image/upload/v1762713857/inicio_x1zmf8.svg"
            alt="Inicio"
            className="w-6 h-6"
          />
        </button>
        <div className="flex-grow flex flex-col justify-center w-full max-w-md mx-auto pt-8 md:pt-0">
          <div className="flex justify-center mb-6 md:mb-8">
            <img
              src="https://res.cloudinary.com/drec8g03e/image/upload/v1762655746/jyjessence_y75wqc.webp"
              alt="JyJ Essence Logo"
              className="h-24 w-24 md:h-28 md:w-28 object-contain"
            />
          </div>
          <h1 className="font-['Lato',sans-serif] font-black text-2xl sm:text-3xl md:text-4xl text-gray-800 text-center mb-6 md:mb-10">
            {t('auth.loginTitle')}
          </h1>
          <form className="space-y-5" onSubmit={manejarEnvio}>
            <div className="text-left">
              <label htmlFor="email" className="block mb-2 font-bold text-gray-700 text-sm">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-sm sm:text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errores.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={t('auth.email')}
                value={datosFormulario.email}
                onChange={manejarCambio}
              />
              {errores.email && (
                <p className="mt-1 text-sm text-red-600">{errores.email}</p>
              )}
            </div>
            <div className="text-left">
              <label htmlFor="password" className="block mb-2 font-bold text-gray-700 text-sm">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-sm sm:text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errores.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={t('auth.password')}
                value={datosFormulario.password}
                onChange={manejarCambio}
              />
              {errores.password && (
                <p className="mt-1 text-sm text-red-600">{errores.password}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 px-4 rounded-lg border-none bg-blue-600 text-white text-base sm:text-lg font-bold cursor-pointer transition-colors shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
            >
              {cargando ? t('common.loading') : t('auth.login')}
            </button>
          </form>
          <div className="text-center mt-6 md:mt-8 text-gray-700 text-sm">
            <span>
              {t('auth.noAccount')}{' '}
              <button
                onClick={() => navegar('/auth/register')}
                className="text-blue-600 font-bold hover:underline"
              >
                {t('auth.register')}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;