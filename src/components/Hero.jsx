import { ArrowDownRight, ArrowRight, ShieldCheck } from "lucide-react";

import MatchFinder from "./MatchFinder";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "../motion/gsap";
import { useReducedMotion } from "../motion/useReducedMotion";

export default function Hero() {
  const { t } = useTranslation();
  const root = useRef(null), reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo('[data-hero-image]', { scale: 1.06 }, { scale: 1, duration: 1.9 })
        .fromTo('[data-hero-copy] > *', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .75, stagger: .12 }, .15)
        .fromTo('[data-matchfinder]', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .8 }, .7);
      gsap.to('[data-hero-image]', { yPercent: 4, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: .6 } });
    }, root);
    return () => ctx.revert();
  }, [reduced]);
  return (
    <section ref={root} className="relative bg-[#f4efe8]">
      {/* =========================
          HERO VISUAL
      ========================== */}
      <div className="relative min-h-[790px] overflow-hidden lg:min-h-[830px]">
        {/* Background image */}
        <img
          data-hero-image
          src="/assets/rajput-hero.webp"
          alt="Rajput heritage architecture"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Main dark overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,12,13,.94)_0%,rgba(34,14,15,.78)_37%,rgba(25,10,11,.32)_72%,rgba(25,10,11,.18)_100%)]" />

        {/* Bottom depth */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(25,10,11,.78)_0%,rgba(25,10,11,.16)_38%,transparent_60%)]" />

        {/* Top nav readability */}
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/35 to-transparent" />

        {/* =========================
            HERO CONTENT
        ========================== */}
        <div className="page-container relative z-10 flex min-h-[790px] items-center pb-36 pt-32 lg:min-h-[830px] lg:pb-40 lg:pt-36">
          <div data-hero-copy className="max-w-[790px]">
            {/* Eyebrow */}
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-[#d5a76e]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#e1bc8a] sm:text-[11px]">
                {t('public.heroEyebrow')}
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-[53px] font-medium leading-[0.95] tracking-[-0.04em] text-white sm:text-[68px] md:text-[76px] lg:text-[88px] xl:text-[94px]">
              {t('public.heroTitle')}
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-[610px] text-[14px] leading-7 text-white/65 sm:text-[15px] sm:leading-8">
              {t('public.heroBody')}
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="group flex w-fit items-center gap-5 rounded-full bg-[#f5f0e9] px-7 py-3.5 text-[13px] font-bold text-[#32171a] transition duration-200 hover:bg-white"
              >
                {t('public.beginJourney')}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#741f27] text-white transition group-hover:translate-x-1">
                  <ArrowRight size={15} />
                </span>
              </Link>

              <Link
                to="/discover"
                className="flex w-fit items-center gap-4 rounded-full border border-white/30 px-7 py-[15px] text-[13px] font-semibold text-white transition hover:border-white/60 hover:bg-white/[0.05]"
              >
                {t('public.exploreMatches')}
                <ArrowDownRight size={16} />
              </Link>
            </div>

            {/* Privacy note */}
            <div className="mt-10 flex items-center gap-3 text-[11px] text-white/55 sm:text-[12px]">
              <ShieldCheck size={15} className="shrink-0 text-[#d9ad72]" />

              <span>
                {t('public.privacyNote')}
              </span>
            </div>
          </div>
        </div>

        {/* =========================
            HERITAGE NOTE
        ========================== */}
        <div className="absolute bottom-[125px] right-[4%] z-20 hidden w-[245px] border border-white/15 bg-[#eee2d2]/95 px-8 py-8 shadow-[0_20px_50px_rgba(20,10,10,.15)] 2xl:block">
          <div className="font-display text-[42px] leading-none text-[#291918]">
            {t('homeExtra:one')}
          </div>

          <div className="my-6 h-px w-full bg-[#cdbda9]" />

          <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-[#8e7561]">
            {t('homeExtra:meaningfulBeginning')}
          </p>

          <p className="mt-4 text-[13px] leading-6 text-[#66544a]">
            {t('homeExtra:compatibilityNote')}
          </p>
        </div>
      </div>

      {/* =========================
          MATCH FINDER
      ========================== */}
      <div data-matchfinder className="relative z-30 -mt-[54px]">
        <MatchFinder />
      </div>
    </section>
  );
}
