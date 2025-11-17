import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useVoiceReader } from '../hooks/useVoiceReader';
import './Accessibility.css';

const Accessibility = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const voiceReader = useVoiceReader();
  

  useEffect(() => {
    if (voiceReader.isEnabled) {
      voiceReader.setLanguage(i18n.language);
    }
  }, [i18n.language, voiceReader.isEnabled]);

  
  const toggleVoiceReader = () => {
    voiceReader.toggle();
  };

  const readPageContent = () => {
    const title = t('accessibility.title', { defaultValue: 'Accesibilidad' });
    const description = t('accessibility.description', { defaultValue: 'Configura las opciones de accesibilidad para mejorar tu experiencia en el sitio.' });
    const voiceReaderTitle = t('accessibility.voiceReader.title', { defaultValue: 'Lector de Voz' });
    const voiceReaderDesc = t('accessibility.voiceReader.description', { defaultValue: 'Activa el lector de voz para escuchar el contenido de la página en voz alta.' });
    const fullText = `${title}. ${description}. ${voiceReaderTitle}. ${voiceReaderDesc}.`;
    voiceReader.speak(fullText);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            aria-label={t('accessibility.goBack', { defaultValue: 'Volver' })}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('accessibility.goBack', { defaultValue: 'Volver' })}
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('accessibility.title', { defaultValue: 'Accesibilidad' })}
          </h1>
          <p className="text-gray-600">
            {t('accessibility.description', { defaultValue: 'Configura las opciones de accesibilidad para mejorar tu experiencia en el sitio.' })}
          </p>
        </div>

        {/* Opciones de accesibilidad */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {t('accessibility.options', { defaultValue: 'Opciones de Accesibilidad' })}
          </h2>

          {/* Alto Contraste eliminado */}

          {/* Lector de Voz */}
          <div className="pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {t('accessibility.voiceReader.title', { defaultValue: 'Lector de Voz' })}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('accessibility.voiceReader.description', { defaultValue: 'Activa el lector de voz para escuchar el contenido de la página en voz alta.' })}
                </p>
                {voiceReader.isEnabled && (
                  <button
                    onClick={() => voiceReader.speak(t('accessibility.voiceReader.title', { defaultValue: 'Lector de Voz' }) + '. ' + t('accessibility.voiceReader.description', { defaultValue: 'Activa el lector de voz para escuchar el contenido de la página en voz alta.' }))}
                    className="text-blue-600 hover:text-blue-800 text-sm underline mr-4"
                  >
                    {t('accessibility.voice.read', { defaultValue: 'Leer en voz alta' })}
                  </button>
                )}
              </div>
              <div className="flex items-center">
                <button
                  onClick={toggleVoiceReader}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    voiceReader.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  aria-label={t('accessibility.voiceReader.toggle', { defaultValue: 'Activar lector de voz' })}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      voiceReader.isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {voiceReader.isEnabled 
                    ? t('accessibility.enabled', { defaultValue: 'Activado' })
                    : t('accessibility.disabled', { defaultValue: 'Desactivado' })
                  }
                </span>
              </div>
            </div>

            {/* Configuración avanzada del lector de voz */}
            {voiceReader.isEnabled && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-gray-800 mb-4">
                  {t('accessibility.voice.settings', { defaultValue: 'Configuración de Voz' })}
                </h4>
                
                {/* Información de voz actual */}
                <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('accessibility.voice.currentVoice', { defaultValue: 'Voz actual' })}:</span> 
                    {voiceReader.selectedVoice ? `${voiceReader.selectedVoice.name} (${voiceReader.selectedVoice.lang})` : t('accessibility.voice.noVoice', { defaultValue: 'No disponible' })}
                  </p>
                </div>
                
                {/* Velocidad de habla */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('accessibility.voice.speed', { defaultValue: 'Velocidad de habla' })}: {voiceReader.speechRate.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceReader.speechRate}
                    onChange={(e) => voiceReader.updateSettings({ speechRate: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Volumen */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('accessibility.voice.volume', { defaultValue: 'Volumen' })}: {Math.round(voiceReader.speechVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceReader.speechVolume}
                    onChange={(e) => voiceReader.updateSettings({ speechVolume: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Lectura por mouse */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('accessibility.voice.mouseReading', { defaultValue: 'Lectura por Mouse' })}
                      </label>
                      <p className="text-xs text-gray-600 mb-2">
                        {t('accessibility.voice.mouseReadingDesc', { defaultValue: 'Activa para leer elementos al pasar el mouse sobre ellos' })}
                      </p>
                    </div>
                    <button
                      onClick={voiceReader.toggleMouseReading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        voiceReader.mouseReadingEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      aria-label={t('accessibility.voice.toggleMouseReading', { defaultValue: 'Activar lectura por mouse' })}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          voiceReader.mouseReadingEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Control de sensibilidad */}
                  {voiceReader.mouseReadingEnabled && (
                    <div className="mt-3 pl-4 border-l-2 border-blue-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('accessibility.voice.mouseSensitivity', { defaultValue: 'Sensibilidad del Mouse' })}: {voiceReader.mouseReadingDelay}ms
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="50"
                        value={voiceReader.mouseReadingDelay}
                        onChange={(e) => voiceReader.updateMouseDelay(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{t('accessibility.voice.fast', { defaultValue: 'Rápido' })}</span>
                        <span>{t('accessibility.voice.slow', { defaultValue: 'Lento' })}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de control */}
                <div className="flex gap-3">
                  <button
                    onClick={readPageContent}
                    className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                  >
                    {t('accessibility.voice.readPage', { defaultValue: 'Leer página completa' })}
                  </button>
                  <button
                    onClick={() => voiceReader.stop()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    {t('accessibility.voice.stop', { defaultValue: 'Detener lectura' })}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">
            {t('accessibility.instructions.title', { defaultValue: 'Cómo usar las funciones de accesibilidad' })}
          </h2>
            <ul className="space-y-2 text-blue-700">
            <li>
              <strong>{t('accessibility.voiceReader.title', { defaultValue: 'Lector de Voz' })}:</strong> 
              {t('accessibility.instructions.voice', { defaultValue: ' Actívalo y usa los botones para escuchar el contenido.' })}
            </li>
            <li>
              <strong>{t('accessibility.keyboard.title', { defaultValue: 'Navegación por teclado' })}:</strong> 
              {t('accessibility.instructions.keyboard', { defaultValue: ' Usa Tab para navegar y Enter para seleccionar opciones.' })}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
