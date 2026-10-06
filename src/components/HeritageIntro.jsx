import {
  ArrowUpRight
} from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useGsapReveal } from '../motion/useGsapReveal';

export default function HeritageIntro() {
  const { t } =
    useTranslation();

  const root =
    useRef(null);

  useGsapReveal(root);

  return (
    <section
      ref={root}
      className="relative bg-[#f4efe8] pb-28 pt-20 lg:pb-36 lg:pt-28"
    >
      <div className="page-container">
        <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-28">
          <div
            data-reveal
            className="relative mx-auto w-full max-w-[500px] lg:mx-0"
          >
            <div className="overflow-hidden rounded-[230px_230px_2px_2px]">
              <img
                src="/assets/public/heritage-arches.webp"
                loading="lazy"
                alt="Carved sandstone arches overlooking a heritage courtyard"
                className="h-[520px] w-full object-cover sm:h-[600px] lg:h-[650px]"
              />
            </div>

            <div className="absolute -left-10 top-[95px] hidden lg:block">
              <div className="mx-auto h-[82px] w-px bg-[#b89771]/60" />

              <span className="mt-5 block -rotate-90 whitespace-nowrap text-[8px] font-extrabold uppercase tracking-[0.32em] text-[#9b7958]">
                {t(
                  'home.heritageAccent'
                )}
              </span>
            </div>

            <div className="absolute -bottom-6 -right-6 hidden h-36 w-36 border border-[#af885d]/30 xl:block" />
          </div>

          <div
            data-reveal
            className="max-w-[680px]"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
              {t(
                'home.heritageEyebrow'
              )}
            </p>

            <h2 className="mt-7 font-display text-[47px] leading-[1.02] tracking-[-0.035em] text-[#291a17] sm:text-[57px] lg:text-[65px]">
              {t(
                'home.heritageTitle'
              )}
            </h2>

            <div className="mt-10 h-px w-full bg-[#d2c3b3]" />

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
                size={15}
                className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}