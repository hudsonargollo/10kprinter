import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, MapPinned, Radar, Search } from "lucide-react";
import { LeadsBoard } from "./components/LeadsBoard";
import { LeadDetailView } from "./components/LeadDetail";
import { SourcesView } from "./components/Sources";
import { HuntWizard } from "./components/HuntWizard";
import { Login } from "./components/Login";
import { CommandPalette } from "./components/CommandPalette";
import { Button } from "@/components/ui/button";
import { logout, me } from "./api";
import type { AuthUser } from "./types";

type Route = { name: "board" } | { name: "lead"; id: string } | { name: "sources" } | { name: "hunt" };

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
    <div className="min-h-screen bg-[#0e0a14] text-foreground font-sans selection:bg-[#e8ff5c] selection:text-black">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#161020]/90 backdrop-blur-md px-6 py-3 shadow-md">
        <div className="flex items-center gap-4">
          <a href="#/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-6 h-6 rounded-lg bg-[#e8ff5c] flex items-center justify-center text-black font-black text-xs group-hover:scale-105 transition-transform">
              M
            </div>
            <h1 className="font-heading text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              MoneyMachine <span className="font-mono text-[11px] font-normal text-[#e8ff5c] px-1.5 py-0.2 rounded bg-[#e8ff5c]/10 border border-[#e8ff5c]/20">PRO</span>
            </h1>
          </a>

          {/* Linear-Style Search / Command Palette Trigger */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search or command...</span>
            <kbd className="px-1.5 py-0.2 text-[10px] font-mono text-white/40 bg-white/5 rounded border border-white/10">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {route.name !== "board" && (
            <Button asChild variant="outline" size="sm" className="h-8 text-xs border-white/15 bg-white/5 text-white hover:bg-white/10">
              <a href="#/" className="flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> All leads
              </a>
            </Button>
          )}
          {route.name !== "hunt" && (
            <Button asChild variant="outline" size="sm" className="h-8 text-xs border-white/15 bg-white/5 text-white hover:bg-[#e8ff5c] hover:text-black transition-colors">
              <a href="#/hunt" className="flex items-center gap-1.5">
                <Radar className="w-3.5 h-3.5" /> Hunt Wizard
              </a>
            </Button>
          )}
          {route.name !== "sources" && (
            <Button asChild variant="outline" size="sm" className="h-8 text-xs border-white/15 bg-white/5 text-white hover:bg-white/10">
              <a href="#/sources" className="flex items-center gap-1.5">
                <MapPinned className="w-3.5 h-3.5" /> Sources
              </a>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onLogout} className="h-8 text-xs text-white/60 hover:text-rose-400">
            <LogOut className="w-3.5 h-3.5 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        {route.name === "board" && <LeadsBoard />}
        {route.name === "lead" && <LeadDetailView leadId={route.id} />}
        {route.name === "sources" && <SourcesView />}
        {route.name === "hunt" && <HuntWizard />}
      </main>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
