class VoiceReaderService {
  constructor() {
    this.isEnabled = false;
    this.selectedVoice = null;
    this.speechRate = 1;
    this.speechVolume = 1;
    this.speechSynthesis = window.speechSynthesis;
    this.voices = [];
    this.mouseReadingEnabled = false;
    this.mouseReadingDelay = 100; 
    this.lastReadElement = null;
    this.currentLanguage = 'es'; 
    
    this.loadSettings();
    this.loadVoices();
    this.setupMouseReading();
  }

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

  loadVoices() {
    const updateVoices = () => {
      this.voices = this.speechSynthesis.getVoices();
      this.selectVoiceForLanguage(this.currentLanguage);
    };

    updateVoices();
    this.speechSynthesis.onvoiceschanged = updateVoices;
  }

  selectVoiceForLanguage(language) {
    const languageMap = {
      'es': ['es', 'es-ES', 'es-MX', 'es-AR', 'es-CO'],
      'en': ['en', 'en-US', 'en-GB', 'en-AU'],
      'pt': ['pt', 'pt-BR', 'pt-PT'],
      'fr': ['fr', 'fr-FR', 'fr-CA'],
      'zh': ['zh', 'zh-CN', 'zh-TW'],
      'bribri': ['es', 'es-ES'], 
      'cab': ['es', 'es-ES']
    };

    const preferredLanguages = languageMap[language] || languageMap['es'];
  
    for (const lang of preferredLanguages) {
      const voice = this.voices.find(v => v.lang.startsWith(lang));
      if (voice) {
        this.selectedVoice = voice;
        return;
      }
    }
    this.selectedVoice = this.voices[0] || null;
  }

  setLanguage(language) {
    this.currentLanguage = language;
    this.selectVoiceForLanguage(language);
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.saveSettings();
    return this.isEnabled;
  }

  updateSettings(settings) {
    if (settings.speechRate !== undefined) {
      this.speechRate = settings.speechRate;
    }
    if (settings.speechVolume !== undefined) {
      this.speechVolume = settings.speechVolume;
    }
    this.saveSettings();
  }


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


  speak(text, options = {}) {
    if (!this.isEnabled || !this.selectedVoice) {
      return false;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.selectedVoice;
    utterance.rate = options.rate || this.speechRate;
    utterance.volume = options.volume || this.speechVolume;
    utterance.lang = this.selectedVoice.lang; 
    utterance.pitch = options.pitch || 1;

    this.speechSynthesis.speak(utterance);
    return true;
  }

  speakElement(elementSelector) {
    const element = document.querySelector(elementSelector);
    if (element) {
      const text = element.innerText || element.textContent;
      return this.speak(text);
    }
    return false;
  }

  speakPage() {
    const mainContent = document.querySelector('main') || document.body;
    const text = mainContent.innerText || mainContent.textContent;
    return this.speak(text);
  }

  stop() {
    this.speechSynthesis.cancel();
  }

  pause() {
    this.speechSynthesis.pause();
  }

  resume() {
    this.speechSynthesis.resume();
  }

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

  speakForm(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return false;

    const texts = [];
    
    const labels = form.querySelectorAll('label');
    labels.forEach(label => {
      texts.push(label.textContent.trim());
    });

    const inputs = form.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(input => {
      const placeholder = input.getAttribute('placeholder');
      if (placeholder) {
        texts.push(placeholder.trim());
      }
    });

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

  setupMouseReading() {
    this.mouseMoveHandler = (event) => {
      if (!this.isEnabled || !this.mouseReadingEnabled) return;

      const element = document.elementFromPoint(event.clientX, event.clientY);
      if (!element) return;

      if (element === this.lastReadElement) return;

      const text = this.getElementText(element);

      if (!text || text.trim().length === 0) {
        this.lastReadElement = element; 
        return;
      }


      this.lastReadElement = element;

      this.stop();

      clearTimeout(this.mouseReadTimeout);
      this.mouseReadTimeout = setTimeout(() => {
        this.speak(text.trim());
      }, this.mouseReadingDelay);
    };

    document.addEventListener('mousemove', this.mouseMoveHandler);
  }

  getElementText(element) {

    if (element.tagName === 'HTML' || element.tagName === 'BODY' || element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || element.tagName === 'HEAD') {
      return '';
    }

    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
      return '';
    }

    let text = 
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.getAttribute('alt') ||
      element.getAttribute('placeholder') ||
      element.value ||
      element.textContent ||
      element.innerText ||
      '';

    text = text.replace(/\s+/g, ' ').trim();

    if (text.length < 1 || text === '' || text === ' ') {
      return '';
    }

    if (text.length === 1 && !/^[a-zA-Z0-9]$/.test(text)) {
      if (!/^[a-zA-Z0-9]$/.test(text)) {
        return '';
      }
    }

    const ignoreTexts = ['•', '|', '/', '\\'];
    if (ignoreTexts.includes(text)) {
      return '';
    }

    if (/^\d+$/.test(text) && text.length > 1) {
      return text; 
    }

    if (/^[\$\€\£\¥]\d+/.test(text) || /^\d+[\$\€\£\¥]/.test(text)) {
      return text;
    }

    return text;
  }

  toggleMouseReading() {
    this.mouseReadingEnabled = !this.mouseReadingEnabled;
    this.saveSettings();
    return this.mouseReadingEnabled;
  }

  updateMouseDelay(delay) {
    this.mouseReadingDelay = Math.max(0, Math.min(1000, delay)); 
    this.saveSettings();
    return this.mouseReadingDelay;
  }

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

const voiceReaderService = new VoiceReaderService();

export default voiceReaderService;
