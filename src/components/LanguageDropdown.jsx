import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const IDIOMAS = [
  { codigo: 'es', etiqueta: 'Español' },
  { codigo: 'en', etiqueta: 'English' },
  { codigo: 'fr', etiqueta: 'Français' },
  { codigo: 'pt', etiqueta: 'Português' },
  { codigo: 'zh', etiqueta: '中文' },
  { codigo: 'cab', etiqueta: 'Cabécar' },
  { codigo: 'bribri', etiqueta: 'Bribri' },
];

export default function LanguageDropdown({ value, onChange }) {
  const [abierto, setAbierto] = useState(false);
  const [indiceEnfocado, setIndiceEnfocado] = useState(-1);
  const [abiertoConTeclado, setAbiertoConTeclado] = useState(false);
  const refDropdown = useRef(null);
  const refLista = useRef(null);
  const refTemporizadorCierre = useRef(null);

  useEffect(() => {
    function manejarClickFuera(event) {
      if (refDropdown.current && !refDropdown.current.contains(event.target)) {
        setAbierto(false);
        setIndiceEnfocado(-1);
      }
    }
    document.addEventListener('mousedown', manejarClickFuera);
    return () => {
      document.removeEventListener('mousedown', manejarClickFuera);
    };
  }, []);

  useEffect(() => {
    if (abierto && refLista.current) {
      setIndiceEnfocado(IDIOMAS.findIndex(l => l.codigo === value));
      setTimeout(() => {
        if (refLista.current) {
          refLista.current.focus();
        }
      }, 0);
    }
  }, [abierto, value]);

  const { t } = useTranslation();
  const actual = IDIOMAS.find(l => l.codigo === value);

  const getTranslatedLabel = (codigo) => {
    return t(`language.${codigo}`);
  };

  return (
    <div 
      className="relative" 
      ref={refDropdown}
    >
      <button
        className="flex h-8 sm:h-9 md:h-10 items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-1.5 transition-all hover:border-gray-400 hover:shadow-sm md:gap-2 md:px-3 lg:px-4"
        onClick={() => {
          setAbierto(!abierto);
          setAbiertoConTeclado(false);
        }}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        tabIndex={0}
        onFocus={(e) => {
          if (e.target.matches(':focus-visible')) {
            setAbierto(true);
            setAbiertoConTeclado(true);
          }
        }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            setAbierto(true);
            setAbiertoConTeclado(true);
            e.preventDefault();
          } else if (e.key === 'ArrowUp') {
            setAbierto(true);
            setAbiertoConTeclado(true);
            e.preventDefault();
          } else if (e.key === 'Enter' || e.key === ' ') {
            setAbierto(true);
            setAbiertoConTeclado(true);
            e.preventDefault();
          }
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20" />
        </svg>
        <span className="hidden lg:inline font-semibold text-gray-800 text-xs lg:text-sm whitespace-nowrap">
          {actual ? getTranslatedLabel(actual.codigo) : t('language.select')}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {abierto && (
        <ul
          className="absolute top-full right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px] md:min-w-[180px] z-[1001] mt-2 overflow-hidden"
          role="listbox"
          ref={refLista}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              setIndiceEnfocado(idx => (idx + 1) % IDIOMAS.length);
              e.preventDefault();
            } else if (e.key === 'ArrowUp') {
              setIndiceEnfocado(idx => (idx - 1 + IDIOMAS.length) % IDIOMAS.length);
              e.preventDefault();
            } else if (e.key === 'Enter' || e.key === ' ') {
              if (indiceEnfocado >= 0) {
                onChange(IDIOMAS[indiceEnfocado].codigo);
                setAbierto(false);
              }
              e.preventDefault();
            } else if (e.key === 'Tab' || e.key === 'Escape') {
              setAbierto(false);
              setIndiceEnfocado(-1);
            }
          }}
        >
          {IDIOMAS.map((idioma, idx) => (
            <li
              key={idioma.codigo}
              className={`block w-full px-4 md:px-5 py-2 md:py-3 text-left bg-none border-none text-gray-700 text-sm md:text-base cursor-pointer transition-colors hover:bg-gray-100 ${idioma.codigo === value ? 'bg-blue-50 font-semibold' : ''} ${indiceEnfocado === idx ? 'bg-blue-100' : ''}`}
              onClick={() => { onChange(idioma.codigo); setAbierto(false); }}
              role="option"
              aria-selected={idioma.codigo === value}
              onMouseEnter={() => setIndiceEnfocado(idx)}
            >
              {idioma.codigo === value && '✓ '}{getTranslatedLabel(idioma.codigo)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
