import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/FadeIn";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  const { t } = useLanguage();
  return (
    <section id="cta" className="relative pt-32 pb-16 px-6 border-t border-white/10">
      <div className="mx-auto max-w-2xl text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8ff5c]/10 border border-[#e8ff5c]/25 text-[#e8ff5c] text-xs font-mono font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>START HUNTING TODAY</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white">{t.cta.heading}</h2>
          <p className="mt-4 text-lg text-white/60">{t.cta.sub}</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
            <Button asChild size="lg" className="h-12 px-8 text-base rounded-full bg-[#e8ff5c] text-black font-bold hover:bg-[#d8ef4c] shadow-lg shadow-[#e8ff5c]/20">
              <a href="/app" className="flex items-center gap-2">
                <span>Launch App Free</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base rounded-full border-white/15 bg-white/[0.03] text-white hover:bg-white/10">
              <a href="mailto:hudson@tektone.com.br">Contact Hudson</a>
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
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#e8ff5c] text-black font-bold text-[10px] flex items-center justify-center">M</div>
          <span className="font-semibold text-white/80">MoneyMachine</span>
          <span className="text-xs text-white/40">by ClubeMkt</span>
        </div>
        <div className="flex gap-6 text-xs">
          <a href="#how-it-works" className="hover:text-white/70 transition-colors">{t.cta.footer.howItWorks}</a>
          <a href="#roi-calculator" className="hover:text-white/70 transition-colors">ROI Calculator</a>
          <a href="#pricing" className="hover:text-white/70 transition-colors">{t.cta.footer.pricing}</a>
          <a href="#faq" className="hover:text-white/70 transition-colors">{t.cta.footer.faq}</a>
          <a href="/app" className="hover:text-[#e8ff5c] text-white font-medium transition-colors">{t.cta.footer.dashboard}</a>
        </div>
      </div>
    </section>
  );
}
