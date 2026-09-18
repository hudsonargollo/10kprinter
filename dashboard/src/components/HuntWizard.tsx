import { useState } from "react";
import { createHuntSession, createSource, generateOutreachTimeline, runSourceNow } from "../api";
import type { NicheDef } from "../types";
import { NICHE_PACKAGE } from "../types";
import { PlaceAutocomplete } from "./PlaceAutocomplete";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Radar, Globe, CheckCircle2, Loader2, Sparkles, ArrowRight, ArrowLeft, RefreshCw, CheckCheck, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

type Step = "place" | "niches" | "run" | "interview" | "timeline";

type NicheProgress = { status: "pending" | "running" | "done"; count: number };

export function HuntWizard({ onLeadDiscovered }: { onLeadDiscovered?: () => void }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("place");
  const [region, setRegion] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [customNiches, setCustomNiches] = useState<NicheDef[]>([]);
  const [leadsPerNiche, setLeadsPerNiche] = useState(20);
  const [language, setLanguage] = useState("auto");

  const [huntSessionId, setHuntSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, NicheProgress>>({});
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [capacityPerWeek, setCapacityPerWeek] = useState(10);
  const [priorityOrder, setPriorityOrder] = useState<string[]>([]);
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "call" | "email">("whatsapp");
  const [timelineMarkdown, setTimelineMarkdown] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const STEPS: { key: Step; label: string }[] = [
    { key: "place", label: t.huntWizard.steps.place },
    { key: "niches", label: t.huntWizard.steps.niches },
    { key: "run", label: t.huntWizard.steps.run },
    { key: "interview", label: t.huntWizard.steps.interview },
    { key: "timeline", label: t.huntWizard.steps.timeline },
  ];

  const allNiches: NicheDef[] = [...NICHE_PACKAGE.filter((n) => selectedKeys.has(n.key)), ...customNiches];

  function toggleNiche(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAllNiches() {
    setSelectedKeys(new Set(NICHE_PACKAGE.map((n) => n.key)));
  }

  function deselectAllNiches() {
    setSelectedKeys(new Set());
  }

  async function startHunt() {
    setRunning(true);
    setError(null);
    const initial: Record<string, NicheProgress> = {};
    for (const n of allNiches) initial[n.key] = { status: "pending", count: 0 };
    setProgress(initial);

    try {
      const { id: sessionId } = await createHuntSession({
        region,
        niches: allNiches,
        leadsPerNiche,
        language: language === "auto" ? undefined : language,
      });
      setHuntSessionId(sessionId);

      const finalCounts: Record<string, number> = {};
      for (const niche of allNiches) {
        setProgress((prev) => ({ ...prev, [niche.key]: { status: "running", count: 0 } }));
        let found = 0;
        for (const variant of niche.queryVariants) {
          if (found >= leadsPerNiche) break;
          const { id: sourceId } = await createSource({
            query: variant,
            region,
            category: niche.label,
            huntSessionId: sessionId,
          });
          const result = await runSourceNow(sourceId);
          found += result.newLeadIds.length;
          setProgress((prev) => ({ ...prev, [niche.key]: { status: "running", count: found } }));
          if (result.newLeadIds.length > 0 && onLeadDiscovered) {
            onLeadDiscovered();
          }
        }
        finalCounts[niche.key] = found;
        setProgress((prev) => ({ ...prev, [niche.key]: { status: "done", count: found } }));
      }

      setPriorityOrder(allNiches.filter((n) => finalCounts[n.key] > 0).map((n) => n.key));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while hunting leads.");
    } finally {
      setRunning(false);
    }
  }

  function movePriority(key: string, dir: -1 | 1) {
    setPriorityOrder((prev) => {
      const idx = prev.indexOf(key);
      const next = [...prev];
      const swapWith = idx + dir;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  }

  async function submitInterview() {
    if (!huntSessionId) return;
    setGenerating(true);
    setError(null);
    try {
      const { timelineMarkdown } = await generateOutreachTimeline(huntSessionId, {
        capacityPerWeek,
        priorityOrder,
        contactMethod,
      });
      setTimelineMarkdown(timelineMarkdown);
      setStep("timeline");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate outreach timeline.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Card className="p-6 bg-[#161020] border-white/10 shadow-2xl rounded-2xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-base font-bold text-white flex items-center gap-2">
          <Radar className="w-5 h-5 text-[#e8ff5c]" />
          <span>{t.huntWizard.title}</span>
        </h2>
        {huntSessionId && (
          <span className="text-[11px] font-mono text-[#e8ff5c] px-2 py-0.5 rounded-full bg-[#e8ff5c]/10 border border-[#e8ff5c]/20">
            {t.huntWizard.sessionActive}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-bad bg-bad/15 px-4 py-3 text-bad text-xs font-mono">
          {error}
        </div>
      )}

      {/* Steps Pill Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
        {STEPS.map((s, i) => {
          const currentIndex = STEPS.findIndex((x) => x.key === step);
          const isCurrent = s.key === step;
          const isPassed = i < currentIndex;
          return (
            <span
              key={s.key}
              className={cn(
                "rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-all flex items-center gap-1.5",
                isCurrent
                  ? "bg-[#e8ff5c] text-black font-semibold shadow-sm"
                  : isPassed
                  ? "bg-white/10 text-white"
                  : "text-white/40"
              )}
            >
              {isPassed ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <span>{i + 1}.</span>}
              <span>{s.label}</span>
            </span>
          );
        })}
      </div>

      {step === "place" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="region" className="text-xs text-white/80">{t.huntWizard.placeLabel}</Label>
              <PlaceAutocomplete id="region" placeholder={t.huntWizard.placePlaceholder} value={region} onChange={setRegion} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hunt-language" className="text-xs text-white/80 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#e8ff5c]" />
                <span>{t.huntWizard.langLabel}</span>
              </Label>
              <select
                id="hunt-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none h-9"
              >
                <option value="auto" className="bg-[#161020] text-white">🌐 Auto (Español)</option>
                <option value="es" className="bg-[#161020] text-white">🇪🇸 Español (LatAm / ES)</option>
                <option value="en" className="bg-[#161020] text-white">🇺🇸 English (US/Global)</option>
                <option value="pt" className="bg-[#161020] text-white">🇧🇷 Português (Brasil / PT)</option>
              </select>
            </div>
          </div>
          <Button
            disabled={!region}
            onClick={() => setStep("niches")}
            className="bg-[#e8ff5c] text-black font-bold hover:bg-[#d8ef4c] rounded-xl text-xs h-9 px-5 shadow-md shadow-[#e8ff5c]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t.huntWizard.nextNiches}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {step === "niches" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-xs uppercase font-mono tracking-wider text-white/50">
                {t.huntWizard.selectNiches}
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#e8ff5c]">
                {selectedKeys.size} / {NICHE_PACKAGE.length} {t.huntWizard.selectedCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAllNiches}
                className="h-7 px-2.5 text-[11px] font-mono border-white/10 text-white/80 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <CheckCheck className="w-3 h-3 mr-1 text-[#e8ff5c]" />
                {t.huntWizard.selectAll}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={deselectAllNiches}
                className="h-7 px-2.5 text-[11px] font-mono border-white/10 text-white/80 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <X className="w-3 h-3 mr-1 text-white/40" />
                {t.huntWizard.deselectAll}
              </Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {NICHE_PACKAGE.map((n) => {
              const checked = selectedKeys.has(n.key);
              return (
                <label
                  key={n.key}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all",
                    checked
                      ? "bg-[#e8ff5c]/10 border-[#e8ff5c]/30 text-white font-medium shadow-sm shadow-[#e8ff5c]/5"
                      : "bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleNiche(n.key)}
                    className="accent-[#e8ff5c] rounded"
                  />
                  <span className="truncate">{t.niches[n.key] || n.label}</span>
                </label>
              );
            })}
          </div>

          <CustomNicheForm
            onAdd={(n) => setCustomNiches((prev) => [...prev, n])}
            nameLabel={t.huntWizard.customNicheName}
            queryLabel={t.huntWizard.customSearchQuery}
            namePlaceholder={t.huntWizard.customNichePlaceholder}
            queryPlaceholder={t.huntWizard.customQueryPlaceholder}
            addLabel={t.huntWizard.customAdd}
          />
          {customNiches.length > 0 && (
            <div className="space-y-1">
              {customNiches.map((n) => (
                <div key={n.key} className="text-xs text-[#e8ff5c] font-mono">
                  + {n.label} ({n.queryVariants[0]})
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Label htmlFor="leadsPerNiche" className="text-xs text-white/70">{t.huntWizard.leadsPerNiche}</Label>
              <Input
                id="leadsPerNiche"
                type="number"
                min={5}
                max={60}
                className="w-20 bg-white/[0.03] border-white/10 text-white h-8 text-xs rounded-lg"
                value={leadsPerNiche}
                onChange={(e) => setLeadsPerNiche(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep("place")} className="border-white/10 text-white">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> {t.huntWizard.back}
              </Button>
              <Button
                disabled={allNiches.length === 0}
                size="sm"
                onClick={() => setStep("run")}
                className="bg-[#e8ff5c] text-black font-bold hover:bg-[#d8ef4c]"
              >
                <span>{t.huntWizard.reviewRun}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "run" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-sm font-bold text-white">{region}</h3>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                {allNiches.length} {t.huntWizard.selectedNichesSummary} {allNiches.length * leadsPerNiche} max
              </p>
            </div>
            {!running && !huntSessionId && (
              <Button onClick={startHunt} className="bg-[#e8ff5c] text-black font-bold hover:bg-[#d8ef4c] shadow-lg shadow-[#e8ff5c]/20">
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>{t.huntWizard.launchHunt}</span>
              </Button>
            )}
            {running && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#e8ff5c]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.huntWizard.huntingLive}</span>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {allNiches.map((n) => {
              const p = progress[n.key];
              const isRunning = p?.status === "running";
              const isDone = p?.status === "done";
              return (
                <div
                  key={n.key}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs"
                >
                  <span className="font-medium text-white">{n.label}</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    {isRunning && <Loader2 className="w-3.5 h-3.5 text-[#e8ff5c] animate-spin" />}
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span className={isDone ? "text-emerald-400 font-bold" : isRunning ? "text-[#e8ff5c]" : "text-white/40"}>
                      {!p || p.status === "pending" ? t.huntWizard.queued : `${p.count} ${t.huntWizard.found}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {huntSessionId && !running && (
            <div className="pt-2 flex justify-between items-center border-t border-white/10">
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {t.huntWizard.discoveryComplete}
              </span>
              <Button onClick={() => setStep("interview")} className="bg-[#e8ff5c] text-black font-bold hover:bg-[#d8ef4c]">
                <span>{t.huntWizard.generateOutreachPlan}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {step === "interview" && (
        <div className="space-y-4">
          <h3 className="font-heading text-sm font-bold text-white">{t.huntWizard.outreachSetup}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="capacity" className="text-xs text-white/80">{t.huntWizard.capacityLabel}</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={100}
                className="w-32 bg-white/[0.03] border-white/10 text-white text-xs h-9"
                value={capacityPerWeek}
                onChange={(e) => setCapacityPerWeek(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-white/80">{t.huntWizard.channelLabel}</Label>
              <div className="flex gap-3">
                {(["whatsapp", "call", "email"] as const).map((m) => (
                  <label key={m} className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      checked={contactMethod === m}
                      onChange={() => setContactMethod(m)}
                      className="accent-[#e8ff5c]"
                    />
                    <span>{t.huntWizard.channels[m]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/80">{t.huntWizard.priorityLabel}</Label>
            <div className="space-y-1.5">
              {priorityOrder.map((key, i) => {
                const niche = allNiches.find((n) => n.key === key);
                if (!niche) return null;
                return (
                  <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white">
                    <span className="font-mono">
                      <span className="text-[#e8ff5c] font-bold mr-2">#{i + 1}</span> {niche.label}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => movePriority(key, -1)} disabled={i === 0} className="h-6 px-2 text-[10px] border-white/10">
                        {t.huntWizard.up}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => movePriority(key, 1)} disabled={i === priorityOrder.length - 1} className="h-6 px-2 text-[10px] border-white/10">
                        {t.huntWizard.down}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button disabled={generating} onClick={submitInterview} className="bg-[#e8ff5c] text-black font-bold hover:bg-[#d8ef4c]">
            {generating ? (
              <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.huntWizard.generatingPlan}</span>
            ) : (
              <span>{t.huntWizard.generatePlanBtn}</span>
            )}
          </Button>
        </div>
      )}

      {step === "timeline" && timelineMarkdown && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-white">{t.huntWizard.timelineHeading}</h3>
            <Button variant="outline" size="sm" onClick={() => setStep("place")} className="border-white/15 text-white">
              <RefreshCw className="w-3 h-3 mr-1" /> {t.huntWizard.newHunt}
            </Button>
          </div>
          <div className="p-4 rounded-xl bg-black/30 border border-white/10 text-xs text-white/80 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {timelineMarkdown}
          </div>
          <Button asChild className="bg-[#e8ff5c] text-black font-bold hover:bg-[#d8ef4c]">
            <a href="#/">{t.huntWizard.viewAllLeads}</a>
          </Button>
        </div>
      )}
    </Card>
  );
}

function CustomNicheForm({
  onAdd,
  nameLabel,
  queryLabel,
  namePlaceholder,
  queryPlaceholder,
  addLabel,
}: {
  onAdd: (niche: NicheDef) => void;
  nameLabel: string;
  queryLabel: string;
  namePlaceholder?: string;
  queryPlaceholder?: string;
  addLabel: string;
}) {
  const [label, setLabel] = useState("");
  const [query, setQuery] = useState("");

  function add() {
    if (!label || !query) return;
    onAdd({ key: `custom-${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`, label, queryVariants: [query] });
    setLabel("");
    setQuery("");
  }

  return (
    <div className="flex flex-col sm:flex-row items-end gap-2 pt-2">
      <div className="flex flex-1 flex-col gap-1 w-full">
        <Label htmlFor="customLabel" className="text-[11px] text-white/60">{nameLabel}</Label>
        <Input
          id="customLabel"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={namePlaceholder || "e.g. Solar Energy Installers"}
          className="bg-white/[0.03] border-white/10 text-white text-xs h-8 rounded-lg"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 w-full">
        <Label htmlFor="customQuery" className="text-[11px] text-white/60">{queryLabel}</Label>
        <Input
          id="customQuery"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={queryPlaceholder || "e.g. solar panel contractors"}
          className="bg-white/[0.03] border-white/10 text-white text-xs h-8 rounded-lg"
        />
      </div>
      <Button variant="outline" size="sm" onClick={add} disabled={!label || !query} className="h-8 border-white/10 text-white">
        {addLabel}
      </Button>
    </div>
  );
}
