import { ArrowUpRight, Mail } from "lucide-react";
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

  return <footer className="site-footer">
    <div className="page-container footer-upper">
      <div className="footer-brand">
        <Link to="/" className="footer-wordmark">
          KSHATRIYA <small>MATRIMONIAL SOCIETY</small>
        </Link>
        <p>{t('redesign:footer.mission')}</p>
      </div>

      <div className="footer-concierge">
        <span>{t('redesign:footer.support')}</span>
        <a href="mailto:support@kshatriya.example">
          <Mail size={15} /> {t('redesign:footer.email')}
        </a>
        <Link to="/contact">
          {t('redesign:footer.help')} <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="footer-language">
        <span>{t('redesign:footer.language')}</span>
        <LanguageSwitcher />
      </div>
    </div>

    <div className="page-container footer-nav">
      <FooterBlock
        title={t('redesign:footer.discover')}
        links={[
          ["Matches", t('nav.matches')],
          ["Membership", t('nav.membership')],
          ["Success Stories", t('nav.stories')]
        ]}
      />
      <FooterBlock
        title={t('redesign:footer.company')}
        links={[
          ["About", t('nav.about')],
          ["How It Works", t('nav.howItWorks')],
          ["Contact", t('public.contact')]
        ]}
      />
      <FooterBlock
        title={t('redesign:footer.safety')}
        links={[
          ["Safety", t('public.safety')],
          ["Privacy", t('public.privacy')]
        ]}
      />
      <FooterBlock
        title={t('redesign:footer.legal')}
        links={[
          ["Terms", t('public.terms')],
          ["Refunds", t('public.refunds')]
        ]}
      />
    </div>

    <div className="footer-bottom">
      <div className="page-container">
        <span>© {new Date().getFullYear()} Kshatriya Matrimonial Society</span>
        <span>{t('redesign:footer.heritage')}</span>
      </div>
    </div>
  </footer>;
}

function FooterBlock({ title, links }) {
  return <div className="footer-block">
    <h4>{title}</h4>
    <div>
      {links.map(([link, label]) =>
        <Link to={destinations[link]} key={link}>{label}</Link>
      )}
    </div>
  </div>;
}
