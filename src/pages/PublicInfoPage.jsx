import { ArrowRight, CheckCircle2, HeartHandshake, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const pages = {
  about: {
    eyebrow: "Our philosophy",
    title: "Marriage begins with more than a profile.",
    intro: "Kshatriya Matrimonial Society is designed for thoughtful introductions where personal choice, family context, privacy and dignity can coexist.",
    sections: [
      ["Why we exist", "Matrimonial discovery can feel transactional. We created a calmer, considered space that gives families enough context without asking members to surrender their privacy."],
      ["Family-first, member-led", "Families may support the journey, while the person at the centre of the profile remains respected. Every introduction is an invitation—not an obligation."],
      ["Technology with tradition", "Preference-led discovery, moderation and privacy controls support a deeply human decision. Technology narrows the search; people decide what comes next."],
      ["A focused community", "Our community focus reflects shared cultural context, not a promise of compatibility. Every family and every individual remains distinct."],
    ],
  },
  "how-it-works": {
    eyebrow: "A considered process",
    title: "From first profile to family conversation.",
    intro: "A clear, moderated path helps members move at a pace that feels comfortable.",
    steps: ["Create your account", "Verify your mobile", "Build your matrimonial profile", "Submit it for review", "Discover suitable profiles", "Express interest", "Accept mutually", "Request contact details", "Continue the family conversation safely"],
  },
  "success-stories": {
    eyebrow: "Shared beginnings",
    title: "Stories shaped by patience and intention.",
    intro: "The stories below are clearly labelled editorial examples while our verified story programme is being prepared.",
    stories: [
      ["An introduction across two cities", "Editorial sample", "Two families began with a considered profile exchange, took time to speak, and met in a familiar family setting."],
      ["Shared values, different paths", "Editorial sample", "A doctor and an entrepreneur discovered that their routines differed, while their expectations of family life aligned."],
      ["A conversation that grew slowly", "Editorial sample", "Their first exchange was brief. Mutual respect—and patient family conversations—made room for something meaningful."],
    ],
  },
  safety: {
    eyebrow: "Safety centre",
    title: "Move thoughtfully. Protect what is private.",
    intro: "No platform can remove every risk. These practices help members and families make safer decisions.",
    sections: [
      ["Never send money", "Do not transfer funds, share banking credentials or respond to urgent financial requests from someone you met through the platform."],
      ["Verify independently", "Confirm identity and important claims through trusted family or community channels. Platform badges are helpful signals, not guarantees."],
      ["Meet safely", "Choose a public place, tell someone you trust, arrange your own transport and avoid being pressured into a private meeting."],
      ["Keep details private", "Share your home address, documents and direct contact details only when trust has developed. Use privacy controls and contact requests."],
      ["Report and block", "If behaviour feels suspicious, coercive or inappropriate, stop contact and use the report or block controls. Our moderation team can review the account."],
    ],
  },
  privacy: { eyebrow: "Privacy", title: "Your information, shared with intention.", intro: "Profiles are private member content. Visibility controls determine who can see photographs, family details, income and contact information.", sections: [["Our approach", "We collect information needed to provide the service, protect the community and support member requests. We do not make private member profiles indexable public pages."], ["Your choices", "You can pause your profile, change privacy settings, block members and request account deletion from Settings."], ["Retention", "Operational, fraud-prevention and legal obligations may require limited retention after closure. A production privacy notice should be reviewed by qualified counsel before launch."]] },
  terms: { eyebrow: "Terms", title: "A respectful community agreement.", intro: "Members must provide truthful information, respect consent, avoid harassment and use the service only for lawful matrimonial purposes.", sections: [["Member responsibility", "You are responsible for independent verification and for decisions made through introductions."], ["Moderation", "We may review, restrict or remove accounts that breach community or safety standards."], ["Production notice", "These launch-ready terms are a product foundation and require jurisdiction-specific legal review before commercial release."]] },
  refunds: { eyebrow: "Payments", title: "Clear and fair refund handling.", intro: "Eligibility depends on the purchased plan, service usage and applicable law.", sections: [["Requesting a review", "Contact support with the account email and payment reference. Never send card or banking credentials."], ["Processing", "Approved refunds return through the original payment provider. Provider processing times may apply."], ["Production notice", "Final refund windows and assisted-service conditions must be approved as part of the commercial policy before launch."]] },
};

export default function PublicInfoPage({ type }) {
  const page = pages[type] || pages.about;
  return <div className="public-shell"><Header solid /><main>
    <section className="public-hero"><div className="page-container"><p className="eyebrow">{page.eyebrow}</p><h1>{page.title}</h1><p>{page.intro}</p></div></section>
    <section className="public-content page-container">
      {['privacy','terms','refunds'].includes(type)&&<div className="legal-draft-notice"><strong>Pre-launch legal draft</strong><p>This policy requires approval by qualified counsel before commercial launch. It is not presented as final legal advice.</p></div>}
      {page.steps && <ol className="journey-steps">{page.steps.map((step, index)=><li key={step}><span>{String(index+1).padStart(2,"0")}</span><h2>{step}</h2><CheckCircle2 /></li>)}</ol>}
      {page.stories && <div className="story-grid">{page.stories.map(([title,label,body])=><article key={title}><span>{label}</span><h2>{title}</h2><p>{body}</p></article>)}</div>}
      {page.sections && <div className="editorial-grid">{page.sections.map(([title,body],index)=><article key={title}>{index%3===0?<ShieldCheck/>:index%3===1?<HeartHandshake/>:<LockKeyhole/>}<h2>{title}</h2><p>{body}</p></article>)}</div>}
      {!['privacy','terms','refunds'].includes(type)&&<div className="public-cta"><div><p className="eyebrow">Begin privately</p><h2>Create a profile when you feel ready.</h2></div><Link className="primary-button" to="/register">Create free profile <ArrowRight size={16}/></Link></div>}
    </section>
  </main><Footer /></div>;
}
