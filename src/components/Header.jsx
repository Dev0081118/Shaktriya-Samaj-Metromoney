import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="page-container flex h-24 items-center justify-between">
        <Link to="/" className="relative z-10">
          <div className="font-display text-[22px] font-semibold tracking-[0.06em] text-white">
            KSHATRIYA
          </div>

          <div className="mt-[-3px] text-[9px] font-semibold uppercase tracking-[0.38em] text-white/55">
            Matrimonial Society
          </div>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {[
            "Discover",
            "About",
            "How it works",
            "Stories",
            "Membership",
          ].map((item) => (
            <Link
              to={item === "Discover" ? "/discover" : item === "Membership" ? "/membership" : `/#${item.toLowerCase().replaceAll(' ', '-')}`}
              key={item}
              className="text-[13px] font-medium text-white/75 transition hover:text-white"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <Link to="/login" className="text-[13px] font-semibold text-white">
            Sign in
          </Link>

          <Link to="/register" className="rounded-full border border-white/40 bg-white px-6 py-3 text-[12px] font-bold text-[#32171a] transition hover:bg-[#f4eee6]">
            Create Profile
          </Link>
        </div>

        <Link to="/register" aria-label="Create profile" className="text-white lg:hidden">
          <Menu />
        </Link>
      </div>
    </header>
  );
}
