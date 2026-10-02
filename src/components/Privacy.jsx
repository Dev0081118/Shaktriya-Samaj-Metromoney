import { Eye, Fingerprint, LockKeyhole } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import { useGsapReveal } from "../motion/useGsapReveal";

export default function Privacy() {
  const root = useRef(null); useGsapReveal(root);
  const { t } = useTranslation(), privacyItems = [
    { icon: Eye, title: t('home.privacyItems.photosTitle'), body: t('home.privacyItems.photosBody') },
    { icon: LockKeyhole, title: t('home.privacyItems.contactTitle'), body: t('home.privacyItems.contactBody') },
    { icon: Fingerprint, title: t('home.privacyItems.verifiedTitle'), body: t('home.privacyItems.verifiedBody') }
  ];
  return (
    <section ref={root} className="home-privacy privacy-cinematic bg-[#641e25] py-28 text-white lg:py-36">
      <div className="page-container">
        <div className="grid gap-16 lg:grid-cols-2">
          <div data-reveal className="max-w-xl">
            <p className="eyebrow text-[#d4a875]">{t('home.privacyEyebrow')}</p>

            <h2 className="mt-6 font-display text-[56px] leading-[0.98] sm:text-[70px]">
              {t('home.privacyTitle')}
            </h2>

            <p className="mt-8 max-w-md text-[15px] leading-8 text-white/60">
              {t('home.privacyBody')}
            </p>
            <div className="privacy-window mt-10 overflow-hidden rounded-t-[12rem] border border-white/15">
              <img src="/assets/public/privacy.webp" alt="A carved jharokha representing intentional, controlled visibility" loading="lazy" className="h-[340px] w-full object-cover" />
            </div>
          </div>

          <div>
            {privacyItems.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                data-reveal
                className="flex gap-6 border-t border-white/15 py-8"
              >
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className="mt-1 shrink-0 text-[#dfb782]"
                />

                <div>
                  <h3 className="font-display text-[26px]">{title}</h3>

                  <p className="mt-2 max-w-md text-sm leading-7 text-white/55">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
