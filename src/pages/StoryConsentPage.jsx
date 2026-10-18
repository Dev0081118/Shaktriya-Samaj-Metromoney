import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { api } from '../services/api';

const pill = 'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50';
const storyDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '';

export default function StoryConsentPage() {
  const [invitations, setInvitations] = useState([]);
  const [own, setOwn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [photoConsent, setPhotoConsent] = useState({});
  const [partnerEmail, setPartnerEmail] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const reload = async () => {
    const [invitationResponse, myResponse] = await Promise.allSettled([
      api('/success-stories/consent-invitations'),
      api('/success-stories/mine')
    ]);
    if (invitationResponse.status === 'fulfilled') {
      setInvitations(invitationResponse.value.data?.invitations || []);
    } else {
      setInvitations([]);
    }
    if (myResponse.status === 'fulfilled') {
      setOwn(myResponse.value.data?.stories || []);
    }
    if (invitationResponse.status === 'rejected') {
      setError(invitationResponse.reason?.message || 'Unable to load partner invitations.');
    } else if (myResponse.status === 'rejected') {
      setError(myResponse.reason?.message || 'Unable to load your submissions.');
    } else {
      setError('');
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      api('/success-stories/consent-invitations'),
      api('/success-stories/mine')
    ]).then(([invitationResponse, myResponse]) => {
      if (cancelled) return;
      if (invitationResponse.status === 'fulfilled') setInvitations(invitationResponse.value.data?.invitations || []);
      else setError(invitationResponse.reason?.message || 'Unable to load invitations.');
      if (myResponse.status === 'fulfilled') setOwn(myResponse.value.data?.stories || []);
      else setError(myResponse.reason?.message || 'Unable to load submissions.');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const act = async (id, path, body, confirmation) => {
    if (busyId) return;
    if (confirmation && !window.confirm(confirmation)) return;
    setBusyId(id);
    setMessage('');
    setError('');
    try {
      const response = await api(path, { method: path.endsWith('/withdraw') ? 'PATCH' : 'POST', ...(body ? { body: JSON.stringify(body) } : {}) });
      setMessage(response.message || 'Updated successfully.');
      await reload();
    } catch (e) {
      setError(e.message || 'Unable to complete the request.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#281a18]">
      <Header solid />
      <main className="page-container mx-auto max-w-5xl py-20 sm:py-28">
        <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#91683f]">Royal Rajputana Matrimony</p>
        <h1 className="mt-5 font-display text-5xl font-medium sm:text-7xl">Story consent centre</h1>
        <p className="mt-5 max-w-3xl text-sm leading-8 text-[#756a60]">Review invitations privately. Only the independently invited, email-verified partner may approve. Consent is voluntary and can be withdrawn.</p>
        <div className="mt-6 flex flex-wrap gap-5 text-sm font-semibold text-[#681d25]"><Link className="underline underline-offset-4" to="/submit-success-story">Submit your story</Link><Link className="underline underline-offset-4" to="/success-stories">Public stories</Link></div>
        {error && <p role="alert" className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {message && <p role="status" className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</p>}
        <section className="mt-12" aria-labelledby="story-invitations">
          <div className="flex items-center gap-3"><ShieldCheck className="text-[#91683f]" aria-hidden="true" /><h2 id="story-invitations" className="font-display text-3xl">Invitations requiring your consent</h2></div>
          {loading ? <p className="mt-5 text-sm">Loading…</p> : invitations.length === 0 ? <div className="mt-5 border border-[#d7c5b1] bg-[#fffdf8] p-6 text-sm text-[#756a60]">No active invitations. Invitations appear only for verified partner accounts.</div> : <div className="mt-5 grid gap-6">{invitations.map((item) => {
            const id = item._id || item.id;
            return <article key={id} className="rounded-xl border border-[#d7c5b1] bg-[#fffdf8] p-6 sm:p-8">
              <h3 className="font-display text-3xl">{item.title}</h3>
              <p className="mt-2 text-sm text-[#756a60]">{item.partnerOneName} &amp; {item.partnerTwoName}{item.city ? ` · ${item.city}` : ''}</p>
              {item.marriageDate && <p className="mt-1 text-xs text-[#756a60]">Marriage date: {storyDate(item.marriageDate)}</p>}
              <p className="mt-5 whitespace-pre-wrap text-sm leading-7">{item.story}</p>
              <p className="mt-4 text-xs text-[#756a60]">Invitation expires: {storyDate(item.partnerInviteExpiresAt)}</p>
              <label className="mt-6 flex items-start gap-3 rounded-lg border border-[#ddc9b2] bg-[#f7efe3] p-4 text-sm leading-6"><input type="checkbox" className="mt-1 accent-[#681d25]" checked={!!photoConsent[id]} onChange={(e) => setPhotoConsent((state) => ({ ...state, [id]: e.target.checked }))}/><span>I separately consent to publication of my photograph, if supplied and approved. Leaving this unchecked means no photo consent.</span></label>
              <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={!!busyId} onClick={() => act(id, `/success-stories/${id}/consent`, { decision: 'accept', photoConsent: !!photoConsent[id] }, 'Do you independently agree to this story being considered for publication?')} className={`${pill} gap-2 bg-[#681d25] text-white hover:bg-[#431318]`}><CheckCircle2 size={16}/> I consent to the story</button><button type="button" disabled={!!busyId} onClick={() => act(id, `/success-stories/${id}/consent`, { decision: 'decline', photoConsent: false }, 'Decline this invitation?')} className={`${pill} gap-2 border border-[#bba58f] text-[#681d25] hover:bg-[#f5eee5]`}><XCircle size={16}/> Decline</button></div>
            </article>;
          })}</div>}
        </section>
        <section className="mt-14" aria-labelledby="story-own">
          <h2 id="story-own" className="font-display text-3xl">Your submitted stories</h2>
          {loading ? <p className="mt-4 text-sm">Loading…</p> : own.length === 0 ? <p className="mt-5 text-sm text-[#756a60]">You have not submitted a story yet.</p> : <div className="mt-5 grid gap-4">{own.map((item) => {
            const id = item._id || item.id;
            return <article key={id} className="rounded-xl border border-[#d7c5b1] bg-[#fffdf8] p-6">
              <h3 className="font-display text-2xl">{item.title}</h3><p className="mt-1 text-sm text-[#756a60]">Status: {item.status}</p>
              {item.status === 'AwaitingConsent' && <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); act(id, `/success-stories/${id}/invite`, { partnerEmail: partnerEmail[id] || '' }); }}><label className="grid min-w-56 flex-1 gap-2 text-sm font-semibold">Partner's verified account email<input type="email" required autoComplete="email" className="w-full rounded-lg border border-[#dcc9b3] p-3 outline-none focus:border-[#681d25]" value={partnerEmail[id] || ''} onChange={(e) => setPartnerEmail((state) => ({ ...state, [id]: e.target.value }))}/></label><button type="submit" disabled={!!busyId} className={`${pill} bg-[#681d25] text-white hover:bg-[#431318]`}>Send in-app invitation</button></form>}
              {item.status !== 'Withdrawn' && <button type="button" disabled={!!busyId} onClick={() => act(id, `/success-stories/${id}/withdraw`, null, 'Withdraw this story? Withdrawal is permanent and removes publication eligibility.')} className="mt-5 text-sm font-semibold text-[#681d25] underline underline-offset-4">Withdraw story and consent</button>}
            </article>;
          })}</div>}
        </section>
      </main>
      <Footer />
    </div>
  );
}
