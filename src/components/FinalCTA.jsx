import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function FinalCTA() {
  const { t } = useTranslation();
  return <section className="final-cta"><div className="page-container final-cta-inner">
    <div className="final-cta-copy"><p className="eyebrow">{t('home.registrationFree')}</p><h2>{t('home.ctaTitle')}</h2><p>{t('home.ctaBody')}</p></div>
    <div className="final-cta-action"><Link to="/register" className="final-cta-button">{t('home.ctaAction')} <ArrowUpRight size={18} /></Link><p><ShieldCheck size={16} /> {t('redesign:cta.note')}</p><span>{t('redesign:cta.trust')}</span></div>
  </div></section>;
}
