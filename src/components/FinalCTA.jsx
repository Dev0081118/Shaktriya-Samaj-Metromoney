import {
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRef } from "react";

import { useGsapReveal } from "../motion/useGsapReveal";

export default function FinalCTA() {
  const { t } = useTranslation();

  const root = useRef(null);
  useGsapReveal(root);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-[#4A1F24] text-white"
    >
      {/* Background image */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
      >
        <img
          src="/assets/public/final-journey.webp"
          alt=""
          className="h-full w-full object-cover object-center opacity-50"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1114]/95 via-[#4A1F24]/82 to-[#4A1F24]/45" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#251012]/70 via-transparent to-transparent" />
      </div>

      {/* ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-[-220px] h-[500px] w-[500px] rounded-full bg-[#C49B70]/10 blur-[150px]"
      />

      <div className="page-container relative z-10">
        <div className="grid min-h-[520px] items-center gap-14 py-20 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-24 lg:py-28">
          {/* LEFT */}

          <div
            data-reveal
            className="max-w-[720px]"
          >
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-[#D2A66F]" />

              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#DDB981]">
                {t("home.registrationFree")}
              </p>
            </div>

            <h2 className="mt-6 max-w-[720px] font-display text-[50px] font-medium leading-[0.95] tracking-[-0.035em] text-[#FFF9F3] sm:text-[62px] lg:text-[72px]">
              {t("home.ctaTitle")}
            </h2>

            <p className="mt-7 max-w-[580px] text-[13px] leading-7 text-white/65 sm:text-[14px] sm:leading-8">
              {t("home.ctaBody")}
            </p>
          </div>

          {/* RIGHT */}

          <div
            data-reveal
            className="lg:border-l lg:border-white/15 lg:pl-10 xl:pl-14"
          >
            <div className="border-t border-[#D0A16B]/60 pt-7">
              <Link
                to="/register"
                className="group flex min-h-[58px] w-full items-center justify-between bg-[#FFF9F2] px-6 text-[11px] font-extrabold text-[#3A1B1E] transition duration-300 hover:bg-white sm:px-7"
              >
                <span>
                  {t("home.ctaAction")}
                </span>

                <ArrowUpRight
                  size={18}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>

              <div className="mt-5 flex items-start gap-3 text-white/65">
                <ShieldCheck
                  size={16}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[#DDB981]"
                />

                <p className="text-[11px] leading-6">
                  {t("redesign:cta.note")}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className="h-px w-7 bg-[#D0A16B]" />

                <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-[#DDB981]">
                  {t("redesign:cta.trust")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* transition into footer */}
      <div className="h-px w-full bg-[#C49B70]/25" />
    </section>
  );
}