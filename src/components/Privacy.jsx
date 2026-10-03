import {
  Eye,
  Fingerprint,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { useGsapReveal } from "../motion/useGsapReveal";

export default function Privacy() {
  const { t } = useTranslation();
  const root = useRef(null);

  useGsapReveal(root);

  const privacyItems = [
    {
      icon: Eye,
      title: t("home.privacyItems.photosTitle"),
      body: t("home.privacyItems.photosBody"),
      number: "01"
    },
    {
      icon: LockKeyhole,
      title: t("home.privacyItems.contactTitle"),
      body: t("home.privacyItems.contactBody"),
      number: "02"
    },
    {
      icon: Fingerprint,
      title: t("home.privacyItems.verifiedTitle"),
      body: t("home.privacyItems.verifiedBody"),
      number: "03"
    }
  ];

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-[#EDE2D4] py-20 text-[#211715] sm:py-24 lg:py-32"
    >
      {/* subtle atmospheric shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-52 top-[-140px] h-[520px] w-[520px] rounded-full bg-[#C49B70]/10 blur-[130px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-44 bottom-[-180px] h-[520px] w-[520px] rounded-full bg-[#681D25]/5 blur-[140px]"
      />

      <div className="page-container relative z-10">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20 xl:gap-28">
          {/* =========================================
              LEFT — PRIVACY VISUAL
          ========================================== */}

          <div
            data-reveal
            className="relative mx-auto w-full max-w-[560px] lg:mx-0"
          >
            {/* architectural offset frame */}
            <div
              aria-hidden="true"
              className="absolute -left-5 top-8 hidden h-[88%] w-full border border-[#AA7A42]/25 sm:block"
            />

            {/* main image */}
            <div className="relative overflow-hidden border border-[#D9CCBD] bg-[#E9DFD3] shadow-[0_32px_90px_rgba(57,30,24,0.12)]">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src="/assets/public/privacy.webp"
                  alt="A carved jharokha representing intentional, controlled visibility"
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-[1400ms] ease-out hover:scale-[1.025]"
                />

                {/* soft neutral overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#211715]/55 via-transparent to-transparent" />

                {/* top label */}
                <div className="absolute left-5 top-5 flex items-center gap-2 border border-white/20 bg-[#211715]/35 px-3 py-2 backdrop-blur-md">
                  <ShieldCheck
                    size={14}
                    strokeWidth={1.5}
                    className="text-[#E0B77F]"
                  />

                  <span className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-white">
                    {t("home.privacyEyebrow")}
                  </span>
                </div>

                {/* bottom editorial message */}
                <div className="absolute mb-8 inset-x-0 bottom-0 p-6 sm:p-8 lg:p-9">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-9 bg-[#D8AE76]" />

                    <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#E0B77F]">
                      Privacy by design
                    </span>
                  </div>

                  <p className="mt-4 max-w-[390px] font-display text-[30px] leading-[1.05] text-white sm:text-[36px]">
                    {t("home.privacyTitle")}
                  </p>
                </div>
              </div>
            </div>

            {/* floating trust card */}
            <div className="relative z-20 -mt-8 ml-auto mr-4 w-[calc(100%-2rem)] max-w-[360px] border border-[#D8C8B5] bg-[#FFFDF8] p-5 shadow-[0_20px_50px_rgba(50,28,22,0.1)] sm:-mt-12 sm:mr-[-26px]">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#681D25] text-white">
                  <LockKeyhole size={16} strokeWidth={1.6} />
                </span>

                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#91683F]">
                    {t("home.privacyEyebrow")}
                  </p>

                  <p className="mt-2 text-[12px] leading-6 text-[#756A60]">
                    {t("home.privacyBody")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              RIGHT — PRIVACY CONTENT
          ========================================== */}

          <div className="lg:pl-2">
            <div data-reveal className="max-w-[620px]">
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-[#AA7A42]" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                  {t("home.privacyEyebrow")}
                </p>
              </div>

              <h2 className="mt-6 max-w-[600px] font-display text-[52px] font-medium leading-[0.95] tracking-[-0.035em] text-[#2B1A18] sm:text-[64px] lg:text-[72px]">
                {t("home.privacyTitle")}
              </h2>

              <p className="mt-7 max-w-[560px] text-[14px] leading-8 text-[#756A60]">
                {t("home.privacyBody")}
              </p>
            </div>

            {/* privacy principles */}
            <div className="mt-12 border-t border-[#D6C8B8]">
              {privacyItems.map(
                ({ icon: Icon, title, body, number }, index) => (
                  <article
                    key={title}
                    data-reveal
                    className="group grid grid-cols-[48px_1fr_auto] gap-4 border-b border-[#D6C8B8] py-7 sm:grid-cols-[56px_1fr_auto] sm:gap-5 sm:py-8"
                  >
                    {/* icon */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#CDB9A3] text-[#681D25] transition duration-300 group-hover:border-[#681D25] group-hover:bg-[#681D25] group-hover:text-white">
                      <Icon
                        size={18}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* copy */}
                    <div>
                      <h3 className="font-display text-[27px] font-medium leading-tight text-[#2F1D1B] sm:text-[31px]">
                        {title}
                      </h3>

                      <p className="mt-3 max-w-[470px] text-[13px] leading-7 text-[#756A60]">
                        {body}
                      </p>
                    </div>

                    {/* number */}
                    <span className="pt-1 font-display text-[18px] italic text-[#B28A5E]">
                      {number}
                    </span>
                  </article>
                )
              )}
            </div>

            {/* final reassurance strip */}
            <div
              data-reveal
              className="mt-10 flex items-start gap-4 border-l-2 border-[#AA7A42] bg-[#EEE4D8]/70 px-5 py-5 sm:px-6"
            >
              <ShieldCheck
                size={19}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-[#681D25]"
              />

              <p className="max-w-[520px] text-[12px] leading-6 text-[#66574F]">
                {t("home.privacyBody")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}