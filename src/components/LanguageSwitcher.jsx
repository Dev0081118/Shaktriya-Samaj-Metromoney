import {
  Languages
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../context/AuthContext';

const choices = [
  [
    'en',
    'English'
  ],
  [
    'gu',
    'ગુજરાતી'
  ],
  [
    'hi',
    'हिन्दी'
  ]
];

export default function LanguageSwitcher({
  compact = false,
  global = false
}) {
  const {
    i18n,
    t
  } = useTranslation();

  const auth =
    useAuth();

  const setLanguage = (
    language
  ) => {
    i18n.changeLanguage(
      language
    );

    auth?.saveLanguage?.(
      language
    );
  };

  const change = (event) => {
    setLanguage(
      event.target.value
    );
  };

  if (global) {
    return (
      <nav
        className="fixed bottom-[18px] right-[18px] z-[200] flex items-center gap-[3px] rounded-full border border-[#c7a879] bg-[rgba(32,22,21,.96)] p-[6px] text-white shadow-[0_14px_45px_rgba(31,15,14,.28)] backdrop-blur-[14px] max-[520px]:bottom-3 max-[520px]:left-1/2 max-[520px]:right-auto max-[520px]:max-w-[calc(100vw-24px)] max-[520px]:-translate-x-1/2"
        aria-label={t(
          'language.select'
        )}
      >
        <Languages
          size={16}
          aria-hidden="true"
          className="ml-[5px] mr-[7px] text-[#d9b476]"
        />

        {choices.map(
          ([
            value,
            label
          ]) => {
            const active =
              i18n.resolvedLanguage ===
              value;

            return (
              <button
                type="button"
                aria-current={
                  active
                    ? 'true'
                    : undefined
                }
                className={`whitespace-nowrap rounded-full px-[11px] py-2 text-[11px] font-bold outline-none transition max-[520px]:px-[9px] max-[520px]:text-[10px] ${
                  active
                    ? 'bg-[#f4eee5] text-[#4d1920] shadow-[0_2px_8px_#0002]'
                    : 'bg-transparent text-white/70 hover:bg-white/[0.09] hover:text-white focus-visible:bg-white/[0.09] focus-visible:text-white'
                }`}
                onClick={() =>
                  setLanguage(
                    value
                  )
                }
                key={value}
              >
                {label}
              </button>
            );
          }
        )}
      </nav>
    );
  }

  return (
    <label className="inline-flex min-w-0 items-center gap-[6px] text-inherit focus-within:rounded-full focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#b58a55]">
      <Languages
        size={15}
        aria-hidden="true"
      />

      <span className="sr-only">
        {t(
          'language.select'
        )}
      </span>

      <select
        aria-label={t(
          'language.select'
        )}
        value={
          i18n.resolvedLanguage ||
          'en'
        }
        onChange={change}
        className={`rounded-full border border-current bg-transparent py-[7px] pl-[10px] pr-[25px] text-[10px] text-inherit ${
          compact
            ? 'max-w-[68px] py-[6px]'
            : 'max-w-[120px]'
        }`}
      >
        {choices.map(
          ([
            value,
            label
          ]) => (
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