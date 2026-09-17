import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANG_LABELS, type Lang } from "@/i18n/translations";
import { ArrowRight, Sparkles } from "lucide-react";

const LANGS: Lang[] = ["en", "pt", "es"];

export function Nav() {
  const { t, lang, setLang } = useLanguage();
  const LINKS = [
    { href: "#how-it-works", label: t.nav.links.howItWorks },
    { href: "#roi-calculator", label: "ROI Estimator" },
    { href: "#features", label: t.nav.links.features },
    { href: "#pricing", label: t.nav.links.pricing },
    { href: "#faq", label: t.nav.links.faq },
  ];

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#1e1726]/90 backdrop-blur-md px-3 py-1.5 shadow-2xl">
        <a href="/" className="flex items-center gap-2 pl-2 pr-2">
          <div className="w-5 h-5 rounded-md bg-[#e8ff5c] flex items-center justify-center text-black font-black text-xs">
            M
          </div>
          <span className="font-heading font-bold tracking-tight text-sm text-white">MoneyMachine</span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-0.5 rounded-full bg-white/5 p-0.5 ml-1" role="group" aria-label="Language">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`rounded-full px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                lang === l ? "bg-[#e8ff5c] text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>

        <Button asChild size="sm" className="rounded-full bg-[#e8ff5c] text-black hover:bg-[#d8ef4c] font-bold text-xs px-4 ml-1">
          <a href="/app" className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </a>
        </Button>
      </div>
    </header>
  );
}
