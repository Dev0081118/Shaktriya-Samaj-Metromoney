import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, HeartHandshake, RefreshCw, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { api } from '../services/api';

const copy = {
  en: { hero:'Real stories. Shared with respect.', intro:'Genuine member experiences, published after independent consent and team review.', section:'Stories shared with permission', eyebrow:'Member experiences', share:'Share your story', verified:'Reviewed & consented', loading:'Loading member stories…', error:'Stories are temporarily unavailable.', retry:'Try again', empty:'Stories of Royal Unions — Be the first to share your journey.', emptyInfo:'Only verified and consented member stories appear here. We never publish fictional testimonials as real stories.', disclosure:'These are voluntarily shared experiences, not guarantees of a match or marriage. Photos are not displayed.', previous:'Previous story', next:'Next story', principles:[['Verified before publishing','Every story is reviewed before publication.'],['Consent from both people','Independent consent from each member is mandatory.'],['Respecting every journey','Stories are shared without promising any matrimonial outcome.']] },
  gu: { hero:'સાચી કહાણીઓ. સંપૂર્ણ સન્માન સાથે.', intro:'બંને વ્યક્તિઓની સ્વતંત્ર સંમતિ અને અમારી ટીમની સમીક્ષા પછી જ સભ્યોની કહાણીઓ પ્રકાશિત થાય છે.', section:'સંમતિ સાથે શેર કરેલી કહાણીઓ', eyebrow:'સભ્યોના અનુભવો', share:'તમારી કહાણી શેર કરો', verified:'ચકાસાયેલ અને સંમતિ પ્રાપ્ત', loading:'કહાણીઓ લોડ થઈ રહી છે…', error:'હાલ કહાણીઓ ઉપલબ્ધ નથી.', retry:'ફરી પ્રયાસ કરો', empty:'શાહી સંબંધોની કહાણીઓ — તમારી સફર શેર કરનાર પ્રથમ બનો.', emptyInfo:'અહીં માત્ર ચકાસેલી અને સંમતિ પ્રાપ્ત કહાણીઓ દેખાય છે. કાલ્પનિક અનુભવોને વાસ્તવિક તરીકે રજૂ કરતા નથી.', disclosure:'આ સભ્યો દ્વારા સ્વેચ્છાએ શેર કરેલા અનુભવો છે, લગ્નની ખાતરી નથી. ફોટા દર્શાવવામાં આવતા નથી.', previous:'પાછલી કહાણી', next:'આગળની કહાણી', principles:[['પ્રકાશન પહેલાં ચકાસણી','દરેક કહાણી પ્રકાશન પહેલાં તપાસવામાં આવે છે.'],['બંને વ્યક્તિઓની સંમતિ','બંને સભ્યોની સ્વતંત્ર સંમતિ જરૂરી છે.'],['દરેક પ્રવાસનો આદર','કોઈપણ પરિણામની ખાતરી વિના અનુભવો શેર થાય છે.']] },
  hi: { hero:'सच्ची कहानियाँ। पूरे सम्मान के साथ।', intro:'दोनों व्यक्तियों की स्वतंत्र सहमति और हमारी टीम की समीक्षा के बाद ही सदस्यों की कहानियाँ प्रकाशित होती हैं।', section:'सहमति से साझा की गई कहानियाँ', eyebrow:'सदस्यों के अनुभव', share:'अपनी कहानी साझा करें', verified:'समीक्षित और सहमति प्राप्त', loading:'कहानियाँ लोड हो रही हैं…', error:'कहानियाँ फिलहाल उपलब्ध नहीं हैं।', retry:'फिर से कोशिश करें', empty:'शाही संबंधों की कहानियाँ — अपनी यात्रा साझा करने वाले पहले व्यक्ति बनें।', emptyInfo:'यहाँ केवल सत्यापित और सहमति वाली कहानियाँ दिखाई जाती हैं। काल्पनिक अनुभव वास्तविक बताकर नहीं दिखाए जाते।', disclosure:'ये स्वेच्छा से साझा किए गए अनुभव हैं, विवाह की गारंटी नहीं। तस्वीरें नहीं दिखाई जातीं।', previous:'पिछली कहानी', next:'अगली कहानी', principles:[['प्रकाशन से पहले समीक्षा','हर कहानी प्रकाशन से पहले जाँची जाती है।'],['दोनों की सहमति','दोनों सदस्यों की स्वतंत्र सहमति अनिवार्य है।'],['हर यात्रा का सम्मान','किसी परिणाम का वादा किए बिना अनुभव साझा किए जाते हैं।']] }
};
const cards = [ShieldCheck, UsersRound, HeartHandshake];
export default function StoriesPage() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.split('-')[0] || i18n.language?.split('-')[0] || 'en';
  const t = copy[language] || copy.en;
  const [stories,setStories] = useState([]);
  const [status,setStatus] = useState('loading');
  const [retry,setRetry] = useState(0);
  const scrollRef = useRef(null);
  const scroll = direction => { const el=scrollRef.current; if(!el)return; const card=el.querySelector('article'); el.scrollBy({ left:direction*(card?.getBoundingClientRect().width || el.clientWidth)+direction*24, behavior:'smooth' }); };
  useEffect(() => { let active=true; const controller=new AbortController(); api('/public/success-stories',{signal:controller.signal}).then(result=>{if(!active)return; const received=result?.data?.stories;if(!Array.isArray(received))throw new Error('Invalid response');setStories(received);setStatus('success');}).catch(()=>{if(active)setStatus('error');});return()=>{active=false;controller.abort();};},[retry]);
  return (
    <div className="min-h-screen bg-subtle-texture text-[#281A18]">
      <Header />

      <main>
        {/* =========================================
            HERO WITH ROYAL MINIATURE BANNER
        ========================================== */}
        <section className="relative overflow-hidden border-b border-[#C49B70]/40 py-36 sm:py-44 lg:py-52 min-h-[580px] sm:min-h-[640px] flex items-center text-white bg-[#1a0e10]">
          <div aria-hidden="true" className="absolute inset-0">
            <img
              src="/assets/stories-hero-miniature-banner.jpg"
              alt="Rajput miniature painting royal garden banner"
              className="h-full w-full object-cover object-center"
            />
            {/* Lighter overlays to let the artwork shine through vibrantly */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#180a0d]/65 via-[#180a0d]/40 to-[#180a0d]/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#180a0d]/70 via-transparent to-black/30" />
          </div>

          <div className="page-container relative z-10 mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-3 border border-[#D5A76E]/40 bg-[#2b1014]/60 px-5 py-2 backdrop-blur-md shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E1BC8A]" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#E1BC8A]">
                Royal Rajputana Matrimony
              </p>
              <span className="h-1.5 w-1.5 rounded-full bg-[#E1BC8A]" />
            </div>

            <h1 className="mt-8 font-display text-[clamp(48px,7vw,88px)] font-medium leading-[1.05] tracking-[-0.03em] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {t.hero}
            </h1>

            <p className="mx-auto mt-7 max-w-[700px] text-sm leading-8 text-[#FAF3EA] sm:text-base drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {t.intro}
            </p>
          </div>
        </section>

        {/* =========================================
            STORIES WITH SCROLL & FRAMES
        ========================================== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF5EC] via-[#F4EDE0] to-[#EFE4D0] py-20 sm:py-28 border-y-2 border-[#C5A059]/70 shadow-[inset_0_20px_40px_rgba(80,40,15,0.05),inset_0_-20px_40px_rgba(80,40,15,0.05)]">
          {/* Subtle Aged Parchment Texture Overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.7)_0%,transparent_80%)]"
          />

          {/* Double Gold Line Scroll Margin Frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-4 inset-x-8 sm:inset-x-16 lg:inset-x-24 border-2 border-[#C5A059]/50 rounded-xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-6 inset-x-10 sm:inset-x-20 lg:inset-x-28 border border-[#AA7A42]/30 rounded-lg"
          />

          {/* LEFT SCROLL BORDER SYSTEM */}
          {/* 1. Left Rolled Scroll Spindle Cylinder */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-7 sm:w-11 lg:w-13 bg-[url('/assets/scroll-roll-vertical.png')] bg-repeat-y bg-left-top shadow-[4px_0_12px_rgba(30,15,5,0.22)] z-20"
          />
          {/* 2. Left Top & Bottom Carved Gold Finials */}
          <img
            src="/assets/scroll-finial-gold.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 -left-1 w-9 sm:w-13 lg:w-15 z-30 select-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
          />
          <img
            src="/assets/scroll-finial-gold.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-3 -left-1 w-9 sm:w-13 lg:w-15 -scale-y-100 z-30 select-none drop-shadow-[0_-4px_8px_rgba(0,0,0,0.35)]"
          />
          {/* 3. Left Running Rajasthani Gold Lotus Filigree Vine */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-7 sm:left-11 lg:left-13 top-0 bottom-0 w-12 sm:w-16 lg:w-20 bg-[url('/assets/lotus-border-vertical.png')] bg-repeat-y bg-left-top opacity-85 select-none drop-shadow-[0_1px_3px_rgba(150,100,30,0.2)] z-10"
          />

          {/* RIGHT SCROLL BORDER SYSTEM */}
          {/* 1. Right Rolled Scroll Spindle Cylinder */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-7 sm:w-11 lg:w-13 bg-[url('/assets/scroll-roll-vertical.png')] bg-repeat-y bg-right-top -scale-x-100 shadow-[-4px_0_12px_rgba(30,15,5,0.22)] z-20"
          />
          {/* 2. Right Top & Bottom Carved Gold Finials */}
          <img
            src="/assets/scroll-finial-gold.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 -right-1 w-9 sm:w-13 lg:w-15 -scale-x-100 z-30 select-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]"
          />
          <img
            src="/assets/scroll-finial-gold.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-3 -right-1 w-9 sm:w-13 lg:w-15 -scale-x-100 -scale-y-100 z-30 select-none drop-shadow-[0_-4px_8px_rgba(0,0,0,0.35)]"
          />
          {/* 3. Right Running Rajasthani Gold Lotus Filigree Vine */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-7 sm:right-11 lg:right-13 top-0 bottom-0 w-12 sm:w-16 lg:w-20 bg-[url('/assets/lotus-border-vertical.png')] bg-repeat-y bg-right-top -scale-x-100 opacity-85 select-none drop-shadow-[0_1px_3px_rgba(150,100,30,0.2)] z-10"
          />

          {/* 4 Grand Golden Lotus Filigree Corners */}
          <img
            src="/assets/lotus-corner-hd.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-6 sm:left-12 lg:left-16 top-2 w-28 sm:w-36 lg:w-44 select-none opacity-85 drop-shadow-[0_2px_4px_rgba(90,60,20,0.1)] z-10"
          />
          <img
            src="/assets/lotus-corner-hd.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-6 sm:right-12 lg:right-16 top-2 w-28 sm:w-36 lg:w-44 -scale-x-100 select-none opacity-85 drop-shadow-[0_2px_4px_rgba(90,60,20,0.1)] z-10"
          />
          <img
            src="/assets/lotus-corner-hd.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-6 sm:left-12 lg:left-16 bottom-2 w-28 sm:w-36 lg:w-44 -scale-y-100 select-none opacity-85 drop-shadow-[0_2px_4px_rgba(90,60,20,0.1)] z-10"
          />
          <img
            src="/assets/lotus-corner-hd.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-6 sm:right-12 lg:right-16 bottom-2 w-28 sm:w-36 lg:w-44 -scale-x-100 -scale-y-100 select-none opacity-85 drop-shadow-[0_2px_4px_rgba(90,60,20,0.1)] z-10"
          />

          {/* Top & Bottom Running Golden Lotus Garland Trims */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-36 sm:inset-x-52 lg:inset-x-64 top-2 sm:top-3 h-8 sm:h-12 bg-[url('/assets/lotus-border-hd.png')] bg-repeat-x bg-contain bg-top opacity-85 select-none z-10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-36 sm:inset-x-52 lg:inset-x-64 bottom-2 sm:bottom-3 h-8 sm:h-12 bg-[url('/assets/lotus-border-hd.png')] bg-repeat-x bg-contain bg-bottom -scale-y-100 opacity-85 select-none z-10"
          />

          <div className="page-container relative z-10 mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
            {status === 'loading' && (
              <div role="status" className="border border-[#dcc9b3] bg-white/80 p-12 text-center text-sm text-[#756A60] backdrop-blur-sm">
                {t.loading}
              </div>
            )}

            {status === 'error' && (
              <div className="border border-[#dcc9b3] bg-white/80 p-12 text-center backdrop-blur-sm">
                <p role="alert" className="text-sm text-[#681D25]">{t.error}</p>
                <button
                  type="button"
                  className="mt-5 rounded-full bg-[#681D25] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#52161d]"
                  onClick={() => {
                    setStatus('loading');
                    setRetry((v) => v + 1);
                  }}
                >
                  <RefreshCw size={16} className="mr-2 inline" />
                  {t.retry}
                </button>
              </div>
            )}

            {status === 'success' && stories.length === 0 && (
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#C5A059]/60 bg-gradient-to-b from-[#FAF5EB] via-[#F4EDE0] to-[#EFE5D2] p-12 sm:p-16 text-center shadow-[0_20px_50px_rgba(80,40,15,0.08)] max-w-2xl mx-auto">
                {/* Ornate Gold Filigree Corners */}
                <img
                  src="/assets/lotus-corner-hd.png"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 left-0 w-24 sm:w-32 select-none opacity-85"
                />
                <img
                  src="/assets/lotus-corner-hd.png"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 right-0 w-24 sm:w-32 -scale-x-100 select-none opacity-85"
                />
                <img
                  src="/assets/lotus-corner-hd.png"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-0 w-24 sm:w-32 -scale-y-100 select-none opacity-85"
                />
                <img
                  src="/assets/lotus-corner-hd.png"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 right-0 w-24 sm:w-32 -scale-x-100 -scale-y-100 select-none opacity-85"
                />

                <span className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#681d25]/10 text-[#681d25]">
                  <HeartHandshake size={32} />
                </span>
                <h2 className="relative z-10 mt-6 font-display text-3xl sm:text-4xl text-[#392019]">
                  {t.empty}
                </h2>
                <p className="relative z-10 mx-auto mt-4 max-w-md text-sm leading-7 text-[#736359]">
                  {t.emptyInfo}
                </p>
                <Link
                  className="relative z-10 mt-8 inline-flex items-center gap-2 rounded-full bg-[#681D25] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#52161d]"
                  to="/submit-success-story"
                >
                  {t.share}
                </Link>
              </div>
            )}

            {status === 'success' && stories.length > 0 && (
              <>
                <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#91683F]">{t.eyebrow}</p>
                    <h2 className="mt-3 font-display text-4xl sm:text-5xl">{t.section}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      className="rounded-full border border-[#C6B199] px-6 py-3 text-xs font-bold text-[#681D25] transition hover:bg-[#681d25] hover:text-white"
                      to="/submit-success-story"
                    >
                      {t.share}
                    </Link>
                    <button
                      type="button"
                      aria-label={t.previous}
                      title={t.previous}
                      onClick={() => scroll(-1)}
                      className="rounded-full border border-[#C6B199] p-3 text-[#681D25] transition hover:bg-[#681D25] hover:text-white"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <button
                      type="button"
                      aria-label={t.next}
                      title={t.next}
                      onClick={() => scroll(1)}
                      className="rounded-full border border-[#C6B199] p-3 text-[#681D25] transition hover:bg-[#681D25] hover:text-white"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  aria-label={t.section}
                  role="region"
                  tabIndex={0}
                  className="flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth pb-6 [scrollbar-width:thin]"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {stories.map((story, index) => (
                    <article
                      key={`${story.publishedAt || ''}-${index}`}
                      className="relative overflow-hidden w-[min(86vw,510px)] shrink-0 snap-start self-stretch rounded-xl border border-[#D7C5B1] bg-gradient-to-b from-[#FFFDF8] to-[#FBF6EE] p-7 shadow-sm sm:p-10"
                    >
                      <div className="flex items-center gap-2 text-[#91683F]">
                        <ShieldCheck size={17} aria-hidden="true" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{t.verified}</span>
                      </div>
                      <h3 className="mt-5 font-display text-3xl text-[#431318]">{story.title}</h3>
                      <p className="mt-3 text-sm font-semibold text-[#681D25]">
                        {[story.partnerOneName, story.partnerTwoName].filter(Boolean).join(' & ')}
                      </p>
                      {story.city && <p className="mt-1 text-xs text-[#756A60]">{story.city}</p>}
                      <p className="mt-6 whitespace-pre-line break-words text-sm leading-8 text-[#574A42]">{story.story}</p>
                    </article>
                  ))}
                </div>

                <p className="mt-5 text-xs leading-6 text-[#756A60]">{t.disclosure}</p>
              </>
            )}

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {t.principles.map(([title, body], i) => {
                const Icon = cards[i];
                return (
                  <article
                    key={i}
                    className="relative overflow-hidden rounded-xl border border-[#D7C5B1] bg-gradient-to-b from-[#FAF6ED] to-[#F3EBDD] p-8 shadow-sm"
                  >
                    <Icon size={26} className="text-[#91683F]" />
                    <h3 className="mt-5 font-display text-2xl text-[#392019]">{title}</h3>
                    <p className="mt-3 text-xs leading-7 text-[#756A60]">{body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
