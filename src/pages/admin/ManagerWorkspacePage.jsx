import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatters';
import { translateStatus } from '../../utils/translatedLabels';
import AppSidebar from '../../components/ui/AppSidebar';
import { getNavigationForRole } from '../../config/navigation';

export default function ManagerWorkspacePage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null), [error, setError] = useState(''), [expiresBefore] = useState(() => new Date(Date.now() + 7 * 864e5)), { t, i18n } = useTranslation();
  useEffect(() => {
    api('/manager').then((r) => setData(r.data)).catch((e) => setError(e.message));
  }, []);
  return <div className="manager-shell">
    <AppSidebar
      variant="manager"
      sections={getNavigationForRole(user?.role)}
      identity={{ initial: user?.email?.[0]?.toUpperCase(), primary: user?.email, secondary: t('roles.relationship_manager') }}
      onLogout={logout}
    />
    <main className="admin-workspace">
      <header className="page-heading compact"><p className="eyebrow">{t('manager.operations')}</p><h1>{t('manager.assignedTitle')}</h1></header>
      {error ? <div className="empty-state"><p>{error}</p></div> : !data ? <div className="page-skeleton">{t('manager.loading')}</div> : <>
        <div className="admin-metrics">
          <article><strong>{data.clients.length}</strong><span>{t('manager.assigned')}</span></article>
          <article><strong>{data.clients.filter((x) => x.subscription).length}</strong><span>{t('manager.activeAssisted')}</span></article>
          <article><strong>{data.clients.filter((x) => x.subscription?.endsAt && new Date(x.subscription.endsAt) < expiresBefore).length}</strong><span>{t('manager.expiring')}</span></article>
        </div>
        <section className="admin-table">
          {data.clients.map((item) => <div className="admin-row" key={item._id}>
            <span className="avatar">{item.profile?.firstName?.[0] || item.user.email[0]}</span>
            <div><strong>{item.profile ? `${item.profile.firstName} ${item.profile.lastName || ''}` : item.user.email}</strong><small>{item.profile?.profileId || t('manager.noProfile')} · {item.user.phone || t('manager.noPhone')}</small></div>
            <time>{item.subscription?.endsAt ? t('manager.expires', { date: formatDate(item.subscription.endsAt, i18n.language) }) : t('manager.noSubscription')}</time>
            <span className="status-chip">{translateStatus(t, item.profile?.visibility || item.user.status)}</span>
          </div>)}
          {!data.clients.length && <p className="empty-inline">{t('manager.none')}</p>}
        </section>
      </>}
    </main>
  </div>;
}
