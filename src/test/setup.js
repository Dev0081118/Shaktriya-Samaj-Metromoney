import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import i18n from '../i18n';

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(async () => {
  localStorage.setItem('ksm_language', 'en');
  await i18n.changeLanguage('en');
});
