import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchEnums } from '../../services/api';
import Ecommerce from '../../patterns/EcommerceFacade';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearchPanel } from '../../context/SearchPanelContext';
import Swal from 'sweetalert2';

export default function SearchPanel() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    openSearchPanel,
    closeSearch,
    filters,
    setBusqueda,
    setCategoriaFiltro,
    setGeneroFiltro,
    setPrecioMin,
    setPrecioMax,
    setMililitrosMin,
    setMililitrosMax,
    limpiarFiltros
  } = useSearchPanel();
  const {
    busqueda,
    categoriaFiltro,
    generoFiltro,
    precioMin,
    precioMax,
    mililitrosMin,
    mililitrosMax
  } = filters;
  const [categorias, setCategorias] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [minPrecio, setMinPrecioLocal] = useState(0);
  const [maxPrecio, setMaxPrecioLocal] = useState(0);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [enums, catalog] = await Promise.all([
          fetchEnums(),
          Ecommerce.getCatalog()
        ]);
        setCategorias(enums?.CategoriaPerfume || []);
        setGeneros(enums?.Genero || []);
      } catch (error) {
       
        }
    };
    if (openSearchPanel) cargarDatos();
  }, [openSearchPanel]);


  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768 && openSearchPanel) {
        closeSearch();
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [openSearchPanel, closeSearch]);

  const handleSearch = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    closeSearch();
  };

  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState('');

  const supportsRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const getSpeechLang = (lang) => {
    if (!lang) return 'es-CR';
    const code = lang.split('-')[0];
    switch (code) {
      case 'es': return 'es-CR';
      case 'en': return 'en-US';
      case 'fr': return 'fr-FR';
      case 'pt': return 'pt-PT';
      case 'zh': return 'zh-CN';
      default: return lang;
    }
  };

  const startListening = () => {
    if (!supportsRecognition) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (err) { }
        recognitionRef.current = null;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = getSpeechLang(i18n.language);
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => setListening(true);

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        transcript = transcript.trim().replace(/[\.\?,!¡¿]+$/u, '');
        setBusqueda(transcript);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };

      recognitionRef.current.onnomatch = () => { };

      recognitionRef.current.onerror = (e) => {
        setListening(false);
        const errCode = e && e.error ? e.error : 'unknown';
        if (errCode === 'network') {
          setRecognitionError(t('voice.networkUnavailable'));
          setTimeout(() => setRecognitionError(''), 4000);
        } else {
          try { Swal.fire({ icon: 'error', title: t('swal.error'), text: (e && e.message) || t('voice.recognitionFailed') }); } catch (swalErr) { }
        }
      };

      recognitionRef.current.start();
      setListening(true);
    } catch (err) {
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
      }
    }
    setListening(false);
  };

  const toggleListening = () => {
    if (!supportsRecognition) return;
    if (listening) stopListening(); else startListening();
  };

  useEffect(() => {
    if (!supportsRecognition) return;
    if (listening) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (err) { }
          recognitionRef.current = null;
        }
        startListening();
      } catch (err) {
      }
    }
  }, [i18n.language]);

  return (
    <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl dark:shadow-gray-900/50 z-[1002] transition-all duration-300 ${openSearchPanel ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <h2 className="text-lg font-bold flex-1 text-gray-800 dark:text-gray-200 transition-colors duration-200">{t('filters.title')}</h2>
        <button onClick={closeSearch} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-200" aria-label={t('search.close')}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('search.placeholder')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 mb-4 transition-colors duration-200"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              onClick={handleSearch}
            >
              {t('common.search')}
            </button>

            <button
              type="button"
              onClick={toggleListening}
              aria-pressed={listening}
              title={supportsRecognition ? (listening ? 'Stop voice search' : 'Voice search') : 'Voice search not supported'}
              className={`w-12 h-12 rounded-lg flex items-center justify-center border ${listening ? 'bg-red-100 border-red-400' : 'bg-white border-gray-200'} hover:bg-gray-50`}
            >
              <img
                src="https://res.cloudinary.com/drec8g03e/image/upload/v1763353745/microfono_jnyork.png"
                alt="mic"
                className={`w-6 h-6 object-contain ${listening ? 'opacity-100' : 'opacity-90'}`}
              />
            </button>
          </div>
          {listening && (
            <div className="mt-2 text-sm text-gray-500">Escuchando...</div>
          )}
          {recognitionError && (
            <div className="mt-2 text-sm text-red-600">{recognitionError}</div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 transition-colors duration-200">
            {t('product.category')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoriaFiltro([])}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                categoriaFiltro.length === 0
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('nav.all')}
            </button>
            {categorias.map(cat => {
              const selected = categoriaFiltro.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoriaFiltro(selected
                      ? categoriaFiltro.filter(c => c !== cat)
                      : [...categoriaFiltro, cat]
                    );
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selected
                      ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t(`category.${cat}`)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 transition-colors duration-200">
            {t('product.gender')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setGeneroFiltro([])}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                generoFiltro.length === 0 
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('nav.all')}
            </button>
            {generos.map(gen => (
              <button
                key={gen}
                onClick={() => setGeneroFiltro(generoFiltro.includes(gen) ? generoFiltro.filter(g => g !== gen) : [...generoFiltro, gen])}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  generoFiltro.includes(gen) 
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {t(`gender.${gen}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t('product.priceMin')}</label>
            <input
              type="number"
              value={precioMin}
              onChange={e => setPrecioMin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              placeholder={minPrecio.toString()}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t('product.priceMax')}</label>
            <input
              type="number"
              value={precioMax}
              onChange={e => setPrecioMax(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              placeholder={maxPrecio.toString()}
            />
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t('product.volumeMin', { defaultValue: 'Min ml' })}</label>
            <input
              type="number"
              value={mililitrosMin}
              onChange={e => setMililitrosMin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              placeholder={t('common.min')}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">{t('product.volumeMax', { defaultValue: 'Max ml' })}</label>
            <input
              type="number"
              value={mililitrosMax}
              onChange={e => setMililitrosMax(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
              placeholder={t('common.max')}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={limpiarFiltros}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 transition-colors duration-200"
          >
            {t('filters.clearFilters')}
          </button>
        </div>
      </div>
    </div>
  );
}
