import {
  ArrowUpRight
} from 'lucide-react';

import {
  useRef
} from 'react';

import {
  useTranslation
} from 'react-i18next';

import {
  Link
} from 'react-router-dom';

import {
  useGsapReveal
} from '../motion/useGsapReveal';

import {
  FloralDivider,
  HeritageArch,
  HeritagePillar
} from './heritage/HeritageOrnaments';

export default function HeritageIntro() {
  const {
    t
  } =
    useTranslation();

  const root =
    useRef(null);

  useGsapReveal(
    root
  );

  return (
    <section
      ref={
        root
      }
      className="relative overflow-hidden bg-[#f4efe8] pb-28 pt-20 lg:pb-36 lg:pt-28"
    >
      {/* =====================================
          CUSTOM VECTOR ARCHITECTURE
      ====================================== */}

      <HeritageArch className="pointer-events-none absolute -left-[145px] top-[70px] hidden h-[760px] text-[#9B6D42] opacity-[0.055] lg:block" />

      <HeritagePillar className="pointer-events-none absolute -right-[22px] bottom-[-90px] hidden h-[720px] text-[#8F6038] opacity-[0.07] xl:block" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[42%] top-[-150px] h-[420px] w-[420px] rounded-full bg-[#C49B70]/10 blur-[130px]"
      />

      <div className="page-container relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-28">
          <div
            data-reveal
            className="relative mx-auto w-full max-w-[500px] lg:mx-0"
          >
            {/* arch echo behind photography */}

            <HeritageArch className="pointer-events-none absolute -left-9 -top-10 hidden h-[690px] text-[#AA7A42] opacity-[0.18] sm:block" />

            <div className="relative z-10 overflow-hidden rounded-[230px_230px_2px_2px]">
              <img
                src="/assets/public/heritage-arches.webp"
                loading="lazy"
                alt="Carved sandstone arches overlooking a heritage courtyard"
                className="h-[520px] w-full object-cover sm:h-[600px] lg:h-[650px]"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#321b1638] via-transparent to-transparent"
              />
            </div>

            <div className="absolute -left-10 top-[95px] z-20 hidden lg:block">
              <div className="mx-auto h-[82px] w-px bg-[#b89771]/60" />

              <span className="mt-5 block -rotate-90 whitespace-nowrap text-[8px] font-extrabold uppercase tracking-[0.32em] text-[#9b7958]">
                {t(
                  'home.heritageAccent'
                )}
              </span>
            </div>

            <div className="absolute -bottom-6 -right-6 z-0 hidden h-36 w-36 border border-[#af885d]/30 xl:block" />
          </div>

          <div
            data-reveal
            className="relative max-w-[680px]"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#7a5228]">
              {t(
                'home.heritageEyebrow'
              )}
            </p>

            <h2 className="mt-7 font-display text-[47px] leading-[1.02] tracking-[-0.035em] text-[#291a17] sm:text-[57px] lg:text-[65px]">
              {t(
                'home.heritageTitle'
              )}
            </h2>

            <FloralDivider className="mt-9 h-auto w-full max-w-[560px] text-[#A57847] opacity-60" />

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <p className="text-[14px] leading-7 text-[#77675e]">
                {t(
                  'home.heritageBody1'
                )}
              </p>

              <p className="text-[14px] leading-7 text-[#77675e]">
                {t(
                  'home.heritageBody2'
                )}
              </p>
            </div>

            <Link
              to="/about"
              className="group mt-10 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#741f27]"
            >
              {t(
                'home.approach'
              )}

              <ArrowUpRight
                size={
                  15
                }
                className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}