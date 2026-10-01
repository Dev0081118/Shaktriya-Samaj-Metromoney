import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import en from './locales/en/common.json';
import gu from './locales/gu/common.json';
import hi from './locales/hi/common.json';
import i18n from './index';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { formatCurrency, formatDate, formatNumber, getLocale } from '../utils/formatters';

const paths = (object, prefix = '') => Object.entries(object).flatMap(([key, value]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  return value && typeof value === 'object' ? paths(value, path) : [path];
});
const at = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);

describe('translations', () => {
  it.each([['Gujarati', gu], ['Hindi', hi]])('%s contains every English key', (_name, locale) => {
    for (const key of paths(en)) expect(at(locale, key), key).toBeTruthy();
  });
  it('switches language, persists it, and updates document language', async () => {
    await i18n.changeLanguage('en');
    render(<LanguageSwitcher />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'gu' } });
    expect(i18n.resolvedLanguage).toBe('gu');
    expect(localStorage.getItem('ksm_language')).toBe('gu');
    expect(document.documentElement.lang).toBe('gu');
  });
  it('falls back to English for an absent Gujarati key', async () => {
    await i18n.changeLanguage('gu');
    expect(i18n.t('states.unavailable')).toBe('હાલ ઉપલબ્ધ નથી');
    expect(i18n.t('missing.key', { defaultValue: 'English fallback' })).toBe('English fallback');
  });
});

describe('locale formatters', () => {
  it.each([['en', 'en-IN'], ['gu', 'gu-IN'], ['hi', 'hi-IN']])('maps %s to %s', (language, locale) => expect(getLocale(language)).toBe(locale));
  it.each(['en', 'gu', 'hi'])('formats date, number, and INR currency for %s', (language) => {
    expect(formatDate('2026-10-01T00:00:00Z', language)).toBeTruthy();
    expect(formatNumber(12345, language)).not.toContain('NaN');
    expect(formatCurrency(4999, language)).toMatch(/4|४|૪/);
  });
});
