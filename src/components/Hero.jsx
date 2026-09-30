import {
  ArrowDownRight,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import MatchFinder from "./MatchFinder";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative bg-[#f4efe8]">
      {/* =========================
          HERO VISUAL
      ========================== */}
      <div className="relative min-h-[790px] overflow-hidden lg:min-h-[830px]">
        {/* Background image */}
        <img
          src="https://www.10wallpaper.com/wallpaper/1920x1200/2412/Sattais_Katcheri_Amber_Fort_Rajasthan_India_Bing_4K_1920x1200.jpg"
          alt="Rajput heritage architecture"
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
          <div className="max-w-[790px]">
            {/* Eyebrow */}
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-[#d5a76e]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#e1bc8a] sm:text-[11px]">
                A modern home for meaningful unions
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-[53px] font-medium leading-[0.95] tracking-[-0.04em] text-white sm:text-[68px] md:text-[76px] lg:text-[88px] xl:text-[94px]">
              Where heritage
              <br />

              <span className="whitespace-nowrap">
                meets a{" "}
                <span className="italic text-[#e7c292]">
                  new beginning.
                </span>
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-[610px] text-[14px] leading-7 text-white/65 sm:text-[15px] sm:leading-8">
              A private matrimonial community thoughtfully created for
              Kshatriya and Rajput families seeking meaningful,
              family-oriented relationships.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/register" className="group flex w-fit items-center gap-5 rounded-full bg-[#f5f0e9] px-7 py-3.5 text-[13px] font-bold text-[#32171a] transition duration-200 hover:bg-white">
                Begin Your Journey

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#741f27] text-white transition group-hover:translate-x-1">
                  <ArrowRight size={15} />
                </span>
              </Link>

              <Link to="/discover" className="flex w-fit items-center gap-4 rounded-full border border-white/30 px-7 py-[15px] text-[13px] font-semibold text-white transition hover:border-white/60 hover:bg-white/[0.05]">
                Explore Matches

                <ArrowDownRight size={16} />
              </Link>
            </div>

            {/* Privacy note */}
            <div className="mt-10 flex items-center gap-3 text-[11px] text-white/55 sm:text-[12px]">
              <ShieldCheck
                size={15}
                className="shrink-0 text-[#d9ad72]"
              />

              <span>
                Privacy-first profiles • family friendly • moderated community
              </span>
            </div>
          </div>
        </div>

        {/* =========================
            HERITAGE NOTE
        ========================== */}
        <div className="absolute bottom-[125px] right-[4%] z-20 hidden w-[245px] border border-white/15 bg-[#eee2d2]/95 px-8 py-8 shadow-[0_20px_50px_rgba(20,10,10,.15)] 2xl:block">
          <div className="font-display text-[42px] leading-none text-[#291918]">
            એક
          </div>

          <div className="my-6 h-px w-full bg-[#cdbda9]" />

          <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-[#8e7561]">
            One meaningful beginning
          </p>

          <p className="mt-4 text-[13px] leading-6 text-[#66544a]">
            For families who believe compatibility is more than a photograph.
          </p>
        </div>
      </div>

      {/* =========================
          MATCH FINDER
      ========================== */}
      <div className="relative z-30 -mt-[54px]">
        <MatchFinder />
      </div>
    </section>
  );
}
