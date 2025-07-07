import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from './locales/en/home.json';
import viTranslation from './locales/vi/home.json';

const resources = {
  en: {
    translation: enTranslation
  },
  vi: {
    translation: viTranslation
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'vi', // default language
  fallbackLng: 'vi',
  interpolation: {
    escapeValue: false // react already safes from xss
  }
});

export default i18n;
