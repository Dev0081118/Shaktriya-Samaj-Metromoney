import {
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const links = [
  [
    'nav.discover',
    '/discover'
  ],
  [
    'nav.howItWorks',
    '/how-it-works'
  ],
  [
    'nav.stories',
    '/success-stories'
  ],
  [
    'nav.membership',
    '/membership'
  ],
  [
    'nav.about',
    '/about'
  ]
];

export default function Header({
  solid = false
}) {
  const [open, setOpen] =
    useState(false);

  const { user } =
    useAuth();

  const { t } =
    useTranslation();

  return (
    <header
      className={`inset-x-0 top-0 z-50 ${
        solid
          ? 'relative bg-[linear-gradient(110deg,#241716,#431318)]'
          : 'absolute'
      }`}
    >
      <div className="page-container flex h-24 items-center justify-between">
        <Link
          to="/"
          className="relative z-10"
        >
          <div className="font-display text-[22px] font-semibold tracking-[0.06em] text-white">
            KSHATRIYA
          </div>

          <div className="mt-[-3px] text-[9px] font-semibold uppercase tracking-[0.38em] text-white/55">
            {t('brand.society')}
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map(
            ([key, to]) => (
              <Link
                to={to}
                key={to}
                className="text-[13px] font-medium text-white/75 transition hover:text-white"
              >
                {t(key)}
              </Link>
            )
          )}
        </nav>

        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-[13px] font-semibold text-white"
              >
                {t(
                  'nav.dashboard'
                )}
              </Link>

              <Link
                to="/my-profile"
                aria-label={t(
                  'nav.myProfile'
                )}
                className="grid h-[38px] w-[38px] place-items-center rounded-full border border-[#ffffff55] font-extrabold text-white"
              >
                {user.email?.[0]?.toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="whitespace-nowrap text-[13px] font-semibold text-white"
              >
                {t(
                  'actions.signIn'
                )}
              </Link>

              <Link
                to="/register"
                className="shrink-0 whitespace-nowrap rounded-full border border-white/40 bg-white px-6 py-3 text-[12px] font-bold text-[#32171a] transition hover:bg-[#f4eee6]"
              >
                {t(
                  'actions.createProfile'
                )}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            setOpen(
              (current) => !current
            )
          }
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="relative z-10 text-white lg:hidden"
        >
          {open ? (
            <X />
          ) : (
            <Menu />
          )}
        </button>
      </div>

      {open && (
        <nav className="grid gap-px border-t border-[#ffffff18] bg-[#241716] px-5 pb-6 pt-3 lg:hidden">
          {links.map(
            ([key, to]) => (
              <Link
                onClick={() =>
                  setOpen(false)
                }
                to={to}
                key={to}
                className="border-b border-[#ffffff0d] p-3 text-[13px] text-white/80"
              >
                {t(key)}
              </Link>
            )
          )}

          <Link
            onClick={() =>
              setOpen(false)
            }
            to={
              user
                ? '/dashboard'
                : '/login'
            }
            className="border-b border-[#ffffff0d] p-3 text-[13px] text-white/80"
          >
            {user
              ? t(
                  'nav.dashboard'
                )
              : t(
                  'actions.signIn'
                )}
          </Link>

          {!user && (
            <Link
              onClick={() =>
                setOpen(false)
              }
              to="/register"
              className="border-b border-[#ffffff0d] p-3 text-[13px] text-white/80"
            >
              {t(
                'actions.createProfile'
              )}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}