import { useCallback, useEffect, useState } from "react";
import { createSource, deleteSource, listSources, runSourceNow, setSourceCronEnabled } from "../api";
import type { LeadSource } from "../types";
import { PlaceAutocomplete } from "./PlaceAutocomplete";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "../i18n/LanguageContext";

export function SourcesView() {
  const { t } = useLanguage();
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
        [id]: `${result.newLeadIds.length} ${t.sources.queuedSuccess} · ${result.skippedExisting} skipped · ${result.skippedNoWebsite} no website`,
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
        <p className="py-10 text-center text-muted-foreground text-sm">{t.sources.loading}</p>
      ) : sources.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground text-sm max-w-lg mx-auto">
          {t.sources.emptyDesc}
        </p>
      ) : (
        sources.map((source) => (
          <Card className="p-4 mb-3" key={source.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-foreground text-sm">{source.query}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {[source.region, source.category].filter(Boolean).join(" · ") || t.sources.noRegionCategory}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t.sources.lastRun} {source.last_run_at ?? t.sources.never}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="flex-row items-center gap-1.5 font-normal normal-case text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary size-4"
                    checked={!!source.cron_enabled}
                    onChange={(e) => setSourceCronEnabled(source.id, e.target.checked).then(refresh)}
                  />
                  {t.sources.cronEnabled}
                </Label>
                <Button variant="outline" size="sm" disabled={running === source.id} onClick={() => onRunNow(source.id)}>
                  {running === source.id ? t.sources.runningBtn : t.sources.runNowBtn}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteSource(source.id).then(refresh)} className="text-destructive hover:text-destructive">
                  {t.sources.deleteBtn}
                </Button>
              </div>
            </div>
            {runResults[source.id] && (
              <div className="mt-2.5 text-xs text-primary">{runResults[source.id]}</div>
            )}
          </Card>
        ))
      )}
    </>
  );
}

function NewSourceForm({ onCreated }: { onCreated: () => void }) {
  const { t } = useLanguage();
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
      <Card className="mb-4 p-4">
        <h2 className="mb-3 font-heading text-[15px] font-semibold text-foreground">{t.sources.addSource}</h2>
        {error && (
          <div className="mb-4 rounded-lg border border-bad bg-bad/15 px-3.5 py-2.5 text-bad">
            {error}
          </div>
        )}
        <div className="mb-3 flex flex-col gap-1.5">
          <Label htmlFor="query" className="text-xs text-muted-foreground">{t.sources.queryLabel}</Label>
          <Input id="query" required placeholder={t.sources.queryPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="mb-3 flex flex-col gap-1.5">
          <Label htmlFor="region" className="text-xs text-muted-foreground">{t.sources.regionLabel}</Label>
          <PlaceAutocomplete id="region" placeholder={t.sources.regionPlaceholder} value={region} onChange={setRegion} />
        </div>
        <div className="mb-3 flex flex-col gap-1.5">
          <Label htmlFor="category" className="text-xs text-muted-foreground">{t.sources.categoryLabel}</Label>
          <Input id="category" placeholder={t.sources.categoryPlaceholder} value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? t.sources.submitting : t.sources.submitAdd}
        </Button>
      </Card>
    </form>
  );
}
