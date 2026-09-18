import { useCallback, useEffect, useRef, useState } from "react";
import { getLead, retryLead, updateLeadStatus } from "../api";
import type { LeadDetail as LeadDetailData, LeadStatus } from "../types";
import { STATUS_ORDER } from "../types";
import { TIER_CLASS } from "@/lib/tier";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PipelineProgressBar } from "./PipelineProgressBar";
import { OfferTab } from "./lead-detail/OfferTab";
import { SalesTab } from "./lead-detail/SalesTab";
import { OverviewTab } from "./lead-detail/OverviewTab";
import { AuditsTab } from "./lead-detail/AuditsTab";
import { PrdsTab } from "./lead-detail/PrdsTab";
import { TimelineTab } from "./lead-detail/TimelineTab";

import { useLanguage } from "../i18n/LanguageContext";

const IN_PROGRESS: LeadStatus[] = ["discovered", "scraping", "scraped", "audited"];

type Tab = "offer" | "sales" | "overview" | "audits" | "prds" | "timeline";

const TAB_KEYS: Record<string, Tab> = {
  "1": "offer",
  "2": "sales",
  "3": "overview",
  "4": "audits",
  "5": "prds",
  "6": "timeline",
};

export function LeadDetailView({ leadId }: { leadId: string }) {
  const [data, setData] = useState<LeadDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("offer");
  const pollRef = useRef<number | null>(null);
  const { t } = useLanguage();

  const refresh = useCallback(() => {
    getLead(leadId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load lead"));
  }, [leadId]);

  useEffect(() => {
    setData(null);
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (data && IN_PROGRESS.includes(data.lead.status)) {
      pollRef.current = window.setInterval(refresh, 3500);
      return () => {
        if (pollRef.current) window.clearInterval(pollRef.current);
      };
    }
  }, [data, refresh]);

  // Keyboard shortcut listener for tabs 1-6
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if (TAB_KEYS[e.key]) {
        e.preventDefault();
        setTab(TAB_KEYS[e.key]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (error)
    return <div className="mb-4 rounded-lg border border-bad bg-bad/15 px-3.5 py-2.5 text-bad">{error}</div>;
  if (!data) return <p className="py-10 text-center text-muted-foreground font-mono text-xs">{t.leadDetail.loading}</p>;

  const { lead, scrapes, audits, prds, proposals, events } = data;
  const latestScrape = scrapes[scrapes.length - 1];
  const latestErrorEvent = events.filter((e) => e.status === "failed").slice(-1)[0];

  async function onStatusChange(status: LeadStatus) {
    await updateLeadStatus(leadId, status);
    refresh();
  }

  return (
    <>
      <div className="mb-4 rounded-xl bg-card p-4.5 ring-1 ring-foreground/10 border border-white/5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="mb-1 font-heading text-[15px] font-bold text-white">{lead.business_name || lead.url}</h2>
            <a href={lead.url} target="_blank" rel="noreferrer" className="text-[13px] text-muted-foreground hover:text-white transition-colors">
              {lead.url}
            </a>
          </div>
          <div className="flex items-center gap-2">
            {lead.tier && (
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold border", TIER_CLASS[lead.tier])}>
                {t.tier[lead.tier]} · {lead.score}
              </span>
            )}
            <span className="rounded-full bg-border px-2 py-0.5 text-[11px] font-bold">{t.status[lead.status] || lead.status}</span>
            {lead.status === "failed" && (
              <Button variant="outline" size="sm" onClick={() => retryLead(leadId).then(refresh)}>
                {t.leadDetail.retry}
              </Button>
            )}
            <Select value={lead.status} onValueChange={(v) => onStatusChange(v as LeadStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t.status[s] || s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Live Progression Tracker */}
        <PipelineProgressBar
          status={lead.status}
          auditCount={audits.length}
          prdCount={prds.length}
          lastError={latestErrorEvent?.message || lead.last_error}
          onRetry={() => retryLead(leadId).then(refresh)}
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="bg-card/80 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="offer" className="flex items-center gap-1.5 text-xs">
            <span>{t.leadDetail.tabs.offer}</span>
            <kbd className="text-[10px] font-mono opacity-50 bg-white/10 px-1 py-0.2 rounded">1</kbd>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-1.5 text-xs">
            <span>{t.leadDetail.tabs.sales}</span>
            <kbd className="text-[10px] font-mono opacity-50 bg-white/10 px-1 py-0.2 rounded">2</kbd>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs">
            <span>{t.leadDetail.tabs.overview}</span>
            <kbd className="text-[10px] font-mono opacity-50 bg-white/10 px-1 py-0.2 rounded">3</kbd>
          </TabsTrigger>
          <TabsTrigger value="audits" className="flex items-center gap-1.5 text-xs">
            <span>{t.leadDetail.tabs.audits} ({audits.length})</span>
            <kbd className="text-[10px] font-mono opacity-50 bg-white/10 px-1 py-0.2 rounded">4</kbd>
          </TabsTrigger>
          <TabsTrigger value="prds" className="flex items-center gap-1.5 text-xs">
            <span>{t.leadDetail.tabs.prds} ({prds.length})</span>
            <kbd className="text-[10px] font-mono opacity-50 bg-white/10 px-1 py-0.2 rounded">5</kbd>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1.5 text-xs">
            <span>{t.leadDetail.tabs.timeline}</span>
            <kbd className="text-[10px] font-mono opacity-50 bg-white/10 px-1 py-0.2 rounded">6</kbd>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offer">
          <OfferTab lead={lead} prds={prds} proposals={proposals} onRefresh={refresh} />
        </TabsContent>
        <TabsContent value="sales">
          <SalesTab lead={lead} audits={audits} prds={prds} onRefresh={refresh} />
        </TabsContent>
        <TabsContent value="overview">
          <OverviewTab leadId={leadId} scrape={latestScrape} />
        </TabsContent>
        <TabsContent value="audits">
          <AuditsTab audits={audits} />
        </TabsContent>
        <TabsContent value="prds">
          <PrdsTab leadId={leadId} prds={prds} />
        </TabsContent>
        <TabsContent value="timeline">
          <TimelineTab events={events} />
        </TabsContent>
      </Tabs>
    </>
  );
}
