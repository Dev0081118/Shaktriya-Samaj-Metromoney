import { Link } from "react-router-dom";
const destinations = {
  Matches: "/discover",
  Membership: "/membership",
  "Success Stories": "/success-stories",
  About: "/about",
  "How It Works": "/how-it-works",
  Contact: "/contact",
  Safety: "/safety",
  Privacy: "/privacy",
  Terms: "/terms",
  Refunds: "/refunds",
  "Delete Account": "/settings"
};
export default function Footer() {
  return (
    <footer className="bg-[#15100f] text-white">
      <div className="page-container py-16">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-4">
          <div>
            <h3 className="font-display text-[22px]">KSHATRIYA</h3>

            <p className="mt-5 max-w-xs text-xs leading-6 text-white/40">
              A private matrimonial community built around family, dignity,
              meaningful compatibility and trust.
            </p>
          </div>

          <FooterBlock
            title="Discover"
            links={["Matches", "Membership", "Success Stories"]}
          />

          <FooterBlock
            title="Company"
            links={["About", "How It Works", "Contact", "Safety"]}
          />

          <FooterBlock
            title="Legal"
            links={["Privacy", "Terms", "Refunds", "Delete Account"]}
          />
        </div>

        <div className="flex flex-col gap-3 pt-7 text-[10px] uppercase tracking-[0.14em] text-white/30 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} Kshatriya Matrimonial Society
          </span>

          <span>Heritage • Trust • Connection</span>
        </div>
      </div>
    </footer>
  );
}

function FooterBlock({ title, links }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">
        {title}
      </h4>

      <div className="mt-5 flex flex-col gap-3">
        {links.map((link) => (
          <Link
            to={destinations[link]}
            key={link}
            className="text-xs text-white/40 transition hover:text-white"
          >
            {link}
          </Link>
        ))}
      </div>
    </div>
  );
}
