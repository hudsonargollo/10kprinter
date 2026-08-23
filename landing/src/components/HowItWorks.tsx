import { FadeIn } from "@/components/FadeIn";

const STEPS = [
  {
    n: "01",
    title: "Hunt",
    body: "Point it at a city and a niche. It finds real local businesses with real websites — dentists, law firms, restaurants, whatever you sell into.",
  },
  {
    n: "02",
    title: "Audit",
    body: "Every site gets audited like a paid conversion consultant would: what's working, what's leaking revenue, and exactly how to fix it.",
  },
  {
    n: "03",
    title: "Price & Pitch",
    body: "Findings become a priced, itemized proposal automatically — no blank page, no guesswork on what to charge.",
  },
  {
    n: "04",
    title: "Close",
    body: "Track every lead through a real pipeline — hot/warm/cold scoring, notes, WhatsApp, and the deal size when it closes.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-32 px-6">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <h2 className="text-6xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white/25 to-white/5 select-none mb-16">
            How it works
          </h2>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-10">
          {STEPS.map((step, i) => (
            <FadeIn key={step.n} delay={i * 0.08}>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
                <span className="text-sm font-mono text-primary">{step.n}</span>
                <h3 className="mt-2 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-white/60 leading-relaxed">{step.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
