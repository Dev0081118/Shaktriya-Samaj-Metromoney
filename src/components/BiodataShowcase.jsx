import { Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BiodataShowcase() {
  const { t } = useTranslation();
  return (
    <section className="bg-[#f5f0e9] py-28 lg:py-40">
      <div className="page-container">
        <div className="grid items-center gap-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow">{t('home.biodataEyebrow')}</p>

            <h2 className="mt-6 font-display text-[55px] leading-[1.02] text-[#271816]">
              {t('home.biodataTitle')}
            </h2>

            <p className="mt-7 max-w-lg text-[15px] leading-8 text-[#78685f]">
              {t('home.biodataBody')}
            </p>

            <Link
              to="/register"
              className="mt-9 flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#681d25]"
            >
              {t('home.biodataAction')}
              <Download size={16} />
            </Link>
          </div>

          <div className="biodata-showcase-visual relative mx-auto w-full max-w-[430px]">
            <img className="biodata-editorial-backdrop" src="/assets/public/biodata-editorial.webp" alt="Ivory matrimonial stationery with a fountain pen" loading="lazy" />

            <article className="relative min-h-[560px] border border-[#d5c5b3] bg-[#fffdf9] px-9 py-10 shadow-[0_25px_60px_rgba(54,34,25,.16)]">
              <div className="text-center">
                <p className="text-[8px] font-bold uppercase tracking-[0.35em] text-[#9b7a5b]">
                  {t('homeExtra:matrimonialProfile')}
                </p>

                <h3 className="mt-3 font-display text-[35px] text-[#521a20]">
                  Devika Jadeja
                </h3>

                <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#927d6d]">
                  Ahmedabad • Gujarat
                </p>
              </div>

              <div className="mx-auto mt-7 h-40 w-32 overflow-hidden rounded-t-[80px]">
                <img
                  src="/assets/member/profile-devika.webp"
                  loading="lazy"
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="my-8 h-px bg-[#decfbe]" />

              <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-[11px]">
                <Info label={t('public.finderAge')} value={`26 ${t('profile.years')}`} />
                <Info label={t('profile.height')} value={"5'6\""} />
                <Info label={t('profile.education')} value="M.Arch" />
                <Info label={t('profile.profession')} value="Architect" />
                <Info label={t('profile.location')} value="Rajkot" />
                <Info label={t('language.label')} value="Gujarati" />
              </div>

              <div className="mt-10 border-t border-[#decfbe] pt-5 text-center text-[9px] uppercase tracking-[0.2em] text-[#9b8776]">
                Kshatriya Matrimonial Society
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <span className="block text-[8px] font-bold uppercase tracking-[0.14em] text-[#a28e7d]">
        {label}
      </span>

      <span className="mt-1 block font-medium text-[#392825]">{value}</span>
    </div>
  );
}
