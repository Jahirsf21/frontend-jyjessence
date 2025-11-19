import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useVoiceReader } from '../../hooks/useVoiceReader';
import EcommerceFacade from '../../patterns/EcommerceFacade';
import { useDarkMode } from '../../context/DarkModeContext';

const MiInformacion = () => {
  const { t } = useTranslation();
  const voiceReader = useVoiceReader();
  const { isDarkMode } = useDarkMode();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [direcciones, setDirecciones] = useState([]);
  const [nuevaDireccion, setNuevaDireccion] = useState({ 
    provincia: '', 
    canton: '', 
    distrito: '', 
    barrio: '', 
    senas: '', 
    codigoPostal: '', 
    referencia: '' 
  });
  const [editandoDireccion, setEditandoDireccion] = useState(null);
  const [mostrarFormAgregar, setMostrarFormAgregar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    EcommerceFacade.auth.getProfile()
      .then((data) => {
        setUsuario(data);
        setEmail(data.email || '');
        setTelefono(data.telefono || '');
        setDirecciones(data.direcciones || []);
      })
      .catch(() => {
        Swal.fire(t('swal.error'), t('swal.profileLoadError'), 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (field, value) => {
    setLoading(true);
    try {
      const updated = await EcommerceFacade.auth.updateProfile({ [field]: value });
      setUsuario(updated);
      Swal.fire(t('swal.success'), t('swal.profileUpdated', {field: field.charAt(0).toUpperCase() + field.slice(1)}), 'success');
    } catch {
      Swal.fire(t('swal.error'), t('swal.profileUpdateError', {field: field}), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDireccion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await EcommerceFacade.agregarDireccion(nuevaDireccion);
      const actualizado = await EcommerceFacade.auth.getProfile();
      setUsuario(actualizado);
      setDirecciones(actualizado.direcciones || []);
      setNuevaDireccion({ provincia: '', canton: '', distrito: '', barrio: '', senas: '', codigoPostal: '', referencia: '' });
      setMostrarFormAgregar(false);
      Swal.fire(t('swal.success'), t('swal.addressAdded'), 'success');
    } catch (error) {
      Swal.fire(t('swal.error'), error.message || t('swal.addressAddError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarDireccion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await EcommerceFacade.actualizarDireccion(editandoDireccion.idDireccion, editandoDireccion);
      const actualizado = await EcommerceFacade.auth.getProfile();
      setUsuario(actualizado);
      setDirecciones(actualizado.direcciones || []);
      setEditandoDireccion(null);
      Swal.fire(t('swal.success'), t('swal.addressUpdated'), 'success');
    } catch (error) {
      Swal.fire(t('swal.error'), error.message || t('swal.addressUpdateError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarDireccion = async (idDireccion) => {
    const confirmacion = await Swal.fire({
      title: t('profile.confirmDelete'),
      text: t('profile.confirmDeleteText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('profile.confirmDeleteButton'),
      cancelButtonText: t('profile.deleteCancelButton')
    });

    if (confirmacion.isConfirmed) {
      setLoading(true);
      try {
        await EcommerceFacade.eliminarDireccion(idDireccion);
        const actualizado = await EcommerceFacade.auth.getProfile();
        setUsuario(actualizado);
        setDirecciones(actualizado.direcciones || []);
        Swal.fire(t('swal.success'), t('swal.addressDeleted'), 'success');
      } catch (error) {
        Swal.fire(t('swal.error'), error.message || t('swal.addressDeleteError'), 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const inputClass = "border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 w-full text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors duration-200";
  const labelClass = "block font-semibold mb-2 text-gray-700 dark:text-gray-300 transition-colors duration-200";
  const buttonPrimaryClass = "bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium";
  const buttonSecondaryClass = "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed font-medium";
  const buttonDangerClass = "bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium";

  return (
    <div className="w-full min-h-screen bg-white dark:bg-gray-900 pt-24 px-4 pb-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto relative">
        {/* Botón de inicio en la esquina superior derecha */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-0 right-0 mt-2 mr-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow dark:shadow-lg dark:shadow-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Ir al inicio"
        >
          <img
            src={isDarkMode ? "https://res.cloudinary.com/drec8g03e/image/upload/v1763528569/home-modo-oscuro_m2aygh.svg" : "https://res.cloudinary.com/drec8g03e/image/upload/v1763528569/home_xudymm.svg"}
            alt="Inicio"
            className="w-7 h-7"
          />
        </button>
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100 transition-colors duration-200">{t('profile.title')}</h1>
        
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {usuario && (
          <div className="space-y-8">
            {/* Sección de datos personales */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg dark:shadow-gray-900/50 p-6 transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3 transition-colors duration-200">{t('profile.personalData')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Correo electrónico */}
                <div>
                  <label className={labelClass}>{t('profile.email')}</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className={inputClass}
                    disabled={loading} 
                  />
                  <button 
                    onClick={() => handleUpdate('email', email)} 
                    className={`${buttonPrimaryClass} mt-3`}
                    disabled={loading}
                  >
                    {t('profile.save')}
                  </button>
                </div>

                {/* Teléfono */}
                <div>
                  <label className={labelClass}>{t('profile.phone')}</label>
                  <input 
                    type="tel" 
                    value={telefono} 
                    onChange={e => setTelefono(e.target.value)} 
                    className={inputClass}
                    disabled={loading} 
                  />
                  <button 
                    onClick={() => handleUpdate('telefono', telefono)} 
                    className={`${buttonPrimaryClass} mt-3`}
                    disabled={loading}
                  >
                    {t('profile.save')}
                  </button>
                </div>

                {/* Restaurar contraseña */}
                <div className="md:col-span-2">
                  <label className={labelClass}>{t('profile.resetPassword')}</label>
                  <input 
                    type="password" 
                    placeholder={t('profile.newPassword')} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className={inputClass}
                    disabled={loading} 
                  />
                  <button 
                    onClick={() => handleUpdate('contrasena', password)} 
                    className={`${buttonPrimaryClass} mt-3`}
                    disabled={loading || !password}
                  >
                    {t('profile.restore')}
                  </button>
                </div>
              </div>
            </div>

            {/* Sección de direcciones */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg dark:shadow-gray-900/50 p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-200">{t('profile.addresses')}</h2>
                {!mostrarFormAgregar && (
                  <button 
                    onClick={() => setMostrarFormAgregar(true)} 
                    className={buttonPrimaryClass}
                    disabled={loading}
                  >
                    {t('profile.addAddress')}
                  </button>
                )}
              </div>

              {/* Lista de direcciones */}
              {direcciones.length > 0 && (
                <div className="space-y-4 mb-6">
                  {direcciones.map((dir) => (
                    <div key={dir.idDireccion} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 transition-colors duration-200">
                      {editandoDireccion?.idDireccion === dir.idDireccion ? (
                        <form onSubmit={handleEditarDireccion} className="space-y-4">
                          <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-100 transition-colors duration-200">{t('profile.editAddress')}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>{t('profile.province')} *</label>
                              <input 
                                type="text" 
                                value={editandoDireccion.provincia} 
                                onChange={e => setEditandoDireccion({ ...editandoDireccion, provincia: e.target.value })} 
                                className={inputClass}
                                required 
                                disabled={loading}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>{t('profile.canton')} *</label>
                              <input 
                                type="text" 
                                value={editandoDireccion.canton} 
                                onChange={e => setEditandoDireccion({ ...editandoDireccion, canton: e.target.value })} 
                                className={inputClass}
                                required 
                                disabled={loading}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>{t('profile.district')} *</label>
                              <input 
                                type="text" 
                                value={editandoDireccion.distrito} 
                                onChange={e => setEditandoDireccion({ ...editandoDireccion, distrito: e.target.value })} 
                                className={inputClass}
                                required 
                                disabled={loading}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>{t('profile.neighborhood')}</label>
                              <input 
                                type="text" 
                                value={editandoDireccion.barrio || ''} 
                                onChange={e => setEditandoDireccion({ ...editandoDireccion, barrio: e.target.value })} 
                                className={inputClass}
                                disabled={loading}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className={labelClass}>{t('profile.directions')} *</label>
                              <input 
                                type="text" 
                                value={editandoDireccion.senas} 
                                onChange={e => setEditandoDireccion({ ...editandoDireccion, senas: e.target.value })} 
                                className={inputClass}
                                required 
                                disabled={loading}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>{t('profile.postalCode')}</label>
                              <input 
                                type="text" 
                                value={editandoDireccion.codigoPostal || ''} 
                                onChange={e => setEditandoDireccion({ ...editandoDireccion, codigoPostal: e.target.value })} 
                                className={inputClass}
                                disabled={loading}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>{t('profile.reference')}</label>
                              <input 
                                type="text" 
                                value={editandoDireccion.referencia || ''} 
                                onChange={e => setEditandoDireccion({ ...editandoDireccion, referencia: e.target.value })} 
                                className={inputClass}
                                disabled={loading}
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 pt-4">
                            <button type="submit" className={buttonPrimaryClass} disabled={loading}>
                              {t('profile.saveChanges')}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setEditandoDireccion(null)} 
                              className={buttonSecondaryClass}
                              disabled={loading}
                            >
                              {t('profile.cancel')}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <p className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100 transition-colors duration-200">
                            {dir.provincia}, {dir.canton}, {dir.distrito}
                          </p>
                          {dir.barrio && <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 transition-colors duration-200">{t('profile.neighborhood')}: {dir.barrio}</p>}
                          <p className="text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-200">{dir.senas}</p>
                          {dir.codigoPostal && <p className="text-gray-500 dark:text-gray-500 text-sm transition-colors duration-200">{t('profile.postalCode')}: {dir.codigoPostal}</p>}
                          {dir.referencia && <p className="text-gray-500 dark:text-gray-500 text-sm transition-colors duration-200">{t('profile.reference')}: {dir.referencia}</p>}
                          <div className="flex gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                            <button 
                              onClick={() => setEditandoDireccion(dir)} 
                              className={buttonPrimaryClass}
                              disabled={loading}
                            >
                              {t('profile.edit')}
                            </button>
                            <button 
                              onClick={() => handleEliminarDireccion(dir.idDireccion)} 
                              className={buttonDangerClass}
                              disabled={loading}
                            >
                              {t('profile.delete')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario para agregar nueva dirección */}
              {mostrarFormAgregar && (
                <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20 transition-colors duration-200">
                  <form onSubmit={handleAddDireccion} className="space-y-4">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-100 transition-colors duration-200">{t('profile.addNewAddress')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('profile.province')} *</label>
                        <input 
                          type="text" 
                          value={nuevaDireccion.provincia} 
                          onChange={e => setNuevaDireccion({ ...nuevaDireccion, provincia: e.target.value })} 
                          className={inputClass}
                          required 
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('profile.canton')} *</label>
                        <input 
                          type="text" 
                          value={nuevaDireccion.canton} 
                          onChange={e => setNuevaDireccion({ ...nuevaDireccion, canton: e.target.value })} 
                          className={inputClass}
                          required 
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('profile.district')} *</label>
                        <input 
                          type="text" 
                          value={nuevaDireccion.distrito} 
                          onChange={e => setNuevaDireccion({ ...nuevaDireccion, distrito: e.target.value })} 
                          className={inputClass}
                          required 
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('profile.neighborhood')}</label>
                        <input 
                          type="text" 
                          value={nuevaDireccion.barrio} 
                          onChange={e => setNuevaDireccion({ ...nuevaDireccion, barrio: e.target.value })} 
                          className={inputClass}
                          disabled={loading}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>{t('profile.directions')} *</label>
                        <input 
                          type="text" 
                          value={nuevaDireccion.senas} 
                          onChange={e => setNuevaDireccion({ ...nuevaDireccion, senas: e.target.value })} 
                          className={inputClass}
                          required 
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('profile.postalCode')}</label>
                        <input 
                          type="text" 
                          value={nuevaDireccion.codigoPostal} 
                          onChange={e => setNuevaDireccion({ ...nuevaDireccion, codigoPostal: e.target.value })} 
                          className={inputClass}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t('profile.reference')}</label>
                        <input 
                          type="text" 
                          value={nuevaDireccion.referencia} 
                          onChange={e => setNuevaDireccion({ ...nuevaDireccion, referencia: e.target.value })} 
                          className={inputClass}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="submit" className={buttonPrimaryClass} disabled={loading}>
                        {t('profile.addAddress')}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { 
                          setMostrarFormAgregar(false); 
                          setNuevaDireccion({ provincia: '', canton: '', distrito: '', barrio: '', senas: '', codigoPostal: '', referencia: '' }); 
                        }} 
                        className={buttonSecondaryClass}
                        disabled={loading}
                      >
                        {t('profile.cancel')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {direcciones.length === 0 && !mostrarFormAgregar && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('profile.noAddresses')}</p>
                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 transition-colors duration-200">{t('profile.noAddressesSubtitle')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiInformacion;