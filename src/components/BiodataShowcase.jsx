import {
  Download,
  FileText,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { useGsapReveal } from "../motion/useGsapReveal";

export default function BiodataShowcase() {
  const { t } = useTranslation();

  const root = useRef(null);
  useGsapReveal(root);

  return (
    <section
      ref={root}
      className="bg-[#f5f0e9] py-20 sm:py-24 lg:py-40"
    >
      <div className="page-container">
        <div className="grid grid-cols-1 items-center gap-14 md:gap-16 lg:grid-cols-2 lg:gap-32 xl:gap-40">

          {/* LEFT */}
          <div
            data-reveal
            className="w-full max-w-[580px]"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="h-px w-8 bg-[#AA7A42] sm:w-10" />

              <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#91683F] sm:text-[10px] sm:tracking-[0.25em]">
                {t("home.biodataEyebrow")}
              </p>
            </div>

            <h2 className="mt-5 max-w-[560px] font-display text-[42px] font-medium leading-[0.98] tracking-[-0.035em] text-[#271816] sm:mt-6 sm:text-[54px] md:text-[60px] lg:text-[68px]">
              {t("home.biodataTitle")}
            </h2>

            <p className="mt-6 max-w-[520px] text-[13px] leading-7 text-[#78685f] sm:mt-7 sm:text-[14px] sm:leading-8">
              {t("home.biodataBody")}
            </p>

            {/* FEATURE ROWS */}
            <div className="mt-8 border-y border-[#D7C9BA] sm:mt-10">
              <FeatureRow
                icon={FileText}
                title="Built from your profile"
                text="Your profile information is arranged into a clean family-ready biodata."
              />

              <FeatureRow
                icon={LockKeyhole}
                title="Privacy controlled"
                text="Sensitive information can remain private unless you choose to include it."
              />

              <FeatureRow
                icon={ShieldCheck}
                title="Ready to share"
                text="A polished document designed for family conversations and introductions."
                last
              />
            </div>

            {/* CTA */}
            <Link
              to="/register"
              className="group mt-8 inline-flex items-center gap-3 border-b border-[#AA7A42] pb-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#681D25] transition hover:text-[#431318] sm:mt-9 sm:gap-4 sm:text-[10px] sm:tracking-[0.18em]"
            >
              {t("home.biodataAction")}

              <Download
                size={15}
                className="transition-transform duration-200 group-hover:translate-y-0.5"
              />
            </Link>
          </div>

          {/* RIGHT */}
          <div
            data-reveal
            className="biodata-showcase-visual relative mx-auto w-full max-w-[430px]"
          >
            <img
              className="biodata-editorial-backdrop hidden sm:block"
              src="/assets/public/biodata-editorial.webp"
              alt="Ivory matrimonial stationery with a fountain pen"
              loading="lazy"
            />

            <article className="relative min-h-0 border border-[#d5c5b3] bg-[#fffdf9] px-5 py-7 shadow-[0_20px_50px_rgba(54,34,25,.14)] sm:min-h-[560px] sm:px-7 sm:py-8 md:px-9 md:py-10 md:shadow-[0_25px_60px_rgba(54,34,25,.16)]">
              <div className="text-center">
                <p className="text-[7px] font-bold uppercase tracking-[0.28em] text-[#9b7a5b] sm:text-[8px] sm:tracking-[0.35em]">
                  {t("homeExtra:matrimonialProfile")}
                </p>

                <h3 className="mt-3 font-display text-[30px] text-[#521a20] sm:text-[35px]">
                  Devika Jadeja
                </h3>

                <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-[#927d6d] sm:text-[10px] sm:tracking-[0.16em]">
                  Ahmedabad • Gujarat
                </p>
              </div>

              <div className="mx-auto mt-6 h-36 w-28 overflow-hidden rounded-t-[70px] sm:mt-7 sm:h-40 sm:w-32 sm:rounded-t-[80px]">
                <img
                  src="/assets/member/profile-devika.webp"
                  loading="lazy"
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="my-6 h-px bg-[#decfbe] sm:my-8" />

              <div className="grid grid-cols-2 gap-x-5 gap-y-5 text-[10px] sm:gap-x-8 sm:gap-y-6 sm:text-[11px]">
                <Info
                  label={t("public.finderAge")}
                  value={`26 ${t("profile.years")}`}
                />

                <Info
                  label={t("profile.height")}
                  value={"5'6\""}
                />

                <Info
                  label={t("profile.education")}
                  value="M.Arch"
                />

                <Info
                  label={t("profile.profession")}
                  value="Architect"
                />

                <Info
                  label={t("profile.location")}
                  value="Rajkot"
                />

                <Info
                  label={t("language.label")}
                  value="Gujarati"
                />
              </div>

              <div className="mt-8 border-t border-[#decfbe] pt-4 text-center text-[8px] uppercase tracking-[0.16em] text-[#9b8776] sm:mt-10 sm:pt-5 sm:text-[9px] sm:tracking-[0.2em]">
                Kshatriya Matrimonial Society
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  text,
  last = false
}) {
  return (
    <div
      className={[
        "grid grid-cols-[38px_1fr] gap-3 py-4 sm:grid-cols-[42px_1fr] sm:gap-4 sm:py-5",
        last ? "" : "border-b border-[#D7C9BA]"
      ].join(" ")}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#CDB9A3] text-[#681D25] sm:h-10 sm:w-10">
        <Icon
          size={15}
          strokeWidth={1.5}
        />
      </span>

      <div>
        <h3 className="text-[10px] font-extrabold uppercase tracking-[0.09em] text-[#3A2925] sm:text-[11px] sm:tracking-[0.1em]">
          {title}
        </h3>

        <p className="mt-1.5 max-w-[440px] text-[11px] leading-5 text-[#756A60] sm:mt-2 sm:text-[12px] sm:leading-6">
          {text}
        </p>
      </div>
    </div>
  );
}

function Info({
  label,
  value
}) {
  return (
    <div>
      <span className="block text-[7px] font-bold uppercase tracking-[0.12em] text-[#a28e7d] sm:text-[8px] sm:tracking-[0.14em]">
        {label}
      </span>

      <span className="mt-1 block text-[10px] font-medium text-[#392825] sm:text-[11px]">
        {value}
      </span>
    </div>
  );
}