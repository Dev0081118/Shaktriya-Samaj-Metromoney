import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeritageIntro() {
  return (
    <section className="relative bg-[#f4efe8] pb-28 pt-20 lg:pb-36 lg:pt-28">
      <div className="page-container">
        <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-28">
          {/* ================= IMAGE SIDE ================= */}
          <div className="relative mx-auto w-full max-w-[500px] lg:mx-0">
            <div className="arch-image overflow-hidden">
              <img
                src="https://i.pinimg.com/originals/d0/23/0b/d0230ba0d769eeb3319158428c3c3fda.jpg"
                loading="lazy"
                alt="Rajput heritage architecture"
                className="h-[520px] w-full object-cover sm:h-[600px] lg:h-[650px]"
              />
            </div>

            {/* Vertical accent */}
            <div className="absolute -left-10 top-[95px] hidden lg:block">
              <div className="mx-auto h-[82px] w-px bg-[#b89771]/60" />

              <span className="mt-5 block -rotate-90 whitespace-nowrap text-[8px] font-extrabold uppercase tracking-[0.32em] text-[#9b7958]">
                Heritage & Connection
              </span>
            </div>

            {/* Decorative square */}
            <div className="absolute -bottom-6 -right-6 hidden h-36 w-36 border border-[#af885d]/30 xl:block" />
          </div>

          {/* ================= TEXT SIDE ================= */}
          <div className="max-w-[680px]">
            <p className="eyebrow">Beyond a matrimonial listing</p>

            <h2 className="mt-7 font-display text-[47px] leading-[1.02] tracking-[-0.035em] text-[#291a17] sm:text-[57px] lg:text-[65px]">
              Families deserve something more thoughtful than a database.
            </h2>

            <div className="mt-10 h-px w-full bg-[#d2c3b3]" />

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <p className="text-[14px] leading-7 text-[#77675e]">
                We are building a curated environment where genuine matrimonial
                intent, family participation and privacy come before endless
                browsing.
              </p>

              <p className="text-[14px] leading-7 text-[#77675e]">
                Every profile tells more than basic information—education,
                career, family, values and partner preferences together create a
                more meaningful introduction.
              </p>
            </div>

            <Link
              to="/about"
              className="group mt-10 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#741f27]"
            >
              Our approach
              <ArrowUpRight
                size={15}
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
