import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    setEnviado(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-['Lato',sans-serif]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('contact.title')}</h1>
        <p className="mb-6 text-gray-600">
          {t('contact.description')} <span className="font-semibold">{t('contact.email')}</span>
        </p>
        {enviado ? (
          <div className="text-green-600 font-semibold text-center">{t('contact.successMessage')}</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              className="border border-gray-300 rounded-lg p-3 resize-none text-base text-gray-800"
              rows={6}
              placeholder={t('contact.messagePlaceholder')}
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >{t('contact.sendButton')}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Contact;
