import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  MapPin,
  BriefcaseBusiness
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

import { useGsapReveal } from "../motion/useGsapReveal";
import { useAuth } from "../context/AuthContext";
import { getHomeRouteForRole } from "../utils/roleRoutes";

const profiles = [
  {
    name: "Rajveer",
    age: 28,
    city: "Rajkot",
    work: "Entrepreneur",
    image: "/assets/member/profile-rajveer.webp"
  },
  {
    name: "Devika",
    age: 26,
    city: "Ahmedabad",
    work: "Architect",
    image: "/assets/member/profile-devika.webp"
  },
  {
    name: "Nandini",
    age: 29,
    city: "Udaipur",
    work: "Doctor",
    image: "/assets/member/profile-nandini.webp"
  },
  {
    name: "Yuvraj",
    age: 29,
    city: "Vadodara",
    work: "Business Owner",
    image: "/assets/member/profile-yuvraj.webp"
  }
];

export default function MatchShowcase() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const root = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  useGsapReveal(root);

  const activeProfile = profiles[activeIndex];

  const previousProfile = () => {
    setActiveIndex((current) =>
      current === 0 ? profiles.length - 1 : current - 1
    );
  };

  const nextProfile = () => {
    setActiveIndex((current) =>
      current === profiles.length - 1 ? 0 : current + 1
    );
  };

  /* =========================================
     AUTO CHANGE PROFILE EVERY 5 SECONDS
  ========================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) =>
        current === profiles.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const matchesPath = !user
    ? "/register"
    : user.role === "member"
      ? "/discover"
      : getHomeRouteForRole(user.role);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-[#211716] py-20 text-white sm:py-24 lg:py-28"
    >
      {/* Subtle atmospheric lighting */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-180px] top-[-220px] h-[520px] w-[520px] rounded-full bg-[#681d25]/25 blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-260px] right-[-160px] h-[540px] w-[540px] rounded-full bg-[#aa7a42]/10 blur-[130px]"
      />

      <div className="page-container relative z-10">
        <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-20">
          {/* LEFT CONTENT */}

          <div
            data-reveal
            className="max-w-[500px]"
          >
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-[#C49B70]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#C99F72]">
                {t("nav.discover")}
              </p>
            </div>

            <h2 className="mt-6 max-w-[480px] font-display text-[54px] font-medium leading-[0.93] tracking-[-0.035em] text-white sm:text-[66px] lg:text-[74px]">
              {t("home.showcaseTitle")}
            </h2>

            <p className="mt-7 max-w-[450px] text-[13px] leading-7 text-white/55 sm:text-[14px]">
              {t("home.heritageBody2")}
            </p>

            {/* ACTIVE PROFILE DETAILS */}

            <div
              aria-live="polite"
              className="mt-10 border-y border-white/10 py-7"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#D6AC78]">
                    <BadgeCheck size={14} />

                    {t("home.verified")}
                  </div>

                  <h3 className="mt-3 font-display text-[39px] font-medium leading-none text-white">
                    {activeProfile.name}
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-white/55">
                    <span className="flex items-center gap-2">
                      <MapPin
                        size={13}
                        className="text-[#C99F72]"
                      />

                      {activeProfile.age} • {activeProfile.city}
                    </span>

                    <span className="flex items-center gap-2">
                      <BriefcaseBusiness
                        size={13}
                        className="text-[#C99F72]"
                      />

                      {activeProfile.work}
                    </span>
                  </div>
                </div>

                <div className="pt-1 text-[10px] font-bold tracking-[0.16em] text-white/35">
                  {String(activeIndex + 1).padStart(2, "0")}

                  <span className="mx-2">/</span>

                  {String(profiles.length).padStart(2, "0")}
                </div>
              </div>
            </div>

            {/* LOCAL CONTROLS */}

            <div className="mt-7 flex items-center gap-3">
              <button
                type="button"
                onClick={previousProfile}
                aria-label={t("home.previousProfiles")}
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white transition duration-200 hover:border-[#C99F72] hover:bg-[#C99F72] hover:text-[#211716] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99F72]"
              >
                <ArrowLeft
                  size={17}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
              </button>

              <button
                type="button"
                onClick={nextProfile}
                aria-label={t("home.moreProfiles")}
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white transition duration-200 hover:border-[#C99F72] hover:bg-[#C99F72] hover:text-[#211716] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99F72]"
              >
                <ArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>

              <div className="ml-3 h-px flex-1 bg-white/10" />
            </div>

            {/* CTA */}

            <Link
              to={matchesPath}
              className="group mt-10 inline-flex items-center gap-4 border-b border-[#C99F72] pb-2 text-[10px] font-bold uppercase tracking-[0.19em] text-[#D9B17F] transition hover:text-white"
            >
              {t("home.viewMatches")}

              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* RIGHT PROFILE CAROUSEL */}

          <div
            data-reveal
            className="relative mx-auto w-full max-w-[700px]"
          >
            {/* Background visual layer */}

            <div className="absolute -left-5 top-10 hidden h-[78%] w-[58%] overflow-hidden opacity-35 md:block">
              <img
                src={
                  profiles[
                    (activeIndex + profiles.length - 1) % profiles.length
                  ].image
                }
                alt=""
                className="h-full w-full object-cover object-top grayscale"
              />

              <div className="absolute inset-0 bg-[#431318]/65" />
            </div>

            <div className="absolute -right-4 bottom-8 hidden h-[66%] w-[48%] overflow-hidden opacity-25 md:block">
              <img
                src={
                  profiles[
                    (activeIndex + 1) % profiles.length
                  ].image
                }
                alt=""
                className="h-full w-full object-cover object-top grayscale"
              />

              <div className="absolute inset-0 bg-[#211716]/65" />
            </div>

            {/* MAIN ACTIVE IMAGE */}

            <div className="relative z-10 ml-auto w-full overflow-hidden border border-white/10 bg-[#2A1B19] shadow-[0_35px_90px_rgba(0,0,0,0.28)] md:w-[72%]">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  key={activeProfile.image}
                  src={activeProfile.image}
                  alt={`${activeProfile.name}, editorial sample profile`}
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition duration-700 hover:scale-[1.02]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#160c0d]/80 via-transparent to-transparent" />

                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/85 backdrop-blur-md">
                  <BadgeCheck size={13} />

                  {t("home.verified")}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#D6AC78]">
                    Editorial introduction
                  </p>

                  <h3 className="mt-2 font-display text-[42px] leading-none text-white sm:text-[48px]">
                    {activeProfile.name}
                  </h3>

                  <p className="mt-3 text-[12px] text-white/55">
                    {activeProfile.age} • {activeProfile.city}

                    <span className="mx-2 text-white/25">•</span>

                    {activeProfile.work}
                  </p>
                </div>
              </div>
            </div>

            {/* Side index */}

            <div className="absolute bottom-5 left-0 z-20 hidden md:block">
              <span className="font-display text-[76px] leading-none text-white/10">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}