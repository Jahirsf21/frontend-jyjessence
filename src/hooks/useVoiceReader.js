import { useState, useEffect } from 'react';
import voiceReaderService from '../services/voiceReaderService';

export const useVoiceReader = () => {
  const [status, setStatus] = useState({
    isEnabled: false,
    isSpeaking: false,
    isPaused: false,
    speechRate: 1,
    speechVolume: 1,
    mouseReadingEnabled: false
  });


  useEffect(() => {
    const updateStatus = () => {
      setStatus(voiceReaderService.getStatus());
    };

    updateStatus();
    
    const interval = setInterval(updateStatus, 100);
    
    return () => clearInterval(interval);
  }, []);

  const toggle = () => {
    return voiceReaderService.toggle();
  };

  const speak = (text, options = {}) => {
    return voiceReaderService.speak(text, options);
  };

  const speakElement = (elementSelector) => {
    return voiceReaderService.speakElement(elementSelector);
  };

  const speakPage = () => {
    return voiceReaderService.speakPage();
  };

  const speakElements = (selectors) => {
    return voiceReaderService.speakElements(selectors);
  };

  const speakForm = (formSelector) => {
    return voiceReaderService.speakForm(formSelector);
  };

  const stop = () => {
    voiceReaderService.stop();
  };

  const pause = () => {
    voiceReaderService.pause();
  };

  const resume = () => {
    voiceReaderService.resume();
  };

  const updateSettings = (settings) => {
    voiceReaderService.updateSettings(settings);
  };

  const toggleMouseReading = () => {
    return voiceReaderService.toggleMouseReading();
  };

  const readElementUnderMouse = () => {
    return voiceReaderService.readElementUnderMouse();
  };

  const readElement = (selector) => {
    return voiceReaderService.readElement(selector);
  };

  const updateMouseDelay = (delay) => {
    return voiceReaderService.updateMouseDelay(delay);
  };

  const setLanguage = (language) => {
    return voiceReaderService.setLanguage(language);
  };

  return {
    ...status,
    
    toggle,
    speak,
    speakElement,
    speakPage,
    speakElements,
    speakForm,
    stop,
    pause,
    resume,
    updateSettings,
    
    toggleMouseReading,
    readElementUnderMouse,
    readElement,
    updateMouseDelay,
    
    setLanguage
  };
};
