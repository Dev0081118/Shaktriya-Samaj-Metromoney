import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const choices = [['en', 'English'], ['gu', 'ગુજરાતી'], ['hi', 'हिन्दी']];
export default function LanguageSwitcher({ compact = false, global = false }) {
  const { i18n, t } = useTranslation(), auth = useAuth();
  const change = (event) => {
    const language = event.target.value;
    i18n.changeLanguage(language);
    auth?.saveLanguage?.(language);
  };
  if (global) return <nav className="global-language-bar" aria-label={t('language.select')}>
    <Languages size={16} aria-hidden="true" />
    {choices.map(([value, label]) => <button type="button" aria-current={i18n.resolvedLanguage === value ? 'true' : undefined} className={i18n.resolvedLanguage === value ? 'active' : ''} onClick={() => { i18n.changeLanguage(value); auth?.saveLanguage?.(value); }} key={value}>{label}</button>)}
  </nav>;
  return <label className={`language-switcher ${compact ? 'compact' : ''}`}>
    <Languages size={15} aria-hidden="true" />
    <span className="sr-only">{t('language.select')}</span>
    <select aria-label={t('language.select')} value={i18n.resolvedLanguage || 'en'} onChange={change}>
      {choices.map(([value, label]) => <option value={value} key={value}>{compact ? value.toUpperCase() : label}</option>)}
    </select>
  </label>;
}
