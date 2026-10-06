import {
  ArrowUpRight,
  Compass,
  Crown,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import {
  useLayoutEffect,
  useRef
} from "react";

import {
  Link
} from "react-router-dom";

import {
  useTranslation
} from "react-i18next";

import Header from "../components/Header";
import Footer from "../components/Footer";

import {
  gsap
} from "../motion/gsap";

import {
  useReducedMotion
} from "../motion/useReducedMotion";

export default function AboutPage() {
  const rootRef = useRef(null);
  const heroImageRef = useRef(null);
  const manifestoRef = useRef(null);

  const reducedMotion = useReducedMotion();
  const { t } = useTranslation();

  const principles = [
    {
      icon: HeartHandshake,
      number: "01",
      title: t("aboutPage.principles.memberLed.title"),
      body: t("aboutPage.principles.memberLed.body")
    },
    {
      icon: Crown,
      number: "02",
      title: t("aboutPage.principles.familyContext.title"),
      body: t("aboutPage.principles.familyContext.body")
    },
    {
      icon: LockKeyhole,
      number: "03",
      title: t("aboutPage.principles.privacy.title"),
      body: t("aboutPage.principles.privacy.body")
    },
    {
      icon: Compass,
      number: "04",
      title: t("aboutPage.principles.intent.title"),
      body: t("aboutPage.principles.intent.body")
    }
  ];

  const refusals = [
    t("aboutPage.refuse.items.swipe"),
    t("aboutPage.refuse.items.directory"),
    t("aboutPage.refuse.items.pressure"),
    t("aboutPage.refuse.items.promises")
  ];

  useLayoutEffect(() => {
    if (!rootRef.current || reducedMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-about-hero]",
        {
          autoAlpha: 0,
          y: 28
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.1
        }
      );

      if (heroImageRef.current) {
        gsap.fromTo(
          heroImageRef.current,
          {
            scale: 1.07,
            yPercent: -3
          },
          {
            scale: 1,
            yPercent: 5,
            ease: "none",
            scrollTrigger: {
              trigger: heroImageRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1
            }
          }
        );
      }

      gsap.utils
        .toArray("[data-about-reveal]")
        .forEach((element) => {
          gsap.fromTo(
            element,
            {
              autoAlpha: 0,
              y: 34
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: {
                trigger: element,
                start: "top 88%",
                once: true
              }
            }
          );
        });

      if (manifestoRef.current) {
        gsap.fromTo(
          manifestoRef.current.querySelectorAll(
            "[data-manifesto-line]"
          ),
          {
            autoAlpha: 0.15,
            x: -20
          },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: manifestoRef.current,
              start: "top 75%",
              once: true
            }
          }
        );
      }

      gsap.utils
        .toArray("[data-principle]")
        .forEach((item, index) => {
          gsap.fromTo(
            item,
            {
              autoAlpha: 0,
              x: index % 2 === 0 ? -20 : 20
            },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: item,
                start: "top 86%",
                once: true
              }
            }
          );
        });
    }, rootRef);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="min-h-screen overflow-x-hidden bg-[#F5F0E8] text-[#191614]"
    >
      <Header solid />

      <main>
        {/* ========================================
            HERO
        ========================================= */}

        <section className="relative overflow-hidden bg-[#F0E4D6] pt-28 sm:pt-32 lg:pt-36">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-40 top-20 h-[460px] w-[460px] rounded-full bg-[#C49B70]/15 blur-[140px]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-44 bottom-[-180px] h-[520px] w-[520px] rounded-full bg-[#681D25]/7 blur-[150px]"
          />

          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-[#D8C4AD]"
          />

          <div className="page-container relative z-10">
            <div className="grid min-h-[690px] items-center gap-14 pb-20 lg:grid-cols-[1fr_0.92fr] lg:gap-24 lg:pb-28">
              {/* LEFT */}

              <div className="max-w-[760px]">
                <div
                  data-about-hero
                  className="flex items-center gap-4"
                >
                  <span className="h-px w-10 bg-[#AA7A42]" />

                  <p className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-[#91683F]">
                    {t("aboutPage.hero.eyebrow")}
                  </p>
                </div>

                <h1
                  data-about-hero
                  className="mt-7 max-w-[760px] font-display text-[52px] font-medium leading-[0.92] tracking-[-0.035em] text-[#2B1A18] sm:text-[68px] lg:text-[82px]"
                >
                  {t("aboutPage.hero.title")}
                </h1>

                <p
                  data-about-hero
                  className="mt-8 max-w-[620px] text-[14px] leading-8 text-[#6D5D54] sm:text-[15px]"
                >
                  {t("aboutPage.hero.body")}
                </p>

                <div
                  data-about-hero
                  className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-[#D7C5B4] pt-7"
                >
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#91683F]">
                    {t("aboutPage.hero.values.heritage")}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-[#AA7A42]/50" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#91683F]">
                    {t("aboutPage.hero.values.choice")}
                  </span>

                  <span className="h-1 w-1 rounded-full bg-[#AA7A42]/50" />

                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#91683F]">
                    {t("aboutPage.hero.values.dignity")}
                  </span>
                </div>
              </div>

              {/* RIGHT IMAGE */}

              <div
                data-about-hero
                className="relative mx-auto w-full max-w-[510px] lg:mx-0"
              >
                <div
                  aria-hidden="true"
                  className="absolute -left-5 top-8 hidden h-[88%] w-full border border-[#B9966E]/30 sm:block"
                />

                <div className="relative overflow-hidden border border-[#D4C1AB] bg-[#E7D8C7] shadow-[0_35px_90px_rgba(72,44,32,0.16)]">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      ref={heroImageRef}
                      src="/assets/public/about-family.webp"
                      alt={t("aboutPage.hero.imageAlt")}
                      className="h-full w-full object-cover object-center"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A1818]/70 via-transparent to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#E4BD86]">
                        {t("aboutPage.hero.imageEyebrow")}
                      </p>

                      <p className="mt-3 max-w-[390px] font-display text-[31px] leading-[1.05] text-white sm:text-[36px]">
                        {t("aboutPage.hero.imageQuote")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-20 -mt-7 ml-auto mr-4 max-w-[330px] border border-[#D4C1AB] bg-[#FFFDF8] p-5 text-[#2B1A18] shadow-[0_20px_50px_rgba(66,37,27,0.12)] sm:-mt-10 sm:mr-[-24px]">
                  <div className="flex items-start gap-4">
                    <ShieldCheck
                      size={20}
                      strokeWidth={1.4}
                      className="mt-0.5 shrink-0 text-[#681D25]"
                    />

                    <p className="text-[11px] leading-6 text-[#756A60]">
                      {t("aboutPage.hero.trustNote")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================
            MANIFESTO
        ========================================= */}

        <section
          ref={manifestoRef}
          className="relative overflow-hidden bg-[#FFFDF8] py-24 sm:py-28 lg:py-36"
        >
          <div className="page-container">
            <div className="grid gap-14 lg:grid-cols-[0.66fr_1.34fr] lg:gap-24">
              <div data-about-reveal>
                <div className="flex items-center gap-4">
                  <span className="h-px w-9 bg-[#AA7A42]" />

                  <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                    {t("aboutPage.manifesto.eyebrow")}
                  </p>
                </div>

                <p className="mt-6 max-w-[320px] text-[13px] leading-7 text-[#756A60]">
                  {t("aboutPage.manifesto.intro")}
                </p>
              </div>

              <div>
                <p
                  data-manifesto-line
                  className="font-display text-[42px] leading-[1.02] tracking-[-0.025em] text-[#2B1A18] sm:text-[54px] lg:text-[64px]"
                >
                  {t("aboutPage.manifesto.line1")}
                </p>

                <p
                  data-manifesto-line
                  className="mt-3 font-display text-[42px] italic leading-[1.02] tracking-[-0.025em] text-[#681D25] sm:text-[54px] lg:text-[64px]"
                >
                  {t("aboutPage.manifesto.line2")}
                </p>

                <p
                  data-manifesto-line
                  className="mt-3 font-display text-[42px] leading-[1.02] tracking-[-0.025em] text-[#2B1A18] sm:text-[54px] lg:text-[64px]"
                >
                  {t("aboutPage.manifesto.line3")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================
            WHY WE EXIST
        ========================================= */}

        <section className="bg-[#EDE2D4] py-24 sm:py-28 lg:py-36">
          <div className="page-container">
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
              <div data-about-reveal>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                  {t("aboutPage.why.eyebrow")}
                </p>

                <h2 className="mt-5 max-w-[560px] font-display text-[48px] font-medium leading-[0.96] tracking-[-0.03em] text-[#2B1A18] sm:text-[58px]">
                  {t("aboutPage.why.title")}
                </h2>
              </div>

              <div
                data-about-reveal
                className="border-l border-[#C9B49B] pl-6 sm:pl-9 lg:pl-12"
              >
                <p className="max-w-[650px] text-[15px] leading-8 text-[#66574F]">
                  {t("aboutPage.why.body1")}
                </p>

                <p className="mt-6 max-w-[650px] text-[15px] leading-8 text-[#66574F]">
                  {t("aboutPage.why.body2")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================
            PRINCIPLES
        ========================================= */}

        <section className="bg-[#F5F0E8] py-24 sm:py-28 lg:py-36">
          <div className="page-container">
            <div
              data-about-reveal
              className="max-w-[760px]"
            >
              <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                {t("aboutPage.principles.eyebrow")}
              </p>

              <h2 className="mt-5 font-display text-[50px] font-medium leading-[0.95] tracking-[-0.03em] text-[#2B1A18] sm:text-[62px] lg:text-[70px]">
                {t("aboutPage.principles.title")}
              </h2>
            </div>

            <div className="mt-16 border-t border-[#D6C8B8]">
              {principles.map(
                ({
                  icon: Icon,
                  number,
                  title,
                  body
                }) => (
                  <article
                    key={number}
                    data-principle
                    className="group grid gap-6 border-b border-[#D6C8B8] py-9 sm:grid-cols-[72px_1fr_auto] sm:items-start sm:gap-8 lg:py-11"
                  >
                    <span className="font-display text-[19px] italic text-[#AA7A42]">
                      {number}
                    </span>

                    <div className="max-w-[670px]">
                      <h3 className="font-display text-[32px] font-medium text-[#2B1A18] sm:text-[38px]">
                        {title}
                      </h3>

                      <p className="mt-4 text-[13px] leading-7 text-[#756A60]">
                        {body}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#CDB9A3] text-[#681D25] transition duration-300 group-hover:border-[#681D25] group-hover:bg-[#681D25] group-hover:text-white">
                      <Icon
                        size={18}
                        strokeWidth={1.5}
                      />
                    </div>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        {/* ========================================
            TRADITION + TECHNOLOGY
        ========================================= */}

        <section className="relative overflow-hidden bg-[#431318] py-24 text-white sm:py-28 lg:py-36">
          <div
            aria-hidden="true"
            className="absolute -right-52 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-[#C49B70]/10 blur-[140px]"
          />

          <div className="page-container relative z-10">
            <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
              <div data-about-reveal>
                <Sparkles
                  size={24}
                  strokeWidth={1.3}
                  className="text-[#DAB47E]"
                />

                <p className="mt-6 text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#DAB47E]">
                  {t("aboutPage.balance.eyebrow")}
                </p>

                <h2 className="mt-5 max-w-[580px] font-display text-[50px] leading-[0.96] tracking-[-0.03em] text-[#FFF9F3] sm:text-[62px]">
                  {t("aboutPage.balance.title")}
                </h2>
              </div>

              <div
                data-about-reveal
                className="lg:border-l lg:border-white/15 lg:pl-12"
              >
                <p className="max-w-[610px] text-[14px] leading-8 text-white/65">
                  {t("aboutPage.balance.body1")}
                </p>

                <p className="mt-7 max-w-[610px] text-[14px] leading-8 text-white/65">
                  {t("aboutPage.balance.body2")}
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.03] p-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#DAB47E]">
                      {t("aboutPage.balance.tech.title")}
                    </p>

                    <p className="mt-3 text-[12px] leading-6 text-white/55">
                      {t("aboutPage.balance.tech.body")}
                    </p>
                  </div>

                  <div className="border border-white/10 bg-white/[0.03] p-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#DAB47E]">
                      {t("aboutPage.balance.people.title")}
                    </p>

                    <p className="mt-3 text-[12px] leading-6 text-white/55">
                      {t("aboutPage.balance.people.body")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================
            WHAT WE REFUSE TO BECOME
        ========================================= */}

        <section className="bg-[#FFFDF8] py-24 sm:py-28 lg:py-36">
          <div className="page-container">
            <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
              <div data-about-reveal>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                  {t("aboutPage.refuse.eyebrow")}
                </p>

                <h2 className="mt-5 max-w-[530px] font-display text-[48px] leading-[0.98] tracking-[-0.03em] text-[#2B1A18] sm:text-[58px]">
                  {t("aboutPage.refuse.title")}
                </h2>

                <p className="mt-7 max-w-[520px] text-[13px] leading-7 text-[#756A60]">
                  {t("aboutPage.refuse.body")}
                </p>
              </div>

              <div className="border-t border-[#D6C8B8]">
                {refusals.map(
                  (item, index) => (
                    <div
                      key={item}
                      data-about-reveal
                      className="grid grid-cols-[50px_1fr] gap-5 border-b border-[#D6C8B8] py-7 sm:grid-cols-[70px_1fr] sm:py-9"
                    >
                      <span className="font-display text-[20px] italic text-[#AA7A42]">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <p className="font-display text-[28px] leading-[1.08] text-[#342321] sm:text-[34px]">
                        {item}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================
            FOUNDERS NOTE
        ========================================= */}

        <section className="bg-[#E9DED1] py-24 sm:py-28 lg:py-36">
          <div className="page-container">
            <div className="mx-auto max-w-[980px] text-center">
              <div
                data-about-reveal
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#C7AE91] text-[#681D25]"
              >
                <HeartHandshake
                  size={20}
                  strokeWidth={1.4}
                />
              </div>

              <p
                data-about-reveal
                className="mt-7 text-[9px] font-extrabold uppercase tracking-[0.27em] text-[#91683F]"
              >
                {t("aboutPage.founder.eyebrow")}
              </p>

              <blockquote
                data-about-reveal
                className="mt-7 font-display text-[40px] font-medium leading-[1.04] tracking-[-0.025em] text-[#2B1A18] sm:text-[52px] lg:text-[60px]"
              >
                “{t("aboutPage.founder.quote")}”
              </blockquote>

              <p
                data-about-reveal
                className="mx-auto mt-8 max-w-[680px] text-[13px] leading-7 text-[#756A60]"
              >
                {t("aboutPage.founder.body")}
              </p>

              <div
                data-about-reveal
                className="mt-9"
              >
                <p className="font-display text-[24px] italic text-[#681D25]">
                  {t("aboutPage.founder.signature")}
                </p>

                <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.2em] text-[#91683F]">
                  {t("aboutPage.founder.role")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================
            CTA
        ========================================= */}

        <section className="relative overflow-hidden bg-[#431318] py-24 text-white sm:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-32 bottom-[-180px] h-[420px] w-[420px] rounded-full bg-[#AA7A42]/8 blur-[130px]"
          />

          <div className="page-container relative z-10">
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
              <div data-about-reveal>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#D7AD78]">
                  {t("aboutPage.cta.eyebrow")}
                </p>

                <h2 className="mt-5 max-w-[760px] font-display text-[48px] leading-[0.96] text-[#FFF9F3] sm:text-[60px]">
                  {t("aboutPage.cta.title")}
                </h2>

                <p className="mt-6 max-w-[620px] text-[13px] leading-7 text-white/55">
                  {t("aboutPage.cta.body")}
                </p>
              </div>

              <div data-about-reveal>
                <Link
                  to="/register"
                  className="group inline-flex min-h-[58px] items-center gap-8 bg-[#FFF9F2] px-7 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#32171A] transition hover:bg-white"
                >
                  {t("aboutPage.cta.action")}

                  <ArrowUpRight
                    size={18}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}