import { useCallback, useEffect, useState } from "react";
import { createSource, deleteSource, listSources, runSourceNow, setSourceCronEnabled } from "../api";
import type { LeadSource } from "../types";
import { PlaceAutocomplete } from "./PlaceAutocomplete";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

      {error && (
        <div className="mb-4 rounded-lg border border-bad bg-bad/15 px-3.5 py-2.5 text-bad">
          {error}
        </div>
      )}

      {sources === null ? (
        <p className="py-10 text-center text-muted-foreground">Loading…</p>
      ) : sources.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          No lead sources configured yet — add a search query above (e.g. "advertising services in Maryland") to
          start autonomous discovery.
        </p>
      ) : (
        sources.map((source) => (
          <Card className="p-4.5" key={source.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{source.query}</div>
                <div className="text-xs text-muted-foreground">
                  {[source.region, source.category].filter(Boolean).join(" · ") || "no region/category"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Last run: {source.last_run_at ?? "never"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="flex-row font-normal normal-case">
                  <input
                    type="checkbox"
                    checked={!!source.cron_enabled}
                    onChange={(e) => setSourceCronEnabled(source.id, e.target.checked).then(refresh)}
                  />
                  Cron enabled
                </Label>
                <Button variant="outline" size="sm" disabled={running === source.id} onClick={() => onRunNow(source.id)}>
                  {running === source.id ? "Running…" : "Run now"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteSource(source.id).then(refresh)}>
                  Delete
                </Button>
              </div>
            </div>
            {runResults[source.id] && (
              <div className="mt-2.5 text-xs text-muted-foreground">{runResults[source.id]}</div>
            )}
          </Card>
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
    <form onSubmit={submit}>
      <Card className="mb-4 p-4.5">
        <h2 className="mb-3 font-heading text-[15px] font-bold">Add a lead source</h2>
        {error && (
          <div className="mb-4 rounded-lg border border-bad bg-bad/15 px-3.5 py-2.5 text-bad">
            {error}
          </div>
        )}
        <div className="mb-3 flex flex-col gap-1">
          <Label htmlFor="query">Search query</Label>
          <Input id="query" required placeholder="advertising services" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="mb-3 flex flex-col gap-1">
          <Label htmlFor="region">Region (optional)</Label>
          <PlaceAutocomplete id="region" placeholder="Maryland" value={region} onChange={setRegion} />
        </div>
        <div className="mb-3 flex flex-col gap-1">
          <Label htmlFor="category">Category tag (optional)</Label>
          <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add source"}
        </Button>
      </Card>
    </form>
  );
}
