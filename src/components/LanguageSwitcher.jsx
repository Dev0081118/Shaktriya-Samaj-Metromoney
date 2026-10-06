import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../context/AuthContext';

const choices = [
  ['en', 'English'],
  ['gu', 'ગુજરાતી'],
  ['hi', 'हिन्दी']
];

export default function LanguageSwitcher({
  compact = false,
  global = false
}) {
  const { i18n, t } = useTranslation();
  const auth = useAuth();

  const setLanguage = (language) => {
    i18n.changeLanguage(language);
    auth?.saveLanguage?.(language);
  };

  const change = (event) => {
    setLanguage(event.target.value);
  };

  if (global) {
    return (
      <nav
        className="fixed bottom-[16px] right-[16px] z-[200] flex items-center gap-[2px] rounded-full border border-[#c7a879] bg-[rgba(32,22,21,.96)] p-[4px] text-white shadow-[0_10px_30px_rgba(31,15,14,.24)] backdrop-blur-[14px] max-[520px]:bottom-[10px] max-[520px]:left-1/2 max-[520px]:right-auto max-[520px]:max-w-[calc(100vw-20px)] max-[520px]:-translate-x-1/2"
        aria-label={t('language.select')}
      >
        <Languages
          size={13}
          aria-hidden="true"
          className="ml-[4px] mr-[4px] text-[#d9b476]"
        />

        {choices.map(([value, label]) => {
          const active =
            i18n.resolvedLanguage === value;

          return (
            <button
              type="button"
              aria-current={
                active ? 'true' : undefined
              }
              className={`whitespace-nowrap rounded-full px-[8px] py-[5px] text-[8px] font-bold outline-none transition max-[520px]:px-[7px] max-[520px]:text-[7px] ${
                active
                  ? 'bg-[#f4eee5] text-[#4d1920] shadow-[0_2px_6px_#0002]'
                  : 'bg-transparent text-white/70 hover:bg-white/[0.09] hover:text-white focus-visible:bg-white/[0.09] focus-visible:text-white'
              }`}
              onClick={() =>
                setLanguage(value)
              }
              key={value}
            >
              {label}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <label className="inline-flex min-w-0 items-center gap-[5px] text-inherit focus-within:rounded-full focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#b58a55]">
      <Languages
        size={13}
        aria-hidden="true"
      />

      <span className="sr-only">
        {t('language.select')}
      </span>

      <select
        aria-label={t('language.select')}
        value={
          i18n.resolvedLanguage ||
          'en'
        }
        onChange={change}
        className={`rounded-full border border-current bg-transparent py-[5px] pl-[8px] pr-[22px] text-[8px] text-inherit ${
          compact
            ? 'max-w-[62px] py-[4px]'
            : 'max-w-[105px]'
        }`}
      >
        {choices.map(
          ([value, label]) => (
            <option
              className="bg-white text-[#211715]"
              value={value}
              key={value}
            >
              {compact
                ? value.toUpperCase()
                : label}
            </option>
          )
        )}
      </select>
    </label>
  );
}