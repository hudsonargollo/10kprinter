import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, MapPinned, Radar, Search, Globe } from "lucide-react";
import { LeadsBoard } from "./components/LeadsBoard";
import { LeadDetailView } from "./components/LeadDetail";
import { SourcesView } from "./components/Sources";
import { HuntWizard } from "./components/HuntWizard";
import { Login } from "./components/Login";
import { CommandPalette } from "./components/CommandPalette";
import { Button } from "@/components/ui/button";
import { logout, me } from "./api";
import type { AuthUser } from "./types";
import { useLanguage } from "./i18n/LanguageContext";
import { LANG_LABELS, type Lang } from "./i18n/translations";

type Route = { name: "board" } | { name: "lead"; id: string } | { name: "sources" } | { name: "hunt" };

const LANGS: Lang[] = ["es", "en", "pt"];

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash === "sources") return { name: "sources" };
  if (hash === "hunt") return { name: "hunt" };
  const match = hash.match(/^leads\/([^/]+)$/);
  if (match) return { name: "lead", id: match[1] };
  return { name: "board" };
}

export function App() {
  const [route, setRoute] = useState<Route>(parseHash());
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined); // undefined = checking
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { t, lang, setLang } = useLanguage();

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null));
  }, []);

  // Global 'g' key chord navigation
  useEffect(() => {
    let lastKey = "";
    let timeout: number | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (lastKey === "g") {
        if (e.key.toLowerCase() === "b") {
          e.preventDefault();
          window.location.hash = "#/";
        } else if (e.key.toLowerCase() === "h") {
          e.preventDefault();
          window.location.hash = "#/hunt";
        } else if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          window.location.hash = "#/sources";
        }
        lastKey = "";
        return;
      }

      if (e.key.toLowerCase() === "g") {
        lastKey = "g";
        if (timeout) window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          lastKey = "";
        }, 800);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function onLogout() {
    await logout();
    setUser(null);
  }

  if (user === undefined) return null;
  if (!user) return <Login onLoggedIn={setUser} />;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border bg-card/90 backdrop-blur-md px-4 py-3 shadow-md sm:px-6">
        <div className="flex items-center gap-4">
          <a href="#/" className="flex items-center gap-2 group cursor-pointer">
            <div className="size-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs group-hover:scale-105 transition-transform">
              M
            </div>
            <h1 className="font-heading text-sm font-semibold tracking-tight text-foreground flex items-center gap-1.5">
              {t.nav.title} <span className="text-[11px] text-primary px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">{t.nav.proBadge}</span>
            </h1>
          </a>

          {/* Linear-Style Search / Command Palette Trigger */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Search className="size-3.5" />
            <span>{t.nav.searchPlaceholder}</span>
            <kbd className="px-1.5 py-0.5 text-[10px] text-muted-foreground bg-muted rounded-md">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Global Language Selector */}
          <div className="flex items-center gap-0.5 rounded-full bg-secondary p-0.5 mr-1" role="group" aria-label="Language">
            <Globe className="size-3 text-muted-foreground ml-1.5 mr-0.5" />
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>

          {route.name !== "board" && (
            <Button asChild variant="outline" size="sm">
              <a href="#/" className="flex items-center gap-1.5">
                <ArrowLeft className="size-3.5" /> <span className="hidden sm:inline">{t.nav.allLeads}</span>
              </a>
            </Button>
          )}
          {route.name !== "hunt" && (
            <Button asChild size="sm">
              <a href="#/hunt" className="flex items-center gap-1.5">
                <Radar className="size-3.5" /> <span className="hidden sm:inline">{t.nav.huntWizard}</span>
              </a>
            </Button>
          )}
          {route.name !== "sources" && (
            <Button asChild variant="outline" size="sm">
              <a href="#/sources" className="flex items-center gap-1.5">
                <MapPinned className="size-3.5" /> <span className="hidden sm:inline">{t.nav.sources}</span>
              </a>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="size-3.5" /> {t.nav.signOut}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        {route.name === "board" && <LeadsBoard />}
        {route.name === "lead" && <LeadDetailView leadId={route.id} />}
        {route.name === "sources" && <SourcesView />}
        {route.name === "hunt" && <HuntWizard />}
      </main>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
