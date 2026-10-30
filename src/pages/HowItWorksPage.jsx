import {
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

import {
  useLayoutEffect,
  useRef
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

const stageImages = [
  "/assets/public/hiw-stage-1-profile.jpg",
  "/assets/public/hiw-stage-2-discover.jpg",
  "/assets/public/hiw-stage-3-interest.jpg",
  "/assets/public/hiw-stage-4-match.jpg"
];

export default function HowItWorksPage() {
  const {
    t
  } =
    useTranslation();

  const root =
    useRef(null);

  const stages = [
    {
      number: "01",
      icon: UserRound,
      title:
        t(
          "howPage.stages.begin.title"
        ),
      eyebrow:
        t(
          "howPage.stages.begin.eyebrow"
        ),
      body:
        t(
          "howPage.stages.begin.body"
        ),
      image:
        stageImages[
          0
        ],
      steps: [
        t(
          "howPage.steps.createAccount"
        ),
        t(
          "howPage.steps.verifyMobile"
        ),
        t(
          "howPage.steps.buildProfile"
        )
      ],
      userDoes:
        t(
          "howPage.stages.begin.userDoes"
        ),
      platformDoes:
        t(
          "howPage.stages.begin.platformDoes"
        ),
      privateNote:
        t(
          "howPage.stages.begin.private"
        )
    },
    {
      number: "02",
      icon: Search,
      title:
        t(
          "howPage.stages.discover.title"
        ),
      eyebrow:
        t(
          "howPage.stages.discover.eyebrow"
        ),
      body:
        t(
          "howPage.stages.discover.body"
        ),
      image:
        stageImages[
          1
        ],
      steps: [
        t(
          "howPage.steps.submitReview"
        ),
        t(
          "howPage.steps.discoverProfiles"
        )
      ],
      userDoes:
        t(
          "howPage.stages.discover.userDoes"
        ),
      platformDoes:
        t(
          "howPage.stages.discover.platformDoes"
        ),
      privateNote:
        t(
          "howPage.stages.discover.private"
        )
    },
    {
      number: "03",
      icon:
        HeartHandshake,
      title:
        t(
          "howPage.stages.interest.title"
        ),
      eyebrow:
        t(
          "howPage.stages.interest.eyebrow"
        ),
      body:
        t(
          "howPage.stages.interest.body"
        ),
      image:
        stageImages[
          2
        ],
      steps: [
        t(
          "howPage.steps.expressInterest"
        ),
        t(
          "howPage.steps.acceptMutually"
        )
      ],
      userDoes:
        t(
          "howPage.stages.interest.userDoes"
        ),
      platformDoes:
        t(
          "howPage.stages.interest.platformDoes"
        ),
      privateNote:
        t(
          "howPage.stages.interest.private"
        )
    },
    {
      number: "04",
      icon:
        UsersRound,
      title:
        t(
          "howPage.stages.connect.title"
        ),
      eyebrow:
        t(
          "howPage.stages.connect.eyebrow"
        ),
      body:
        t(
          "howPage.stages.connect.body"
        ),
      image:
        stageImages[
          3
        ],
      steps: [
        t(
          "howPage.steps.requestContact"
        ),
        t(
          "howPage.steps.familyConversation"
        )
      ],
      userDoes:
        t(
          "howPage.stages.connect.userDoes"
        ),
      platformDoes:
        t(
          "howPage.stages.connect.platformDoes"
        ),
      privateNote:
        t(
          "howPage.stages.connect.private"
        )
    }
  ];

  useLayoutEffect(
    () => {
      const scope =
        root.current;

      if (
        !scope
      ) {
        return undefined;
      }

      const reducedMotion =
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

      if (
        reducedMotion
      ) {
        return undefined;
      }

      const context =
        gsap.context(
          () => {
            const reveals =
              gsap.utils.toArray(
                "[data-hiw-reveal]",
                scope
              );

            reveals.forEach(
              (
                element
              ) => {
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
                    ease:
                      "power3.out",
                    scrollTrigger: {
                      trigger:
                        element,
                      start:
                        "top 86%",
                      once: true
                    }
                  }
                );
              }
            );

            const stageRows =
              gsap.utils.toArray(
                "[data-stage-row]",
                scope
              );

            stageRows.forEach(
              (
                row
              ) => {
                const copy =
                  row.querySelector(
                    "[data-stage-content]"
                  );

                const visual =
                  row.querySelector(
                    "[data-stage-visual]"
                  );

                const image =
                  row.querySelector(
                    "[data-stage-img]"
                  );

                if (
                  copy
                ) {
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
                      ease:
                        "power3.out",
                      scrollTrigger: {
                        trigger:
                          row,
                        start:
                          "top 78%",
                        once: true
                      }
                    }
                  );
                }

                if (
                  visual
                ) {
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
                      ease:
                        "power3.out",
                      scrollTrigger: {
                        trigger:
                          row,
                        start:
                          "top 76%",
                        once: true
                      }
                    }
                  );
                }

                if (
                  image
                ) {
                  gsap.fromTo(
                    image,
                    {
                      scale: 1.07
                    },
                    {
                      scale: 1,
                      ease:
                        "none",
                      scrollTrigger: {
                        trigger:
                          row,
                        start:
                          "top bottom",
                        end:
                          "bottom top",
                        scrub:
                          0.8
                      }
                    }
                  );
                }
              }
            );
          },
          scope
        );

      return () =>
        context.revert();
    },
    []
  );

  return (
    <div
      ref={
        root
      }
      className="min-h-screen bg-[#1a080b]"
    >
      <Header />

      <main>
        {/* =========================================
            HERO WITH BACKGROUND IMAGE
        ========================================== */}

        <section className="relative overflow-hidden bg-[#1a080b]">
          <div
            aria-hidden="true"
            className="absolute inset-0"
          >
            <img
              src="/assets/public/how-it-works-hero-royal.jpg"
              alt="Rajput royal palace grand durbar"
              className="h-full w-full object-cover object-center"
            />

            {/* Left text readability - preserves vibrant palace image */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,8,11,0.88)_0%,rgba(26,8,11,0.60)_42%,rgba(26,8,11,0.18)_75%,transparent_100%)]" />

            {/* Top nav bar integration */}
            <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/70 via-black/25 to-transparent" />

            {/* Bottom seamless blend into damask wallpaper section */}
            <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(0deg,#1a080b_0%,rgba(26,8,11,0.75)_35%,transparent_100%)]" />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-48 top-0 h-[520px] w-[520px] rounded-full bg-[#8B2635]/20 blur-[140px]"
          />

          <div className="page-container relative z-10">
            <div className="grid min-h-[720px] items-center gap-14 pb-24 pt-36 sm:pb-28 sm:pt-40 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:pb-36 lg:pt-44">
              <div data-hiw-reveal>
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-[#C49B70]" />

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#D1A46F]">
                    {t(
                      "howPage.hero.eyebrow"
                    )}
                  </p>
                </div>

                <h1 className="mt-6 max-w-[820px] font-display text-[54px] font-medium leading-[0.92] tracking-[-0.04em] text-white sm:text-[68px] lg:text-[88px]">
                  {t(
                    "howPage.hero.title"
                  )}
                </h1>

                <p className="mt-8 max-w-[650px] text-[14px] leading-8 text-[#E8DDD0]/80 sm:text-[15px]">
                  {t(
                    "howPage.hero.body"
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            JOURNEY
        ========================================== */}

        <section className="relative overflow-hidden bg-damask-maroon py-20 text-white sm:py-24 lg:py-32 border-y border-[#4a181d] shadow-[inset_0_20px_40px_rgba(0,0,0,0.35),inset_0_-20px_40px_rgba(0,0,0,0.35)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-52 top-40 h-[520px] w-[520px] rounded-full bg-[#8B2635]/15 blur-[140px]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-48 bottom-20 h-[500px] w-[500px] rounded-full bg-[#AA7A42]/10 blur-[140px]"
          />

          <div className="page-container relative z-10">
            <div
              data-hiw-reveal
              className="mb-16 max-w-[760px] lg:mb-24"
            >
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-[#C49B70]" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#D1A46F]">
                  {t(
                    "howPage.process.eyebrow"
                  )}
                </p>
              </div>

              <h2 className="mt-6 font-display text-[48px] font-medium leading-[0.95] tracking-[-0.035em] text-white sm:text-[60px] lg:text-[72px]">
                {t(
                  "howPage.process.title"
                )}
              </h2>

              <p className="mt-7 max-w-[620px] text-[13px] leading-7 text-white/55 sm:text-[14px]">
                {t(
                  "howPage.process.body"
                )}
              </p>
            </div>

            <div className="space-y-24 lg:space-y-32">
              {stages.map(
                (
                  stage,
                  index
                ) => {
                  const Icon =
                    stage.icon;

                  return (
                    <article
                      key={
                        stage.number
                      }
                      data-stage-row
                      className="relative"
                    >
                      <div className="mb-10 flex items-center gap-5">
                        <span className="font-display text-[20px] italic text-[#C99F72]">
                          {
                            stage.number
                          }
                        </span>

                        <span className="h-px flex-1 bg-white/10" />
                      </div>

                      <div
                        className={[
                          "grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20 xl:gap-28",
                          index %
                              2 ===
                            1
                            ? "lg:[&>*:first-child]:order-2"
                            : ""
                        ].join(
                          " "
                        )}
                      >
                        <div
                          data-stage-content
                          className="max-w-[560px]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C99F72]/40 bg-[#681D25]/40 text-[#E1B781]">
                              <Icon
                                size={
                                  17
                                }
                                strokeWidth={
                                  1.5
                                }
                              />
                            </span>

                            <p className="text-[9px] font-extrabold uppercase tracking-[0.19em] text-[#C99F72]">
                              {
                                stage.eyebrow
                              }
                            </p>
                          </div>

                          <h3 className="mt-6 font-display text-[42px] font-medium leading-[0.96] text-white sm:text-[50px]">
                            {
                              stage.title
                            }
                          </h3>

                          <p className="mt-6 max-w-[520px] text-[13px] leading-7 text-white/60">
                            {
                              stage.body
                            }
                          </p>

                          <div className="mt-8 border-y border-white/10 py-5">
                            {stage.steps.map(
                              (
                                step,
                                stepIndex
                              ) => (
                                <div
                                  key={
                                    step
                                  }
                                  className={[
                                    "grid grid-cols-[30px_1fr] gap-3 py-3",
                                    stepIndex !==
                                    stage.steps.length -
                                      1
                                      ? "border-b border-white/10"
                                      : ""
                                  ].join(
                                    " "
                                  )}
                                >
                                  <span className="font-display text-[13px] italic text-[#C99F72]">
                                    {String(
                                      stepIndex +
                                        1
                                    ).padStart(
                                      2,
                                      "0"
                                    )}
                                  </span>

                                  <div className="flex items-start gap-3">
                                    <Check
                                      size={
                                        14
                                      }
                                      className="mt-1 shrink-0 text-[#C99F72]"
                                    />

                                    <span className="text-[11px] leading-6 text-white/55">
                                      {
                                        step
                                      }
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          <div className="mt-8 grid gap-5">
                            <SmallDetail
                              label={
                                t(
                                  "howPage.details.you"
                                )
                              }
                              value={
                                stage.userDoes
                              }
                            />

                            <SmallDetail
                              label={
                                t(
                                  "howPage.details.platform"
                                )
                              }
                              value={
                                stage.platformDoes
                              }
                            />

                            <SmallDetail
                              label={
                                t(
                                  "howPage.details.private"
                                )
                              }
                              value={
                                stage.privateNote
                              }
                            />
                          </div>
                        </div>

                        <div
                          data-stage-visual
                          className="relative mx-auto w-full max-w-[590px]"
                          style={{
                            perspective:
                              "1200px"
                          }}
                        >
                          <div
                            aria-hidden="true"
                            className={[
                              "absolute top-7 h-[88%] w-full border border-[#C49B70]/20",
                              index %
                                  2 ===
                                1
                                ? "-right-5"
                                : "-left-5"
                            ].join(
                              " "
                            )}
                          />

                          <div className="relative overflow-hidden border border-white/10 bg-[#2A1B19] shadow-[0_35px_90px_rgba(0,0,0,.30)]">
                            <div className="relative aspect-[4/5] overflow-hidden">
                              <img
                                data-stage-img
                                src={
                                  stage.image
                                }
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover object-center"
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-[#160D0F]/88 via-[#160D0F]/5 to-transparent" />

                              <div className="absolute left-5 top-5 flex items-center gap-3 border border-white/15 bg-[#211716]/45 px-3 py-2 backdrop-blur-md">
                                <span className="font-display text-[15px] italic text-[#D6AC78]">
                                  {
                                    stage.number
                                  }
                                </span>

                                <span className="h-3 w-px bg-white/20" />

                                <span className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-white/70">
                                  {
                                    stage.eyebrow
                                  }
                                </span>
                              </div>

                              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                                <p className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#D6AC78]">
                                  {
                                    stage.number
                                  }{" "}
                                  / 04
                                </p>

                                <h4 className="mt-3 max-w-[420px] font-display text-[36px] leading-none text-white sm:text-[42px]">
                                  {
                                    stage.title
                                  }
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* =========================================
            CONTROL SECTION
        ========================================== */}

        <section className="relative overflow-hidden bg-gradient-to-b from-[#F9F5EC] via-[#F3ECE0] to-[#ECE2D2] py-20 sm:py-24 lg:py-28 border-y-2 border-[#C5A059]/70 shadow-[inset_0_20px_40px_rgba(100,50,20,0.04),inset_0_-20px_40px_rgba(100,50,20,0.04)]">
          {/* Outer fine gold border line around entire section */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-3 sm:inset-5 lg:inset-7 rounded-2xl border-2 border-[#C5A059]/50"
          />

          {/* Inner hairline gold border line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-4 sm:inset-7 lg:inset-9 rounded-xl border border-[#C5A059]/30"
          />

          {/* 4 Golden Lotus Corners - Authentic Indian Royal Design */}
          <img
            src="/assets/lotus-corner-hd.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 w-36 sm:w-48 lg:w-60 select-none drop-shadow-[0_2px_4px_rgba(90,60,20,0.08)]"
          />
          <img
            src="/assets/lotus-corner-hd.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 w-36 sm:w-48 lg:w-60 -scale-x-100 select-none drop-shadow-[0_2px_4px_rgba(90,60,20,0.08)]"
          />
          <img
            src="/assets/lotus-corner-hd.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 w-36 sm:w-48 lg:w-60 -scale-y-100 select-none drop-shadow-[0_2px_4px_rgba(90,60,20,0.08)]"
          />
          <img
            src="/assets/lotus-corner-hd.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 w-36 sm:w-48 lg:w-60 -scale-x-100 -scale-y-100 select-none drop-shadow-[0_2px_4px_rgba(90,60,20,0.08)]"
          />

          {/* Top & Bottom Running Golden Lotus Garland Trims */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-36 sm:inset-x-52 lg:inset-x-64 top-2 sm:top-3 h-8 sm:h-12 bg-[url('/assets/lotus-border-hd.png')] bg-repeat-x bg-contain bg-top opacity-90 select-none"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-36 sm:inset-x-52 lg:inset-x-64 bottom-2 sm:bottom-3 h-8 sm:h-12 bg-[url('/assets/lotus-border-hd.png')] bg-repeat-x bg-contain bg-bottom -scale-y-100 opacity-90 select-none"
          />

          {/* Centered Content Framed Inside the Golden Lotus Design */}
          <div className="page-container relative z-10 px-4 sm:px-8 lg:px-12">
            <div
              data-hiw-reveal
              className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
            >
              <div>
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-[#AA7A42]" />

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                    {t(
                      "howPage.control.eyebrow"
                    )}
                  </p>
                </div>

                <h2 className="mt-6 max-w-[500px] font-display text-[48px] font-medium leading-[0.95] text-[#281A18] sm:text-[60px]">
                  {t(
                    "howPage.control.title"
                  )}
                </h2>

                <p className="mt-6 max-w-[500px] text-[13px] leading-7 text-[#756A60]">
                  {t(
                    "howPage.control.body"
                  )}
                </p>
              </div>

              <div className="border-t border-[#C9B69F]">
                <ControlRow
                  icon={
                    Eye
                  }
                  title={
                    t(
                      "howPage.control.photos.title"
                    )
                  }
                  body={
                    t(
                      "howPage.control.photos.body"
                    )
                  }
                  number="01"
                />

                <ControlRow
                  icon={
                    LockKeyhole
                  }
                  title={
                    t(
                      "howPage.control.contact.title"
                    )
                  }
                  body={
                    t(
                      "howPage.control.contact.body"
                    )
                  }
                  number="02"
                />

                <ControlRow
                  icon={
                    HeartHandshake
                  }
                  title={
                    t(
                      "howPage.control.interest.title"
                    )
                  }
                  body={
                    t(
                      "howPage.control.interest.body"
                    )
                  }
                  number="03"
                />

                <ControlRow
                  icon={
                    MessageCircleMore
                  }
                  title={
                    t(
                      "howPage.control.family.title"
                    )
                  }
                  body={
                    t(
                      "howPage.control.family.body"
                    )
                  }
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

        <section className="bg-subtle-texture py-20 sm:py-24 lg:py-32">
          <div className="page-container">
            <div
              data-hiw-reveal
              className="max-w-[720px]"
            >
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-[#AA7A42]" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                  {t(
                    "howPage.journey.eyebrow"
                  )}
                </p>
              </div>

              <h2 className="mt-6 font-display text-[48px] font-medium leading-[0.95] text-[#281A18] sm:text-[60px] lg:text-[68px]">
                {t(
                  "howPage.journey.title"
                )}
              </h2>

              <p className="mt-6 max-w-[600px] text-[13px] leading-7 text-[#756A60]">
                {t(
                  "howPage.journey.body"
                )}
              </p>
            </div>

            <div className="mt-14 border-t border-[#D4C5B4]">
              {[
                [
                  t(
                    "howPage.journey.items.profile.time"
                  ),
                  t(
                    "howPage.journey.items.profile.title"
                  ),
                  t(
                    "howPage.journey.items.profile.body"
                  )
                ],
                [
                  t(
                    "howPage.journey.items.review.time"
                  ),
                  t(
                    "howPage.journey.items.review.title"
                  ),
                  t(
                    "howPage.journey.items.review.body"
                  )
                ],
                [
                  t(
                    "howPage.journey.items.discover.time"
                  ),
                  t(
                    "howPage.journey.items.discover.title"
                  ),
                  t(
                    "howPage.journey.items.discover.body"
                  )
                ],
                [
                  t(
                    "howPage.journey.items.mutual.time"
                  ),
                  t(
                    "howPage.journey.items.mutual.title"
                  ),
                  t(
                    "howPage.journey.items.mutual.body"
                  )
                ],
                [
                  t(
                    "howPage.journey.items.family.time"
                  ),
                  t(
                    "howPage.journey.items.family.title"
                  ),
                  t(
                    "howPage.journey.items.family.body"
                  )
                ]
              ].map(
                (
                  [
                    time,
                    title,
                    body
                  ],
                  index
                ) => (
                  <article
                    key={
                      title
                    }
                    data-hiw-reveal
                    className="grid gap-4 border-b border-[#D4C5B4] py-7 sm:grid-cols-[120px_240px_1fr] sm:gap-7 sm:py-8"
                  >
                    <span className="font-display text-[18px] italic text-[#AA7A42]">
                      {
                        time
                      }
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#681D25] text-[9px] font-bold text-white">
                        {String(
                          index +
                            1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <h3 className="font-display text-[26px] text-[#2B1A18]">
                        {
                          title
                        }
                      </h3>
                    </div>

                    <p className="max-w-[560px] text-[12px] leading-6 text-[#756A60]">
                      {
                        body
                      }
                    </p>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        {/* Same FinalCTA used on homepage */}

        <FinalCTA />
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
        {
          label
        }
      </span>

      <p className="text-[11px] leading-5 text-white/55">
        {
          value
        }
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
        last
          ? ""
          : "border-b border-[#C9B69F]"
      ].join(
        " "
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#BFA486] text-[#681D25] transition duration-300 group-hover:border-[#681D25] group-hover:bg-[#681D25] group-hover:text-white">
        <Icon
          size={
            18
          }
          strokeWidth={
            1.5
          }
        />
      </span>

      <div>
        <h3 className="font-display text-[28px] text-[#2C1A18] sm:text-[31px]">
          {
            title
          }
        </h3>

        <p className="mt-2 max-w-[520px] text-[12px] leading-6 text-[#756A60]">
          {
            body
          }
        </p>
      </div>

      <span className="font-display text-[17px] italic text-[#A77B4E]">
        {
          number
        }
      </span>
    </article>
  );
}