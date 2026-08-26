import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANG_LABELS, type Lang } from "@/i18n/translations";

const LANGS: Lang[] = ["en", "pt", "es"];

export function Nav() {
  const { t, lang, setLang } = useLanguage();
  const LINKS = [
    { href: "#how-it-works", label: t.nav.links.howItWorks },
    { href: "#features", label: t.nav.links.features },
    { href: "#pricing", label: t.nav.links.pricing },
    { href: "#faq", label: t.nav.links.faq },
  ];

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#211a29]/90 backdrop-blur-md px-2 py-2 shadow-2xl">
        <span className="font-heading font-bold tracking-tight pl-3 pr-2 text-sm">MoneyMachine</span>
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
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
              className={`rounded-full px-2.5 py-1 text-xs font-mono font-semibold transition-colors ${
                lang === l ? "bg-primary text-primary-foreground" : "text-white/50 hover:text-white"
              }`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full border-white/15 bg-transparent ml-1">
          <a href="/app">{t.nav.dashboard}</a>
        </Button>
        <Button asChild size="sm" className="rounded-full">
          <a href="#cta">{t.nav.bookCall}</a>
        </Button>
      </div>
    </header>
  );
}
