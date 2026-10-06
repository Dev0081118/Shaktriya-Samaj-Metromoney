import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppSidebar from '../../components/ui/AppSidebar';
import { getNavigationForRole } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { translateStatus } from '../../utils/translatedLabels';

const metricClass =
  "border border-[#ddd0c1] bg-[#fffdf8] p-[25px]";

const metricValueClass =
  "block font-['Cormorant_Garamond'] text-[34px] font-medium";

const metricLabelClass =
  "text-[9px] uppercase text-[#756a60]";

const rowClass =
  "grid grid-cols-[auto_1fr_auto_auto] items-center gap-[15px] border-t border-[#ddd0c1] py-4 max-[767px]:grid-cols-[auto_1fr_auto]";

export default function ManagerWorkspacePage() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const [expiresBefore] = useState(
    () => new Date(Date.now() + 7 * 864e5)
  );

  useEffect(() => {
    api('/manager')
      .then((response) => setData(response.data))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const activeAssisted =
    data?.clients.filter((item) => item.subscription).length || 0;

  const expiringSoon =
    data?.clients.filter(
      (item) =>
        item.subscription?.endsAt &&
        new Date(item.subscription.endsAt) < expiresBefore
    ).length || 0;

  return (
    <div className="manager-shell min-h-screen bg-[#f5f0e8]">
      <AppSidebar
        variant="manager"
        sections={getNavigationForRole(user?.role)}
        identity={{
          initial: user?.email?.[0]?.toUpperCase(),
          primary: user?.email,
          secondary: t('roles.relationship_manager')
        }}
        onLogout={logout}
      />

      <main className="min-w-0 px-[5vw] py-[45px]">
        <header className="mb-[30px]">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#91683f]">
            {t('manager.operations')}
          </p>

          <h1 className="mt-3 max-w-[900px] font-['Cormorant_Garamond'] text-[clamp(42px,5vw,66px)] font-medium leading-[0.98] text-[#2c1a18]">
            {t('manager.assignedTitle')}
          </h1>
        </header>

        {error ? (
          <div className="border border-[#ddd0c1] bg-[#fffdf8] px-[30px] py-[60px] text-center">
            <p className="mx-auto max-w-[430px] text-[13px] leading-[1.8] text-[#756a60]">
              {error}
            </p>
          </div>
        ) : !data ? (
          <div className="page-skeleton">
            {t('manager.loading')}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-[15px] max-[767px]:grid-cols-2">
              <article className={metricClass}>
                <strong className={metricValueClass}>
                  {data.clients.length}
                </strong>

                <span className={metricLabelClass}>
                  {t('manager.assigned')}
                </span>
              </article>

              <article className={metricClass}>
                <strong className={metricValueClass}>
                  {activeAssisted}
                </strong>

                <span className={metricLabelClass}>
                  {t('manager.activeAssisted')}
                </span>
              </article>

              <article className={metricClass}>
                <strong className={metricValueClass}>
                  {expiringSoon}
                </strong>

                <span className={metricLabelClass}>
                  {t('manager.expiring')}
                </span>
              </article>
            </div>

            <section className="mt-10 border border-[#ddd0c1] bg-[#fffdf8] px-[25px] pb-[15px]">
              {data.clients.map((item) => (
                <div className={rowClass} key={item._id}>
                  <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-[#c49b70] font-extrabold text-[#291817]">
                    {item.profile?.firstName?.[0] || item.user.email[0]}
                  </span>

                  <div>
                    <strong className="block text-[11px]">
                      {item.profile
                        ? `${item.profile.firstName} ${
                            item.profile.lastName || ''
                          }`
                        : item.user.email}
                    </strong>

                    <small className="block text-[9px] text-[#756a60]">
                      {item.profile?.profileId || t('manager.noProfile')} ·{' '}
                      {item.user.phone || t('manager.noPhone')}
                    </small>
                  </div>

                  <time className="text-[9px] text-[#756a60] max-[767px]:hidden">
                    {item.subscription?.endsAt
                      ? t('manager.expires', {
                          date: formatDate(
                            item.subscription.endsAt,
                            i18n.language
                          )
                        })
                      : t('manager.noSubscription')}
                  </time>

                  <span className="rounded-[99px] border border-[#8d6e45] px-[9px] py-[5px] text-[9px] uppercase text-[#694c26]">
                    {translateStatus(
                      t,
                      item.profile?.visibility || item.user.status
                    )}
                  </span>
                </div>
              ))}

              {!data.clients.length && (
                <p className="p-[25px] text-[12px] text-[#756a60]">
                  {t('manager.none')}
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}