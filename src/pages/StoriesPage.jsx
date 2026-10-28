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
  return <div className="min-h-screen bg-subtle-texture text-[#281A18]"><Header solid/><main>
    <section className="relative overflow-hidden border-b border-[#DDCDB9] py-24 sm:py-32"><div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{backgroundImage:'radial-gradient(circle at 15% 20%, rgba(196,155,112,.13), transparent 35%),radial-gradient(circle at 88% 80%, rgba(104,29,37,.07), transparent 40%)'}}/><div className="page-container relative mx-auto max-w-5xl text-center"><p className="text-xs font-bold uppercase tracking-[.25em] text-[#91683F]">Royal Rajputana Matrimony</p><h1 className="mt-6 font-display text-[clamp(48px,7vw,86px)] leading-tight">{t.hero}</h1><p className="mx-auto mt-8 max-w-[720px] text-sm leading-8 text-[#756A60]">{t.intro}</p></div></section>
    <section className="py-20 sm:py-28"><div className="page-container mx-auto max-w-6xl">
      {status==='loading' && <div role="status" className="border bg-white p-12 text-center">{t.loading}</div>}
      {status==='error' && <div className="border bg-white p-12 text-center"><p role="alert">{t.error}</p><button type="button" className="mt-5 rounded-full bg-[#681D25] px-6 py-3 text-white" onClick={()=>{setStatus('loading');setRetry(v=>v+1);}}><RefreshCw size={16} className="mr-2 inline"/>{t.retry}</button></div>}
      {status==='success' && stories.length===0 && (
        <div className="border border-[#dcc9b3] bg-[#fffdf8] p-12 sm:p-16 text-center shadow-sm max-w-2xl mx-auto">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#681d25]/10 text-[#681d25]">
            <HeartHandshake size={32} />
          </span>
          <h2 className="mt-6 font-display text-3xl sm:text-4xl text-[#392019]">{t.empty}</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#736359]">{t.emptyInfo}</p>
          <Link className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#681D25] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#52161d]" to="/submit-success-story">
            {t.share}
          </Link>
        </div>
      )}
      {status==='success' && stories.length>0 && <><div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-widest text-[#91683F]">{t.eyebrow}</p><h2 className="mt-3 font-display text-4xl sm:text-5xl">{t.section}</h2></div><div className="flex items-center gap-3"><Link className="rounded-full border border-[#C6B199] px-6 py-3 text-xs font-bold text-[#681D25]" to="/submit-success-story">{t.share}</Link><button type="button" aria-label={t.previous} title={t.previous} onClick={()=>scroll(-1)} className="rounded-full border border-[#C6B199] p-3"><ArrowLeft size={18}/></button><button type="button" aria-label={t.next} title={t.next} onClick={()=>scroll(1)} className="rounded-full border border-[#C6B199] p-3"><ArrowRight size={18}/></button></div></div>
        <div ref={scrollRef} aria-label={t.section} role="region" tabIndex={0} className="flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth pb-6 [scrollbar-width:thin]" style={{WebkitOverflowScrolling:'touch'}}>{stories.map((story,index)=><article key={`${story.publishedAt||''}-${index}`} className="w-[min(86vw,510px)] shrink-0 snap-start self-stretch border border-[#D7C5B1] bg-[#FFFDF8] p-7 shadow-sm sm:p-10"><div className="flex items-center gap-2 text-[#91683F]"><ShieldCheck size={17} aria-hidden="true"/><span className="text-[10px] font-bold uppercase tracking-widest">{t.verified}</span></div><h3 className="mt-5 font-display text-3xl text-[#431318]">{story.title}</h3><p className="mt-3 text-sm font-semibold text-[#681D25]">{[story.partnerOneName,story.partnerTwoName].filter(Boolean).join(' & ')}</p>{story.city&&<p className="mt-1 text-xs text-[#756A60]">{story.city}</p>}<p className="mt-6 whitespace-pre-line break-words text-sm leading-8 text-[#574A42]">{story.story}</p></article>)}</div><p className="mt-5 text-xs leading-6 text-[#756A60]">{t.disclosure}</p></>}
      <div className="mt-14 grid gap-4 md:grid-cols-3">{t.principles.map(([title,body],i)=>{const Icon=cards[i];return <article key={i} className="border border-[#D7C5B1] bg-[#FBF7F0] p-7"><Icon size={24} className="text-[#91683F]"/><h3 className="mt-5 font-display text-3xl">{title}</h3><p className="mt-3 text-xs leading-7 text-[#756A60]">{body}</p></article>;})}</div>
    </div></section></main><Footer/></div>;
}
