import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookHeart, CheckCircle2, ShieldCheck } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { api } from '../services/api';

const initial = { partnerOneName: '', partnerTwoName: '', city: '', title: '', story: '', marriageDate: '', submitterConsent: false };
const inputClass = 'w-full rounded-lg border border-[#dcc9b3] bg-white px-4 py-3 text-sm text-[#291c19] outline-none transition focus:border-[#681d25] focus:ring-2 focus:ring-[#681d25]/10';
const labelClass = 'grid gap-2 text-sm font-semibold text-[#392720]';
const statusLabel = { AwaitingConsent: 'Awaiting partner consent', PendingReview: 'Awaiting admin review', ChangesRequested: 'Changes requested', Approved: 'Approved', Rejected: 'Rejected', Withdrawn: 'Withdrawn' };

export default function SubmitStoryPage() {
  const [form, setForm] = useState(initial);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadStories = async () => {
    try {
      const response = await api('/success-stories/mine');
      setStories(response.data?.stories || []);
      setError('');
    } catch (e) {
      setError(e.message || 'Unable to load your submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    // Network resolution runs asynchronously; never synchronously update state in an effect.
    api('/success-stories/mine').then((response) => {
      if (!cancelled) {
        setStories(response.data?.stories || []);
        setLoading(false);
      }
    }).catch((e) => {
      if (!cancelled) {
        setError(e.message || 'Unable to load your submissions.');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api('/success-stories', { method: 'POST', body: JSON.stringify(form) });
      setForm(initial);
      setSuccess('Your story has been received. It will remain private until independent consent verification and admin approval are completed.');
      await loadStories();
    } catch (e) {
      setError(e.message || 'Unable to submit your story.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#291c19]">
      <Header solid />
      <main>
        <section className="border-b border-[#ddc9b2] bg-[radial-gradient(circle_at_80%_20%,rgba(178,135,83,.18),transparent_42%),linear-gradient(135deg,#efe1cd,#fffaf2)] py-20 sm:py-28">
          <div className="page-container mx-auto max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-[#88603a]">Royal Rajputana Matrimony</p>
            <h1 className="mt-5 font-display text-5xl font-medium leading-tight sm:text-7xl">Share your genuine story</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#766358]">Celebrate your journey while keeping your privacy in control. Submissions are never published automatically. Both people must independently consent and our team must approve before publication.</p>
            <Link to="/success-stories" className="mt-5 inline-flex text-sm font-semibold text-[#681d25] underline underline-offset-4">Back to Success Stories</Link>
          </div>
        </section>
        <section className="page-container mx-auto grid max-w-6xl gap-9 py-14 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={submit} className="grid gap-6 rounded-xl border border-[#ddc9b2] bg-[#fffdf9] p-6 shadow-sm sm:p-9" aria-label="Share your success story">
            <div className="flex items-center gap-3"><BookHeart className="text-[#681d25]" aria-hidden="true"/><h2 className="font-display text-3xl">Your experience</h2></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>Your name<input className={inputClass} required minLength={2} maxLength={100} autoComplete="name" value={form.partnerOneName} onChange={(e) => update('partnerOneName', e.target.value)}/></label>
              <label className={labelClass}>Your partner's name<input className={inputClass} required minLength={2} maxLength={100} value={form.partnerTwoName} onChange={(e) => update('partnerTwoName', e.target.value)}/></label>
              <label className={labelClass}>City (optional)<input className={inputClass} maxLength={120} value={form.city} onChange={(e) => update('city', e.target.value)}/></label>
              <label className={labelClass}>Marriage date (optional)<input className={inputClass} type="date" max={new Date().toISOString().slice(0,10)} value={form.marriageDate} onChange={(e) => update('marriageDate', e.target.value)}/></label>
            </div>
            <label className={labelClass}>Story headline<input className={inputClass} required minLength={8} maxLength={140} placeholder="How our families came together" value={form.title} onChange={(e) => update('title', e.target.value)}/><span className="text-xs font-normal text-[#796b62]">8–140 characters</span></label>
            <label className={labelClass}>Tell us your genuine story<textarea className={`${inputClass} min-h-48 resize-y`} required minLength={80} maxLength={3000} value={form.story} onChange={(e) => update('story', e.target.value)} placeholder="Share your experience in your own words, including how your introduction happened and what mattered to both families."/><span className="text-xs font-normal text-[#796b62]">{form.story.length}/3000 characters (minimum 80)</span></label>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#ddc9b2] bg-[#f7efe3] p-4 text-sm leading-6"><input type="checkbox" className="mt-1 accent-[#681d25]" required checked={form.submitterConsent} onChange={(e) => update('submitterConsent', e.target.checked)}/><span>I voluntarily agree to submit my story for private review. I understand this is <strong>my consent only</strong>, not my partner's consent, and nothing will be made public without separate verification and admin approval.</span></label>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {success && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</p>}
            <button disabled={saving || !form.submitterConsent} type="submit" className="min-h-12 rounded-full bg-[#681d25] px-7 text-sm font-bold text-white transition hover:bg-[#431318] disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Submitting…' : 'Submit privately for review'}</button>
          </form>
          <aside className="space-y-6">
            <div className="rounded-xl border border-[#ddc9b2] bg-[#fffdf9] p-6"><ShieldCheck size={28} className="text-[#88603a]" aria-hidden="true"/><h2 className="mt-3 font-display text-2xl">Privacy first</h2><p className="mt-3 text-sm leading-7 text-[#766358]">A submission does not mean approval or consent from both people. No story, photograph or identifying details are publicly visible at this stage.</p></div>
            <div className="rounded-xl border border-[#ddc9b2] bg-[#fffdf9] p-6"><div className="flex items-center gap-2"><CheckCircle2 size={20} className="text-[#88603a]" aria-hidden="true"/><h2 className="font-display text-2xl">Your submissions</h2></div>{loading ? <p className="mt-4 text-sm">Loading…</p> : stories.length ? <div className="mt-4 space-y-4">{stories.map((item) => <article key={item._id || item.id} className="border-t border-[#eadccd] pt-4"><p className="font-semibold">{item.title}</p><p className="mt-2 text-xs text-[#766358]">{statusLabel[item.status] || item.status}</p>{item.status === 'ChangesRequested' && item.moderationNotes && <p className="mt-2 text-xs leading-5 text-[#681d25]">{item.moderationNotes}</p>}</article>)}</div> : <p className="mt-4 text-sm leading-6 text-[#766358]">No submissions yet.</p>}</div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
