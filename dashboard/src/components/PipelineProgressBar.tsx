import { CheckCircle2, CircleDashed, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import type { LeadStatus } from "../types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../i18n/LanguageContext";

interface PipelineProgressBarProps {
  status: LeadStatus;
  auditCount?: number;
  prdCount?: number;
  lastError?: string | null;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function PipelineProgressBar({
  status,
  auditCount,
  prdCount,
  lastError,
  onRetry,
  className,
  compact = false,
}: PipelineProgressBarProps) {
  const { t } = useLanguage();

  const count = auditCount ?? 0;
  const prds = prdCount ?? 0;

  let percent = 50;
  let stageIndex = 2;
  let activeLabel = t.pipelineProgress.processing;

  if (status === "failed") {
    percent = 100;
    stageIndex = -1;
    activeLabel = t.pipelineProgress.failed;
  } else if (["prd_ready", "reviewed", "proposal_sent", "won", "lost"].includes(status)) {
    percent = 100;
    stageIndex = 4;
    activeLabel = t.pipelineProgress.ready;
  } else if (status === "discovered") {
    percent = 10;
    stageIndex = 0;
    activeLabel = t.pipelineProgress.discovered;
  } else if (status === "scraping") {
    percent = 25;
    stageIndex = 1;
    activeLabel = t.pipelineProgress.scraping;
  } else if (status === "scraped" || (count > 0 && count < 4)) {
    percent = 30 + Math.min(count, 4) * 12;
    stageIndex = 2;
    activeLabel = count > 0 ? t.pipelineProgress.auditing : t.pipelineProgress.startingAudits;
  } else if (status === "audited" || count >= 4) {
    percent = 80 + (prds > 0 ? 10 : 0);
    stageIndex = 3;
    activeLabel = prds > 0 ? t.pipelineProgress.generatingProposals : t.pipelineProgress.auditsCompleteWritingPrds;
  }

  const isFailed = status === "failed";
  const isComplete = percent === 100 && !isFailed;
  const inProgress = ["discovered", "scraping", "scraped", "audited"].includes(status);

  const stages = [
    { key: "discovered", label: t.pipelineProgress.stages.discovered },
    { key: "scraping", label: t.pipelineProgress.stages.scraping },
    { key: "audited", label: t.pipelineProgress.stages.audited },
    { key: "prd_ready", label: t.pipelineProgress.stages.prd_ready },
  ];

  if (compact) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground flex items-center gap-1.5 truncate">
            {inProgress && <Loader2 className="size-3 text-primary animate-spin shrink-0" />}
            {isComplete && <Sparkles className="size-3 text-emerald-400 shrink-0" />}
            {isFailed && <AlertTriangle className="size-3 text-rose-400 shrink-0" />}
            <span className="truncate">{isFailed && lastError ? `${activeLabel}: ${lastError}` : activeLabel}</span>
          </span>
          <span className="text-primary font-bold shrink-0 ml-1">{percent}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-700 ease-out rounded-full",
              isFailed ? "bg-rose-500" : isComplete ? "bg-emerald-400" : "bg-primary"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl bg-secondary p-4 space-y-3 font-sans", className)}>
      {/* Header with live stage */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {inProgress && (
            <div className="size-2.5 rounded-full bg-primary animate-ping" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {t.pipelineProgress.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold", isFailed ? "text-rose-400" : "text-primary")}>
            {activeLabel}
          </span>
          <span className="text-xs text-muted-foreground">({percent}%)</span>
        </div>
      </div>

      {/* Main Animated Progress Track */}
      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-700 ease-out rounded-full",
            isFailed
              ? "bg-rose-500"
              : isComplete
              ? "bg-gradient-to-r from-emerald-400 to-primary"
              : "bg-primary animate-pulse"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* If Failed, display error banner with one-click retry */}
      {isFailed && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{lastError || "Pipeline interrupted or timed out."}</span>
          </div>
          {onRetry && (
            <Button variant="destructive" size="xs" onClick={onRetry} className="shrink-0 cursor-pointer">
              {t.leadDetail.retry}
            </Button>
          )}
        </div>
      )}

      {/* Visual Step Markers */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {stages.map((s, idx) => {
          const isDone = stageIndex > idx || isComplete;
          const isCurrent = stageIndex === idx && inProgress;
          return (
            <div key={s.key} className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-1">
                {isDone ? (
                  <CheckCircle2 className="size-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="size-4 text-primary animate-spin" />
                ) : (
                  <CircleDashed className="size-4 text-muted-foreground/40" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  isDone ? "text-foreground/80 font-medium" : isCurrent ? "text-primary font-semibold" : "text-muted-foreground/60"
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
