import {
  ArrowRight,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck
} from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Footer from '../components/Footer';
import Header from '../components/Header';
import { useGsapReveal } from '../motion/useGsapReveal';

const LEGAL_PAGES = [
  'privacy',
  'terms',
  'refunds'
];

const SECTION_ICONS = [
  ShieldCheck,
  HeartHandshake,
  LockKeyhole
];

const HERO_IMAGES = {
  safety:
    '/assets/public/safety.webp',
  privacy:
    '/assets/public/privacy.webp'
};

const primaryButtonClass =
  'inline-flex min-h-[45px] items-center justify-center gap-[10px] rounded-[99px] border border-transparent bg-[#681d25] px-5 text-[12px] font-extrabold text-white transition duration-200 hover:bg-[#431318]';

export default function PublicInfoPage({
  type
}) {
  const { t } = useTranslation();

  const root = useRef(null);

  useGsapReveal(
    root,
    '[data-reveal]',
    [type]
  );

  const page = t(
    `publicPages:${type}`,
    {
      returnObjects: true
    }
  );

  const isLegal =
    LEGAL_PAGES.includes(type);

  const heroImage =
    HERO_IMAGES[type];

  return (
    <div
      ref={root}
      className="min-h-screen bg-[#f5f0e8]"
    >
      <Header solid />

      <main>
        <section className="relative overflow-hidden border-b border-[#ddd0c1] bg-[#eee3d5] pb-[90px] pt-[110px] max-[767px]:pb-[60px] max-[767px]:pt-[75px]">
          {heroImage && (
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-[42%] bg-cover bg-center opacity-[0.42] max-[767px]:w-[60%] max-[767px]:opacity-[0.12]"
              style={{
                backgroundImage:
                  `linear-gradient(90deg,#eee3d5 0%,transparent 38%),url('${heroImage}')`
              }}
            />
          )}

          <div
            data-reveal
            className="page-container relative z-10"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
              {page.eyebrow}
            </p>

            <h1 className="mt-[18px] max-w-[920px] font-['Cormorant_Garamond'] text-[clamp(52px,7vw,92px)] font-medium leading-[0.94] tracking-[-0.03em] text-[#431318]">
              {page.title}
            </h1>

            <p className="mt-[27px] max-w-[650px] text-[15px] leading-[1.9] text-[#756a60]">
              {page.intro}
            </p>

            {isLegal && (
              <div className="mt-[38px] flex gap-[25px] text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#876d56]">
                <span>
                  {t(
                    'redesign:public.document'
                  )}
                </span>

                <span>
                  {t(
                    'redesign:public.effective'
                  )}
                </span>
              </div>
            )}
          </div>
        </section>

        <section
          className={`page-container py-[85px] ${
            isLegal
              ? 'max-w-[860px]'
              : ''
          }`}
        >
          {isLegal && (
            <div className="mb-8 border border-[#d5a948] bg-[#fff9e9] px-[1.2rem] py-4">
              <strong>
                {t(
                  'publicPages:legal.title'
                )}
              </strong>

              <p className="mt-[0.35rem]">
                {t(
                  'publicPages:legal.body'
                )}
              </p>
            </div>
          )}

          {page.sections && (
            <div
              className={
                isLegal
                  ? 'block'
                  : 'grid grid-cols-3 gap-px max-[1024px]:grid-cols-2 max-[767px]:grid-cols-1'
              }
            >
              {page.sections.map(
                (
                  [
                    title,
                    body
                  ],
                  index
                ) => {
                  const SectionIcon =
                    SECTION_ICONS[
                      index %
                        SECTION_ICONS.length
                    ];

                  return (
                    <article
                      data-reveal
                      key={title}
                      className={
                        isLegal
                          ? 'border-b border-[#d9cdbf] bg-transparent py-[42px]'
                          : '-mb-px -mr-px min-h-[260px] border border-[#d9cdbf] bg-[#fffdf8] p-[42px] max-[767px]:min-h-0 max-[767px]:p-[30px]'
                      }
                    >
                      <SectionIcon className="text-[#aa7a42]" />

                      <h2 className="mt-6 font-['Cormorant_Garamond'] text-[35px] font-medium leading-[1.05]">
                        {title}
                      </h2>

                      <p className="mt-4 text-[13px] leading-[1.9] text-[#756a60]">
                        {body}
                      </p>
                    </article>
                  );
                }
              )}
            </div>
          )}

          {!isLegal && (
            <div className="mt-[70px] flex items-center justify-between gap-[30px] bg-[#e9ddce] p-[45px] max-[767px]:flex-col max-[767px]:items-start max-[767px]:p-[30px]">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
                  {t(
                    'publicPages:cta.eyebrow'
                  )}
                </p>

                <h2 className="mt-2 font-['Cormorant_Garamond'] text-[35px] font-medium leading-[1.05]">
                  {t(
                    'publicPages:cta.title'
                  )}
                </h2>
              </div>

              <Link
                className={primaryButtonClass}
                to="/register"
              >
                {t(
                  'publicPages:cta.action'
                )}

                <ArrowRight
                  size={16}
                />
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}