import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function ManagerWorkspacePage() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null), [error, setError] = useState(''), [expiresBefore] = useState(() => new Date(Date.now() + 7 * 864e5));
  useEffect(() => {
    api('/manager').then((r) => setData(r.data)).catch((e) => setError(e.message));
  }, []);
  return <div className="manager-shell">
    <header className="admin-topbar">
      <div><strong>KSHATRIYA</strong><small>Relationship Manager Workspace</small></div>
      <div><span>{user.email}</span><button className="outline-button" onClick={logout}>Log out</button></div>
    </header>
    <main className="admin-workspace">
      <header className="page-heading compact"><p className="eyebrow">Assisted member operations</p><h1>Your assigned clients</h1></header>
      {error ? <div className="empty-state"><p>{error}</p></div> : !data ? <div className="page-skeleton">Loading clients…</div> : <>
        <div className="admin-metrics">
          <article><strong>{data.clients.length}</strong><span>Assigned clients</span></article>
          <article><strong>{data.clients.filter((x) => x.subscription).length}</strong><span>Active Assisted members</span></article>
          <article><strong>{data.clients.filter((x) => x.subscription?.endsAt && new Date(x.subscription.endsAt) < expiresBefore).length}</strong><span>Expiring in 7 days</span></article>
        </div>
        <section className="admin-table">
          {data.clients.map((item) => <div className="admin-row" key={item._id}>
            <span className="avatar">{item.profile?.firstName?.[0] || item.user.email[0]}</span>
            <div><strong>{item.profile ? `${item.profile.firstName} ${item.profile.lastName || ''}` : item.user.email}</strong><small>{item.profile?.profileId || 'Profile not created'} · {item.user.phone || 'No phone'}</small></div>
            <time>{item.subscription?.endsAt ? `Expires ${new Date(item.subscription.endsAt).toLocaleDateString('en-IN')}` : 'No active subscription'}</time>
            <span className="status-chip">{item.profile?.visibility || item.user.status}</span>
          </div>)}
          {!data.clients.length && <p className="empty-inline">No clients are assigned to you.</p>}
        </section>
      </>}
    </main>
  </div>;
}
