import { CheckCircle2, CircleDashed, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import type { LeadStatus } from "../types";
import { cn } from "@/lib/utils";

interface PipelineProgressBarProps {
  status: LeadStatus;
  auditCount?: number;
  prdCount?: number;
  className?: string;
  compact?: boolean;
}

const STAGES: { key: string; label: string }[] = [
  { key: "discovered", label: "Discovered" },
  { key: "scraping", label: "Scraping Site" },
  { key: "audited", label: "4-Vertical Audit" },
  { key: "prd_ready", label: "Proposal & PRD" },
];

function getStageProgress(
  status: LeadStatus,
  auditCount?: number,
  prdCount?: number
): { percent: number; stageIndex: number; activeLabel: string } {
  if (status === "failed") {
    return { percent: 100, stageIndex: -1, activeLabel: "Pipeline Failed" };
  }

  if (["prd_ready", "reviewed", "proposal_sent", "won", "lost"].includes(status)) {
    return { percent: 100, stageIndex: 4, activeLabel: "Audits & Proposal Ready" };
  }

  if (status === "discovered") {
    return { percent: 10, stageIndex: 0, activeLabel: "Discovered • Queued" };
  }

  if (status === "scraping") {
    return { percent: 25, stageIndex: 1, activeLabel: "Scraping DOM & Screenshot..." };
  }

  const count = auditCount ?? 0;
  if (status === "scraped" || (count > 0 && count < 4)) {
    const percent = 30 + Math.min(count, 4) * 12;
    const activeLabel = count > 0 ? `Auditing (${count}/4 verticals finished)...` : "Starting 4-Vertical Audits...";
    return { percent, stageIndex: 2, activeLabel };
  }

  if (status === "audited" || count >= 4) {
    const prds = prdCount ?? 0;
    const percent = 80 + (prds > 0 ? 10 : 0);
    const activeLabel = prds > 0 ? `Generating Proposals (${prds} ready)...` : "Audits 4/4 Complete • Writing PRDs...";
    return { percent, stageIndex: 3, activeLabel };
  }

  return { percent: 50, stageIndex: 2, activeLabel: "Processing Lead..." };
}

export function PipelineProgressBar({
  status,
  auditCount,
  prdCount,
  className,
  compact = false,
}: PipelineProgressBarProps) {
  const { percent, stageIndex, activeLabel } = getStageProgress(status, auditCount, prdCount);
  const isFailed = status === "failed";
  const isComplete = percent === 100 && !isFailed;
  const inProgress = ["discovered", "scraping", "scraped", "audited"].includes(status);

  if (compact) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-white/70 flex items-center gap-1.5 truncate">
            {inProgress && <Loader2 className="w-3 h-3 text-[#e8ff5c] animate-spin shrink-0" />}
            {isComplete && <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />}
            {isFailed && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />}
            <span className="truncate">{activeLabel}</span>
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
            Pipeline Progression
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#e8ff5c] font-semibold">{activeLabel}</span>
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

      {/* Visual Step Markers */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {STAGES.map((s, idx) => {
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
