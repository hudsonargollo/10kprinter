import { useCallback, useEffect, useState } from "react";
import { buildProposalSite, getWebsiteBuild, listWebsiteBuilds, publishWebsiteBuild } from "../../api";
import type { WebsiteBuild } from "../../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "../../i18n/LanguageContext";

const IN_FLIGHT = ["queued", "planning", "building", "publishing"];
const STATUS_COLOR: Record<string, string> = {
  queued: "#8b9ab5",
  planning: "#38bdf8",
  building: "#38bdf8",
  ready: "#e8ff5c",
  publishing: "#38bdf8",
  live: "#34d399",
  failed: "#f87171",
};

export function WebsiteBuildsPanel({ leadId }: { leadId: string }) {
  const { t } = useLanguage();
  const L = t.websiteBuilds;
  const [builds, setBuilds] = useState<WebsiteBuild[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusLabel: Record<string, string> = {
    queued: L.queued,
    planning: L.planning,
    building: L.building,
    ready: L.ready,
    publishing: L.publishing,
    live: L.live,
    failed: L.failed,
  };

  const load = useCallback(() => {
    listWebsiteBuilds(leadId)
      .then((r) => setBuilds(r.builds))
      .catch(() => {});
  }, [leadId]);

  useEffect(() => {
    load();
  }, [load]);

  const hasActive = builds.some((b) => b.krikkit_build_id && IN_FLIGHT.includes(b.status));

  // Poll in-flight builds: the list endpoint reads local rows only, so hit the
  // single-build endpoint (which refreshes from Krikkit) before reloading.
  useEffect(() => {
    if (!hasActive) return;
    const id = window.setInterval(async () => {
      try {
        const r = await listWebsiteBuilds(leadId);
        const active = r.builds.filter((b) => b.krikkit_build_id && IN_FLIGHT.includes(b.status));
        await Promise.all(active.map((b) => getWebsiteBuild(b.id).catch(() => null)));
        const fresh = active.length > 0 ? await listWebsiteBuilds(leadId) : r;
        setBuilds(fresh.builds);
      } catch {
        // transient; keep last known state
      }
    }, 4000);
    return () => window.clearInterval(id);
  }, [hasActive, leadId]);

  async function trigger() {
    setBusy(true);
    setError(null);
    try {
      await buildProposalSite(leadId);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : L.buildError);
    } finally {
      setBusy(false);
    }
  }

  async function publish(b: WebsiteBuild) {
    setBusy(true);
    setError(null);
    try {
      await publishWebsiteBuild(b.id, b.subdomain ?? undefined);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : L.buildError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-4 p-4.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-[15px] font-bold">{L.title}</h2>
          <p className="mt-[-6px] text-[13px] text-muted-foreground">{L.desc}</p>
        </div>
        <Button onClick={trigger} disabled={busy} size="sm" className="shrink-0">
          {busy ? L.working : L.build}
        </Button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-bad bg-bad/15 px-3 py-2 text-xs text-bad">{error}</div>
      )}

      {builds.length === 0 ? (
        <p className="py-6 text-center font-mono text-xs text-muted-foreground">{L.noBuilds}</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {builds.map((b) => {
            const active = !!b.krikkit_build_id && IN_FLIGHT.includes(b.status);
            return (
              <div key={b.id} className="rounded-lg border border-border px-2.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ background: STATUS_COLOR[b.status] ?? "#8b9ab5" }}
                    />
                    <span className="text-xs font-medium">{statusLabel[b.status] ?? b.status}</span>
                    {b.subdomain && (
                      <span className="truncate font-mono text-[11px] text-muted-foreground">{b.subdomain}</span>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {b.status === "ready" && (
                      <Button size="sm" onClick={() => publish(b)} disabled={busy}>
                        {L.publish}
                      </Button>
                    )}
                    {b.status === "live" && b.live_url && (
                      <Button asChild variant="outline" size="sm">
                        <a href={b.live_url} target="_blank" rel="noreferrer">
                          {L.openLive}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                {active && <p className="mt-1 text-[11px] text-muted-foreground">{L.inProgress}</p>}
                {b.status === "failed" && b.last_error && (
                  <p className="mt-1 break-words text-[11px] text-bad">{b.last_error}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}