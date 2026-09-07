import type { LeadDetail as LeadDetailData } from "../../types";
import { Card } from "@/components/ui/card";

export function OverviewTab({ leadId, scrape }: { leadId: string; scrape: LeadDetailData["scrapes"][number] | undefined }) {
  if (!scrape) return <p className="py-10 text-center text-muted-foreground">Scrape hasn't completed yet.</p>;
  const summary = scrape.summary_json ? JSON.parse(scrape.summary_json) : null;
  return (
    <Card className="p-4.5">
      <h2 className="font-heading text-[15px] font-bold">Scraped page</h2>
      <img
        src={`/api/leads/${leadId}/screenshot`}
        alt="Site screenshot"
        className="mb-4 max-w-full rounded-lg border border-border"
      />
      {summary && (
        <dl className="grid grid-cols-[140px_1fr] gap-y-1.5 text-[13px]">
          <dt className="text-muted-foreground">Title</dt>
          <dd className="m-0">{summary.title ?? "—"}</dd>
          <dt className="text-muted-foreground">Load time</dt>
          <dd className="m-0">{summary.loadTimeMs}ms</dd>
          <dt className="text-muted-foreground">Email capture form</dt>
          <dd className="m-0">{summary.hasEmailCaptureForm ? "Yes" : "No"}</dd>
          <dt className="text-muted-foreground">Phone numbers found</dt>
          <dd className="m-0">{summary.phoneNumbersFound?.join(", ") || "—"}</dd>
        </dl>
      )}
    </Card>
  );
}
