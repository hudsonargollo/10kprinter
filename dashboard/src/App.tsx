import { useEffect, useState } from "react";
import { LeadsBoard } from "./components/LeadsBoard";
import { LeadDetailView } from "./components/LeadDetail";

type Route = { name: "board" } | { name: "lead"; id: string };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const match = hash.match(/^leads\/([^/]+)$/);
  if (match) return { name: "lead", id: match[1] };
  return { name: "board" };
}

export function App() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div>
      <header className="app-header">
        <h1>
          10kPrinter <span className="subtitle">The Hudson System</span>
        </h1>
        {route.name !== "board" && (
          <a className="btn" href="#/">
            ← All leads
          </a>
        )}
      </header>
      <div className="container">
        {route.name === "board" ? <LeadsBoard /> : <LeadDetailView leadId={route.id} />}
      </div>
    </div>
  );
}
