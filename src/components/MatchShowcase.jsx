import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  MapPin
} from "lucide-react";

import {
  Link
} from "react-router-dom";

import {
  useTranslation
} from "react-i18next";

import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  useGsapReveal
} from "../motion/useGsapReveal";

import {
  useAuth
} from "../context/AuthContext";

import {
  getHomeRouteForRole
} from "../utils/roleRoutes";

const profiles = [
  {
    name: "Rajveersinh Jadeja",
    age: 28,
    city: "Rajkot",
    work: "Entrepreneur",
    image: "/assets/member/profile-rajveer.webp"
  },
  {
    name: "Devikaba",
    age: 26,
    city: "Ahmedabad",
    work: "Architect",
    image: "/assets/member/profile-devika.webp"
  },
  {
    name: "Nandiniba",
    age: 29,
    city: "Udaipur",
    work: "Doctor",
    image: "/assets/member/profile-nandini.webp"
  },
  {
    name: "Yuvrajsinh Parmar",
    age: 29,
    city: "Vadodara",
    work: "Business Owner",
    image: "/assets/member/profile-yuvraj.webp"
  }
];

export default function MatchShowcase() {
  const {
    t
  } =
    useTranslation();

  const {
    user
  } =
    useAuth();

  const root =
    useRef(null);

  const [
    activeIndex,
    setActiveIndex
  ] =
    useState(0);

  useGsapReveal(
    root
  );

  const activeProfile =
    profiles[
      activeIndex
    ];

  const previousProfile =
    () => {
      setActiveIndex(
        (
          current
        ) =>
          current === 0
            ? profiles.length - 1
            : current - 1
      );
    };

  const nextProfile =
    () => {
      setActiveIndex(
        (
          current
        ) =>
          current === profiles.length - 1
            ? 0
            : current + 1
      );
    };

  useEffect(
    () => {
      const interval =
        setInterval(
          () => {
            setActiveIndex(
              (
                current
              ) =>
                current === profiles.length - 1
                  ? 0
                  : current + 1
            );
          },
          5000
        );

      return () =>
        clearInterval(
          interval
        );
    },
    []
  );

  const matchesPath =
    !user
      ? "/register"
      : user.role === "member"
        ? "/discover"
        : getHomeRouteForRole(
            user.role
          );

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-parchment-texture border-y border-[#dfd4c4] py-20 text-[#2C1814] sm:py-24 lg:py-32"
    >
      <div className="page-container relative z-10">
        <div className="grid gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-24">

          {/* =================================
              LEFT CONTENT
          ================================== */}

          <div
            data-reveal
            className="relative max-w-[520px]"
          >
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-[#9B6F3E]" />

              <p className="text-[10px] font-extrabold uppercase tracking-[0.27em] text-[#9B6F3E]">
                {t(
                  "nav.discover"
                )}
              </p>
            </div>

            <h2 className="mt-6 max-w-[500px] font-display text-[54px] font-medium leading-[0.92] tracking-[-0.035em] text-[#3D1418] sm:text-[66px] lg:text-[76px]">
              {t(
                "home.showcaseTitle"
              )}
            </h2>

            <p className="mt-7 max-w-[470px] text-[13px] leading-7 text-[#5C4A42] sm:text-[14px]">
              {t(
                "home.heritageBody2"
              )}
            </p>

            <div className="mt-8 h-px w-20 bg-[#9B6F3E]/60" />

            {/* =================================
                ACTIVE PROFILE INFORMATION
            ================================== */}

            <div
              aria-live="polite"
              className="mt-6"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[#8E5E2C]">
                    <BadgeCheck
                      size={
                        14
                      }
                      className="text-[#8E5E2C]"
                    />

                    {t(
                      "home.verified"
                    )}
                  </div>

                  <h3 className="mt-3 font-display text-[40px] font-medium leading-none text-[#2A1517]">
                    {
                      activeProfile.name
                    }
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-medium text-[#65534A]">
                    <span className="flex items-center gap-2">
                      <MapPin
                        size={
                          13
                        }
                        className="text-[#9B6F3E]"
                      />

                      {
                        activeProfile.age
                      }

                      {" • "}

                      {
                        activeProfile.city
                      }
                    </span>

                    <span className="flex items-center gap-2">
                      <BriefcaseBusiness
                        size={
                          13
                        }
                        className="text-[#9B6F3E]"
                      />

                      {
                        activeProfile.work
                      }
                    </span>
                  </div>
                </div>

                <div className="pt-1 font-display text-[20px] italic text-[#8E5E2C]">
                  {String(
                    activeIndex + 1
                  ).padStart(
                    2,
                    "0"
                  )}

                  <span className="mx-2 text-[10px]">
                    /
                  </span>

                  {String(
                    profiles.length
                  ).padStart(
                    2,
                    "0"
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}

            <div className="mt-8 h-px w-full bg-[#DFD3C3]" />

            {/* =================================
                CONTROLS
            ================================== */}

            <div className="mt-7 flex items-center gap-3">
              <button
                type="button"
                onClick={
                  previousProfile
                }
                aria-label={
                  t(
                    "home.previousProfiles"
                  )
                }
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#D5C2AF] bg-[#FFFDF9] text-[#431318] shadow-sm transition duration-200 hover:border-[#681D25] hover:bg-[#681D25] hover:text-white"
              >
                <ArrowLeft
                  size={
                    17
                  }
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
              </button>

              <button
                type="button"
                onClick={
                  nextProfile
                }
                aria-label={
                  t(
                    "home.moreProfiles"
                  )
                }
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#D5C2AF] bg-[#FFFDF9] text-[#431318] shadow-sm transition duration-200 hover:border-[#681D25] hover:bg-[#681D25] hover:text-white"
              >
                <ArrowRight
                  size={
                    17
                  }
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>

              <div className="ml-3 h-px flex-1 bg-[#DFD3C3]" />
            </div>

            <Link
              to={
                matchesPath
              }
              className="group mt-10 inline-flex items-center gap-4 border-b-2 border-[#681D25] pb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#681D25] transition hover:border-[#3D1418] hover:text-[#3D1418]"
            >
              {t(
                "home.viewMatches"
              )}

              <ArrowRight
                size={
                  15
                }
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* =================================
              PROFILE EDITORIAL COMPOSITION
          ================================== */}

          <div
            data-reveal
            className="relative mx-auto w-full max-w-[720px]"
          >
            {/* decorative vertical line */}

            <div
              aria-hidden="true"
              className="absolute left-[10%] top-[3%] hidden h-[88%] w-px bg-[#DFD3C3] md:block"
            />

            {/* previous image */}

            <div className="absolute left-0 top-[13%] hidden h-[65%] w-[52%] overflow-hidden border border-[#D5C2AF] opacity-35 md:block">
              <img
                src={
                  profiles[
                    (
                      activeIndex +
                      profiles.length -
                      1
                    ) %
                      profiles.length
                  ].image
                }
                alt=""
                className="h-full w-full object-cover object-top grayscale"
              />

              <div className="absolute inset-0 bg-[#431318]/40" />
            </div>

            {/* main card */}

            <div className="relative z-10 ml-auto w-full max-w-[470px]">
              {/* Offset gold geometry */}

              <div
                aria-hidden="true"
                className="absolute -right-5 -top-5 h-full w-full border border-[#C49B70]/40"
              />

              <div
                aria-hidden="true"
                className="absolute -bottom-4 -left-4 h-[72%] w-[72%] border border-[#681D25]/15"
              />

              <div className="relative overflow-hidden border border-[#C99F72]/40 bg-[#1F1012] shadow-[0_24px_60px_rgba(40,20,15,0.16)]">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    key={
                      activeProfile.image
                    }
                    src={
                      activeProfile.image
                    }
                    alt={`${activeProfile.name}, editorial sample profile`}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition duration-700 hover:scale-[1.025]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#160C0D]/90 via-transparent to-transparent" />

                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/85 backdrop-blur-md">
                    <BadgeCheck
                      size={
                        13
                      }
                    />

                    {t(
                      "home.verified"
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#D6AC78]">
                      Editorial introduction
                    </p>

                    <h3 className="mt-2 font-display text-[43px] leading-none text-white sm:text-[49px]">
                      {
                        activeProfile.name
                      }
                    </h3>

                    <p className="mt-3 text-[12px] text-white/70">
                      {
                        activeProfile.age
                      }

                      {" • "}

                      {
                        activeProfile.city
                      }

                      <span className="mx-2 text-white/40">
                        •
                      </span>

                      {
                        activeProfile.work
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* oversized index */}

            <div aria-hidden="true" className="absolute bottom-[-6px] left-[4%] z-20 hidden md:block">
              <span className="font-display text-[108px] italic leading-none text-[#C49B70]/30 select-none">
                {String(
                  activeIndex + 1
                ).padStart(
                  2,
                  "0"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}