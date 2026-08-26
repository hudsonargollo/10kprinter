import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

export function HowItWorks() {
  const { t } = useLanguage();
  return (
    <section id="how-it-works" className="relative py-32 px-6">
      <div className="mx-auto max-w-5xl">
        <FadeIn>
          <h2 className="font-heading text-6xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white/25 to-white/5 select-none mb-16">
            {t.howItWorks.heading}
          </h2>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-6">
          {t.howItWorks.steps.map((step, i) => (
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
            <a href="#cta">{t.howItWorks.bookCall}</a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 px-6 rounded-full border-white/15 bg-transparent">
            <a href="/app">{t.howItWorks.viewDashboard}</a>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
