import React, { useState, useRef, useEffect } from 'react';

const IDIOMAS = [
  { codigo: 'es', etiqueta: 'Español' },
  { codigo: 'en', etiqueta: 'English' },
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

  const actual = IDIOMAS.find(l => l.codigo === value);

  const manejarMouseEnter = () => {
    if (refTemporizadorCierre.current) {
      clearTimeout(refTemporizadorCierre.current);
      refTemporizadorCierre.current = null;
    }
    setAbierto(true);
  };

  const manejarMouseLeave = () => {
    refTemporizadorCierre.current = setTimeout(() => {
      setAbierto(false);
    }, 200);
  };

  return (
    <div 
      className="relative" 
      ref={refDropdown} 
      onMouseEnter={manejarMouseEnter}
      onMouseLeave={manejarMouseLeave}
    >
      <button
        className="flex items-center bg-blue-900 text-white px-3 py-2 rounded shadow hover:bg-blue-800 focus:outline-none min-w-[120px]"
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
        <img
          src="https://res.cloudinary.com/drec8g03e/image/upload/v1762664466/language_mhwtyd.svg"
          alt="Language"
          className="w-4 h-4 mr-2"
        />
        <span className="mr-2 font-semibold">{actual ? actual.etiqueta : 'Idioma'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {abierto && (
        <ul
          className="absolute left-0 mt-2 min-w-[120px] bg-white text-blue-900 rounded shadow border z-10 outline-none"
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
              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${idioma.codigo === value ? 'font-bold' : ''} ${indiceEnfocado === idx ? 'bg-blue-100' : ''}`}
              onClick={() => { onChange(idioma.codigo); setAbierto(false); }}
              role="option"
              aria-selected={idioma.codigo === value}
              onMouseEnter={() => setIndiceEnfocado(idx)}
            >
              {idioma.etiqueta}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
