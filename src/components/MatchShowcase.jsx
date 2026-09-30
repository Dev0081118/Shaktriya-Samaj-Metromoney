import { ArrowLeft, ArrowRight, BadgeCheck } from "lucide-react";

const profiles = [
  {
    name: "Rajveer",
    details: "28 • Rajkot",
    work: "Entrepreneur",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900",
  },
  {
    name: "Devika",
    details: "26 • Ahmedabad",
    work: "Architect",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900",
  },
  {
    name: "Yuvraj",
    details: "29 • Vadodara",
    work: "Business Owner",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900",
  },
];

export default function MatchShowcase() {
  return (
    <section className="overflow-hidden bg-[#1e1715] py-28 text-white">
      <div className="page-container">
        <div className="flex flex-col justify-between gap-8 border-b border-white/15 pb-10 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow text-[#c99f72]">
              Discover
            </p>

            <h2 className="mt-5 font-display text-[50px] leading-none sm:text-[64px]">
              Profiles with
              <span className="italic text-[#d5ad7c]"> intention.</span>
            </h2>
          </div>

          <div className="flex gap-2">
            <button className="round-control">
              <ArrowLeft size={17} />
            </button>

            <button className="round-control">
              <ArrowRight size={17} />
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {profiles.map((profile, index) => (
            <article
              key={profile.name}
              className={`profile-editorial ${index === 1 ? "md:mt-16" : ""}`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={profile.image}
                  alt=""
                  className="h-[500px] w-full object-cover transition duration-700 hover:scale-[1.025]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                <span className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur">
                  <BadgeCheck size={13} />
                  Verified
                </span>

                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h3 className="font-display text-[36px]">
                    {profile.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-3 text-[12px] text-white/70">
                    <span>{profile.details}</span>
                    <span className="h-1 w-1 rounded-full bg-white/40" />
                    <span>{profile.work}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <button className="border-b border-[#c99f72] pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d9b17f]">
            View all matches
          </button>
        </div>
      </div>
    </section>
  );
}