class VoiceReaderService {
  constructor() {
    this.isEnabled = false;
    this.selectedVoice = null;
    this.speechRate = 1;
    this.speechVolume = 1;
    this.speechSynthesis = window.speechSynthesis;
    this.voices = [];
    this.mouseReadingEnabled = false;
    this.mouseReadingDelay = 100; // ms de demora para lectura por mouse
    this.lastReadElement = null;
    this.currentLanguage = 'es'; // idioma por defecto
    
    this.loadSettings();
    this.loadVoices();
    this.setupMouseReading();
  }

  // Cargar configuración guardada
  loadSettings() {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.isEnabled = settings.voiceReader || false;
      this.speechRate = settings.speechRate || 1;
      this.speechVolume = settings.speechVolume || 1;
      this.mouseReadingEnabled = settings.mouseReadingEnabled || false;
      this.mouseReadingDelay = settings.mouseReadingDelay || 100;
    }
  }

  // Cargar voces disponibles
  loadVoices() {
    const updateVoices = () => {
      this.voices = this.speechSynthesis.getVoices();
      this.selectVoiceForLanguage(this.currentLanguage);
    };

    updateVoices();
    this.speechSynthesis.onvoiceschanged = updateVoices;
  }

  // Seleccionar voz para un idioma específico
  selectVoiceForLanguage(language) {
    // Mapeo de idiomas a códigos de voz
    const languageMap = {
      'es': ['es', 'es-ES', 'es-MX', 'es-AR', 'es-CO'],
      'en': ['en', 'en-US', 'en-GB', 'en-AU'],
      'pt': ['pt', 'pt-BR', 'pt-PT'],
      'fr': ['fr', 'fr-FR', 'fr-CA'],
      'zh': ['zh', 'zh-CN', 'zh-TW'],
      'bribri': ['es', 'es-ES'], // Bribri usa voz en español
      'cab': ['es', 'es-ES'] // Cabécar usa voz en español
    };

    const preferredLanguages = languageMap[language] || languageMap['es'];
    
    // Buscar voz que coincida con el idioma preferido
    for (const lang of preferredLanguages) {
      const voice = this.voices.find(v => v.lang.startsWith(lang));
      if (voice) {
        this.selectedVoice = voice;
        return;
      }
    }

    // Si no encuentra, usar la primera voz disponible
    this.selectedVoice = this.voices[0] || null;
  }

  // Actualizar idioma actual
  setLanguage(language) {
    this.currentLanguage = language;
    this.selectVoiceForLanguage(language);
  }

  // Habilitar/deshabilitar lector de voz
  toggle() {
    this.isEnabled = !this.isEnabled;
    this.saveSettings();
    return this.isEnabled;
  }

  // Actualizar configuración de voz
  updateSettings(settings) {
    if (settings.speechRate !== undefined) {
      this.speechRate = settings.speechRate;
    }
    if (settings.speechVolume !== undefined) {
      this.speechVolume = settings.speechVolume;
    }
    this.saveSettings();
  }

  // Guardar configuración
  saveSettings() {
    const settings = {
      voiceReader: this.isEnabled,
      speechRate: this.speechRate,
      speechVolume: this.speechVolume,
      mouseReadingEnabled: this.mouseReadingEnabled,
      mouseReadingDelay: this.mouseReadingDelay
    };
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }

  // Leer texto en voz alta
  speak(text, options = {}) {
    if (!this.isEnabled || !this.selectedVoice) {
      return false;
    }

    // Detener cualquier lectura en curso
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.selectedVoice;
    utterance.rate = options.rate || this.speechRate;
    utterance.volume = options.volume || this.speechVolume;
    utterance.lang = this.selectedVoice.lang; // Usar el idioma de la voz seleccionada
    utterance.pitch = options.pitch || 1;

    this.speechSynthesis.speak(utterance);
    return true;
  }

  // Leer elemento del DOM
  speakElement(elementSelector) {
    const element = document.querySelector(elementSelector);
    if (element) {
      const text = element.innerText || element.textContent;
      return this.speak(text);
    }
    return false;
  }

  // Leer página completa
  speakPage() {
    const mainContent = document.querySelector('main') || document.body;
    const text = mainContent.innerText || mainContent.textContent;
    return this.speak(text);
  }

  // Detener lectura
  stop() {
    this.speechSynthesis.cancel();
  }

  // Pausar lectura
  pause() {
    this.speechSynthesis.pause();
  }

  // Reanudar lectura
  resume() {
    this.speechSynthesis.resume();
  }

  // Obtener estado actual
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isSpeaking: this.speechSynthesis.speaking,
      isPaused: this.speechSynthesis.paused,
      speechRate: this.speechRate,
      speechVolume: this.speechVolume,
      selectedVoice: this.selectedVoice,
      availableVoices: this.voices,
      mouseReadingEnabled: this.mouseReadingEnabled,
      mouseReadingDelay: this.mouseReadingDelay
    };
  }

  // Leer atributos específicos de elementos
  speakElements(selectors) {
    const texts = [];
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const text = element.innerText || element.textContent || element.getAttribute('aria-label') || '';
        if (text.trim()) {
          texts.push(text.trim());
        }
      });
    });
    
    if (texts.length > 0) {
      return this.speak(texts.join('. '));
    }
    return false;
  }

  // Leer formulario
  speakForm(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return false;

    const texts = [];
    
    // Leer labels e inputs
    const labels = form.querySelectorAll('label');
    labels.forEach(label => {
      texts.push(label.textContent.trim());
    });

    // Leer placeholders
    const inputs = form.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(input => {
      const placeholder = input.getAttribute('placeholder');
      if (placeholder) {
        texts.push(placeholder.trim());
      }
    });

    // Leer botones
    const buttons = form.querySelectorAll('button');
    buttons.forEach(button => {
      const text = button.textContent.trim();
      if (text && !['Leer en voz alta', 'Detener lectura'].includes(text)) {
        texts.push(text.trim());
      }
    });

    if (texts.length > 0) {
      return this.speak(texts.join('. '));
    }
    return false;
  }

  // Configurar lectura por mouse
  setupMouseReading() {
    this.mouseMoveHandler = (event) => {
      if (!this.isEnabled || !this.mouseReadingEnabled) return;

      const element = document.elementFromPoint(event.clientX, event.clientY);
      if (!element) return;

      // Si es el mismo elemento, no hacer nada
      if (element === this.lastReadElement) return;

      // Obtener texto del nuevo elemento primero
      const text = this.getElementText(element);
      
      // Solo procesar si el elemento tiene texto válido
      if (!text || text.trim().length === 0) {
        this.lastReadElement = element; // Actualizar para no repetir elementos vacíos
        return;
      }

      // Actualizar el último elemento
      this.lastReadElement = element;

      // Cancelar lectura anterior inmediatamente
      this.stop();

      // Usar la configuración de demora dinámica
      clearTimeout(this.mouseReadTimeout);
      this.mouseReadTimeout = setTimeout(() => {
        this.speak(text.trim());
      }, this.mouseReadingDelay);
    };

    document.addEventListener('mousemove', this.mouseMoveHandler);
  }

  // Obtener texto de un elemento
  getElementText(element) {
    // Ignorar ciertos elementos básicos
    if (element.tagName === 'HTML' || element.tagName === 'BODY' || element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || element.tagName === 'HEAD') {
      return '';
    }

    // Ignorar elementos sin contenido visible
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
      return '';
    }

    // Priorizar diferentes atributos pero ser más inclusivos
    let text = 
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.getAttribute('alt') ||
      element.getAttribute('placeholder') ||
      element.value ||
      element.textContent ||
      element.innerText ||
      '';

    // Limpiar texto
    text = text.replace(/\s+/g, ' ').trim();

    // Ser menos restrictivo con la longitud mínima
    if (text.length < 1 || text === '' || text === ' ') {
      return '';
    }

    // Permitir textos cortos si tienen significado (botones, iconos, etc.)
    if (text.length === 1 && !/^[a-zA-Z0-9]$/.test(text)) {
      // Permitir caracteres simples si son letras o números
      if (!/^[a-zA-Z0-9]$/.test(text)) {
        return '';
      }
    }

    // Ser menos restrictivo con caracteres especiales si están en contexto
    // Solo ignorar los caracteres más comunes sin contexto
    const ignoreTexts = ['•', '|', '/', '\\'];
    if (ignoreTexts.includes(text)) {
      return '';
    }

    // Permitir números si tienen contexto (precios, cantidades, etc.)
    if (/^\d+$/.test(text) && text.length > 1) {
      return text; // Permitir números de más de un dígito
    }

    // Permitir textos con símbolos comunes como precios, etc.
    if (/^[\$\€\£\¥]\d+/.test(text) || /^\d+[\$\€\£\¥]/.test(text)) {
      return text;
    }

    return text;
  }

  // Activar/desactivar lectura por mouse
  toggleMouseReading() {
    this.mouseReadingEnabled = !this.mouseReadingEnabled;
    this.saveSettings();
    return this.mouseReadingEnabled;
  }

  // Actualizar configuración de demora del mouse
  updateMouseDelay(delay) {
    this.mouseReadingDelay = Math.max(0, Math.min(1000, delay)); // Limitar entre 0 y 1000ms
    this.saveSettings();
    return this.mouseReadingDelay;
  }

  // Leer elemento bajo el mouse (manual)
  readElementUnderMouse() {
    if (!this.isEnabled) return false;

    const mouseX = window.mouseX || window.innerWidth / 2;
    const mouseY = window.mouseY || window.innerHeight / 2;
    
    const element = document.elementFromPoint(mouseX, mouseY);
    if (element) {
      const text = this.getElementText(element);
      if (text && text.trim().length > 0) {
        return this.speak(text.trim());
      }
    }
    return false;
  }

  // Leer elemento específico por selector
  readElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      const text = this.getElementText(element);
      if (text && text.trim().length > 0) {
        return this.speak(text.trim());
      }
    }
    return false;
  }
}

// Crear instancia global
const voiceReaderService = new VoiceReaderService();

export default voiceReaderService;
