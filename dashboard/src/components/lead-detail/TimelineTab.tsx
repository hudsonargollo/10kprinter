import { useState } from "react";
import type { LeadDetail as LeadDetailData } from "../../types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Clock, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "../../i18n/LanguageContext";

export function TimelineTab({ events }: { events: LeadDetailData["events"] }) {
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (events.length === 0) return <p className="py-10 text-center text-muted-foreground text-sm">{t.timelineTab.noEvents}</p>;

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {t.timelineTab.executionLog} ({events.length})
        </h4>
        <span className="text-[11px] text-muted-foreground">
          {t.timelineTab.autoRecorded}
        </span>
      </div>

      <ul className="m-0 list-none p-0 space-y-2.5">
        {events.map((e) => {
          const isError = e.status === "failed" || e.status === "error";
          const isSuccess = e.status === "completed" || e.status === "won";
          return (
            <li
              key={e.id}
              className={cn(
                "rounded-xl p-3 text-xs transition-colors border",
                isError
                  ? "bg-destructive/10 border-destructive/30 text-rose-200"
                  : isSuccess
                  ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                  : "bg-secondary border-transparent text-foreground"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {isError ? (
                      <AlertTriangle className="size-3.5 text-rose-400" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                    ) : (
                      <Clock className="size-3.5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold uppercase tracking-wide text-[11px] text-foreground">
                        {e.stage}
                      </span>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold",
                          isError
                            ? "bg-destructive/20 text-rose-300"
                            : isSuccess
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {e.status}
                      </span>
                    </div>
                    {e.message && (
                      <p className={cn("mt-1.5 font-mono text-[11px] leading-relaxed break-all", isError ? "text-rose-300/90 font-medium" : "text-muted-foreground")}>
                        {e.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                    {e.created_at}
                  </span>
                  {e.message && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleCopy(e.id, `[${e.stage}][${e.status}] ${e.message}`)}
                      title={t.timelineTab.copyLog}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {copiedId === e.id ? (
                        <Check className="size-3 text-emerald-400" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
