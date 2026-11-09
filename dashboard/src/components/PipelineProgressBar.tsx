import { CheckCircle2, CircleDashed, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import type { LeadStatus } from "../types";
import { cn } from "@/lib/utils";
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
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-white/70 flex items-center gap-1.5 truncate">
            {inProgress && <Loader2 className="w-3 h-3 text-[#e8ff5c] animate-spin shrink-0" />}
            {isComplete && <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />}
            {isFailed && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />}
            <span className="truncate">{isFailed && lastError ? `${activeLabel}: ${lastError}` : activeLabel}</span>
          </span>
          <span className="text-[#e8ff5c] font-bold shrink-0 ml-1">{percent}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div
            className={cn(
              "h-full transition-all duration-700 ease-out rounded-full",
              isFailed ? "bg-rose-500" : isComplete ? "bg-emerald-400" : "bg-gradient-to-r from-[#e8ff5c] via-emerald-400 to-[#e8ff5c]"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3 font-sans", className)}>
      {/* Header with live stage */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {inProgress && (
            <div className="w-2.5 h-2.5 rounded-full bg-[#e8ff5c] animate-ping" />
          )}
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/90">
            {t.pipelineProgress.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-mono font-semibold", isFailed ? "text-rose-400" : "text-[#e8ff5c]")}>
            {activeLabel}
          </span>
          <span className="text-xs font-mono text-white/40">({percent}%)</span>
        </div>
      </div>

      {/* Main Animated Progress Track */}
      <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
        <div
          className={cn(
            "h-full transition-all duration-700 ease-out rounded-full",
            isFailed
              ? "bg-rose-500"
              : isComplete
              ? "bg-gradient-to-r from-emerald-400 to-[#e8ff5c]"
              : "bg-gradient-to-r from-[#e8ff5c] via-emerald-400 to-[#e8ff5c] animate-pulse"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* If Failed, display error banner with one-click retry */}
      {isFailed && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-mono">{lastError || "Pipeline interrupted or timed out."}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="shrink-0 px-3 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white font-mono font-bold text-xs transition-colors cursor-pointer"
            >
              {t.leadDetail.retry}
            </button>
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#e8ff5c] animate-spin" />
                ) : (
                  <CircleDashed className="w-4 h-4 text-white/20" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono leading-tight",
                  isDone ? "text-white/80 font-medium" : isCurrent ? "text-[#e8ff5c] font-bold" : "text-white/30"
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
