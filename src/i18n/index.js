import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/common.json';
import enHomeExtra from './locales/en/homeExtra.json';
import gu from './locales/gu/common.json';
import guHomeExtra from './locales/gu/homeExtra.json';
import hi from './locales/hi/common.json';
import hiHomeExtra from './locales/hi/homeExtra.json';

export const SUPPORTED_LANGUAGES = ['en', 'gu', 'hi'];
export const normalizeLanguage = (value) => {
  const code = String(value || '').toLowerCase().split('-')[0];
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
};
const saved = localStorage.getItem('ksm_language');
const initialLanguage = normalizeLanguage(saved || navigator.language);

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en, homeExtra: enHomeExtra },
    gu: { translation: gu, homeExtra: guHomeExtra },
    hi: { translation: hi, homeExtra: hiHomeExtra }
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false
});

const applyDocumentLanguage = (language) => {
  const normalized = normalizeLanguage(language);
  document.documentElement.lang = normalized;
  localStorage.setItem('ksm_language', normalized);
};
applyDocumentLanguage(i18n.language);
i18n.on('languageChanged', applyDocumentLanguage);

export default i18n;
