import { useCallback, useEffect, useState } from "react";
import { createSource, deleteSource, listSources, runSourceNow, setSourceCronEnabled } from "../api";
import type { LeadSource } from "../types";

export function SourcesView() {
  const [sources, setSources] = useState<LeadSource[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [runResults, setRunResults] = useState<Record<string, string>>({});
  const [running, setRunning] = useState<string | null>(null);

  const refresh = useCallback(() => {
    listSources()
      .then(setSources)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load sources"));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onRunNow(id: string) {
    setRunning(id);
    try {
      const result = await runSourceNow(id);
      setRunResults((prev) => ({
        ...prev,
        [id]: `${result.newLeadIds.length} new lead(s) queued · ${result.skippedExisting} already known · ${result.skippedNoWebsite} skipped (no website)`,
      }));
      refresh();
    } catch (err) {
      setRunResults((prev) => ({ ...prev, [id]: err instanceof Error ? err.message : "Run failed" }));
    } finally {
      setRunning(null);
    }
  }

  return (
    <>
      <NewSourceForm onCreated={refresh} />

      {error && <div className="error-banner">{error}</div>}

      {sources === null ? (
        <p className="empty-state">Loading…</p>
      ) : sources.length === 0 ? (
        <p className="empty-state">
          No lead sources configured yet — add a search query above (e.g. "advertising services in Maryland") to
          start autonomous discovery.
        </p>
      ) : (
        sources.map((source) => (
          <div className="card" key={source.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{source.query}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  {[source.region, source.category].filter(Boolean).join(" · ") || "no region/category"}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
                  Last run: {source.last_run_at ?? "never"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={!!source.cron_enabled}
                    onChange={(e) => setSourceCronEnabled(source.id, e.target.checked).then(refresh)}
                  />
                  Cron enabled
                </label>
                <button className="btn" disabled={running === source.id} onClick={() => onRunNow(source.id)}>
                  {running === source.id ? "Running…" : "Run now"}
                </button>
                <button className="btn" onClick={() => deleteSource(source.id).then(refresh)}>
                  Delete
                </button>
              </div>
            </div>
            {runResults[source.id] && (
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>{runResults[source.id]}</div>
            )}
          </div>
        ))
      )}
    </>
  );
}

function NewSourceForm({ onCreated }: { onCreated: () => void }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query) return;
    setSubmitting(true);
    setError(null);
    try {
      await createSource({ query, region: region || undefined, category: category || undefined });
      setQuery("");
      setRegion("");
      setCategory("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create source");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Add a lead source</h2>
      {error && <div className="error-banner">{error}</div>}
      <div className="form-row">
        <label htmlFor="query">Search query</label>
        <input id="query" required placeholder="advertising services" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="region">Region (optional)</label>
        <input id="region" placeholder="Maryland" value={region} onChange={(e) => setRegion(e.target.value)} />
      </div>
      <div className="form-row">
        <label htmlFor="category">Category tag (optional)</label>
        <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Adding…" : "Add source"}
      </button>
    </form>
  );
}
