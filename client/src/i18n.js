import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enHome from './locales/en/home.json';
import viHome from './locales/vi/home.json';
import enInventory from './locales/en/inventory.json';
import viInventory from './locales/vi/inventory.json';

const resources = {
  en: {
    translation: {
      ...enHome,
      ...enInventory
    }
  },
  vi: {
    translation: {
      ...viHome,
      ...viInventory
    }
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
