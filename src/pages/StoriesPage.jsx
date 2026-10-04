import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  HeartHandshake,
  MapPin,
  Sparkles,
  UsersRound
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { gsap } from "../motion/gsap";

const stories = [
  {
    id: "story-1",
    name: "Aditi & Harsh",
    city: "Ahmedabad ↔ Rajkot",
    timeline: "A patient introduction",
    image: "/assets/member/profile-devika.webp",
    altImage: "/assets/member/profile-rajveer.webp",
    tag: "Editorial story",
    quote: "What mattered first was not speed, but how comfortably both families could speak.",
    title: "An introduction across two cities",
    body:
      "A profile exchange began quietly. A few thoughtful conversations followed, then both families chose to speak directly. Nothing was rushed, and that gave the introduction room to feel natural.",
    points: [
      "Profiles were explored before direct contact",
      "Interest was mutual before families connected",
      "The pace was decided by the people involved"
    ]
  },
  {
    id: "story-2",
    name: "Meera & Yash",
    city: "Vadodara ↔ Udaipur",
    timeline: "Shared values, different routines",
    image: "/assets/member/profile-nandini.webp",
    altImage: "/assets/member/profile-yuvraj.webp",
    tag: "Editorial story",
    quote: "Their professions were different. Their idea of family life was not.",
    title: "Shared values, different paths",
    body:
      "Their daily lives looked different on paper, but the conversation revealed something more important: similar expectations around family, independence and long-term partnership.",
    points: [
      "Different professions did not become a barrier",
      "Values mattered more than surface-level similarity",
      "Families joined only after both sides were comfortable"
    ]
  },
  {
    id: "story-3",
    name: "Riya & Veer",
    city: "Rajkot ↔ Ahmedabad",
    timeline: "A slower beginning",
    image: "/assets/member/profile-devika.webp",
    altImage: "/assets/member/profile-yuvraj.webp",
    tag: "Editorial story",
    quote: "The first conversation was brief. The second was warmer. The rest grew slowly.",
    title: "A conversation that grew slowly",
    body:
      "There was no instant certainty. Instead, trust developed through time, respectful questions and patient family conversations. The process gave both sides space to decide without pressure.",
    points: [
      "No pressure to respond immediately",
      "Mutual interest developed over time",
      "Family conversation followed personal comfort"
    ]
  }
];

