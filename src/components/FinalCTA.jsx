import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function FinalCTA() {
  return (
    <section className="bg-[#201615] text-white">
      <div className="page-container border-x border-white/10 px-7 py-28 text-center sm:px-12 lg:py-36">
        <p className="eyebrow text-[#c89c6d]">
          Registration is free
        </p>

        <h2 className="mx-auto mt-7 max-w-[850px] font-display text-[58px] leading-[0.98] sm:text-[74px]">
          Perhaps someone’s beginning
          <span className="italic text-[#d1a979]"> starts here.</span>
        </h2>

        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-white/55">
          Create a profile, tell us what truly matters to you, and discover
          suitable matrimonial connections in a private environment.
        </p>

        <Link to="/register" className="mx-auto mt-10 flex w-fit items-center gap-4 rounded-full bg-[#eee5da] px-8 py-4 text-[12px] font-bold text-[#301819]">
          Create Free Profile
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
