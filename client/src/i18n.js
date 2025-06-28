import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import vi from './locales/vi.json';

const resources = {
  en: {
    // gọi là namespace, có thể là tên file json
    // translation: en
  },
  vi: {
    translation: vi
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
