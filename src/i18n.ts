import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './locales/en/translation.json';
import zhTranslation from './locales/zh/translation.json';
import viTranslation from './locales/vi/translation.json';

// Define resource structure for type safety
declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    resources: {
      translation: typeof enTranslation;
    };
  }
}

// Define resources with proper typing
const resources = {
  en: {
    translation: enTranslation
  },
  zh: {
    translation: zhTranslation
  },
  vi: {
    translation: viTranslation
  }
};

// Initialize i18next
i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    returnNull: false
  });

export default i18n;
