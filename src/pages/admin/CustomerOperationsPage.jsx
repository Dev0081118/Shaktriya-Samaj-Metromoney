/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Link, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import AdminNav from '../../components/AdminNav';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

function CustomerList() {
  const [params, setParams] = useSearchParams(), [data, setData] = useState(null), [error, setError] = useState('');
  const query = params.toString();
  useEffect(() => { api(`/admin/customers${query ? `?${query}` : ''}`).then((r) => setData(r.data)).catch((e) => setError(e.message)); }, [query]);
  const update = (key, value) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); if (key !== 'page') next.set('page', '1'); setParams(next); };
  return <>
    <header className="page-heading compact"><p className="eyebrow">Customer operations</p><h1>Customers</h1><p>Search an account once, then open its complete support history.</p></header>
    <div className="admin-filters">
      <input aria-label="Search customers" placeholder="Name, email, phone or profile ID" value={params.get('search') || ''} onChange={(e) => update('search', e.target.value)} />
      <select value={params.get('status') || ''} onChange={(e) => update('status', e.target.value)}><option value="">All account statuses</option>{['Active', 'Suspended', 'Blocked', 'Deleted'].map((x) => <option key={x}>{x}</option>)}</select>
    </div>
    {error ? <div className="empty-state"><p>{error}</p></div> : !data ? <div className="page-skeleton">Loading customers…</div> : <section className="admin-table">
      {data.items.map((item) => <Link className="admin-row" to={`/admin/customers/${item._id}`} key={item._id}>
        <span className="avatar">{item.profile?.firstName?.[0] || item.email?.[0]?.toUpperCase()}</span>
        <div><strong>{item.profile ? `${item.profile.firstName} ${item.profile.lastName || ''}` : item.email}</strong><small>{item.profile?.profileId || 'No profile'} · {item.email} · {item.phone || 'No phone'}</small></div>
        <time>{formatDate(item.createdAt)}</time>
        <span className="status-chip">{item.status}</span>
      </Link>)}
      {!data.items.length && <p className="empty-inline">No customers match these filters.</p>}
      <div className="pagination"><button disabled={data.pagination.page <= 1} onClick={() => update('page', String(data.pagination.page - 1))}>Previous</button><span>Page {data.pagination.page} of {data.pagination.totalPages}</span><button disabled={data.pagination.page >= data.pagination.totalPages} onClick={() => update('page', String(data.pagination.page + 1))}>Next</button></div>
    </section>}
  </>;
}

