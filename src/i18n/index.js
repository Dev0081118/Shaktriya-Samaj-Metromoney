import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/common.json';
import enHomeExtra from './locales/en/homeExtra.json';
import enPublicPages from './locales/en/publicPages.json';
import enRedesign from './locales/en/redesign.json';
import gu from './locales/gu/common.json';
import guHomeExtra from './locales/gu/homeExtra.json';
import guPublicPages from './locales/gu/publicPages.json';
import guRedesign from './locales/gu/redesign.json';
import hi from './locales/hi/common.json';
import hiHomeExtra from './locales/hi/homeExtra.json';
import hiPublicPages from './locales/hi/publicPages.json';
import hiRedesign from './locales/hi/redesign.json';

export const SUPPORTED_LANGUAGES = ['en', 'gu', 'hi'];
export const normalizeLanguage = (value) => {
  const code = String(value || '').toLowerCase().split('-')[0];
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
};
const saved = localStorage.getItem('ksm_language');
const initialLanguage = normalizeLanguage(saved || navigator.language);

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en, homeExtra: enHomeExtra, publicPages: enPublicPages, redesign: enRedesign },
    gu: { translation: gu, homeExtra: guHomeExtra, publicPages: guPublicPages, redesign: guRedesign },
    hi: { translation: hi, homeExtra: hiHomeExtra, publicPages: hiPublicPages, redesign: hiRedesign }
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
