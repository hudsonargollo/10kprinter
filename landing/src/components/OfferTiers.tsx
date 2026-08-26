import { FadeIn } from "@/components/FadeIn";
import { useLanguage } from "@/i18n/LanguageContext";

const TONES = ["bg-white/[0.03]", "bg-white/[0.03]", "bg-white/[0.03]", "bg-primary text-primary-foreground"];

export function OfferTiers() {
  const { t } = useLanguage();
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight">{t.offerTiers.heading}</h2>
          <p className="mt-3 text-white/60 max-w-xl mx-auto">{t.offerTiers.sub}</p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.offerTiers.tiers.map((tier, i) => (
            <FadeIn key={tier.name} delay={i * 0.06}>
              <div className={`rounded-2xl p-6 h-full flex flex-col ${TONES[i]}`}>
                <div className="text-sm font-medium opacity-70">{tier.name}</div>
                <div className="mt-2 font-heading text-3xl font-bold">{tier.price}</div>
                <p className="mt-3 text-sm opacity-70 leading-relaxed flex-1">{tier.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
