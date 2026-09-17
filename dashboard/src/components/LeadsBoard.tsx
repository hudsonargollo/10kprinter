import { useCallback, useEffect, useRef, useState } from "react";
import { listLeads } from "../api";
import type { Lead, LeadStatus } from "../types";
import { STATUS_LABELS, STATUS_ORDER } from "../types";
import { NewLeadForm } from "./NewLeadForm";
import { PipelineProgressBar } from "./PipelineProgressBar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TIER_CLASS } from "@/lib/tier";

const IN_PROGRESS: LeadStatus[] = ["discovered", "scraping", "scraped", "audited"];
const SALES_COLUMNS = STATUS_ORDER.filter((s) => !IN_PROGRESS.includes(s));

export function LeadsBoard() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const refresh = useCallback(() => {
    listLeads()
      .then(setLeads)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load leads"));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const hasInProgress = leads?.some((l) => IN_PROGRESS.includes(l.status));
    if (hasInProgress) {
      pollRef.current = window.setInterval(refresh, 4000);
      return () => {
        if (pollRef.current) window.clearInterval(pollRef.current);
      };
    }
  }, [leads, refresh]);

  const inProgressLeads = leads?.filter((l) => IN_PROGRESS.includes(l.status)) ?? [];
  const salesColumns = SALES_COLUMNS.filter((s) => leads?.some((l) => l.status === s));

  function sortedByScore(items: Lead[]): Lead[] {
    return [...items].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  function LeadCard({ lead }: { lead: Lead }) {
    return (
      <a
        className="mb-2 block rounded-xl border border-white/10 bg-card p-3 hover:border-[#e8ff5c] transition-all hover:scale-[1.01] shadow-sm"
        href={`#/leads/${lead.id}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="mb-0.5 font-semibold text-sm text-white truncate">{lead.business_name || lead.url}</div>
          {lead.tier && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold border",
                TIER_CLASS[lead.tier]
              )}
            >
              {lead.score}
            </span>
          )}
        </div>
        <div className="truncate text-xs text-muted-foreground">{lead.url}</div>
      </a>
    );
  }

  return (
    <>
      <NewLeadForm onCreated={refresh} />

      {error && (
        <div className="mb-4 rounded-xl border border-bad bg-bad/15 px-4 py-3 text-bad text-xs font-mono">
          {error}
        </div>
      )}

      {leads === null ? (
        <p className="py-10 text-center text-muted-foreground font-mono text-xs">Loading leads…</p>
      ) : leads.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl p-8 bg-white/[0.01]">
          <p className="text-sm text-white/70 font-medium">No leads in the database yet</p>
          <p className="text-xs text-white/40 mt-1">Audit your first prospect above or launch the Hunt Wizard to discover leads automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-start gap-4">
          {inProgressLeads.length > 0 && (
            <Card className="min-h-20 gap-0 p-3 bg-card border-white/10">
              <h3 className="mb-2.5 ml-1 text-xs font-semibold tracking-wide text-[#e8ff5c] uppercase flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#e8ff5c] animate-pulse" />
                <span>In Progress ({inProgressLeads.length})</span>
              </h3>
              {inProgressLeads.map((lead) => (
                <a
                  className="mb-2.5 block rounded-xl border border-white/10 bg-background/80 p-3 hover:border-[#e8ff5c] transition-all space-y-2 shadow-sm"
                  key={lead.id}
                  href={`#/leads/${lead.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-white truncate">{lead.business_name || lead.url}</div>
                  </div>
                  <PipelineProgressBar status={lead.status} compact />
                </a>
              ))}
            </Card>
          )}
          {salesColumns.map((status) => (
            <Card className="min-h-20 gap-0 p-3 bg-card border-white/10" key={status}>
              <h3 className="mb-2.5 ml-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {STATUS_LABELS[status]} ({leads.filter((l) => l.status === status).length})
              </h3>
              {sortedByScore(leads.filter((l) => l.status === status)).map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
