import { useEffect, useState } from 'react';
import { HeartHandshake, ShieldCheck, UsersRound, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { api } from '../services/api';

const principles = [
  { icon: ShieldCheck, title: 'Verified before publishing', body: 'Every submitted story is reviewed before it appears on this page.' },
  { icon: UsersRound, title: 'Consent from both people', body: 'We publish only experiences with both members’ documented consent. Photographs are not displayed.' },
  { icon: HeartHandshake, title: 'Respecting every journey', body: 'Genuine member experiences are shared without exaggerating outcomes or promising a match.' }
];

// Public API provides only approved stories with independently verified consent.
// Never render unapproved submissions, sensitive IDs or photo URLs on this page.
export default function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    api('/public/success-stories', { signal: controller.signal })
      .then((result) => {
        if (!active) return;
        const received = result?.data?.stories;
        if (!Array.isArray(received)) throw new Error('Unexpected stories response');
        setStories(received);
        setStatus('success');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => { active = false; controller.abort(); };
  }, [retry]);

  const retryLoading = () => {
    setStatus('loading');
    setRetry(value => value + 1);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#281A18]">
      <Header solid />
      <main>
        <section className="relative overflow-hidden border-b border-[#DDCDB9] py-24 sm:py-32">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(196,155,112,.13), transparent 35%), radial-gradient(circle at 88% 80%, rgba(104,29,37,.07), transparent 40%)' }} />
          <div className="page-container relative mx-auto max-w-[1050px] text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[.26em] text-[#91683F]">Royal Rajputana Matrimony</p>
            <h1 className="mt-6 font-display text-[clamp(48px,7vw,86px)] font-medium leading-[.97]">Real stories. Shared with respect.</h1>
            <p className="mx-auto mt-8 max-w-[720px] text-[15px] leading-8 text-[#756A60]">A space for genuine member experiences, published only after independent consent and review by our team.</p>
          </div>
        </section>

        <section className="py-20 sm:py-28" aria-labelledby="story-status-title">
          <div className="page-container mx-auto max-w-[1060px]">
            {status === 'loading' && (
              <div role="status" aria-live="polite" className="border border-[#D7C5B1] bg-[#FFFDF8] p-12 text-center text-[#756A60]">Loading member stories…</div>
            )}
            {status === 'error' && (
              <div className="border border-[#D7C5B1] bg-[#FFFDF8] p-10 text-center sm:p-14">
                <HeartHandshake size={38} strokeWidth={1.3} className="mx-auto text-[#91683F]" aria-hidden="true" />
                <h2 id="story-status-title" className="mt-5 font-display text-4xl">Stories are temporarily unavailable.</h2>
                <p role="alert" className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#756A60]">We couldn’t load approved member stories. Please try again.</p>
                <button type="button" onClick={retryLoading} className="mt-7 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#681D25] px-6 text-xs font-bold text-white hover:bg-[#431318]"><RefreshCw size={15} /> Try again</button>
              </div>
            )}
            {status === 'success' && stories.length === 0 && (
              <div className="border border-[#D7C5B1] bg-[#FFFDF8] p-8 text-center shadow-[0_20px_50px_rgba(44,26,24,.04)] sm:p-14">
                <HeartHandshake size={38} strokeWidth={1.3} className="mx-auto text-[#91683F]" aria-hidden="true" />
                <p className="mt-7 text-[10px] font-bold uppercase tracking-[.23em] text-[#91683F]">Stories coming soon</p>
                <h2 id="story-status-title" className="mt-4 font-display text-[clamp(34px,5vw,52px)] font-medium">We have not published any member stories yet.</h2>
                <p className="mx-auto mt-5 max-w-[680px] text-[13px] leading-7 text-[#756A60]">Once a couple voluntarily shares their experience, both parties consent, and our team approves the submission, it may be featured here. No fictional couples or sample testimonials are presented as real stories.</p>
                <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/how-it-works" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#681D25] px-6 text-[12px] font-bold text-white transition hover:bg-[#431318]">How it works</Link>
                  <Link to="/submit-success-story" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#C6B199] px-6 text-[12px] font-bold text-[#681D25] transition hover:bg-[#F5F0E8]">Share your story</Link>
                  <Link to="/contact" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#C6B199] px-6 text-[12px] font-bold text-[#681D25] transition hover:bg-[#F5F0E8]">Contact our team</Link>
                </div>
              </div>
            )}
            {status === 'success' && stories.length > 0 && (
              <div>
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                  <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#91683F]">Member experiences</p><h2 id="story-status-title" className="mt-3 font-display text-4xl sm:text-5xl">Stories shared with permission</h2></div>
                  <Link to="/submit-success-story" className="inline-flex min-h-[44px] items-center rounded-full border border-[#C6B199] px-6 text-xs font-bold text-[#681D25] hover:bg-[#FFFDF8]">Share your story</Link>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {stories.map((story, index) => (
                    <article key={`${story.publishedAt || ''}-${index}`} className="border border-[#D7C5B1] bg-[#FFFDF8] p-7 shadow-[0_20px_50px_rgba(44,26,24,.04)] sm:p-10">
                      <div className="flex items-center gap-2 text-[#91683F]"><ShieldCheck size={17} strokeWidth={1.6} aria-hidden="true" /><span className="text-[10px] font-bold uppercase tracking-[.18em]">Reviewed & consented</span></div>
                      <h3 className="mt-5 font-display text-3xl leading-tight text-[#431318]">{story.title}</h3>
                      <p className="mt-3 text-sm font-semibold text-[#681D25]">{[story.partnerOneName, story.partnerTwoName].filter(Boolean).join(' & ')}</p>
                      {story.city && <p className="mt-1 text-xs text-[#756A60]">{story.city}</p>}
                      <p className="mt-6 whitespace-pre-line wrap-break-word text-sm leading-8 text-[#574A42]">{story.story}</p>
                    </article>
                  ))}
                </div>
                <p className="mt-7 text-xs leading-6 text-[#756A60]">These are voluntarily submitted experiences, not guarantees of a match or marriage. Photographs are not displayed.</p>
              </div>
            )}
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {principles.map(({ icon: Icon, title, body }) => (
                <article key={title} className="border border-[#D7C5B1] bg-[#FBF7F0] p-7">
                  <Icon size={24} strokeWidth={1.4} className="text-[#91683F]" aria-hidden="true" />
                  <h3 className="mt-5 font-display text-[29px]">{title}</h3>
                  <p className="mt-3 text-[12px] leading-7 text-[#756A60]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
