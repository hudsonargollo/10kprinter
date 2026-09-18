import type { LeadDetail as LeadDetailData } from "../../types";
import { Card } from "@/components/ui/card";
import { useLanguage } from "../../i18n/LanguageContext";

export function OverviewTab({ leadId, scrape }: { leadId: string; scrape: LeadDetailData["scrapes"][number] | undefined }) {
  const { t } = useLanguage();
  if (!scrape) return <p className="py-10 text-center text-muted-foreground font-mono text-xs">{t.overviewTab.notCompleted}</p>;
  const summary = scrape.summary_json ? JSON.parse(scrape.summary_json) : null;

  return (
    <Card className="p-4.5">
      <h2 className="font-heading text-[15px] font-bold mb-3">{t.leadDetail.tabs.overview}</h2>
      <img
        src={`/api/leads/${leadId}/screenshot`}
        alt="Site screenshot"
        className="mb-4 max-w-full rounded-lg border border-border"
      />
      {summary && (
        <dl className="grid grid-cols-[160px_1fr] gap-y-2 text-[13px]">
          <dt className="text-muted-foreground">{t.overviewTab.title}</dt>
          <dd className="m-0 font-medium text-white">{summary.title ?? "—"}</dd>
          <dt className="text-muted-foreground">{t.overviewTab.loadTime}</dt>
          <dd className="m-0 font-mono text-white">{summary.loadTimeMs}ms</dd>
          <dt className="text-muted-foreground">{t.overviewTab.emailCapture}</dt>
          <dd className="m-0 font-medium text-white">{summary.hasEmailCaptureForm ? t.overviewTab.yes : t.overviewTab.no}</dd>
          <dt className="text-muted-foreground">{t.overviewTab.phoneNumbers}</dt>
          <dd className="m-0 font-mono text-white">{summary.phoneNumbersFound?.join(", ") || "—"}</dd>
        </dl>
      )}
    </Card>
  );
}
