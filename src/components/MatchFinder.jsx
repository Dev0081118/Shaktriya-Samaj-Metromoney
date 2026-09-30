import {
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";

const fields = [
  {
    label: "Profile created for",
    value: "Myself",
  },
  {
    label: "Looking for",
    value: "Bride",
  },
  {
    label: "Age",
    value: "24 – 30",
  },
  {
    label: "Location",
    value: "Gujarat",
  },
];

export default function MatchFinder() {
  return (
    <div className="page-container">
      <div className="grid overflow-hidden rounded-[3px] border border-[#dfd3c6] bg-[#f8f3ec] shadow-[0_22px_55px_rgba(46,24,19,.14)] md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1fr_0.95fr]">
        {fields.map((field) => (
          <FinderField
            key={field.label}
            label={field.label}
            value={field.value}
          />
        ))}

        <button className="group flex min-h-[104px] items-center justify-between bg-[#7a2028] px-8 text-white transition duration-200 hover:bg-[#641920] md:col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]">
            Find Matches
          </span>

          <ArrowUpRight
            size={18}
            className="transition duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </button>
      </div>
    </div>
  );
}

function FinderField({ label, value }) {
  return (
    <button className="group flex min-h-[104px] items-center justify-between border-b border-[#dfd3c6] px-7 text-left transition duration-200 hover:bg-white md:border-r lg:border-b-0">
      <div>
        <span className="block text-[9px] font-extrabold uppercase tracking-[0.17em] text-[#9a816c]">
          {label}
        </span>

        <span className="mt-3 block font-display text-[23px] font-medium leading-none text-[#33221e]">
          {value}
        </span>
      </div>

      <ChevronDown
        size={14}
        className="ml-4 shrink-0 text-[#a18b78] transition duration-200 group-hover:translate-y-0.5"
      />
    </button>
  );
}