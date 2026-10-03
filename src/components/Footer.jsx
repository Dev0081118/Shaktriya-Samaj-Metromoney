import {
  ArrowUpRight,
  Mail
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "./LanguageSwitcher";

const destinations = {
  Matches: "/discover",
  Membership: "/membership",
  "Success Stories": "/success-stories",
  About: "/about",
  "How It Works": "/how-it-works",
  Contact: "/contact",
  Safety: "/safety",
  Privacy: "/privacy",
  Terms: "/terms",
  Refunds: "/refunds"
};

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#181211] text-white">
      <div className="page-container">
        {/* =====================================
            TOP
        ====================================== */}

        <div className="grid gap-12 border-b border-white/10 py-14 sm:py-16 lg:grid-cols-[1.3fr_0.8fr_0.7fr] lg:gap-16 lg:py-20">
          {/* BRAND */}

          <div className="max-w-[460px]">
            <Link
              to="/"
              className="inline-block"
            >
              <span className="font-display text-[28px] font-semibold tracking-[0.06em] text-[#FFF9F3] sm:text-[30px]">
                KSHATRIYA
              </span>

              <span className="mt-1 block text-[7px] font-extrabold uppercase tracking-[0.3em] text-[#C89C66]">
                Matrimonial Society
              </span>
            </Link>

            <p className="mt-6 max-w-[430px] text-[12px] leading-7 text-white/45">
              {t("redesign:footer.mission")}
            </p>
          </div>

          {/* SUPPORT */}

          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-[#B68C61]">
              {t("redesign:footer.support")}
            </p>

            <a
              href="mailto:support@kshatriya.example"
              className="mt-5 flex items-center gap-3 text-[11px] text-white/65 transition hover:text-white"
            >
              <Mail
                size={14}
                strokeWidth={1.5}
              />

              {t("redesign:footer.email")}
            </a>

            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold text-[#D1A66F] transition hover:text-[#E2BB86]"
            >
              {t("redesign:footer.help")}

              <ArrowUpRight size={13} />
            </Link>
          </div>

          {/* LANGUAGE */}

          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-[#B68C61]">
              {t("redesign:footer.language")}
            </p>

            <div className="mt-5 text-white/70">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* =====================================
            LINKS
        ====================================== */}

        <div className="grid grid-cols-2 gap-x-8 gap-y-12 border-b border-white/10 py-12 sm:grid-cols-4 sm:py-14">
          <FooterBlock
            title={t("redesign:footer.discover")}
            links={[
              ["Matches", t("nav.matches")],
              ["Membership", t("nav.membership")],
              ["Success Stories", t("nav.stories")]
            ]}
          />

          <FooterBlock
            title={t("redesign:footer.company")}
            links={[
              ["About", t("nav.about")],
              ["How It Works", t("nav.howItWorks")],
              ["Contact", t("public.contact")]
            ]}
          />

          <FooterBlock
            title={t("redesign:footer.safety")}
            links={[
              ["Safety", t("public.safety")],
              ["Privacy", t("public.privacy")]
            ]}
          />

          <FooterBlock
            title={t("redesign:footer.legal")}
            links={[
              ["Terms", t("public.terms")],
              ["Refunds", t("public.refunds")]
            ]}
          />
        </div>

        {/* =====================================
            BOTTOM
        ====================================== */}

        <div className="flex flex-col gap-3 py-7 text-[7px] font-semibold uppercase tracking-[0.15em] text-white/25 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <span>
            © {new Date().getFullYear()} Kshatriya Matrimonial Society
          </span>

          <span>
            {t("redesign:footer.heritage")}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterBlock({
  title,
  links
}) {
  return (
    <div>
      <h4 className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/85">
        {title}
      </h4>

      <div className="mt-6 flex flex-col gap-4">
        {links.map(([link, label]) => (
          <Link
            to={destinations[link]}
            key={link}
            className="w-fit text-[10px] text-white/40 transition duration-200 hover:translate-x-0.5 hover:text-[#D3A66F]"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}