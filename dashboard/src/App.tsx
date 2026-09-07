import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, MapPinned, Radar } from "lucide-react";
import { LeadsBoard } from "./components/LeadsBoard";
import { LeadDetailView } from "./components/LeadDetail";
import { SourcesView } from "./components/Sources";
import { HuntWizard } from "./components/HuntWizard";
import { Login } from "./components/Login";
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

  async function onLogout() {
    await logout();
    setUser(null);
  }

  if (user === undefined) return null;
  if (!user) return <Login onLoggedIn={setUser} />;

  return (
    <div>
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <h1 className="font-heading text-base font-bold tracking-tight">
          MoneyMachine <span className="font-sans font-normal text-muted-foreground">Ops</span>
        </h1>
        <div className="flex items-center gap-2">
          {route.name !== "board" && (
            <Button asChild variant="outline" size="sm">
              <a href="#/">
                <ArrowLeft /> All leads
              </a>
            </Button>
          )}
          {route.name !== "hunt" && (
            <Button asChild variant="outline" size="sm">
              <a href="#/hunt">
                <Radar /> Hunt Wizard
              </a>
            </Button>
          )}
          {route.name !== "sources" && (
            <Button asChild variant="outline" size="sm">
              <a href="#/sources">
                <MapPinned /> Lead sources
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut /> Sign out
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl p-6">
        {route.name === "board" && <LeadsBoard />}
        {route.name === "lead" && <LeadDetailView leadId={route.id} />}
        {route.name === "sources" && <SourcesView />}
        {route.name === "hunt" && <HuntWizard />}
      </div>
    </div>
  );
}
