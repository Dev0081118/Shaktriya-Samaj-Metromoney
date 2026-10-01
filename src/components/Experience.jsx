import { useTranslation } from 'react-i18next';

export default function Experience() {
  const { t } = useTranslation(), steps = [
    ['01', t('home.steps.createTitle'), t('home.steps.createBody')],
    ['02', t('home.steps.discoverTitle'), t('home.steps.discoverBody')],
    ['03', t('home.steps.expressTitle'), t('home.steps.expressBody')],
    ['04', t('home.steps.connectTitle'), t('home.steps.connectBody')]
  ];
  return (
    <section className="bg-[#eee5da] py-28 lg:py-36">
      <div className="page-container">
        <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow">{t('nav.howItWorks')}</p>

            <h2 className="mt-6 font-display text-[50px] leading-[1.02] text-[#271917]">
              {t('home.howTitle')}
            </h2>
          </div>

          <div>
            {steps.map(([number, title, body]) => (
              <div
                key={number}
                className="grid gap-4 border-t border-[#cab9a8] py-8 sm:grid-cols-[90px_180px_1fr]"
              >
                <span className="font-display text-[20px] italic text-[#a57c51]">
                  {number}
                </span>

                <h3 className="font-display text-[28px] text-[#281a18]">
                  {title}
                </h3>

                <p className="max-w-lg text-sm leading-7 text-[#77675e]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
