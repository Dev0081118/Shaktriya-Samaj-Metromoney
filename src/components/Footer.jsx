import {
  ArrowUpRight,
  BookHeart,
  Mail,
  ShieldCheck
} from 'lucide-react';

import {
  Link
} from 'react-router-dom';

import {
  useTranslation
} from 'react-i18next';

import BrandLogo from './BrandLogo';
import LanguageSwitcher from './LanguageSwitcher';

const legalLinks = [
  { to: '/privacy', labelKey: 'public.privacy', defaultLabel: 'Privacy Policy' },
  { to: '/safety', labelKey: 'public.safety', defaultLabel: 'Safety' },
  { to: '/terms', labelKey: 'public.terms', defaultLabel: 'Terms & Conditions' },
  { to: '/refunds', labelKey: 'public.refunds', defaultLabel: 'Refund Policy' },
  { to: '/submit-success-story', labelKey: 'public.tellStory', defaultLabel: 'Tell Your Success Story' }
];

export default function Footer() {
  const {
    t
  } =
    useTranslation();

  return (
    <footer className="bg-texture-dark border-t border-[#3d2422] text-white">
      <div className="page-container">
        {/* =====================================
            TOP
        ====================================== */}

        <div className="grid gap-12 border-b border-white/10 py-14 sm:py-16 lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:gap-16 lg:py-20">
          {/* =================================
              BRAND
          ================================== */}

          <div className="max-w-[460px]">
            <Link
              to="/"
              aria-label="Royal Rajputana Matrimony home"
              className="inline-flex items-center"
            >
              <BrandLogo
                variant="whiteHorizontal"
                loading="lazy"
                className="h-[68px] w-auto max-w-[285px] object-contain object-left sm:h-[76px] sm:max-w-[320px]"
              />
            </Link>

            <p className="mt-6 max-w-[430px] text-[12px] leading-7 text-white/55">
              {t(
                'redesign:footer.mission'
              )}
            </p>

            <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold text-[#D1A66F]">
              <ShieldCheck size={14} className="shrink-0" />
              <span>Verified Kshatriya community matrimony</span>
            </div>
          </div>

          {/* =================================
              SUPPORT & STORY
          ================================== */}

          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-[#B68C61]">
              {t(
                'redesign:footer.support'
              )}
            </p>

            <a
              href="mailto:support@kshatriya.example"
              className="mt-5 flex items-center gap-3 text-[11px] text-white/65 transition hover:text-white"
            >
              <Mail
                size={14}
                strokeWidth={1.5}
              />
              {t('redesign:footer.email')}
            </a>

            <Link
              to="/submit-success-story"
              className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold text-[#D1A66F] transition hover:text-[#E2BB86]"
            >
              <BookHeart size={14} />
              <span>Tell Your Success Story</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {/* =================================
              LANGUAGE
          ================================== */}

          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-[#B68C61]">
              {t(
                'redesign:footer.language'
              )}
            </p>

            <div className="mt-5 text-white/70">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* =====================================
            MEANINGFUL FOOTER ENDPOINTS
        ====================================== */}

        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/10 py-8">
          <nav aria-label="Footer links" className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {legalLinks.map(({ to, labelKey, defaultLabel }) => (
              <Link
                key={to}
                to={to}
                className="text-[11px] text-white/75 transition duration-200 hover:text-[#D3A66F]"
              >
                {t(labelKey, defaultLabel)}
              </Link>
            ))}
          </nav>
        </div>

        {/* =====================================
            BOTTOM
        ====================================== */}

        <div className="flex flex-col gap-3 py-7 text-[8px] font-semibold uppercase tracking-[0.15em] text-white/65 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <span>
            © {new Date().getFullYear()} Royal Rajputana Matrimony
          </span>

          <span>
            {t('redesign:footer.heritage')}
          </span>
        </div>
      </div>
    </footer>
  );
}
