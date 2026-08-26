import { FadeIn } from "@/components/FadeIn";
import huntWizard from "@/assets/screenshots/hunt-wizard.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

export function SetupSection() {
  const { t } = useLanguage();
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">{t.setup.heading}</h2>
          <p className="mt-3 text-white/60 max-w-xl mx-auto">{t.setup.sub}</p>
        </FadeIn>
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 items-stretch">
          <FadeIn>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white h-full">
              <img src={huntWizard} alt={t.setup.huntWizardAlt} className="w-full block" />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="rounded-2xl border border-white/10 bg-bg-inset h-full p-6 flex flex-col justify-center gap-4">
              <div className="text-xs font-mono text-primary uppercase tracking-wide">{t.setup.liveRun}</div>
              {t.setup.niches.map((label, i) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{label}</span>
                  <span className="text-white/40 font-mono">{t.setup.nicheStatus[i]}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
