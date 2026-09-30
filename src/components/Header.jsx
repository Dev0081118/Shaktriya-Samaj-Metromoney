import { Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="page-container flex h-24 items-center justify-between">
        <a href="/" className="relative z-10">
          <div className="font-display text-[22px] font-semibold tracking-[0.06em] text-white">
            KSHATRIYA
          </div>

          <div className="mt-[-3px] text-[9px] font-semibold uppercase tracking-[0.38em] text-white/55">
            Matrimonial Society
          </div>
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {[
            "Discover",
            "About",
            "How it works",
            "Stories",
            "Membership",
          ].map((item) => (
            <a
              href="#"
              key={item}
              className="text-[13px] font-medium text-white/75 transition hover:text-white"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <button className="text-[13px] font-semibold text-white">
            Sign in
          </button>

          <button className="rounded-full border border-white/40 bg-white px-6 py-3 text-[12px] font-bold text-[#32171a] transition hover:bg-[#f4eee6]">
            Create Profile
          </button>
        </div>

        <button className="text-white lg:hidden">
          <Menu />
        </button>
      </div>
    </header>
  );
}