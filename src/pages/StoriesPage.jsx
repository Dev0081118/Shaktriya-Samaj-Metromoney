import { HeartHandshake, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const principles = [
  {
    icon: ShieldCheck,
    title: 'Verified before publishing',
    body: 'Every submitted story will be reviewed before it appears on this page.'
  },
  {
    icon: UsersRound,
    title: 'Consent from both people',
    body: 'Names, photographs and identifying details will only be shown with appropriate permission.'
  },
  {
    icon: HeartHandshake,
    title: 'Respecting every journey',
    body: 'We will share genuine experiences without exaggerating outcomes or promising a match.'
  }
];

export default function StoriesPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#281A18]">
      <Header solid />
      <main>
        <section className="relative overflow-hidden border-b border-[#DDCDB9] py-24 sm:py-32">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(196,155,112,.13), transparent 35%), radial-gradient(circle at 88% 80%, rgba(104,29,37,.07), transparent 40%)' }} />
          <div className="page-container relative mx-auto max-w-[1050px] text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[.26em] text-[#91683F]">Royal Rajputana Matrimony</p>
            <h1 className="mt-6 font-display text-[clamp(48px,7vw,86px)] font-medium leading-[.97]">Real stories. Shared with respect.</h1>
            <p className="mx-auto mt-8 max-w-[720px] text-[15px] leading-8 text-[#756A60]">We believe a meaningful relationship deserves a truthful telling. This space is reserved for genuine member experiences published only after review and consent.</p>
          </div>
        </section>

        <section className="py-20 sm:py-28" aria-labelledby="story-status-title">
          <div className="page-container mx-auto max-w-[1060px]">
            <div className="border border-[#D7C5B1] bg-[#FFFDF8] p-8 text-center shadow-[0_20px_50px_rgba(44,26,24,.04)] sm:p-14">
              <HeartHandshake size={38} strokeWidth={1.3} className="mx-auto text-[#91683F]" aria-hidden="true" />
              <p className="mt-7 text-[10px] font-bold uppercase tracking-[.23em] text-[#91683F]">Stories coming soon</p>
              <h2 id="story-status-title" className="mt-4 font-display text-[clamp(34px,5vw,52px)] font-medium">We have not published any member stories yet.</h2>
              <p className="mx-auto mt-5 max-w-[680px] text-[13px] leading-7 text-[#756A60]">Once a couple voluntarily shares their experience, both parties consent to publication, and our team approves the submission, it may be featured here. No fictional couples or sample testimonials are presented as real success stories.</p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link to="/how-it-works" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#681D25] px-6 text-[12px] font-bold text-white transition hover:bg-[#431318]">How it works</Link>
                <Link to="/submit-success-story" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#C6B199] px-6 text-[12px] font-bold text-[#681D25] transition hover:bg-[#F5F0E8]">Share your story</Link>
                <Link to="/contact" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#C6B199] px-6 text-[12px] font-bold text-[#681D25] transition hover:bg-[#F5F0E8]">Contact our team</Link>
              </div>
            </div>
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