export default function StoriesPage() {
  const { t } = useTranslation();

  const root = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const activeStory = stories[activeIndex];

  const previousStory = () => {
    setActiveIndex((current) =>
      current === 0 ? stories.length - 1 : current - 1
    );
  };

  const nextStory = () => {
    setActiveIndex((current) =>
      current === stories.length - 1 ? 0 : current + 1
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) =>
        current === stories.length - 1 ? 0 : current + 1
      );
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  useLayoutEffect(() => {
    if (!root.current) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return undefined;

    const context = gsap.context(() => {
      const reveals = gsap.utils.toArray(
        "[data-story-reveal]",
        root.current
      );

      reveals.forEach((element) => {
        gsap.fromTo(
          element,
          {
            autoAlpha: 0,
            y: 32
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
    }, root);

    return () => context.revert();
  }, []);

  useLayoutEffect(() => {
    if (!root.current) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return undefined;

    const image = root.current.querySelector(
      "[data-featured-image]"
    );

    const copy = root.current.querySelector(
      "[data-featured-copy]"
    );

    const context = gsap.context(() => {
      if (image) {
        gsap.fromTo(
          image,
          {
            autoAlpha: 0,
            scale: 1.045
          },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.75,
            ease: "power3.out"
          }
        );
      }

      if (copy) {
        gsap.fromTo(
          copy,
          {
            autoAlpha: 0,
            y: 16
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out"
          }
        );
      }
    }, root);

    return () => context.revert();
  }, [activeIndex]);

  return (
    <div
      ref={root}
      className="min-h-screen bg-[#F5F0E8]"
    >
      <Header solid />

      <main>
        {/* =========================================
            HERO
        ========================================== */}

        <section className="relative overflow-hidden bg-[#F5F0E8] py-24 sm:py-28 lg:py-36">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-48 top-[-120px] h-[520px] w-[520px] rounded-full bg-[#C49B70]/10 blur-[140px]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-52 bottom-[-170px] h-[520px] w-[520px] rounded-full bg-[#681D25]/7 blur-[140px]"
          />

          <div className="page-container relative z-10">
            <div className="grid gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-24">
              <div data-story-reveal>
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-[#AA7A42]" />

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                    {t("storiesPage.hero.eyebrow")}
                  </p>
                </div>

                <h1 className="mt-6 max-w-[780px] font-display text-[54px] font-medium leading-[0.92] tracking-[-0.04em] text-[#281A18] sm:text-[68px] lg:text-[86px]">
                  {t("storiesPage.hero.title")}
                </h1>

                <p className="mt-8 max-w-[650px] text-[14px] leading-8 text-[#756A60] sm:text-[15px]">
                  {t("storiesPage.hero.body")}
                </p>
              </div>

              <div
                data-story-reveal
                className="border-l border-[#D2C0AD] pl-8 lg:pl-10"
              >
                <p className="font-display text-[28px] italic leading-[1.25] text-[#681D25] sm:text-[34px]">
                  “{t("storiesPage.hero.quote")}”
                </p>

                <div className="mt-7 flex items-center gap-3">
                  <Sparkles
                    size={15}
                    strokeWidth={1.5}
                    className="text-[#AA7A42]"
                  />

                  <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#91683F]">
                    {t("storiesPage.hero.note")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            FEATURED STORY
        ========================================== */}

        <section className="relative overflow-hidden bg-[#211716] py-20 text-white sm:py-24 lg:py-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-48 top-24 h-[500px] w-[500px] rounded-full bg-[#681D25]/20 blur-[140px]"
          />

          <div className="page-container relative z-10">
            <div
              data-story-reveal
              className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-[#C49B70]" />

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#D1A46F]">
                    {t("storiesPage.featured.eyebrow")}
                  </p>
                </div>

                <h2 className="mt-5 font-display text-[48px] font-medium leading-[0.95] text-white sm:text-[60px]">
                  {t("storiesPage.featured.title")}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={previousStory}
                  aria-label={t("storiesPage.featured.previous")}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-[#C99F72] hover:bg-[#C99F72] hover:text-[#211716]"
                >
                  <ArrowLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={nextStory}
                  aria-label={t("storiesPage.featured.next")}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-[#C99F72] hover:bg-[#C99F72] hover:text-[#211716]"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20">
              {/* image */}

              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -left-5 top-6 hidden h-[88%] w-[88%] border border-[#C49B70]/20 sm:block"
                />

                <div className="relative overflow-hidden border border-white/10 bg-[#2A1B19] shadow-[0_35px_90px_rgba(0,0,0,.3)]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      key={activeStory.image}
                      data-featured-image
                      src={activeStory.image}
                      alt=""
                      className="h-full w-full object-cover object-top"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#160D0F]/80 via-transparent to-transparent" />

                    <div className="absolute left-5 top-5 flex items-center gap-2 border border-white/15 bg-[#211716]/40 px-3 py-2 backdrop-blur-md">
                      <BadgeCheck
                        size={13}
                        className="text-[#D6AC78]"
                      />

                      <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-white/75">
                        {activeStory.tag}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                      <p className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#D6AC78]">
                        {activeStory.timeline}
                      </p>

                      <h3 className="mt-3 font-display text-[40px] leading-none text-white sm:text-[48px]">
                        {activeStory.name}
                      </h3>

                      <p className="mt-3 flex items-center gap-2 text-[11px] text-white/55">
                        <MapPin
                          size={13}
                          className="text-[#C99F72]"
                        />

                        {activeStory.city}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* copy */}

              <div
                key={activeStory.id}
                data-featured-copy
              >
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#D1A46F]">
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(stories.length).padStart(2, "0")}
                </p>

                <blockquote className="mt-6 max-w-[540px] font-display text-[34px] italic leading-[1.12] text-white sm:text-[40px]">
                  “{activeStory.quote}”
                </blockquote>

                <h3 className="mt-8 font-display text-[36px] font-medium leading-none text-white">
                  {activeStory.title}
                </h3>

                <p className="mt-5 max-w-[560px] text-[13px] leading-7 text-white/55">
                  {activeStory.body}
                </p>

                <div className="mt-8 border-y border-white/10 py-5">
                  {activeStory.points.map((point, index) => (
                    <div
                      key={point}
                      className={[
                        "grid grid-cols-[28px_1fr] gap-3 py-3",
                        index !== activeStory.points.length - 1
                          ? "border-b border-white/10"
                          : ""
                      ].join(" ")}
                    >
                      <span className="font-display text-[12px] italic text-[#C99F72]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <p className="text-[11px] leading-6 text-white/55">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>

                {/* progress */}

                <div className="mt-8 flex gap-2">
                  {stories.map((story, index) => (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`${t(
                        "storiesPage.featured.goTo"
                      )} ${index + 1}`}
                      className={[
                        "h-[2px] flex-1 transition-all duration-300",
                        index === activeIndex
                          ? "bg-[#D1A46F]"
                          : "bg-white/15"
                      ].join(" ")}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            STORY CHAPTERS
        ========================================== */}

        <section className="bg-[#F5F0E8] py-20 sm:py-24 lg:py-32">
          <div className="page-container">
            <div
              data-story-reveal
              className="max-w-[760px]"
            >
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-[#AA7A42]" />

                <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                  {t("storiesPage.chapters.eyebrow")}
                </p>
              </div>

              <h2 className="mt-6 font-display text-[48px] font-medium leading-[0.95] text-[#281A18] sm:text-[60px] lg:text-[68px]">
                {t("storiesPage.chapters.title")}
              </h2>
            </div>

            <div className="mt-16 space-y-20 lg:space-y-28">
              <StoryChapter
                number="01"
                title={t("storiesPage.chapters.first.title")}
                body={t("storiesPage.chapters.first.body")}
                image="/assets/member/profile-rajveer.webp"
                align="left"
              />

              <StoryChapter
                number="02"
                title={t("storiesPage.chapters.family.title")}
                body={t("storiesPage.chapters.family.body")}
                image="/assets/member/profile-devika.webp"
                align="right"
              />

              <StoryChapter
                number="03"
                title={t("storiesPage.chapters.decision.title")}
                body={t("storiesPage.chapters.decision.body")}
                image="/assets/member/profile-nandini.webp"
                align="left"
              />
            </div>
          </div>
        </section>

        {/* =========================================
            SCRAPBOOK
        ========================================== */}

        <section className="overflow-hidden bg-[#E8DCCB] py-20 sm:py-24 lg:py-32">
          <div className="page-container">
            <div
              data-story-reveal
              className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20"
            >
              <div>
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-[#AA7A42]" />

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                    {t("storiesPage.scrapbook.eyebrow")}
                  </p>
                </div>

                <h2 className="mt-6 font-display text-[48px] font-medium leading-[0.95] text-[#281A18] sm:text-[60px]">
                  {t("storiesPage.scrapbook.title")}
                </h2>

                <p className="mt-6 max-w-[500px] text-[13px] leading-7 text-[#756A60]">
                  {t("storiesPage.scrapbook.body")}
                </p>
              </div>

              <div className="relative min-h-[560px] sm:min-h-[620px]">
                <div className="absolute left-[4%] top-[12%] w-[42%] -rotate-[6deg] border border-[#CBB79E] bg-[#FFF9F1] p-3 shadow-[0_20px_50px_rgba(55,33,24,.12)]">
                  <img
                    src="/assets/member/profile-devika.webp"
                    alt=""
                    className="aspect-[4/5] w-full object-cover object-top"
                  />

                  <p className="mt-3 font-display text-[20px] italic text-[#681D25]">
                    A first introduction
                  </p>
                </div>

                <div className="absolute right-[3%] top-[5%] w-[46%] rotate-[4deg] border border-[#CBB79E] bg-[#FFF9F1] p-3 shadow-[0_20px_50px_rgba(55,33,24,.12)]">
                  <img
                    src="/assets/member/profile-rajveer.webp"
                    alt=""
                    className="aspect-[4/5] w-full object-cover object-top"
                  />

                  <p className="mt-3 font-display text-[20px] italic text-[#681D25]">
                    Families begin to speak
                  </p>
                </div>

                <div className="absolute bottom-[4%] left-[25%] z-20 w-[52%] -rotate-[1deg] border border-[#CBB79E] bg-[#FFFDF8] p-6 shadow-[0_28px_70px_rgba(55,33,24,.16)] sm:p-8">
                  <HeartHandshake
                    size={24}
                    strokeWidth={1.4}
                    className="text-[#681D25]"
                  />

                  <p className="mt-5 font-display text-[30px] italic leading-[1.1] text-[#2B1A18]">
                    “The meaningful part is not how quickly the story moves,
                    but how naturally it does.”
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <span className="h-px w-8 bg-[#AA7A42]" />

                    <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#91683F]">
                      Illustrative journey
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            PHILOSOPHY
        ========================================== */}

        <section className="bg-[#F5F0E8] py-20 sm:py-24 lg:py-28">
          <div className="page-container">
            <div
              data-story-reveal
              className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
            >
              <div>
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-[#AA7A42]" />

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683F]">
                    {t("storiesPage.values.eyebrow")}
                  </p>
                </div>

                <h2 className="mt-6 font-display text-[48px] font-medium leading-[0.95] text-[#281A18] sm:text-[58px]">
                  {t("storiesPage.values.title")}
                </h2>
              </div>

              <div className="border-t border-[#D2C1AE]">
                <ValueRow
                  number="01"
                  icon={HeartHandshake}
                  title={t("storiesPage.values.mutual.title")}
                  body={t("storiesPage.values.mutual.body")}
                />

                <ValueRow
                  number="02"
                  icon={UsersRound}
                  title={t("storiesPage.values.family.title")}
                  body={t("storiesPage.values.family.body")}
                />

                <ValueRow
                  number="03"
                  icon={Sparkles}
                  title={t("storiesPage.values.pace.title")}
                  body={t("storiesPage.values.pace.body")}
                  last
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            CTA
        ========================================== */}

        <section className="relative overflow-hidden bg-[#4A1F24] py-20 text-white sm:py-24 lg:py-28">
          <div className="page-container relative z-10">
            <div
              data-story-reveal
              className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20"
            >
              <div className="max-w-[780px]">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#D7AE78]">
                  {t("storiesPage.cta.eyebrow")}
                </p>

                <h2 className="mt-5 font-display text-[48px] font-medium leading-[0.95] text-[#FFF9F3] sm:text-[60px] lg:text-[70px]">
                  {t("storiesPage.cta.title")}
                </h2>

                <p className="mt-6 max-w-[600px] text-[13px] leading-7 text-white/60">
                  {t("storiesPage.cta.body")}
                </p>
              </div>

              <Link
                to="/register"
                className="group inline-flex min-h-[56px] items-center justify-between gap-8 bg-[#FFF8F1] px-6 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#3B1B1F] transition hover:bg-white"
              >
                {t("storiesPage.cta.action")}

                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
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

function StoryChapter({
  number,
  title,
  body,
  image,
  align
}) {
  const reverse = align === "right";

  return (
    <article
      data-story-reveal
      className="border-t border-[#D5C5B3] pt-8"
    >
      <div
        className={[
          "grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-20",
          reverse ? "lg:[&>*:first-child]:order-2" : ""
        ].join(" ")}
      >
        <div>
          <span className="font-display text-[18px] italic text-[#AA7A42]">
            {number}
          </span>

          <h3 className="mt-5 max-w-[520px] font-display text-[42px] font-medium leading-[0.98] text-[#281A18] sm:text-[50px]">
            {title}
          </h3>

          <p className="mt-6 max-w-[520px] text-[13px] leading-7 text-[#756A60]">
            {body}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div
            aria-hidden="true"
            className={[
              "absolute top-5 h-[88%] w-full border border-[#C8AE8E]/50",
              reverse ? "-right-5" : "-left-5"
            ].join(" ")}
          />

          <div className="relative overflow-hidden border border-[#D4C4B2] bg-[#EDE2D5]">
            <img
              src={image}
              alt=""
              loading="lazy"
              className="aspect-[4/3] w-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ValueRow({
  number,
  icon: Icon,
  title,
  body,
  last = false
}) {
  return (
    <article
      className={[
        "grid grid-cols-[50px_1fr_auto] gap-4 py-7 sm:grid-cols-[58px_1fr_auto] sm:gap-5 sm:py-8",
        last ? "" : "border-b border-[#D2C1AE]"
      ].join(" ")}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#BFA486] text-[#681D25]">
        <Icon
          size={17}
          strokeWidth={1.5}
        />
      </span>

      <div>
        <h3 className="font-display text-[28px] text-[#2C1A18] sm:text-[31px]">
          {title}
        </h3>

        <p className="mt-2 max-w-[540px] text-[12px] leading-6 text-[#756A60]">
          {body}
        </p>
      </div>

      <span className="font-display text-[16px] italic text-[#A77B4E]">
        {number}
      </span>
    </article>
  );
}