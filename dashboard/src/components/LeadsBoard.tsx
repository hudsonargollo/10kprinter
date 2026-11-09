import { useCallback, useEffect, useRef, useState } from "react";
import { listLeads } from "../api";
import type { Lead, LeadStatus } from "../types";
import { STATUS_ORDER } from "../types";
import { NewLeadForm } from "./NewLeadForm";
import { HuntWizard } from "./HuntWizard";
import { PipelineProgressBar } from "./PipelineProgressBar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TIER_CLASS } from "@/lib/tier";
import { Radar, Plus, Filter } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

const IN_PROGRESS: LeadStatus[] = ["discovered", "scraping", "scraped", "audited"];
const SALES_COLUMNS = STATUS_ORDER.filter((s) => !IN_PROGRESS.includes(s));

export function LeadsBoard() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeActionTab, setActiveActionTab] = useState<"hunt" | "single" | "none">("hunt");
  const [filterTier, setFilterTier] = useState<"all" | "hot" | "warm" | "cold">("all");
  const pollRef = useRef<number | null>(null);
  const { t } = useLanguage();

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
      pollRef.current = window.setInterval(refresh, 3500);
      return () => {
        if (pollRef.current) window.clearInterval(pollRef.current);
      };
    }
  }, [leads, refresh]);

  const filteredLeads = leads?.filter((l) => filterTier === "all" || l.tier === filterTier) ?? [];
  const inProgressLeads = filteredLeads.filter((l) => IN_PROGRESS.includes(l.status));
  const salesColumns = SALES_COLUMNS.filter((s) => filteredLeads.some((l) => l.status === s));

  // Quick stats
  const totalCount = leads?.length ?? 0;
  const hotCount = leads?.filter((l) => l.tier === "hot").length ?? 0;
  const inProgressCount = leads?.filter((l) => IN_PROGRESS.includes(l.status)).length ?? 0;

  function sortedByScore(items: Lead[]): Lead[] {
    return [...items].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  function LeadCard({ lead }: { lead: Lead }) {
    return (
      <a
        className="mb-2.5 block rounded-2xl border border-border bg-background/60 p-3 hover:border-primary transition-all hover:scale-[1.01] shadow-sm group"
        href={`#/leads/${lead.id}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="mb-0.5 font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
            {lead.business_name || lead.url}
          </div>
          {lead.tier && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                TIER_CLASS[lead.tier]
              )}
            >
              {lead.score}
            </span>
          )}
        </div>
        <div className="truncate text-[11px] text-muted-foreground mt-0.5">{lead.url}</div>
      </a>
    );
  }

  return (
    <div className="space-y-6">
      {/* Front Page Action Center: Hunt Wizard & Quick Audit */}
      <div className="space-y-4">
        {/* Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border">
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-full">
            <button
              onClick={() => setActiveActionTab(activeActionTab === "hunt" ? "none" : "hunt")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeActionTab === "hunt"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Radar className="size-3.5" />
              <span>{t.board.actionHunt}</span>
            </button>

            <button
              onClick={() => setActiveActionTab(activeActionTab === "single" ? "none" : "single")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeActionTab === "single"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plus className="size-3.5" />
              <span>{t.board.actionSingle}</span>
            </button>
          </div>

          {/* Metrics summary */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{t.board.total}: <strong className="text-foreground">{totalCount}</strong></span>
            <span>🔥 {t.board.hot}: <strong className="text-rose-400">{hotCount}</strong></span>
            {inProgressCount > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <span className="size-1.5 rounded-full bg-primary animate-ping" />
                {t.board.active}: <strong>{inProgressCount}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Embedded Front-Page Hunt Wizard */}
        {activeActionTab === "hunt" && (
          <HuntWizard onLeadDiscovered={refresh} />
        )}

        {/* Embedded Single Lead Form */}
        {activeActionTab === "single" && (
          <NewLeadForm onCreated={refresh} />
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-bad bg-bad/15 px-4 py-3 text-bad text-xs">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <h2 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
          <span>{t.board.title}</span>
          <span className="text-xs text-muted-foreground">({filteredLeads.length})</span>
        </h2>

        <div className="flex items-center gap-1 bg-secondary p-1 rounded-full text-xs">
          <Filter className="size-3 text-muted-foreground ml-1.5 mr-0.5" />
          <button
            onClick={() => setFilterTier("all")}
            className={`px-2.5 py-1 rounded-full uppercase text-[10px] font-bold transition-colors cursor-pointer ${
              filterTier === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.board.filterAll}
          </button>
          <button
            onClick={() => setFilterTier("hot")}
            className={`px-2.5 py-1 rounded-full uppercase text-[10px] font-bold transition-colors cursor-pointer ${
              filterTier === "hot" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.board.filterHot}
          </button>
          <button
            onClick={() => setFilterTier("warm")}
            className={`px-2.5 py-1 rounded-full uppercase text-[10px] font-bold transition-colors cursor-pointer ${
              filterTier === "warm" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.board.filterWarm}
          </button>
          <button
            onClick={() => setFilterTier("cold")}
            className={`px-2.5 py-1 rounded-full uppercase text-[10px] font-bold transition-colors cursor-pointer ${
              filterTier === "cold" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.board.filterCold}
          </button>
        </div>
      </div>

      {/* Leads Columns */}
      {leads === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 opacity-60 space-y-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-16 bg-muted rounded-xl" />
              <div className="h-16 bg-muted rounded-xl" />
            </Card>
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-2xl p-8">
          <p className="text-sm text-foreground font-medium">{t.board.emptyTitle}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.board.emptyDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-start gap-4">
          {inProgressLeads.length > 0 && (
            <Card className="min-h-20 gap-0 p-3">
              <h3 className="mb-2.5 ml-1 text-xs font-semibold tracking-wide text-primary uppercase flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-primary animate-pulse" />
                <span>{t.board.inProgress} ({inProgressLeads.length})</span>
              </h3>
              {inProgressLeads.map((lead) => (
                <a
                  className="mb-2.5 block rounded-2xl border border-border bg-background/60 p-3 hover:border-primary transition-all space-y-2 shadow-sm"
                  key={lead.id}
                  href={`#/leads/${lead.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-xs text-foreground truncate">{lead.business_name || lead.url}</div>
                  </div>
                  <PipelineProgressBar
                    status={lead.status}
                    auditCount={lead.audit_count}
                    prdCount={lead.prd_count}
                    lastError={lead.last_error}
                    compact
                  />
                </a>
              ))}
            </Card>
          )}
          {salesColumns.map((status) => (
            <Card className="min-h-20 gap-0 p-3" key={status}>
              <h3 className="mb-2.5 ml-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t.status[status] || status} ({filteredLeads.filter((l) => l.status === status).length})
              </h3>
              {sortedByScore(filteredLeads.filter((l) => l.status === status)).map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
