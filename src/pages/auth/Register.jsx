import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ecommerceFacade from '../../patterns/EcommerceFacade';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { t } = useTranslation();
  const navegar = useNavigate();
  const { iniciarSesion } = useAuth();
  
  const [datosFormulario, setDatosFormulario] = useState({
    cedula: '',
    nombre: '',
    apellidos: '',
    email: '',
    genero: 'Unisex',
    telefono: '',
    password: '',
    confirmPassword: ''
  });
  
  const [datosDireccion, setDatosDireccion] = useState({
    provincia: '',
    canton: '',
    distrito: '',
    barrio: '',
    senas: '',
    codigoPostal: '',
    referencia: ''
  });
  
  const [cargando, setCargando] = useState(false);
  const [cargandoCedula, setCargandoCedula] = useState(false);
  const [errores, setErrores] = useState({});
  const [cedulaValidada, setCedulaValidada] = useState(false);
  const [agregarDireccion, setAgregarDireccion] = useState(false);
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

  // Función para validar formato de cédula costarricense
  const validarFormatoCedula = (cedula) => {
    // Debe tener exactamente 9 dígitos (sin guiones)
    const cleaned = cedula.replace(/\D/g, '');
    return cleaned.length === 9;
  };

  // Función para formatear cédula mientras el usuario escribe
  const formatCedula = (value) => {
    const limpia = value.replace(/\D/g, '');
    
    if (limpia.length <= 1) {
      return limpia;
    } else if (limpia.length <= 5) {
      return `${limpia.slice(0, 1)}-${limpia.slice(1)}`;
    } else {
      return `${limpia.slice(0, 1)}-${limpia.slice(1, 5)}-${limpia.slice(5, 9)}`;
    }
  };

  const consultarDatosCedula = async (cedula) => {
    setCargandoCedula(true);
    
    try {
      const cedulaLimpia = cedula.replace(/\D/g, '');
      
      const datos = await ecommerceFacade.consultarCedula(cedulaLimpia);
      
      if (!datos || !datos.valida) {
        throw new Error(t('error.register.cedulaNotFound'));
      }
      
      setDatosFormulario(prev => ({
        ...prev,
        nombre: datos.nombre || '',
        apellidos: datos.apellidos || ''
      }));
      
      setCedulaValidada(true);
      await Swal.fire({
        icon: 'success',
        title: t('success.cedula.title'),
        text: t('success.cedula.message'),
        confirmButtonColor: '#2563eb',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (error) {
      console.error('Error consultando cédula:', error);
      await Swal.fire({
        icon: 'error',
        title: t('error.register.cedulaNotFoundTitle'),
        text: error.message || t('error.register.cedulaNotFound'),
        confirmButtonColor: '#2563eb',
        confirmButtonText: t('button.understood')
      });
      setCedulaValidada(false);
    } finally {
      setCargandoCedula(false);
    }
  };

  const manejarCambioCedula = (e) => {
    const cedulaFormateada = formatCedula(e.target.value);
    
    setDatosFormulario(prev => ({
      ...prev,
      cedula: cedulaFormateada
    }));
    
    if (cedulaValidada) {
      setCedulaValidada(false);
      setDatosFormulario(prev => ({
        ...prev,
        nombre: '',
        apellidos: ''
      }));
    }
    
    if (validarFormatoCedula(cedulaFormateada)) {
      consultarDatosCedula(cedulaFormateada);
    }
  };

  const validateForm = () => {
    const nuevosErrores = {};
    
    if (!datosFormulario.cedula) {
      nuevosErrores.cedula = t('auth.cedulaRequired');
    } else if (!validarFormatoCedula(datosFormulario.cedula)) {
      nuevosErrores.cedula = t('auth.cedulaInvalidFormat');
    }
    
    if (!datosFormulario.nombre) {
      nuevosErrores.nombre = t('auth.nameRequired');
    }
    
    if (!datosFormulario.apellidos) {
      nuevosErrores.apellidos = t('auth.lastNameRequired');
    }
    
    if (!datosFormulario.email) {
      nuevosErrores.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(datosFormulario.email)) {
      nuevosErrores.email = t('auth.emailInvalid');
    }
    
    if (!datosFormulario.genero) {
      nuevosErrores.genero = t('auth.genderRequired');
    }
    
    if (!datosFormulario.telefono) {
      nuevosErrores.telefono = t('auth.phoneRequired');
    } else if (!/^\d{4}-\d{4}$/.test(datosFormulario.telefono)) {
      nuevosErrores.telefono = t('auth.phoneInvalidFormat');
    }
    
    if (!datosFormulario.password) {
      nuevosErrores.password = t('auth.passwordRequired');
    } else if (datosFormulario.password.length < 6) {
      nuevosErrores.password = t('auth.passwordMinLength');
    }
    
    if (!datosFormulario.confirmPassword) {
      nuevosErrores.confirmPassword = t('auth.confirmPasswordRequired');
    } else if (datosFormulario.password !== datosFormulario.confirmPassword) {
      nuevosErrores.confirmPassword = t('auth.passwordMismatch');
      // Mostrar alerta inmediatamente si las contraseñas no coinciden
      Swal.fire({
        icon: 'error',
        title: t('error.register.passwordMismatchTitle'),
        text: t('error.register.passwordMismatch'),
        confirmButtonColor: '#2563eb',
        confirmButtonText: t('button.understood')
      });
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefono') {
      const limpia = value.replace(/\D/g, '');
      const formateado = limpia.length <= 4 ? limpia : `${limpia.slice(0, 4)}-${limpia.slice(4, 8)}`;
      setDatosFormulario(prev => ({
        ...prev,
        [name]: formateado
      }));
    } else {
      setDatosFormulario(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDireccionChange = (e) => {
    const { name, value } = e.target;
    setDatosDireccion(prev => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setCargando(true);
    
    try {
      const cedulaLimpia = datosFormulario.cedula.replace(/\D/g, '');
      const telefonoLimpio = datosFormulario.telefono.replace(/\D/g, '');
      
      const datosRegistro = {
        cedula: cedulaLimpia,
        nombre: datosFormulario.nombre,
        apellido: datosFormulario.apellidos,
        email: datosFormulario.email,
        genero: datosFormulario.genero,
        telefono: telefonoLimpio,
        contrasena: datosFormulario.password
      };

      // Agregar dirección solo si el usuario marcó el checkbox
      if (agregarDireccion) {
        datosRegistro.direccion = datosDireccion;
      }
      
      await ecommerceFacade.registerUser(datosRegistro);
      
      await Swal.fire({
        icon: 'success',
        title: t('success.register.title'),
        text: t('success.register.message'),
        confirmButtonColor: '#2563eb',
        confirmButtonText: t('success.register.button')
      });
      
      navegar('/auth/login');
      
    } catch (error) {
      console.error('Error en registro:', error);
      
      let mensajeError = t('error.register.title');
      let tituloError = t('error.register.title');
      let iconoError = 'error';
      
      // Verificar el código de error del backend
      const codigoError = error.response?.data?.codigo;
      
      if (codigoError === 'CEDULA_DUPLICADA') {
        tituloError = t('error.register.cedulaDuplicateTitle');
        mensajeError = error.response.data.error || t('error.register.cedulaDuplicate');
        iconoError = 'warning';
      } else if (codigoError === 'EMAIL_DUPLICADO') {
        tituloError = t('error.register.emailDuplicateTitle');
        mensajeError = error.response.data.error || t('error.register.emailDuplicate');
        iconoError = 'warning';
      } else if (codigoError === 'CEDULA_INVALIDA') {
        tituloError = t('error.register.cedulaInvalidTitle');
        mensajeError = error.response.data.error || t('error.register.cedulaInvalid');
        iconoError = 'error';
      } else if (error.response?.data?.error) {
        mensajeError = error.response.data.error;
      } else if (error.message) {
        mensajeError = error.message;
      } else if (error.response?.status === 409) {
        tituloError = t('error.register.title');
        mensajeError = t('error.register.emailDuplicate');
        iconoError = 'warning';
      }
      
      await Swal.fire({
        icon: iconoError,
        title: tituloError,
        text: mensajeError,
        confirmButtonColor: '#2563eb',
        confirmButtonText: t('error.register.tryAgain')
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
        <div className="flex-grow flex flex-col justify-center w-full max-w-2xl mx-auto py-4">
          <div className="flex justify-center mb-4">
            <img
              src="https://res.cloudinary.com/drec8g03e/image/upload/v1762655746/jyjessence_y75wqc.webp"
              alt="JyJ Essence Logo"
              className="h-28 w-28 object-contain"
            />
          </div>
          <h1 className="font-['Lato',sans-serif] font-black text-2xl sm:text-3xl text-gray-800 text-center mb-6">
            {t('auth.registerTitle')}
          </h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="cedula" className="block mb-1 font-bold text-gray-700 text-sm">
                  {t('auth.cedula')} *
                  {cedulaValidada && (
                    <span className="ml-2 text-green-600 text-xs">
                      ✓ {t('auth.cedulaValidated')}
                    </span>
                  )}
                </label>
                <input
                  id="cedula"
                  name="cedula"
                  type="text"
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errores.cedula ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="X-XXXX-XXXX"
                  value={datosFormulario.cedula}
                  onChange={manejarCambioCedula}
                  maxLength={11}
                />
                {errores.cedula && <p className="mt-1 text-xs text-red-600">{errores.cedula}</p>}
              </div>
              <div>
                <label htmlFor="nombre" className="block mb-1 font-bold text-gray-700 text-sm">
                  {t('auth.name')} *
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  disabled={cedulaValidada}
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    cedulaValidada ? 'opacity-60' : ''
                  } ${errores.nombre ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder={t('auth.name')}
                  value={datosFormulario.nombre}
                  onChange={handleChange}
                />
                {errores.nombre && <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>}
              </div>
              <div>
                <label htmlFor="apellidos" className="block mb-1 font-bold text-gray-700 text-sm">
                  {t('auth.lastName')} *
                </label>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  required
                  disabled={cedulaValidada}
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    cedulaValidada ? 'opacity-60' : ''
                  } ${errores.apellidos ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder={t('auth.lastName')}
                  value={datosFormulario.apellidos}
                  onChange={handleChange}
                />
                {errores.apellidos && <p className="mt-1 text-xs text-red-600">{errores.apellidos}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block mb-1 font-bold text-gray-700 text-sm">
                  {t('auth.email')} *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errores.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={t('auth.email')}
                  value={datosFormulario.email}
                  onChange={handleChange}
                />
                {errores.email && <p className="mt-1 text-xs text-red-600">{errores.email}</p>}
              </div>
              <div>
                <label htmlFor="genero" className="block mb-1 font-bold text-gray-700 text-sm">
                  {t('auth.gender')} *
                </label>
                <select
                  id="genero"
                  name="genero"
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errores.genero ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={datosFormulario.genero}
                  onChange={handleChange}
                >
                  <option value="Male">{t('auth.male')}</option>
                  <option value="Female">{t('auth.female')}</option>
                  <option value="Unisex">{t('auth.other')}</option>
                </select>
                {errores.genero && <p className="mt-1 text-xs text-red-600">{errores.genero}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="telefono" className="block mb-1 font-bold text-gray-700 text-sm">
                  {t('auth.phone')} *
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errores.telefono ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="XXXX-XXXX"
                  value={datosFormulario.telefono}
                  onChange={handleChange}
                  maxLength={9}
                />
                {errores.telefono && <p className="mt-1 text-xs text-red-600">{errores.telefono}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agregarDireccion}
                    onChange={(e) => setAgregarDireccion(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm font-medium">
                    {t('address.addAddress')}
                  </span>
                </label>
              </div>
              {agregarDireccion && (
                <>
                  <div>
                    <label htmlFor="provincia" className="block mb-1 font-bold text-gray-700 text-sm">
                      {t('address.province')} *
                    </label>
                    <input
                      id="provincia"
                      name="provincia"
                      type="text"
                      required={agregarDireccion}
                      className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errores.provincia ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={t('address.provincePlaceholder')}
                      value={datosDireccion.provincia}
                      onChange={handleDireccionChange}
                    />
                    {errores.provincia && <p className="mt-1 text-xs text-red-600">{errores.provincia}</p>}
                  </div>
                  <div>
                    <label htmlFor="canton" className="block mb-1 font-bold text-gray-700 text-sm">
                      {t('address.canton')} *
                    </label>
                    <input
                      id="canton"
                      name="canton"
                      type="text"
                      required={agregarDireccion}
                      className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errores.canton ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={t('address.cantonPlaceholder')}
                      value={datosDireccion.canton}
                      onChange={handleDireccionChange}
                    />
                    {errores.canton && <p className="mt-1 text-xs text-red-600">{errores.canton}</p>}
                  </div>
                  <div>
                    <label htmlFor="distrito" className="block mb-1 font-bold text-gray-700 text-sm">
                      {t('address.district')} *
                    </label>
                    <input
                      id="distrito"
                      name="distrito"
                      type="text"
                      required={agregarDireccion}
                      className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errores.distrito ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={t('address.districtPlaceholder')}
                      value={datosDireccion.distrito}
                      onChange={handleDireccionChange}
                    />
                    {errores.distrito && <p className="mt-1 text-xs text-red-600">{errores.distrito}</p>}
                  </div>
                  <div>
                    <label htmlFor="barrio" className="block mb-1 font-bold text-gray-700 text-sm">
                      {t('address.neighborhood')}
                    </label>
                    <input
                      id="barrio"
                      name="barrio"
                      type="text"
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder={t('address.neighborhoodPlaceholder')}
                      value={datosDireccion.barrio}
                      onChange={handleDireccionChange}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="senas" className="block mb-1 font-bold text-gray-700 text-sm">
                      {t('address.directions')} *
                    </label>
                    <textarea
                      id="senas"
                      name="senas"
                      rows={2}
                      required={agregarDireccion}
                      className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        errores.senas ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={t('address.directionsPlaceholder')}
                      value={datosDireccion.senas}
                      onChange={handleDireccionChange}
                    />
                    {errores.senas && <p className="mt-1 text-xs text-red-600">{errores.senas}</p>}
                  </div>
                  <div>
                    <label htmlFor="codigoPostal" className="block mb-1 font-bold text-gray-700 text-sm">
                      {t('address.postalCode')}
                    </label>
                    <input
                      id="codigoPostal"
                      name="codigoPostal"
                      type="text"
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder={t('address.postalCodePlaceholder')}
                      value={datosDireccion.codigoPostal}
                      onChange={handleDireccionChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="referencia" className="block mb-1 font-bold text-gray-700 text-sm">
                      {t('address.reference')}
                    </label>
                    <input
                      id="referencia"
                      name="referencia"
                      type="text"
                      className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder={t('address.referencePlaceholder')}
                      value={datosDireccion.referencia}
                      onChange={handleDireccionChange}
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="password" className="block mb-1 font-bold text-gray-700 text-sm">
                  {t('auth.password')} *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errores.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={t('auth.password')}
                  value={datosFormulario.password}
                  onChange={handleChange}
                />
                {errores.password && <p className="mt-1 text-xs text-red-600">{errores.password}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block mb-1 font-bold text-gray-700 text-sm">
                  {t('auth.confirmPassword')} *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                    errores.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={t('auth.confirmPassword')}
                  value={datosFormulario.confirmPassword}
                  onChange={handleChange}
                />
                {errores.confirmPassword && <p className="mt-1 text-xs text-red-600">{errores.confirmPassword}</p>}
              </div>
            </div>
            <button
              type="submit"
              disabled={cargando || !cedulaValidada}
              className="w-full py-3 px-4 rounded-lg border-none bg-blue-600 text-white text-base sm:text-lg font-bold cursor-pointer transition-colors shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
            >
              {cargando ? t('common.loading') : t('auth.register')}
            </button>
          </form>
          <div className="text-center mt-6 text-gray-700 text-sm">
            <span>
              {t('auth.hasAccount')}{' '}
              <button
                onClick={() => navegar('/auth/login')}
                className="text-blue-600 font-bold hover:underline"
              >
                {t('auth.login')}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;