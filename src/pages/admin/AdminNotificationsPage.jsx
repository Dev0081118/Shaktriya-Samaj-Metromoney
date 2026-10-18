import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const destination = (type) => type?.startsWith('STORY_') ? '/admin/success-stories' : '/admin';
export default function AdminNotificationsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    api('/admin/notifications').then((response) => {
      if (active) { setItems(response.data?.notifications || []); setError(''); }
    }).catch((reason) => { if (active) setError(reason.message); });
    const onRealtime = () => { if (active) setRefresh(v => v + 1); };
    window.addEventListener('ksm:realtime', onRealtime);
    return () => { active = false; window.removeEventListener('ksm:realtime', onRealtime); };
  }, [refresh]);
  async function markRead(id) {
    setBusy(true);
    try { await api(`/admin/notifications/${id}/read`, { method: 'PATCH' }); setRefresh(v => v + 1); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-5xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div>
      <p className="text-xs font-bold uppercase tracking-widest text-[#91683f]">Administration</p>
      <h1 className="mt-2 font-display text-5xl text-[#431318]">Notifications</h1>
    </div><button type="button" disabled={busy} onClick={() => void markRead('all')} className="rounded-full border border-[#cbb8a4] px-5 py-3 text-sm">Mark all as read</button></div>
    {error && <p role="alert" className="border border-red-300 p-4 text-red-700">{error}</p>}
    {items.length === 0 && <p className="border border-[#d7c5b1] bg-white p-6">No notifications yet.</p>}
    {items.map(item => <article key={item._id} className={`border border-[#d7c5b1] p-5 ${item.read ? 'bg-[#fffdf8]' : 'bg-[#f7ebdc]'}`}>
      <div className="flex justify-between gap-4"><div><p className="font-semibold text-[#431318]">{item.title}</p><p className="mt-2 text-sm text-[#756a60]">{item.message}</p><time className="mt-2 block text-xs text-[#756a60]">{new Date(item.createdAt).toLocaleString()}</time></div>{!item.read && <button type="button" disabled={busy} onClick={() => void markRead(item._id)} className="h-fit whitespace-nowrap text-xs underline">Mark read</button>}</div>
      <Link to={destination(item.type)} className="mt-3 inline-block text-sm font-semibold text-[#681d25] underline">View related activity</Link>
    </article>)}
  </div>;
}
