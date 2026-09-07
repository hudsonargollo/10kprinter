import { useCallback, useEffect, useRef, useState } from "react";
import { getLead, retryLead, updateLeadStatus } from "../api";
import type { LeadDetail as LeadDetailData, LeadStatus } from "../types";
import { STATUS_LABELS, STATUS_ORDER, TIER_LABELS } from "../types";
import { TIER_CLASS } from "@/lib/tier";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfferTab } from "./lead-detail/OfferTab";
import { SalesTab } from "./lead-detail/SalesTab";
import { OverviewTab } from "./lead-detail/OverviewTab";
import { AuditsTab } from "./lead-detail/AuditsTab";
import { PrdsTab } from "./lead-detail/PrdsTab";
import { TimelineTab } from "./lead-detail/TimelineTab";

const IN_PROGRESS: LeadStatus[] = ["discovered", "scraping", "scraped", "audited"];

type Tab = "offer" | "sales" | "overview" | "audits" | "prds" | "timeline";

export function LeadDetailView({ leadId }: { leadId: string }) {
  const [data, setData] = useState<LeadDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("offer");
  const pollRef = useRef<number | null>(null);

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
      pollRef.current = window.setInterval(refresh, 4000);
      return () => {
        if (pollRef.current) window.clearInterval(pollRef.current);
      };
    }
  }, [data, refresh]);

  if (error)
    return <div className="mb-4 rounded-lg border border-bad bg-bad/15 px-3.5 py-2.5 text-bad">{error}</div>;
  if (!data) return <p className="py-10 text-center text-muted-foreground">Loading…</p>;

  const { lead, scrapes, audits, prds, proposals, events } = data;
  const latestScrape = scrapes[scrapes.length - 1];

  async function onStatusChange(status: LeadStatus) {
    await updateLeadStatus(leadId, status);
    refresh();
  }

  return (
    <>
      <div className="mb-4 rounded-xl bg-card p-4.5 ring-1 ring-foreground/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="mb-1 font-heading text-[15px] font-bold">{lead.business_name || lead.url}</h2>
            <a href={lead.url} target="_blank" rel="noreferrer" className="text-[13px] text-muted-foreground">
              {lead.url}
            </a>
          </div>
          <div className="flex items-center gap-2">
            {lead.tier && (
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", TIER_CLASS[lead.tier])}>
                {TIER_LABELS[lead.tier]} · {lead.score}
              </span>
            )}
            <span className="rounded-full bg-border px-2 py-0.5 text-[11px] font-bold">{STATUS_LABELS[lead.status]}</span>
            {lead.status === "failed" && (
              <Button variant="outline" size="sm" onClick={() => retryLead(leadId).then(refresh)}>
                Retry
              </Button>
            )}
            <Select value={lead.status} onValueChange={(v) => onStatusChange(v as LeadStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          <TabsTrigger value="offer">Offer</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audits">Audits ({audits.length})</TabsTrigger>
          <TabsTrigger value="prds">PRDs ({prds.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
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
