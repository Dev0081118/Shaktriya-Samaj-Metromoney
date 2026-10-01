import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import i18n from '../i18n';

beforeEach(async () => {
  localStorage.setItem('ksm_language', 'en');
  await i18n.changeLanguage('en');
});
