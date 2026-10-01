import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Refunds: "/refunds",
  "Delete Account": "/settings"
};
export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#15100f] text-white">
      <div className="page-container py-16">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-4">
          <div>
            <h3 className="font-display text-[22px]">KSHATRIYA</h3>

            <p className="mt-5 max-w-xs text-xs leading-6 text-white/40">
              {t('public.footerBody')}
            </p>
          </div>

          <FooterBlock
            title={t('nav.discover')}
            links={[['Matches', t('nav.matches')], ['Membership', t('nav.membership')], ['Success Stories', t('nav.stories')]]}
          />

          <FooterBlock
            title={t('public.company')}
            links={[['About', t('nav.about')], ['How It Works', t('nav.howItWorks')], ['Contact', t('public.contact')], ['Safety', t('public.safety')]]}
          />

          <FooterBlock
            title={t('public.legal')}
            links={[['Privacy', t('public.privacy')], ['Terms', t('public.terms')], ['Refunds', t('public.refunds')], ['Delete Account', t('public.deleteAccount')]]}
          />
        </div>

        <div className="flex flex-col gap-3 pt-7 text-[10px] uppercase tracking-[0.14em] text-white/30 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} Kshatriya Matrimonial Society
          </span>

          <span>{t('public.footerValues')}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterBlock({ title, links }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">
        {title}
      </h4>

      <div className="mt-5 flex flex-col gap-3">
        {links.map(([link, label]) => (
          <Link
            to={destinations[link]}
            key={link}
            className="text-xs text-white/40 transition hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
