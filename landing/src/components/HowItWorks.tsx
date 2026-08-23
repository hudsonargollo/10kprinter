import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/ui/button";

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
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <h2 className="font-heading text-6xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white/25 to-white/5 select-none mb-16">
            How it works
          </h2>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-6">
          {STEPS.map((step, i) => (
            <FadeIn key={step.n} delay={i * 0.08}>
              <div className="rounded-2xl border border-white/10 bg-card p-8 h-full">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-bold font-mono">
                  {step.n}
                </span>
                <h3 className="mt-4 text-2xl font-heading font-semibold">{step.title}</h3>
                <p className="mt-3 text-white/60 leading-relaxed">{step.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.3} className="mt-12 flex justify-center gap-3">
          <Button asChild size="lg" className="h-11 px-6 rounded-full">
            <a href="#cta">Book a call</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 px-6 rounded-full border-white/15 bg-transparent">
            <a href="/app">View the dashboard</a>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
