import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const actions = [ ['approve', 'Approve'], ['requestChanges', 'Request changes'], ['reject', 'Reject'] ];

export default function StoryModerationPage() {
  const [stories, setStories] = useState([]);
  const [filter, setFilter] = useState('AwaitingConsent');
  const [notes, setNotes] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    let active = true;
    api(`/admin/success-stories?status=${encodeURIComponent(filter)}`)
      .then(result => {
        if (!active) return;
        setStories(result.data?.stories ?? []);
        setError('');
      })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filter, refreshKey]);
  function refreshStories() {
    setLoading(true);
    setRefreshKey(current => current + 1);
  }
  async function moderate(id, action) {
    const note = notes[id] || '';
    if (action !== 'approve' && note.trim().length < 10) {
      setError('Please write at least 10 characters explaining the decision.'); return;
    }
    setBusy(id); setError('');
    try {
      await api(`/admin/success-stories/${id}`, { method: 'PATCH', body: JSON.stringify({ action, notes: note }) });
      refreshStories();
    } catch (err) { setError(err.message); }
    finally { setBusy(''); }
  }
  return <section className="mx-auto max-w-6xl space-y-7">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-[#91683F]">Administration / Trust</p>
      <h1 className="mt-3 font-display text-5xl text-[#431318]">Member success stories</h1>
      <p className="mt-3 text-sm text-[#756A60]">Approve only independently consent-verified member submissions. Photos are not published in this phase.</p></div>
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="story-filter" className="text-sm font-semibold">Status</label>
      <select id="story-filter" value={filter} onChange={e => { setLoading(true); setFilter(e.target.value); }} className="rounded border border-[#CBB8A4] bg-white p-3">
        {['PendingReview','AwaitingConsent','ChangesRequested','Approved','Rejected','Withdrawn'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button type="button" onClick={refreshStories} className="rounded-full border border-[#CBB8A4] px-5 py-3 text-sm">Refresh</button>
    </div>
    {error && <p role="alert" className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {loading ? <p>Loading stories…</p> : stories.length === 0 ? <p className="border border-[#DDD0C1] bg-white p-8">No stories in this status.</p> : stories.map(item =>
      <article key={item._id} className="space-y-4 border border-[#D7C5B1] bg-[#FFFDF8] p-6 sm:p-8">
        <div className="flex flex-wrap justify-between gap-3"><div>
          <p className="text-xs uppercase tracking-widest text-[#91683F]">{item.status} · {item.partnerConsentStatus}</p>
          <h2 className="mt-2 font-display text-3xl text-[#431318]">{item.title}</h2>
          <p className="mt-1 text-sm text-[#756A60]">{item.partnerOneName} & {item.partnerTwoName} · {item.city || 'Location withheld'}</p>
        </div></div>
        <p className="whitespace-pre-wrap text-sm leading-7 text-[#4D4039]">{item.story}</p>
        <p className="text-xs text-[#756A60]">Submitter consent: {item.submitterConsent ? 'Yes' : 'No'} · Partner verified: {item.partnerConsentStatus === 'Verified' ? 'Yes' : 'No'}</p>
        {item.moderationNotes && <p className="border-l-2 border-[#91683F] pl-3 text-sm">Previous note: {item.moderationNotes}</p>}
        {(item.status === 'PendingReview' || item.status === 'AwaitingConsent' || item.status === 'ChangesRequested') && <div className="space-y-3 border-t border-[#DDD0C1] pt-5">
          <label className="block text-sm font-semibold" htmlFor={`notes-${item._id}`}>Decision notes</label>
          <textarea id={`notes-${item._id}`} maxLength={1000} rows={3} value={notes[item._id] || ''} onChange={e => setNotes(n => ({ ...n, [item._id]: e.target.value }))} className="w-full rounded border border-[#DDD0C1] bg-white p-3" placeholder="Reason for rejection or changes requested" />
          <div className="flex flex-wrap gap-3">{actions.map(([key, label]) =>
            <button key={key} type="button" disabled={busy === item._id || (key === 'approve' && item.partnerConsentStatus !== 'Verified')} onClick={() => void moderate(item._id, key)} className="rounded-full border border-[#681D25] px-5 py-2 text-sm text-[#681D25] disabled:opacity-40">{busy === item._id ? 'Working…' : label}</button>
          )}</div>
        </div>}
      </article>
    )}
  </section>;
}
