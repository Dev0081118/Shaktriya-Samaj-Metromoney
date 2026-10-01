const steps = [
  {
    number: '01',
    title: 'Create',
    body: 'Build a meaningful profile for yourself, your son, daughter or family member.'
  },
  {
    number: '02',
    title: 'Discover',
    body: 'Explore people whose preferences and background meaningfully align.'
  },
  {
    number: '03',
    title: 'Express',
    body: 'Show matrimonial interest privately instead of exposing your contact information.'
  },
  {
    number: '04',
    title: 'Connect',
    body: 'When interest is mutual, families can comfortably take the conversation forward.'
  }
];

export default function Experience() {
  return (
    <section className="bg-[#eee5da] py-28 lg:py-36">
      <div className="page-container">
        <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow">How it works</p>

            <h2 className="mt-6 font-display text-[50px] leading-[1.02] text-[#271917]">
              Simple enough for everyone in the family.
            </h2>
          </div>

          <div>
            {steps.map((step) => (
              <div
                key={step.number}
                className="grid gap-4 border-t border-[#cab9a8] py-8 sm:grid-cols-[90px_180px_1fr]"
              >
                <span className="font-display text-[20px] italic text-[#a57c51]">
                  {step.number}
                </span>

                <h3 className="font-display text-[28px] text-[#281a18]">
                  {step.title}
                </h3>

                <p className="max-w-lg text-sm leading-7 text-[#77675e]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
