import {
  ArrowRight,
  Check,
  Eye,
  HeartHandshake,
  LockKeyhole,
  MessageCircleMore,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { gsap } from "../motion/gsap";

const stageImages = [
  "/assets/public/Heritage Matrimony Profile Creation.png",
  "/assets/public/Discover Matrimony in Heritage Elegance.png",
  "/assets/public/Express Interest in Tradition.png",
  "/assets/public/A Joyful Mutual Match.png"
];

export default function HowItWorksPage() {
  const { t } = useTranslation();

  const root = useRef(null);

  const stages = [
    {
      number: "01",
      icon: UserRound,
      title: t("howPage.stages.begin.title"),
      eyebrow: t("howPage.stages.begin.eyebrow"),
      body: t("howPage.stages.begin.body"),
      image: stageImages[0],
      steps: [
        t("howPage.steps.createAccount"),
        t("howPage.steps.verifyMobile"),
        t("howPage.steps.buildProfile")
      ],
      userDoes: t("howPage.stages.begin.userDoes"),
      platformDoes: t("howPage.stages.begin.platformDoes"),
      privateNote: t("howPage.stages.begin.private")
    },
    {
      number: "02",
      icon: Search,
      title: t("howPage.stages.discover.title"),
      eyebrow: t("howPage.stages.discover.eyebrow"),
      body: t("howPage.stages.discover.body"),
      image: stageImages[1],
      steps: [
        t("howPage.steps.submitReview"),
        t("howPage.steps.discoverProfiles")
      ],
      userDoes: t("howPage.stages.discover.userDoes"),
      platformDoes: t("howPage.stages.discover.platformDoes"),
      privateNote: t("howPage.stages.discover.private")
    },
    {
      number: "03",
      icon: HeartHandshake,
      title: t("howPage.stages.interest.title"),
      eyebrow: t("howPage.stages.interest.eyebrow"),
      body: t("howPage.stages.interest.body"),
      image: stageImages[2],
      steps: [
        t("howPage.steps.expressInterest"),
        t("howPage.steps.acceptMutually")
      ],
      userDoes: t("howPage.stages.interest.userDoes"),
      platformDoes: t("howPage.stages.interest.platformDoes"),
      privateNote: t("howPage.stages.interest.private")
    },
    {
      number: "04",
      icon: UsersRound,
      title: t("howPage.stages.connect.title"),
      eyebrow: t("howPage.stages.connect.eyebrow"),
      body: t("howPage.stages.connect.body"),
      image: stageImages[3],
      steps: [
        t("howPage.steps.requestContact"),
        t("howPage.steps.familyConversation")
      ],
      userDoes: t("howPage.stages.connect.userDoes"),
      platformDoes: t("howPage.stages.connect.platformDoes"),
      privateNote: t("howPage.stages.connect.private")
    }
  ];

  useLayoutEffect(() => {
    const scope = root.current;

    if (!scope) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return undefined;

    const context = gsap.context(() => {
      const reveals = gsap.utils.toArray(
        "[data-hiw-reveal]",
        scope
      );

      reveals.forEach((element) => {
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
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              once: true
            }
          }
        );
      });

      const stageRows = gsap.utils.toArray(
        "[data-stage-row]",
        scope
      );

      stageRows.forEach((row) => {
        const copy = row.querySelector(
          "[data-stage-content]"
        );

        const visual = row.querySelector(
          "[data-stage-visual]"
        );

        const image = row.querySelector(
          "[data-stage-img]"
        );

        if (copy) {
          gsap.fromTo(
            copy,
            {
              autoAlpha: 0,
              x: -34
            },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: row,
                start: "top 78%",
                once: true
              }
            }
          );
        }

        if (visual) {
          gsap.fromTo(
            visual,
            {
              autoAlpha: 0,
              y: 45,
              rotateY: -4,
              scale: 0.97
            },
            {
              autoAlpha: 1,
              y: 0,
              rotateY: 0,
              scale: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: row,
                start: "top 76%",
                once: true
              }
            }
          );
        }

        if (image) {
          gsap.fromTo(
            image,
            {
              scale: 1.07
            },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8
              }
            }
          );
        }
      });
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={root}
      className="min-h-screen bg-[#F5F0E8]"
    >
      <Header solid />

      <main>
        {/* =========================================
            HERO WITH BACKGROUND IMAGE
        ========================================== */}

        <section className="relative overflow-hidden bg-[#F5F0E8]">
          {/* background image */}

          <div
            aria-hidden="true"
            className="absolute inset-0"
          >
            <img
              src="/assets/public/how-it-works.webp"
              alt=""
              className="h-full w-full object-cover object-center"
            />

            <div className="absolute inset-0 bg-[#F5F0E8]/24" />
            
            <div className="absolute inset-0 bg-gradient-to-r from-[#F5F0E8]/78 via-[#F5F0E8]/42 to-transparent" />

            <div className="absolute inset-0 bg-gradient-to-t from-[#F5F0E8]/28 via-transparent to-transparent" />
          </div>

          {/* ambience */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-48 top-0 h-[520px] w-[520px] rounded-full bg-[#C49B70]/12 blur-[140px]"
          />

          <div className="page-container relative z-10">
            <div className="grid min-h-[720px] items-center gap-14 py-24 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:py-36">
              {/* left */}

              <div data-hiw-reveal>
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-[#AA7A42]" />

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                    {t("howPage.hero.eyebrow")}
                  </p>
                </div>

                <h1 className="mt-6 max-w-[820px] font-display text-[54px] font-medium leading-[0.92] tracking-[-0.04em] text-[#281A18] sm:text-[68px] lg:text-[88px]">
                  {t("howPage.hero.title")}
                </h1>

                <p className="mt-8 max-w-[650px] text-[14px] leading-8 text-[#6F6159] sm:text-[15px]">
                  {t("howPage.hero.body")}
                </p>
              </div>

              {/* right summary */}

              <div
                data-hiw-reveal
                className="max-w-[420px] border-l border-[#B99C7E]/45 pl-8 backdrop-blur-[1px] lg:justify-self-end lg:pl-10"
              >
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#91683F]">
                  {t("howPage.hero.summaryLabel")}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <strong className="font-display text-[46px] font-medium text-[#681D25]">
                      09
                    </strong>

                    <p className="mt-1 text-[11px] leading-5 text-[#756A60]">
                      {t("howPage.hero.steps")}
                    </p>
                  </div>

                  <div>
                    <strong className="font-display text-[46px] font-medium text-[#681D25]">
                      04
                    </strong>

                    <p className="mt-1 text-[11px] leading-5 text-[#756A60]">
                      {t("howPage.hero.stages")}
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex items-start gap-3 border-t border-[#B99C7E]/45 pt-6">
                  <ShieldCheck
                    size={17}
                    strokeWidth={1.5}
                    className="mt-1 shrink-0 text-[#681D25]"
                  />

                  <p className="text-[11px] leading-6 text-[#685A53]">
                    {t("howPage.hero.note")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            JOURNEY — NO STICKY IMAGE
        ========================================== */}

        <section className="relative overflow-hidden bg-[#211716] py-20 text-white sm:py-24 lg:py-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-52 top-40 h-[520px] w-[520px] rounded-full bg-[#681D25]/25 blur-[140px]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-48 bottom-20 h-[500px] w-[500px] rounded-full bg-[#AA7A42]/10 blur-[140px]"
          />

          <div className="page-container relative z-10">
            {/* section intro */}

            <div
              data-hiw-reveal
              className="mb-16 max-w-[760px] lg:mb-24"
            >
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-[#C49B70]" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#D1A46F]">
                  {t("howPage.process.eyebrow")}
                </p>
              </div>

              <h2 className="mt-6 font-display text-[48px] font-medium leading-[0.95] tracking-[-0.035em] text-white sm:text-[60px] lg:text-[72px]">
                {t("howPage.process.title")}
              </h2>

              <p className="mt-7 max-w-[620px] text-[13px] leading-7 text-white/55 sm:text-[14px]">
                {t("howPage.process.body")}
              </p>
            </div>

            {/* =====================================
                STAGE ROWS
            ====================================== */}

            <div className="space-y-24 lg:space-y-32">
              {stages.map((stage, index) => {
                const Icon = stage.icon;

                return (
                  <article
                    key={stage.number}
                    data-stage-row
                    className="relative"
                  >
                    {/* divider */}

                    <div className="mb-10 flex items-center gap-5">
                      <span className="font-display text-[20px] italic text-[#C99F72]">
                        {stage.number}
                      </span>

                      <span className="h-px flex-1 bg-white/10" />
                    </div>

                    <div
                      className={[
                        "grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20 xl:gap-28",
                        index % 2 === 1
                          ? "lg:[&>*:first-child]:order-2"
                          : ""
                      ].join(" ")}
                    >
                      {/* CONTENT */}

                      <div
                        data-stage-content
                        className="max-w-[560px]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C99F72]/40 bg-[#681D25]/40 text-[#E1B781]">
                            <Icon
                              size={17}
                              strokeWidth={1.5}
                            />
                          </span>

                          <p className="text-[9px] font-extrabold uppercase tracking-[0.19em] text-[#C99F72]">
                            {stage.eyebrow}
                          </p>
                        </div>

                        <h3 className="mt-6 font-display text-[42px] font-medium leading-[0.96] text-white sm:text-[50px]">
                          {stage.title}
                        </h3>

                        <p className="mt-6 max-w-[520px] text-[13px] leading-7 text-white/60">
                          {stage.body}
                        </p>

                        {/* individual steps */}

                        <div className="mt-8 border-y border-white/10 py-5">
                          {stage.steps.map((step, stepIndex) => (
                            <div
                              key={step}
                              className={[
                                "grid grid-cols-[30px_1fr] gap-3 py-3",
                                stepIndex !== stage.steps.length - 1
                                  ? "border-b border-white/10"
                                  : ""
                              ].join(" ")}
                            >
                              <span className="font-display text-[13px] italic text-[#C99F72]">
                                {String(
                                  stepIndex + 1
                                ).padStart(2, "0")}
                              </span>

                              <div className="flex items-start gap-3">
                                <Check
                                  size={14}
                                  className="mt-1 shrink-0 text-[#C99F72]"
                                />

                                <span className="text-[11px] leading-6 text-white/55">
                                  {step}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* WHAT HAPPENS */}

                        <div className="mt-8 grid gap-5">
                          <SmallDetail
                            label={t("howPage.details.you")}
                            value={stage.userDoes}
                          />

                          <SmallDetail
                            label={t("howPage.details.platform")}
                            value={stage.platformDoes}
                          />

                          <SmallDetail
                            label={t("howPage.details.private")}
                            value={stage.privateNote}
                          />
                        </div>
                      </div>

                      {/* VISUAL */}

                      <div
                        data-stage-visual
                        className="relative mx-auto w-full max-w-[590px]"
                        style={{
                          perspective: "1200px"
                        }}
                      >
                        {/* offset frame */}

                        <div
                          aria-hidden="true"
                          className={[
                            "absolute top-7 h-[88%] w-full border border-[#C49B70]/20",
                            index % 2 === 1
                              ? "-right-5"
                              : "-left-5"
                          ].join(" ")}
                        />

                        <div className="relative overflow-hidden border border-white/10 bg-[#2A1B19] shadow-[0_35px_90px_rgba(0,0,0,.30)]">
                          <div className="relative aspect-[4/5] overflow-hidden">
                            <img
                              data-stage-img
                              src={stage.image}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover object-center"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#160D0F]/88 via-[#160D0F]/5 to-transparent" />

                            {/* stage number */}

                            <div className="absolute left-5 top-5 flex items-center gap-3 border border-white/15 bg-[#211716]/45 px-3 py-2 backdrop-blur-md">
                              <span className="font-display text-[15px] italic text-[#D6AC78]">
                                {stage.number}
                              </span>

                              <span className="h-3 w-px bg-white/20" />

                              <span className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-white/70">
                                {stage.eyebrow}
                              </span>
                            </div>

                            {/* bottom label */}

                            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                              <p className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#D6AC78]">
                                {stage.number} / 04
                              </p>

                              <h4 className="mt-3 max-w-[420px] font-display text-[36px] leading-none text-white sm:text-[42px]">
                                {stage.title}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================
            CONTROL SECTION
        ========================================== */}

        <section className="bg-[#E8DCCB] py-20 sm:py-24 lg:py-28">
          <div className="page-container">
            <div
              data-hiw-reveal
              className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
            >
              <div>
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-[#AA7A42]" />

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                    {t("howPage.control.eyebrow")}
                  </p>
                </div>

                <h2 className="mt-6 max-w-[500px] font-display text-[48px] font-medium leading-[0.95] text-[#281A18] sm:text-[60px]">
                  {t("howPage.control.title")}
                </h2>

                <p className="mt-6 max-w-[500px] text-[13px] leading-7 text-[#756A60]">
                  {t("howPage.control.body")}
                </p>
              </div>

              <div className="border-t border-[#C9B69F]">
                <ControlRow
                  icon={Eye}
                  title={t("howPage.control.photos.title")}
                  body={t("howPage.control.photos.body")}
                  number="01"
                />

                <ControlRow
                  icon={LockKeyhole}
                  title={t("howPage.control.contact.title")}
                  body={t("howPage.control.contact.body")}
                  number="02"
                />

                <ControlRow
                  icon={HeartHandshake}
                  title={t("howPage.control.interest.title")}
                  body={t("howPage.control.interest.body")}
                  number="03"
                />

                <ControlRow
                  icon={MessageCircleMore}
                  title={t("howPage.control.family.title")}
                  body={t("howPage.control.family.body")}
                  number="04"
                  last
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            TYPICAL JOURNEY
        ========================================== */}

        <section className="bg-[#F5F0E8] py-20 sm:py-24 lg:py-32">
          <div className="page-container">
            <div
              data-hiw-reveal
              className="max-w-[720px]"
            >
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-[#AA7A42]" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                  {t("howPage.journey.eyebrow")}
                </p>
              </div>

              <h2 className="mt-6 font-display text-[48px] font-medium leading-[0.95] text-[#281A18] sm:text-[60px] lg:text-[68px]">
                {t("howPage.journey.title")}
              </h2>

              <p className="mt-6 max-w-[600px] text-[13px] leading-7 text-[#756A60]">
                {t("howPage.journey.body")}
              </p>
            </div>

            <div className="mt-14 border-t border-[#D4C5B4]">
              {[
                [
                  t("howPage.journey.items.profile.time"),
                  t("howPage.journey.items.profile.title"),
                  t("howPage.journey.items.profile.body")
                ],
                [
                  t("howPage.journey.items.review.time"),
                  t("howPage.journey.items.review.title"),
                  t("howPage.journey.items.review.body")
                ],
                [
                  t("howPage.journey.items.discover.time"),
                  t("howPage.journey.items.discover.title"),
                  t("howPage.journey.items.discover.body")
                ],
                [
                  t("howPage.journey.items.mutual.time"),
                  t("howPage.journey.items.mutual.title"),
                  t("howPage.journey.items.mutual.body")
                ],
                [
                  t("howPage.journey.items.family.time"),
                  t("howPage.journey.items.family.title"),
                  t("howPage.journey.items.family.body")
                ]
              ].map(([time, title, body], index) => (
                <article
                  key={title}
                  data-hiw-reveal
                  className="grid gap-4 border-b border-[#D4C5B4] py-7 sm:grid-cols-[120px_240px_1fr] sm:gap-7 sm:py-8"
                >
                  <span className="font-display text-[18px] italic text-[#AA7A42]">
                    {time}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#681D25] text-[9px] font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 className="font-display text-[26px] text-[#2B1A18]">
                      {title}
                    </h3>
                  </div>

                  <p className="max-w-[560px] text-[12px] leading-6 text-[#756A60]">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            FINAL CTA
        ========================================== */}

        <section className="relative overflow-hidden bg-[#4A1F24] py-20 text-white sm:py-24 lg:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 top-[-180px] h-[480px] w-[480px] rounded-full bg-[#C49B70]/10 blur-[140px]"
          />

          <div className="page-container relative z-10">
            <div
              data-hiw-reveal
              className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20"
            >
              <div className="max-w-[760px]">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#D7AE78]">
                  {t("howPage.cta.eyebrow")}
                </p>

                <h2 className="mt-5 font-display text-[48px] font-medium leading-[0.95] text-[#FFF9F3] sm:text-[60px] lg:text-[70px]">
                  {t("howPage.cta.title")}
                </h2>

                <p className="mt-6 max-w-[580px] text-[13px] leading-7 text-white/60">
                  {t("howPage.cta.body")}
                </p>
              </div>

              <Link
                to="/register"
                className="group inline-flex min-h-[56px] items-center justify-between gap-8 bg-[#FFF8F1] px-6 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#3B1B1F] transition hover:bg-white"
              >
                {t("howPage.cta.action")}

                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SmallDetail({
  label,
  value
}) {
  return (
    <div className="grid grid-cols-[95px_1fr] gap-4 sm:grid-cols-[110px_1fr] sm:gap-5">
      <span className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-[#D1A46F]">
        {label}
      </span>

      <p className="text-[11px] leading-5 text-white/55">
        {value}
      </p>
    </div>
  );
}

function ControlRow({
  icon: Icon,
  title,
  body,
  number,
  last = false
}) {
  return (
    <article
      className={[
        "group grid grid-cols-[48px_1fr_auto] gap-4 py-7 sm:grid-cols-[56px_1fr_auto] sm:gap-5 sm:py-8",
        last ? "" : "border-b border-[#C9B69F]"
      ].join(" ")}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#BFA486] text-[#681D25] transition duration-300 group-hover:border-[#681D25] group-hover:bg-[#681D25] group-hover:text-white">
        <Icon
          size={18}
          strokeWidth={1.5}
        />
      </span>

      <div>
        <h3 className="font-display text-[28px] text-[#2C1A18] sm:text-[31px]">
          {title}
        </h3>

        <p className="mt-2 max-w-[520px] text-[12px] leading-6 text-[#756A60]">
          {body}
        </p>
      </div>

      <span className="font-display text-[17px] italic text-[#A77B4E]">
        {number}
      </span>
    </article>
  );
}