import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const statusOptions = ['All', 'AwaitingConsent', 'PendingReview', 'ChangesRequested', 'Approved', 'Rejected', 'Withdrawn'];
const button = 'rounded-full border border-[#681D25] px-5 py-2 text-sm font-semibold text-[#681D25] disabled:cursor-not-allowed disabled:opacity-40';
export default function StoryModerationPage() {
  const [stories, setStories] = useState([]);
  const [filter, setFilter] = useState('All');
  const [notes, setNotes] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let mounted = true;
    const query = filter === 'All' ? '' : `?status=${encodeURIComponent(filter)}`;
    api(`/admin/success-stories${query}`).then(result => {
      if (mounted) { setStories(result.data?.stories || []); setError(''); }
    }).catch(e => { if (mounted) setError(e.message || 'Unable to load stories.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [filter, revision]);
  const reload = () => { setLoading(true); setRevision(v => v + 1); };
  const action = async (item, kind) => {
    const reason = (notes[item._id] || '').trim();
    if (['reject', 'requestChanges', 'hide'].includes(kind) && reason.length < 10) {
      setError('Please provide a reason of at least 10 characters.'); return;
    }
    if (['hide', 'restore'].includes(kind) && !window.confirm(kind === 'hide' ? 'Take down this published story?' : 'Restore this story to the public page?')) return;
    setBusy(item._id); setError(''); setMessage('');
    try {
      const visibility = ['hide', 'restore'].includes(kind);
      const response = await api(`/admin/success-stories/${item._id}${visibility ? '/visibility' : ''}`, {
        method: 'PATCH', body: JSON.stringify(visibility ? { action: kind, reason } : { action: kind, notes: reason })
      });
      setMessage(response.message || 'Story updated.'); reload();
    } catch (e) { setError(e.message || 'Could not update story.'); }
    finally { setBusy(''); }
  };
  return <section className="mx-auto max-w-6xl space-y-7">
    <div><p className="text-xs font-bold uppercase tracking-widest text-[#91683F]">Administration / Trust</p><h1 className="mt-3 font-display text-5xl text-[#431318]">Member success stories</h1><p className="mt-3 text-sm text-[#756A60]">Names and registered email addresses below are private admin-only data. Restoring never overrides withdrawn consent.</p></div>
    <div className="flex flex-wrap items-center gap-3"><label htmlFor="story-filter" className="font-semibold">Status</label><select id="story-filter" value={filter} onChange={e => { setLoading(true); setFilter(e.target.value); }} className="rounded border border-[#CBB8A4] bg-white p-3">{statusOptions.map(value => <option key={value} value={value}>{value}</option>)}</select><button type="button" className={button} onClick={reload}>Refresh</button></div>
    {error && <p role="alert" className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {message && <p role="status" className="rounded bg-green-50 p-4 text-sm text-green-900">{message}</p>}
    {loading ? <p>Loading stories…</p> : stories.length === 0 ? <p className="border bg-white p-8">No stories in this status.</p> : stories.map(item => <article key={item._id} className="space-y-4 border border-[#D7C5B1] bg-[#FFFDF8] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-[#91683F]">{item.status} · {item.partnerConsentStatus}</p><h2 className="mt-2 font-display text-3xl text-[#431318]">{item.title}</h2><p className="mt-1 text-sm text-[#756A60]">{item.partnerOneName} &amp; {item.partnerTwoName} · {item.city || 'Location withheld'}</p></div>{item.status === 'Approved' && <span className="rounded-full bg-[#f2e8dd] px-4 py-2 text-xs font-bold">{item.adminHiddenAt ? 'Taken down' : 'Published'}</span>}</div>
      <div className="grid gap-3 rounded-lg border border-[#e5d9cc] bg-[#f8f1e8] p-4 text-sm sm:grid-cols-2"><div><strong>Submitted by</strong><p>{item.submitterIdentity?.name || 'Unknown'}</p><p className="break-all text-[#681D25]">{item.submitterIdentity?.email || 'Unavailable'}</p></div><div><strong>Consent partner</strong><p>{item.partnerIdentity?.name || 'Not yet invited'}</p><p className="break-all text-[#681D25]">{item.partnerIdentity?.email || 'No registered email yet'}</p><p className="text-xs text-[#756A60]">Email verified: {item.partnerIdentity?.emailVerified ? 'Yes' : 'No'}</p></div></div>
      <p className="whitespace-pre-wrap wrap-break-word text-sm leading-7 text-[#4D4039]">{item.story}</p><p className="text-xs text-[#756A60]">Submitter consent: {item.submitterConsent ? 'Yes' : 'No'} · Partner consent: {item.partnerConsentStatus === 'Verified' ? 'Verified' : 'Not verified'}</p>
      {item.moderationNotes && <p className="border-l-2 border-[#91683F] pl-3 text-sm">Previous moderation note: {item.moderationNotes}</p>}
      {item.adminHiddenAt && <p className="border-l-2 border-red-600 pl-3 text-sm">Take-down reason: {item.adminHiddenReason || 'Not provided'}</p>}
      {['PendingReview', 'AwaitingConsent', 'ChangesRequested', 'Approved'].includes(item.status) && <div className="space-y-3 border-t border-[#DDD0C1] pt-5"><label className="block text-sm font-semibold" htmlFor={`notes-${item._id}`}>Decision / take-down reason</label><textarea id={`notes-${item._id}`} maxLength={1000} rows={3} value={notes[item._id] || ''} onChange={e => setNotes(prev => ({ ...prev, [item._id]: e.target.value }))} className="w-full rounded border border-[#DDD0C1] bg-white p-3" placeholder="Explain changes, rejection, or take-down"/><div className="flex flex-wrap gap-3">
      {item.status === 'PendingReview' && <button className={button} type="button" disabled={!!busy || item.partnerConsentStatus !== 'Verified'} onClick={() => action(item, 'approve')}>Approve &amp; publish</button>}
      {['PendingReview','AwaitingConsent','ChangesRequested'].includes(item.status) && <><button className={button} type="button" disabled={!!busy} onClick={() => action(item, 'requestChanges')}>Request changes</button><button className={button} type="button" disabled={!!busy} onClick={() => action(item, 'reject')}>Reject</button></>}
      {item.status === 'Approved' && <button className={button} type="button" disabled={!!busy} onClick={() => action(item, item.adminHiddenAt ? 'restore' : 'hide')}>{item.adminHiddenAt ? 'Restore publication' : 'Take down'}</button>}
      </div></div>}
    </article>)}
  </section>;
}
