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

import {
  FloralDivider,
  HeritageArch,
  HeritageCorner
} from "./heritage/HeritageOrnaments";

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

function LotusSeal({
  className = ""
}) {
  return (
    <svg
      viewBox="0 0 220 220"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <circle
        cx="110"
        cy="110"
        r="96"
        stroke="currentColor"
        strokeWidth="1"
        opacity=".45"
      />

      <circle
        cx="110"
        cy="110"
        r="77"
        stroke="currentColor"
        strokeWidth=".8"
        opacity=".22"
      />

      <path
        d="M110 49
           C92 66 88 83 110 105
           C132 83 128 66 110 49Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />

      <path
        d="M110 105
           C85 82 65 83 53 99
           C72 108 89 111 110 105Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />

      <path
        d="M110 105
           C135 82 155 83 167 99
           C148 108 131 111 110 105Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />

      <path
        d="M110 105
           C91 119 84 139 91 158
           C103 146 108 128 110 105Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />

      <path
        d="M110 105
           C129 119 136 139 129 158
           C117 146 112 128 110 105Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />

      <path
        d="M73 163
           C88 171 132 171 147 163"
        stroke="currentColor"
        strokeWidth="1.1"
      />

      <path
        d="M83 177
           C97 182 123 182 137 177"
        stroke="currentColor"
        strokeWidth=".8"
        opacity=".7"
      />
    </svg>
  );
}

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
      className="relative overflow-hidden bg-[#211716] py-20 text-white sm:py-24 lg:py-32"
    >
      {/* =====================================
          ATMOSPHERE
      ====================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[220px] top-[-260px] h-[620px] w-[620px] rounded-full bg-[#681D25]/20 blur-[150px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[250px] right-[-180px] h-[620px] w-[620px] rounded-full bg-[#AA7A42]/10 blur-[150px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C99F72]/35 to-transparent"
      />

      {/* =====================================
          DECORATIVE LOTUS DETAILS
      ====================================== */}

      <LotusSeal
        className="pointer-events-none absolute -left-[78px] top-[170px] hidden w-[260px] text-[#C99F72] opacity-[0.07] lg:block"
      />

      <LotusSeal
        className="pointer-events-none absolute -right-[90px] bottom-[40px] hidden w-[320px] rotate-12 text-[#C99F72] opacity-[0.06] xl:block"
      />

      <HeritageCorner
        mirror
        className="pointer-events-none absolute -right-[155px] -top-[165px] hidden w-[480px] text-[#C99F72] opacity-[0.075] xl:block"
      />

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
              <span className="h-px w-10 bg-[#C49B70]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.27em] text-[#C99F72]">
                {t(
                  "nav.discover"
                )}
              </p>
            </div>

            <h2 className="mt-6 max-w-[500px] font-display text-[54px] font-medium leading-[0.92] tracking-[-0.035em] text-white sm:text-[66px] lg:text-[76px]">
              {t(
                "home.showcaseTitle"
              )}
            </h2>

            <p className="mt-7 max-w-[470px] text-[13px] leading-7 text-white/55 sm:text-[14px]">
              {t(
                "home.heritageBody2"
              )}
            </p>

            <FloralDivider
              className="mt-8 h-auto w-full max-w-[450px] text-[#C99F72] opacity-40"
            />

            {/* =================================
                ACTIVE PROFILE INFORMATION
            ================================== */}

            <div
              aria-live="polite"
              className="mt-6"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[#D6AC78]">
                    <BadgeCheck
                      size={
                        14
                      }
                    />

                    {t(
                      "home.verified"
                    )}
                  </div>

                  <h3 className="mt-3 font-display text-[40px] font-medium leading-none text-white">
                    {
                      activeProfile.name
                    }
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-white/55">
                    <span className="flex items-center gap-2">
                      <MapPin
                        size={
                          13
                        }
                        className="text-[#C99F72]"
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
                        className="text-[#C99F72]"
                      />

                      {
                        activeProfile.work
                      }
                    </span>
                  </div>
                </div>

                <div className="pt-1 font-display text-[20px] italic text-white/30">
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

            <div className="mt-8 h-px w-full bg-gradient-to-r from-[#C99F72]/45 via-white/10 to-transparent" />

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
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white transition duration-200 hover:border-[#C99F72] hover:bg-[#C99F72] hover:text-[#211716]"
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
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white transition duration-200 hover:border-[#C99F72] hover:bg-[#C99F72] hover:text-[#211716]"
              >
                <ArrowRight
                  size={
                    17
                  }
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>

              <div className="ml-3 h-px flex-1 bg-white/10" />
            </div>

            <Link
              to={
                matchesPath
              }
              className="group mt-10 inline-flex items-center gap-4 border-b border-[#C99F72] pb-2 text-[10px] font-bold uppercase tracking-[0.19em] text-[#D9B17F] transition hover:text-white"
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
            {/* Arch is now framing only */}

            <HeritageArch
              className="pointer-events-none absolute -right-[65px] -top-[82px] hidden h-[770px] text-[#C99F72] opacity-[0.11] md:block"
            />

            {/* decorative vertical line */}

            <div
              aria-hidden="true"
              className="absolute left-[10%] top-[3%] hidden h-[88%] w-px bg-gradient-to-b from-transparent via-[#C99F72]/30 to-transparent md:block"
            />

            {/* previous image */}

            <div className="absolute left-0 top-[13%] hidden h-[65%] w-[52%] overflow-hidden border border-white/[0.06] opacity-25 md:block">
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

              <div className="absolute inset-0 bg-[#431318]/70" />
            </div>

            {/* main card */}

            <div className="relative z-10 ml-auto w-full max-w-[470px]">
              {/* Offset gold geometry */}

              <div
                aria-hidden="true"
                className="absolute -right-5 -top-5 h-full w-full border border-[#C99F72]/25"
              />

              <div
                aria-hidden="true"
                className="absolute -bottom-4 -left-4 h-[72%] w-[72%] border border-white/[0.07]"
              />

              <div className="relative overflow-hidden border border-[#C99F72]/35 bg-[#2A1B19] shadow-[0_40px_100px_rgba(0,0,0,0.34)]">
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

                    <p className="mt-3 text-[12px] text-white/55">
                      {
                        activeProfile.age
                      }

                      {" • "}

                      {
                        activeProfile.city
                      }

                      <span className="mx-2 text-white/25">
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

            <div className="absolute bottom-[-6px] left-[4%] z-20 hidden md:block">
              <span className="font-display text-[92px] italic leading-none text-[#C99F72]/10">
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