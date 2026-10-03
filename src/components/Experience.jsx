import {
  Check,
  HeartHandshake,
  Search,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { gsap, ScrollTrigger } from "../motion/gsap";

const stepImages = [
  "/assets/public/Heritage Matrimony Profile Creation.png",
  "/assets/public/Discover Matrimony in Heritage Elegance.png",
  "/assets/public/Express Interest in Tradition.png",
  "/assets/public/A Joyful Mutual Match.png"
];

export default function Experience() {
  const { t } = useTranslation();

  const root = useRef(null);
  const lineRef = useRef(null);
  const visualRef = useRef(null);
  const imageCardRef = useRef(null);

  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: t("home.steps.createTitle"),
      body: t("home.steps.createBody"),
      image: stepImages[0],
      icon: UserRound
    },
    {
      number: "02",
      title: t("home.steps.discoverTitle"),
      body: t("home.steps.discoverBody"),
      image: stepImages[1],
      icon: Search
    },
    {
      number: "03",
      title: t("home.steps.expressTitle"),
      body: t("home.steps.expressBody"),
      image: stepImages[2],
      icon: HeartHandshake
    },
    {
      number: "04",
      title: t("home.steps.connectTitle"),
      body: t("home.steps.connectBody"),
      image: stepImages[3],
      icon: ShieldCheck
    }
  ];

  const safeActiveStep = Math.min(
    Math.max(Number(activeStep) || 0, 0),
    steps.length - 1
  );

  const currentStep = steps[safeActiveStep];

  useLayoutEffect(() => {
    const scope = root.current;

    if (!scope) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const context = gsap.context(() => {
      /* =====================================
         REDUCED MOTION
      ====================================== */

      if (reducedMotion) {
        if (lineRef.current) {
          gsap.set(lineRef.current, {
            scaleY: 1,
            transformOrigin: "top"
          });
        }

        if (imageCardRef.current) {
          gsap.set(imageCardRef.current, {
            y: 0
          });
        }

        return;
      }

      /* =====================================
         HEADING REVEAL
      ====================================== */

      gsap.fromTo(
        "[data-how-heading]",
        {
          autoAlpha: 0,
          y: 38
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "[data-how-heading]",
            start: "top 85%",
            once: true
          }
        }
      );

      /* =====================================
         TIMELINE PROGRESS
      ====================================== */

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          {
            scaleY: 0,
            transformOrigin: "top"
          },
          {
            scaleY: 1,
            transformOrigin: "top",
            ease: "none",
            scrollTrigger: {
              trigger: "[data-how-desktop]",
              start: "top 62%",
              end: "bottom 52%",
              scrub: 0.55
            }
          }
        );
      }

      /* =====================================
         DESKTOP STEPS
      ====================================== */

      const desktopSteps = gsap.utils.toArray(
        "[data-how-step-desktop]",
        scope
      );

      desktopSteps.forEach((element, index) => {
        const content = element.querySelector(
          "[data-step-content]"
        );

        const node = element.querySelector(
          "[data-step-node]"
        );

        ScrollTrigger.create({
          trigger: element,
          start: "top 58%",
          end: "bottom 42%",

          onEnter: () => {
            if (index >= steps.length) return;

            setActiveStep(index);

            if (node) {
              gsap.fromTo(
                node,
                {
                  scale: 0.85
                },
                {
                  scale: 1.07,
                  duration: 0.45,
                  ease: "back.out(1.5)"
                }
              );
            }
          },

          onEnterBack: () => {
            if (index >= steps.length) return;

            setActiveStep(index);

            if (node) {
              gsap.fromTo(
                node,
                {
                  scale: 0.9
                },
                {
                  scale: 1.07,
                  duration: 0.4,
                  ease: "power2.out"
                }
              );
            }
          }
        });

        if (content) {
          gsap.fromTo(
            content,
            {
              autoAlpha: 0,
              y: 42
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 82%",
                once: true
              }
            }
          );
        }
      });

      /* =====================================
         VISUAL CARD ENTRANCE
      ====================================== */

      if (visualRef.current) {
        gsap.fromTo(
          visualRef.current,
          {
            autoAlpha: 0,
            y: 45,
            scale: 0.97
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: visualRef.current,
              start: "top 82%",
              once: true
            }
          }
        );
      }

      /* =====================================
         RIGHT VISUAL SCROLL FOLLOW

         Important:
         Sticky remains, but card subtly travels
         downward as the storytelling progresses.
      ====================================== */

      if (imageCardRef.current) {
        gsap.fromTo(
          imageCardRef.current,
          {
            y: 0
          },
          {
            y: 110,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-how-desktop]",
              start: "top 32%",
              end: "bottom 72%",
              scrub: 0.8
            }
          }
        );
      }

      /* =====================================
         MOBILE CARD REVEALS
      ====================================== */

      const mobileSteps = gsap.utils.toArray(
        "[data-how-step-mobile]",
        scope
      );

      mobileSteps.forEach((element) => {
        gsap.fromTo(
          element,
          {
            autoAlpha: 0,
            y: 32
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true
            }
          }
        );
      });
    }, scope);

    return () => context.revert();
  }, [steps.length]);

  /* =====================================
     ACTIVE IMAGE TRANSITION
  ====================================== */

  useLayoutEffect(() => {
    const scope = root.current;

    if (!scope) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return undefined;

    const currentImage = scope.querySelector(
      `[data-step-image="${safeActiveStep}"]`
    );

    if (!currentImage) return undefined;

    const context = gsap.context(() => {
      /* Image fade + cinematic zoom */

      gsap.fromTo(
        currentImage,
        {
          autoAlpha: 0,
          scale: 1.065,
          y: 8
        },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out"
        }
      );

      /* Copy transition */

      const visualCopy = scope.querySelector(
        "[data-active-copy]"
      );

      if (visualCopy) {
        gsap.fromTo(
          visualCopy,
          {
            autoAlpha: 0,
            y: 20
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.58,
            ease: "power2.out"
          }
        );
      }
    }, scope);

    return () => context.revert();
  }, [safeActiveStep]);

  return (
    <section
      ref={root}
      className="relative overflow-clip bg-[#F5F0E8] py-20 sm:py-24 lg:py-32"
    >
      {/* =====================================
          AMBIENT BACKGROUND
      ====================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-40 h-[480px] w-[480px] rounded-full bg-[#C49B70]/10 blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-52 bottom-10 h-[520px] w-[520px] rounded-full bg-[#681D25]/5 blur-[130px]"
      />

      <div className="page-container relative z-10">
        {/* =====================================
            HEADER
        ====================================== */}

        <div
          data-how-heading
          className="mb-16 max-w-[780px] lg:mb-20"
        >
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-[#AA7A42]" />

            <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
              {t("nav.howItWorks")}
            </p>
          </div>

          <h2 className="mt-6 font-display text-[50px] font-medium leading-[0.96] tracking-[-0.035em] text-[#2B1A18] sm:text-[62px] lg:text-[76px]">
            {t("home.howTitle")}
          </h2>

          <p className="mt-7 max-w-[620px] text-[13px] leading-7 text-[#756A60] sm:text-[14px]">
            A thoughtful introduction should move at the pace of trust —
            from creating a profile to a mutual family conversation.
          </p>
        </div>

        {/* =====================================
            DESKTOP STORY EXPERIENCE
        ====================================== */}

        <div
          data-how-desktop
          className="relative hidden lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:gap-20 xl:gap-28"
        >
          {/* ===================================
              LEFT TIMELINE
          ==================================== */}

          <div className="relative">
            {/* inactive line */}

            <div className="absolute bottom-[10vh] left-[27px] top-7 w-px bg-[#D5C6B6]" />

            {/* active progress line */}

            <div
              ref={lineRef}
              className="absolute bottom-[10vh] left-[27px] top-7 w-px origin-top bg-[#681D25]"
            />

            {steps.map((step, index) => {
              const Icon = step.icon;

              const reached =
                index <= safeActiveStep;

              const active =
                index === safeActiveStep;

              return (
                <article
                  key={step.number}
                  data-how-step-desktop
                  className="
                    relative
                    grid
                    min-h-[52vh]
                    grid-cols-[56px_1fr]
                    gap-7
                    first:min-h-[48vh]
                    last:min-h-[58vh]
                  "
                >
                  {/* ===========================
                      NODE
                  ============================ */}

                  <div className="relative z-10 flex justify-center">
                    <div
                      data-step-node
                      className={[
                        "mt-1 flex h-[56px] w-[56px] items-center justify-center rounded-full border transition-colors duration-500",
                        reached
                          ? "border-[#681D25] bg-[#681D25] text-white shadow-[0_12px_35px_rgba(104,29,37,0.18)]"
                          : "border-[#CDBBA8] bg-[#F5F0E8] text-[#8E7969]"
                      ].join(" ")}
                    >
                      {index < safeActiveStep ? (
                        <Check size={17} />
                      ) : (
                        <Icon size={18} />
                      )}
                    </div>

                    {active && (
                      <>
                        <span
                          aria-hidden="true"
                          className="absolute left-[-5px] top-[-4px] h-[66px] w-[66px] animate-ping rounded-full border border-[#681D25]/15"
                        />

                        <span
                          aria-hidden="true"
                          className="absolute left-[-9px] top-[-8px] h-[74px] w-[74px] rounded-full border border-[#AA7A42]/10"
                        />
                      </>
                    )}
                  </div>

                  {/* ===========================
                      STEP COPY
                  ============================ */}

                  <div
                    data-step-content
                    className="pt-1"
                  >
                    <div
                      className={[
                        "border-t pt-6 transition-colors duration-500",
                        active
                          ? "border-[#AA7A42]"
                          : "border-[#D8CABB]"
                      ].join(" ")}
                    >
                      <span className="font-display text-[18px] italic text-[#A57C51]">
                        {step.number}
                      </span>

                      <h3
                        className={[
                          "mt-3 font-display text-[38px] font-medium leading-none transition-colors duration-500",
                          active
                            ? "text-[#431318]"
                            : "text-[#423330]"
                        ].join(" ")}
                      >
                        {step.title}
                      </h3>

                      <p
                        className={[
                          "mt-5 max-w-[460px] text-[13px] leading-7 transition-colors duration-500",
                          active
                            ? "text-[#66564D]"
                            : "text-[#897970]"
                        ].join(" ")}
                      >
                        {step.body}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* ===================================
              RIGHT VISUAL
          ==================================== */}

          <aside className="relative">
            <div
              className="
                sticky
                top-[clamp(72px,8vh,100px)]
                flex
                h-[calc(100vh-8rem)]
                max-h-[760px]
                min-h-[500px]
                items-start
                pt-5
              "
            >
              <div
                ref={imageCardRef}
                className="relative mx-auto w-full max-w-[590px]"
              >
                {/* Offset architectural border */}

                <div
                  aria-hidden="true"
                  className="absolute -left-5 top-7 h-[88%] w-full border border-[#C7A980]/30"
                />

                {/* Main visual */}

                <div
                  ref={visualRef}
                  className="relative overflow-hidden border border-[#D7C7B5] bg-[#EDE5DB] shadow-[0_35px_100px_rgba(57,30,24,0.16)]"
                >
                  <div className="relative h-[min(650px,70vh)] min-h-[470px] overflow-hidden">
                    {/* =========================
                        STEP IMAGES
                    ========================== */}

                    {steps.map((step, index) => (
                      <img
                        key={step.image}
                        data-step-image={index}
                        src={step.image}
                        alt=""
                        aria-hidden={
                          index !== safeActiveStep
                        }
                        loading="lazy"
                        className={[
                          "absolute inset-0 h-full w-full object-cover object-center",
                          index === safeActiveStep
                            ? "z-10 opacity-100"
                            : "pointer-events-none z-0 opacity-0"
                        ].join(" ")}
                      />
                    ))}

                    {/* Gradient */}

                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#1E1112]/85 via-[#1E1112]/10 to-transparent" />

                    {/* =========================
                        ACTIVE STEP COPY
                    ========================== */}

                    <div
                      key={`copy-${safeActiveStep}`}
                      data-active-copy
                      className="absolute inset-x-0 bottom-0 z-30 p-8 lg:p-9 xl:p-10"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#D7AD78]">
                          {String(
                            safeActiveStep + 1
                          ).padStart(2, "0")}
                        </span>

                        <span className="h-px w-8 bg-[#D7AD78]/50" />

                        <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/45">
                          {String(
                            steps.length
                          ).padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="mt-4 font-display text-[42px] leading-none text-white xl:text-[48px]">
                        {currentStep.title}
                      </h3>

                      <p className="mt-4 max-w-[420px] text-[12px] leading-6 text-white/70">
                        {currentStep.body}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorative large index */}

                <span
                  aria-hidden="true"
                  className="absolute -right-7 top-7 hidden font-display text-[78px] italic leading-none text-[#681D25]/8 xl:block"
                >
                  {currentStep.number}
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* =====================================
            MOBILE
        ====================================== */}

        <div className="space-y-6 lg:hidden">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                data-how-step-mobile
                className="overflow-hidden border border-[#D6C7B7] bg-[#FFFDF8]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={step.image}
                    alt=""
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#211313]/65 via-transparent to-transparent" />

                  <span className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#431318]/70 text-white backdrop-blur">
                    <Icon size={17} />
                  </span>

                  <span className="absolute bottom-5 right-5 font-display text-[36px] italic text-white/70">
                    {step.number}
                  </span>
                </div>

                <div className="p-6 sm:p-7">
                  <h3 className="font-display text-[31px] text-[#2B1A18]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-[13px] leading-7 text-[#756A60]">
                    {step.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}