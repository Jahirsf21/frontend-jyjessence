import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AddressForm = ({ onAddressChange, initialData = {}, disabled = false }) => {
  const { t } = useTranslation();
  const [datosDireccion, setDatosDireccion] = useState({
    provincia: initialData.provincia || '',
    canton: initialData.canton || '',
    distrito: initialData.distrito || '',
    barrio: initialData.barrio || '',
    senas: initialData.senas || '',
    codigoPostal: initialData.codigoPostal || '',
    referencia: initialData.referencia || '',
    ...initialData
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevaDireccion = { ...datosDireccion, [name]: value };
    setDatosDireccion(nuevaDireccion);
    
    if (onAddressChange) {
      onAddressChange(nuevaDireccion);
    }
  };

  const isFormValid = () => {
    return datosDireccion.provincia && 
           datosDireccion.canton && 
           datosDireccion.distrito && 
           datosDireccion.senas;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="provincia" className="block mb-1 font-bold text-gray-700 dark:text-gray-300 text-sm transition-colors duration-200">
            {t('address.province')} *
          </label>
          <input
            id="provincia"
            name="provincia"
            type="text"
            disabled={disabled}
            className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-200 ${
              disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder={t('address.provincePlaceholder')}
            value={datosDireccion.provincia}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="canton" className="block mb-1 font-bold text-gray-700 text-sm">
            {t('address.canton')} *
          </label>
          <input
            id="canton"
            name="canton"
            type="text"
            disabled={disabled}
            className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-200 ${
              disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder={t('address.cantonPlaceholder')}
            value={datosDireccion.canton}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="distrito" className="block mb-1 font-bold text-gray-700 text-sm">
            {t('address.district')} *
          </label>
          <input
            id="distrito"
            name="distrito"
            type="text"
            disabled={disabled}
            className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-200 ${
              disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder={t('address.districtPlaceholder')}
            value={datosDireccion.distrito}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="barrio" className="block mb-1 font-bold text-gray-700 text-sm">
            {t('address.neighborhood')}
          </label>
          <input
            id="barrio"
            name="barrio"
            type="text"
            disabled={disabled}
            className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-200 ${
              disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder={t('address.neighborhoodPlaceholder')}
            value={datosDireccion.barrio}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="codigoPostal" className="block mb-1 font-bold text-gray-700 text-sm">
            {t('address.postalCode')}
          </label>
          <input
            id="codigoPostal"
            name="codigoPostal"
            type="text"
            disabled={disabled}
            className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-200 ${
              disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder={t('address.postalCodePlaceholder')}
            value={datosDireccion.codigoPostal}
            onChange={handleChange}
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
            disabled={disabled}
            className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-200 ${
              disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder={t('address.referencePlaceholder')}
            value={datosDireccion.referencia}
            onChange={handleChange}
          />
        </div>
      </div>
      <div>
        <label htmlFor="senas" className="block mb-1 font-bold text-gray-700 text-sm">
          {t('address.directions')} *
        </label>
        <textarea
          id="senas"
          name="senas"
          disabled={disabled}
          rows={3}
          className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 transition-colors duration-200 ${
            disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder={t('address.directionsPlaceholder')}
          value={datosDireccion.senas}
          onChange={handleChange}
        />
      </div>
      
      {!disabled && (
        <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
          {isFormValid() ? (
            <span className="text-green-600 dark:text-green-400 transition-colors duration-200">✓ {t('address.formValid')}</span>
          ) : (
            <span className="text-orange-600 dark:text-orange-400 transition-colors duration-200">{t('address.requiredFields')}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressForm;
