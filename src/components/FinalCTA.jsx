import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { useGsapReveal } from "../motion/useGsapReveal";

export default function FinalCTA() {
  const { t } = useTranslation();
  const root = useRef(null); useGsapReveal(root);
  return <section ref={root} className="final-cta"><div className="page-container final-cta-inner">
    <div data-reveal className="final-cta-copy"><p className="eyebrow">{t('home.registrationFree')}</p><h2>{t('home.ctaTitle')}</h2><p>{t('home.ctaBody')}</p></div>
    <div data-reveal className="final-cta-action"><Link to="/register" className="final-cta-button">{t('home.ctaAction')} <ArrowUpRight size={18} /></Link><p><ShieldCheck size={16} /> {t('redesign:cta.note')}</p><span>{t('redesign:cta.trust')}</span></div>
  </div></section>;
}
