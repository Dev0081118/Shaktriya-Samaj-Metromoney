import { Eye, Fingerprint, LockKeyhole } from "lucide-react";

const privacyItems = [
  {
    icon: Eye,
    title: "Control your photographs",
    body: "Decide who can view personal photos instead of showing everything publicly.",
  },
  {
    icon: LockKeyhole,
    title: "Keep contact details private",
    body: "Mobile and WhatsApp details stay protected until the appropriate stage.",
  },
  {
    icon: Fingerprint,
    title: "Verified membership",
    body: "Verification and moderation help maintain a more trustworthy community.",
  },
];

export default function Privacy() {
  return (
    <section className="bg-[#641e25] py-28 text-white lg:py-36">
      <div className="page-container">
        <div className="grid gap-16 lg:grid-cols-2">
          <div className="max-w-xl">
            <p className="eyebrow text-[#d4a875]">
              Privacy is not premium.
            </p>

            <h2 className="mt-6 font-display text-[56px] leading-[0.98] sm:text-[70px]">
              Your story.
              <br />
              <span className="italic text-[#dab182]">
                Your control.
              </span>
            </h2>

            <p className="mt-8 max-w-md text-[15px] leading-8 text-white/60">
              Matrimonial information is deeply personal. Our platform is
              designed so that privacy is part of the foundation—not an
              afterthought.
            </p>
          </div>

          <div>
            {privacyItems.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex gap-6 border-t border-white/15 py-8"
              >
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className="mt-1 shrink-0 text-[#dfb782]"
                />

                <div>
                  <h3 className="font-display text-[26px]">
                    {title}
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-7 text-white/55">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}