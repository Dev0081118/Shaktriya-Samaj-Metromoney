import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  ["Discover", "/discover"],
  ["How It Works", "/how-it-works"],
  ["Stories", "/success-stories"],
  ["Membership", "/membership"],
  ["About", "/about"]
];
export default function Header({ solid = false }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <header
      className={`${solid ? "public-header solid" : "absolute"} inset-x-0 top-0 z-50`}
    >
      <div className="page-container flex h-24 items-center justify-between">
        <Link to="/" className="relative z-10">
          <div className="font-display text-[22px] font-semibold tracking-[0.06em] text-white">
            KSHATRIYA
          </div>
          <div className="mt-[-3px] text-[9px] font-semibold uppercase tracking-[0.38em] text-white/55">
            Matrimonial Society
          </div>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map(([label, to]) => (
            <Link
              to={to}
              key={to}
              className="text-[13px] font-medium text-white/75 transition hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-[13px] font-semibold text-white"
              >
                Dashboard
              </Link>
              <Link
                to="/my-profile"
                aria-label="My profile"
                className="header-avatar"
              >
                {user.email?.[0]?.toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="whitespace-nowrap text-[13px] font-semibold text-white"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="shrink-0 whitespace-nowrap rounded-full border border-white/40 bg-white px-6 py-3 text-[12px] font-bold text-[#32171a] transition hover:bg-[#f4eee6]"
              >
                Create Profile
              </Link>
            </>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="relative z-10 text-white lg:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="mobile-public-nav">
          {links.map(([label, to]) => (
            <Link onClick={() => setOpen(false)} to={to} key={to}>
              {label}
            </Link>
          ))}
          <Link
            onClick={() => setOpen(false)}
            to={user ? "/dashboard" : "/login"}
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
          {!user && (
            <Link onClick={() => setOpen(false)} to="/register">
              Create profile
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
