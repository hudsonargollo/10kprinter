import { useEffect, useState } from "react";
import { LeadsBoard } from "./components/LeadsBoard";
import { LeadDetailView } from "./components/LeadDetail";
import { SourcesView } from "./components/Sources";
import { HuntWizard } from "./components/HuntWizard";
import { Login } from "./components/Login";
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
      <header className="app-header">
        <h1>
          MoneyMachine <span className="subtitle">Ops</span>
        </h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {route.name !== "board" && (
            <a className="btn" href="#/">
              ← All leads
            </a>
          )}
          {route.name !== "hunt" && (
            <a className="btn" href="#/hunt">
              Hunt Wizard
            </a>
          )}
          {route.name !== "sources" && (
            <a className="btn" href="#/sources">
              Lead sources
            </a>
          )}
          <button className="btn" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>
      <div className="container">
        {route.name === "board" && <LeadsBoard />}
        {route.name === "lead" && <LeadDetailView leadId={route.id} />}
        {route.name === "sources" && <SourcesView />}
        {route.name === "hunt" && <HuntWizard />}
      </div>
    </div>
  );
}
