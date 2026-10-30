import {
  Compass,
  Crown,
  HeartHandshake,
  LockKeyhole,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";

import {
  useTranslation
} from "react-i18next";

import Header from "../components/Header";
import Footer from "../components/Footer";
import FinalCTA from "../components/FinalCTA";

import {
  gsap
} from "../motion/gsap";

import {
  useReducedMotion
} from "../motion/useReducedMotion";

function TypewriterManifestoQuote({ text, triggerRef, reducedMotion }) {
  const [charIndex, setCharIndex] = useState(reducedMotion ? text.length : 0);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setCharIndex(text.length);
      return;
    }

    setCharIndex(0);

    if (!hasTriggered) return;

    let animationFrameId;

    const startDelay = setTimeout(() => {
      let lastTime = performance.now();
      let current = 0;
      const charDelay = 36; // Buttery smooth, slightly slower dignified pace

      const tick = (now) => {
        const delta = now - lastTime;
        if (delta >= charDelay) {
          const advance = Math.min(1, Math.floor(delta / charDelay));
          current = Math.min(text.length, current + advance);
          setCharIndex(current);
          lastTime = now;
        }

        if (current < text.length) {
          animationFrameId = requestAnimationFrame(tick);
        }
      };

      animationFrameId = requestAnimationFrame(tick);
    }, 450);

    return () => {
      clearTimeout(startDelay);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [text, hasTriggered, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || hasTriggered || !triggerRef?.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [triggerRef, hasTriggered, reducedMotion]);

  const displayed = text.slice(0, charIndex);

  return (
    <span className="relative">
      <span className="sr-only">&ldquo;{text}&rdquo;</span>
      <span aria-hidden="true">
        &ldquo;{displayed}&rdquo;
      </span>
    </span>
  );
}

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

      gsap.utils.toArray("[data-tech-card]").forEach((card, idx) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 30, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: idx * 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
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
      className="min-h-screen overflow-x-hidden bg-subtle-texture text-[#191614]"
    >
      <Header />

      <main>
        {/* ========================================
            HERO: MINIMALIST CINEMATIC PALACE VISTA
        ========================================= */}
        <section className="relative overflow-hidden h-screen min-h-[640px] max-h-[1050px] flex flex-col justify-between text-white border-b border-[#C5A059]/40 bg-[#0a0507]">
          {/* Panoramic Rajput Kingdom Background with Subtle Parallax */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            <img
              ref={heroImageRef}
              src="/assets/about-panoramic-hero.jpg"
              alt="Panoramic Royal Rajput Kingdom at Twilight"
              className="h-full w-full object-cover object-center scale-105 will-change-transform"
            />

            {/* Ultra-Light Cinematic Vignettes (Pure Vista Visibility) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.4)_100%)]" />
          </div>

          {/* Top Gold Hairline Border */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D5A76E]/50 to-transparent"
          />

          {/* Bottom Gold Hairline Border */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D5A76E]/50 to-transparent"
          />

          {/* Top spacer to balance floating Header */}
          <div className="h-20 sm:h-24 shrink-0" aria-hidden="true" />

          {/* Center Main Stage: Pure Cinematic Typography */}
          <div className="page-container relative z-10 mx-auto w-full max-w-4xl text-center px-4 sm:px-6 my-auto flex flex-col items-center">
            {/* Subtle Royal Eyebrow with Filigree Flourish */}
            <div
              data-about-hero
              className="inline-flex items-center gap-3 text-[#E5C384]"
            >
              <span className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#E5C384]/70" />
              <Crown size={14} className="text-[#E5C384]" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.35em] text-[#E5C384]">
                {t("aboutPage.hero.eyebrow")}
              </span>
              <Crown size={14} className="text-[#E5C384]" />
              <span className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#E5C384]/70" />
            </div>

            {/* Grand Headline in Royal Serif */}
            <h1
              data-about-hero
              className="mt-6 sm:mt-8 font-display text-[clamp(34px,5.8vw,74px)] font-normal leading-[1.06] tracking-[-0.025em] text-[#FFFDF8] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] max-w-4xl mx-auto"
            >
              {t("aboutPage.hero.title")}
            </h1>

            {/* Grand Poetic Proclamation Quote */}
            <p
              data-about-hero
              className="mt-6 sm:mt-8 max-w-2xl mx-auto font-serif text-lg sm:text-2xl italic text-[#FFEAD0] drop-shadow-[0_2px_18px_rgba(0,0,0,0.9)] leading-relaxed"
            >
              “{t("aboutPage.hero.imageQuote")}”
            </p>

            {/* Refined Philosophy Body */}
            <p
              data-about-hero
              className="mt-5 max-w-xl mx-auto text-xs sm:text-sm text-[#E2D5C3]/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] font-light leading-relaxed"
            >
              {t("aboutPage.hero.body")}
            </p>

            {/* Minimalist Ethos Inscription */}
            <div
              data-about-hero
              className="mt-8 flex items-center justify-center gap-4 sm:gap-8 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-[#E5C384]/85"
            >
              <span>{t("aboutPage.hero.values.heritage")}</span>
              <span className="text-[#E5C384]/40 select-none">✦</span>
              <span>{t("aboutPage.hero.values.choice")}</span>
              <span className="text-[#E5C384]/40 select-none">✦</span>
              <span>{t("aboutPage.hero.values.dignity")}</span>
            </div>
          </div>

          {/* Bottom: Elegant Subtle Scroll Cue */}
          <div
            data-about-hero
            className="relative z-10 w-full text-center pb-6 sm:pb-8 shrink-0"
          >
            <a
              href="#manifesto"
              onClick={(e) => {
                e.preventDefault();
                manifestoRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex flex-col items-center gap-2 text-white/50 hover:text-[#E5C384] transition-colors duration-300"
            >
              <span className="text-[9px] uppercase tracking-[0.3em] font-medium text-[#E5C384]/80">
                Explore Our Story
              </span>
              <span className="animate-bounce text-[#E5C384]/80 text-sm">↓</span>
            </a>
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
                  className="mt-6 border-l-2 border-[#AA7A42] pl-6 font-display text-[26px] italic leading-[1.3] tracking-[-0.015em] text-[#2B1A18] sm:text-[32px] lg:text-[38px]"
                >
                  <TypewriterManifestoQuote
                    text={t("aboutPage.manifesto.line3")}
                    triggerRef={manifestoRef}
                    reducedMotion={reducedMotion}
                  />
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================
            WHY WE EXIST
        ========================================= */}

        <section className="bg-subtle-texture py-24 sm:py-28 lg:py-36">
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

        <section className="bg-subtle-texture py-24 sm:py-28 lg:py-36">
          <div className="page-container">
            <div
              data-about-reveal
              className="max-w-[820px]"
            >
              <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                {t("aboutPage.principles.eyebrow")}
              </p>

              <h2 className="mt-5 font-display text-[50px] font-medium leading-[0.95] tracking-[-0.03em] text-[#2B1A18] sm:text-[62px] lg:text-[70px]">
                {t("aboutPage.principles.title")}
              </h2>

              <p className="mt-6 border-l-2 border-[#AA7A42] pl-6 font-display text-[20px] italic leading-[1.4] text-[#681D25]">
                Modern tools, human pace. Software should never replace judgement, family, conversation or independent verification.
              </p>
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

        <section className="relative overflow-hidden bg-texture-dark py-24 text-white sm:py-28 lg:py-36 border-y border-[#3d2422]">
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
                  Modern tools, human pace.
                </h2>

                <p className="mt-6 border-l-2 border-[#DAB47E] pl-6 font-display text-[22px] italic leading-[1.4] text-[#E7D6BE]">
                  Technology does, people decide.
                </p>
              </div>

              <div
                data-about-reveal
                className="lg:border-l lg:border-white/15 lg:pl-12"
              >
                <p className="max-w-[610px] text-[15px] leading-8 text-white/80">
                  {t("aboutPage.balance.body1")}
                </p>

                <p className="mt-7 max-w-[610px] text-[15px] leading-8 text-[#E2BB86]">
                  {t("aboutPage.balance.body2")}
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <div data-tech-card className="border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:border-[#DAB47E]/40 hover:bg-white/[0.06]">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#DAB47E]">
                      {t("aboutPage.balance.tech.title")}
                    </p>

                    <p className="mt-3 text-[12px] leading-6 text-white/55">
                      {t("aboutPage.balance.tech.body")}
                    </p>
                  </div>

                  <div data-tech-card className="border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:border-[#DAB47E]/40 hover:bg-white/[0.06]">
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

        {/* Shared site-wide final CTA */}

        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}