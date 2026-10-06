import { ArrowRight, HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { useGsapReveal } from '../motion/useGsapReveal';

const LEGAL_PAGES = ['privacy', 'terms', 'refunds'];
const SECTION_ICONS = [ShieldCheck, HeartHandshake, LockKeyhole];

export default function PublicInfoPage({ type }) {
  const { t } = useTranslation();

  const root = useRef(null);

  useGsapReveal(root, '[data-reveal]', [type]);

  const page = t(`publicPages:${type}`, { returnObjects: true });
  const isLegal = LEGAL_PAGES.includes(type);

  return (
    <div
      ref={root}
      className={`public-shell public-shell-${type}`}
    >
      <Header solid />

      <main>
        {/* HERO */}

        <section
          className={`public-hero public-hero-${type}`}
        >
          <div data-reveal className="page-container">
            <p className="eyebrow">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>

            {isLegal && (
              <div className="mt-[38px] flex gap-[25px] text-[9px] font-extrabold uppercase tracking-[.12em] text-[#876d56]">
                <span>{t('redesign:public.document')}</span>
                <span>{t('redesign:public.effective')}</span>
              </div>
            )}
          </div>
        </section>

        {/* CONTENT */}

        <section
          className={`public-content public-content-${type} page-container`}
        >
          {isLegal && (
            <div className="mb-8 border border-[#d5a948] bg-[#fff9e9] px-[1.2rem] py-4 [&_p]:mt-[.35rem]">
              <strong>{t('publicPages:legal.title')}</strong>
              <p>{t('publicPages:legal.body')}</p>
            </div>
          )}

          {page.sections && (
            <div className="editorial-grid">
              {page.sections.map(([title, body], index) => {
                const SectionIcon = SECTION_ICONS[index % SECTION_ICONS.length];

                return (
                  <article data-reveal key={title}>
                    <SectionIcon />
                    <h2>{title}</h2>
                    <p>{body}</p>
                  </article>
                );
              })}
            </div>
          )}

          {!isLegal && (
            <div className="public-cta">
              <div>
                <p className="eyebrow">{t('publicPages:cta.eyebrow')}</p>
                <h2>{t('publicPages:cta.title')}</h2>
              </div>

              <Link className="primary-button" to="/register">
                {t('publicPages:cta.action')}
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