const date = (value) => formatDate(value, undefined, { dateStyle: 'medium', timeStyle: 'short' });
function CustomerDetail() {
  const { userId } = useParams(), notify = useToast(), [data, setData] = useState(null), [text, setText] = useState(''), [category, setCategory] = useState('General'), [pendingStatus, setPendingStatus] = useState(''), [reason, setReason] = useState('');
  const load = () => api(`/admin/customers/${userId}`).then((r) => setData(r.data)).catch((e) => notify(e.message, 'error'));
  useEffect(() => { load(); }, [userId]);
  const addNote = async (event) => { event.preventDefault(); try { await api(`/admin/customers/${userId}/notes`, { method: 'POST', body: JSON.stringify({ text, category }) }); setText(''); await load(); notify('Internal note added.'); } catch (e) { notify(e.message, 'error'); } };
  const updateStatus = async (event) => { event.preventDefault(); try { await api(`/admin/customers/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ status: pendingStatus, reason }) }); setPendingStatus(''); setReason(''); await load(); notify('Account status updated and audited.'); } catch (e) { notify(e.message, 'error'); } };
  if (!data) return <div className="page-skeleton">Loading Customer 360…</div>;
  const { user, profile } = data;
  return <>
    <Link to="/admin/customers" className="back-home">← Customers</Link>
    <header className="page-heading compact"><p className="eyebrow">Customer 360</p><h1>{profile ? `${profile.firstName} ${profile.lastName || ''}` : user.email}</h1><p>{profile?.profileId || 'No matrimonial profile'} · {user.status}</p><div className="profile-actions">{['Active', 'Suspended', 'Blocked'].filter((x) => x !== user.status).map((status) => <button className={status === 'Active' ? 'primary-button' : 'outline-button'} onClick={() => setPendingStatus(status)} key={status}>{status === 'Active' ? 'Activate' : status}</button>)}</div></header>
    {pendingStatus && <div className="modal-backdrop" role="presentation"><form className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="status-title" onSubmit={updateStatus}><h2 id="status-title">{pendingStatus} this account?</h2><p>This high-impact operation is recorded in the audit log.</p>{pendingStatus !== 'Active' && <label>Reason<textarea autoFocus required minLength="5" value={reason} onChange={(e) => setReason(e.target.value)} /></label>}<div className="profile-actions"><button className="primary-button">Confirm {pendingStatus.toLowerCase()}</button><button type="button" className="outline-button" onClick={() => setPendingStatus('')}>Cancel</button></div></form></div>}
    <div className="customer-grid">
      <section className="operations-card"><h2>Account</h2><dl><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Phone</dt><dd>{user.phone || '—'}</dd></div><div><dt>Status</dt><dd>{user.status}</dd></div><div><dt>Joined</dt><dd>{date(user.createdAt)}</dd></div><div><dt>Last login</dt><dd>{date(user.lastLoginAt)}</dd></div><div><dt>Verified</dt><dd>Phone {user.phoneVerified ? 'Yes' : 'No'} · Email {user.emailVerified ? 'Yes' : 'No'}</dd></div></dl></section>
      <section className="operations-card"><h2>Profile</h2>{profile ? <dl><div><dt>Status</dt><dd>{profile.visibility}</dd></div><div><dt>Completion</dt><dd>{profile.completionPercentage}%</dd></div><div><dt>Location</dt><dd>{profile.location?.city}, {profile.location?.state}</dd></div><div><dt>Last active</dt><dd>{date(profile.lastActiveAt)}</dd></div></dl> : <p>No member profile exists.</p>}</section>
      <section className="operations-card"><h2>Matrimonial activity</h2><dl>{Object.entries(data.activity).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section>
      <section className="operations-card"><h2>Membership</h2>{data.subscriptions.length ? data.subscriptions.map((s) => <p key={s._id}><strong>{s.planNameSnapshot || s.plan?.name}</strong><br />{s.status} · {date(s.endsAt)}</p>) : <p>No subscription history.</p>}</section>
    </div>
    <section className="admin-table"><h2>Payments</h2>{data.payments.map((p) => <div className="admin-row" key={p._id}><div><strong>{p.plan?.name || 'Plan'}</strong><small>{p.providerOrderId || 'No provider order'} · {p.providerPaymentId || 'No payment ID'}</small></div><time>{date(p.createdAt)}</time><span>{formatCurrency(p.amount)} · {p.status}</span></div>)}{!data.payments.length && <p className="empty-inline">No payments.</p>}</section>
    <section className="admin-table"><h2>Support tickets</h2>{data.tickets.map((t) => <div className="admin-row" key={t._id}><div><strong>{t.category} · {t.priority}</strong><small>{t.message}</small></div><time>{date(t.createdAt)}</time><span>{t.status}</span></div>)}{!data.tickets.length && <p className="empty-inline">No support tickets.</p>}</section>
    <section className="operations-card"><h2>Internal customer notes</h2><form className="note-form" onSubmit={addNote}><select value={category} onChange={(e) => setCategory(e.target.value)}>{['General', 'Support', 'Safety', 'Payment', 'Verification', 'Relationship Manager'].map((x) => <option key={x}>{x}</option>)}</select><textarea required maxLength="2000" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add an internal operational note…" /><button className="primary-button">Add note</button></form>{data.notes.map((n) => <div className="customer-note" key={n._id}><strong>{n.category}</strong><p>{n.text}</p><small>{n.author?.email} · {date(n.createdAt)}</small></div>)}</section>
  </>;
}

export default function CustomerOperationsPage() {
  return <div className="admin-shell"><AdminNav /><main><Routes><Route index element={<CustomerList />} /><Route path=":userId" element={<CustomerDetail />} /></Routes></main></div>;
}
