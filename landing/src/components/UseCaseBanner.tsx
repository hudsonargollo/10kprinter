import { FadeIn } from "@/components/FadeIn";
import { Badge } from "@/components/ui/badge";
import salesTab from "@/assets/screenshots/sales-tab.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

export function UseCaseBanner() {
  const { t } = useLanguage();
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="text-center mb-8">
          <Badge className="rounded-full bg-primary text-primary-foreground font-semibold">{t.useCase.badge}</Badge>
          <h2 className="mt-4 font-heading text-3xl md:text-4xl font-bold tracking-tight">{t.useCase.heading}</h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img src={salesTab} alt={t.useCase.salesAlt} className="w-full block" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
