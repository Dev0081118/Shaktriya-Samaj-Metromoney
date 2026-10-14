import {
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

import {
  Link
} from "react-router-dom";

import {
  useTranslation
} from "react-i18next";

import {
  useRef
} from "react";

import {
  useGsapReveal
} from "../motion/useGsapReveal";

import {
  FloralDivider,
  HeritageCorner
} from "./heritage/HeritageOrnaments";

function LotusEmblem({
  className = ""
}) {
  return (
    <svg
      viewBox="0 0 360 360"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="180"
        cy="180"
        r="148"
        stroke="currentColor"
        strokeWidth="1"
        opacity=".42"
      />

      <circle
        cx="180"
        cy="180"
        r="126"
        stroke="currentColor"
        strokeWidth=".8"
        opacity=".22"
      />

      <circle
        cx="180"
        cy="180"
        r="104"
        stroke="currentColor"
        strokeWidth=".7"
        opacity=".15"
      />

      <path
        d="
          M180 79
          C151 106 148 137 180 166
          C212 137 209 106 180 79Z
        "
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="
          M180 165
          C145 129 111 130 94 153
          C119 169 147 174 180 165Z
        "
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="
          M180 165
          C215 129 249 130 266 153
          C241 169 213 174 180 165Z
        "
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="
          M180 166
          C148 181 132 210 137 239
          C160 226 174 204 180 166Z
        "
        stroke="currentColor"
        strokeWidth="1.4"
      />

      <path
        d="
          M180 166
          C212 181 228 210 223 239
          C200 226 186 204 180 166Z
        "
        stroke="currentColor"
        strokeWidth="1.4"
      />

      <path
        d="
          M137 239
          C151 261 166 271 180 274
          C194 271 209 261 223 239
        "
        stroke="currentColor"
        strokeWidth="1.2"
      />

      <path
        d="
          M114 261
          C136 281 158 291 180 292
          C202 291 224 281 246 261
        "
        stroke="currentColor"
        strokeWidth="1"
        opacity=".65"
      />

      <path
        d="M86 180H45"
        stroke="currentColor"
        strokeWidth=".9"
        opacity=".5"
      />

      <path
        d="M315 180H274"
        stroke="currentColor"
        strokeWidth=".9"
        opacity=".5"
      />

      <path
        d="M180 70V37"
        stroke="currentColor"
        strokeWidth=".9"
        opacity=".5"
      />

      <path
        d="M180 323V290"
        stroke="currentColor"
        strokeWidth=".9"
        opacity=".5"
      />
    </svg>
  );
}

export default function FinalCTA() {
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
      className="relative overflow-hidden bg-[#2a1715] text-white"
    >
      {/* =====================================
          BACKGROUND IMAGE
      ====================================== */}

      <div
        aria-hidden="true"
        className="absolute inset-0"
      >
        <img
          src="/assets/public/final-journey.webp"
          alt=""
          className="h-full w-full object-cover object-center"
        />

        {/*
          Much lighter overlay than before.

          Left side stays readable while the image remains
          clearly visible through the center and right side.
        */}

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,13,10,0.88)_0%,rgba(40,19,16,0.68)_42%,rgba(50,23,18,0.42)_72%,rgba(35,16,13,0.24)_100%)]" />

        {/* Soft bottom readability */}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.02)_50%,rgba(17,8,6,0.30)_100%)]" />
      </div>

      {/* =====================================
          SUBTLE SVG ARTWORK
      ====================================== */}

      <LotusEmblem
        className="pointer-events-none absolute -right-[115px] top-1/2 hidden w-[470px] -translate-y-1/2 text-[#e1b774] opacity-[0.12] lg:block"
      />

      <HeritageCorner
        className="pointer-events-none absolute -bottom-[285px] -left-[190px] hidden w-[520px] text-[#d6a866] opacity-[0.075] xl:block"
      />

      <HeritageCorner
        mirror
        className="pointer-events-none absolute -right-[210px] -top-[270px] hidden w-[520px] text-[#d6a866] opacity-[0.065] xl:block"
      />

      {/* fine top line */}

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d8aa69]/40 to-transparent"
      />

      {/* =====================================
          CONTENT
      ====================================== */}

      <div className="page-container relative z-10">
        <div className="grid min-h-[560px] items-center gap-14 py-20 sm:py-24 lg:grid-cols-[1.12fr_0.88fr] lg:gap-24 lg:py-28">

          {/* =================================
              LEFT SIDE
          ================================== */}

          <div
            data-reveal
            className="max-w-[760px]"
          >
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-[#d2a66f]" />

              <p className="text-[9px] font-extrabold uppercase tracking-[0.26em] text-[#ddb981]">
                {t(
                  "home.registrationFree"
                )}
              </p>
            </div>

            <h2 className="mt-7 max-w-[760px] font-display text-[50px] font-medium leading-[0.94] tracking-[-0.035em] text-[#fff9f3] sm:text-[62px] lg:text-[72px]">
              {t(
                "home.ctaTitle"
              )}
            </h2>

            <p className="mt-7 max-w-[610px] text-[13px] leading-7 text-white/65 sm:text-[14px] sm:leading-8">
              {t(
                "home.ctaBody"
              )}
            </p>

            <FloralDivider
              className="mt-8 h-auto w-full max-w-[520px] text-[#d9b177] opacity-45"
            />

            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
              <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.1em] text-white/60">
                <ShieldCheck
                  size={
                    14
                  }
                  className="text-[#ddb981]"
                />

                Private by design
              </div>

              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rotate-45 border border-[#ddb981]" />

                <span className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-white/60">
                  Community focused
                </span>
              </div>
            </div>
          </div>

          {/* =================================
              RIGHT SIDE — OLD SIMPLE DESIGN
          ================================== */}

          <div
            data-reveal
            className="relative lg:border-l lg:border-white/15 lg:pl-10 xl:pl-14"
          >
            <div className="border-t border-[#d0a16b]/65 pt-7">

              <p className="text-[8px] font-extrabold uppercase tracking-[0.23em] text-[#ddb981]">
                Begin thoughtfully
              </p>

              <h3 className="mt-4 max-w-[430px] font-display text-[34px] font-medium leading-[1.02] text-[#fff8ef] sm:text-[40px]">
                Create your matrimonial
                profile
              </h3>

              <p className="mt-5 max-w-[430px] text-[11px] leading-6 text-white/55">
                Build your profile,
                choose what remains
                private and explore
                meaningful introductions
                within the community.
              </p>

              <Link
                to="/register"
                className="group mt-8 flex min-h-[58px] w-full max-w-[460px] items-center justify-between bg-[#fff9f2] px-6 text-[10px] font-extrabold uppercase tracking-[0.11em] text-[#3a1b1e] transition duration-300 hover:bg-white sm:px-7"
              >
                {t(
                  "home.ctaAction"
                )}

                <ArrowUpRight
                  size={
                    17
                  }
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>

              <div className="mt-5 flex max-w-[460px] items-start gap-3">
                <ShieldCheck
                  size={
                    15
                  }
                  strokeWidth={
                    1.5
                  }
                  className="mt-0.5 shrink-0 text-[#ddb981]"
                />

                <p className="text-[10px] leading-5 text-white/50">
                  {t(
                    "redesign:cta.note"
                  )}
                </p>
              </div>

              <div className="mt-7 flex items-center gap-3">
                <span className="h-px w-7 bg-[#d0a16b]" />

                <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-[#ddb981]">
                  {t(
                    "redesign:cta.trust"
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 h-px w-full bg-[#c49b70]/20" />
    </section>
  );
}