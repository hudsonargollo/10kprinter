import { FadeIn } from "@/components/FadeIn";
import { useLanguage } from "@/i18n/LanguageContext";

export function ValueStrip() {
  const { t } = useLanguage();
  return (
    <section className="py-16 px-6 border-y border-white/10">
      <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {t.valueStrip.items.map((item, i) => (
          <FadeIn key={item.title} delay={i * 0.06}>
            <div className="h-1.5 w-8 rounded-full bg-primary mb-4" />
            <h4 className="font-heading font-semibold text-lg">{item.title}</h4>
            <p className="mt-2 text-sm text-white/60 leading-relaxed">{item.body}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
