import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";
import { useLanguage } from "@/i18n/LanguageContext";

export function CTA() {
  const { t } = useLanguage();
  return (
    <section id="cta" className="relative pt-32 pb-16 px-6 border-t border-white/10">
      <div className="mx-auto max-w-2xl text-center">
        <FadeIn>
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">{t.cta.heading}</h2>
          <p className="mt-4 text-lg text-white/60">{t.cta.sub}</p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-11 px-6 text-base rounded-full">
              <a href="mailto:hudson@tektone.com.br">{t.cta.bookCall}</a>
            </Button>
          </div>
        </FadeIn>
      </div>

      <div className="mt-28 select-none">
        <p className="font-heading text-center font-extrabold tracking-tight leading-[0.9] text-[10vw] md:text-[7vw] bg-clip-text text-transparent bg-gradient-to-b from-white/20 to-white/0">
          {t.cta.bigLine1}
          <br />
          {t.cta.bigLine2}
        </p>
      </div>

      <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40 border-t border-white/10 pt-8 max-w-6xl mx-auto">
        <span>MoneyMachine</span>
        <div className="flex gap-6">
          <a href="#how-it-works" className="hover:text-white/70">{t.cta.footer.howItWorks}</a>
          <a href="#pricing" className="hover:text-white/70">{t.cta.footer.pricing}</a>
          <a href="#faq" className="hover:text-white/70">{t.cta.footer.faq}</a>
          <a href="/app" className="hover:text-white/70">{t.cta.footer.dashboard}</a>
        </div>
      </div>
    </section>
  );
}
