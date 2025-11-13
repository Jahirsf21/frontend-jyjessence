import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './es';
import en from './en';
import fr from './fr';
import pt from './pt';
import zh from './zh';
import cab from './cab';
import bribri from './bribri';

// Each language file must export: export default { translation: { ... } }
const resources = {
  es,
  en,
  fr,
  pt,
  zh,
  cab,
  bribri
};


i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false // React ya protege contra XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;