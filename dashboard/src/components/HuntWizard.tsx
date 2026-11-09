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
    <Card className="p-6 shadow-2xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
          <Radar className="size-5 text-primary" />
          <span>{t.huntWizard.title}</span>
        </h2>
        {huntSessionId && (
          <span className="text-[11px] text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            {t.huntWizard.sessionActive}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-bad bg-bad/15 px-4 py-3 text-bad text-xs">
          {error}
        </div>
      )}

      {/* Steps Pill Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-1 p-1 bg-secondary rounded-full">
        {STEPS.map((s, i) => {
          const currentIndex = STEPS.findIndex((x) => x.key === step);
          const isCurrent = s.key === step;
          const isPassed = i < currentIndex;
          return (
            <span
              key={s.key}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5",
                isCurrent
                  ? "bg-primary text-primary-foreground font-semibold"
                  : isPassed
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {isPassed ? <CheckCircle2 className="size-3 text-emerald-400" /> : <span>{i + 1}.</span>}
              <span>{s.label}</span>
            </span>
          );
        })}
      </div>

      {step === "place" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="region" className="text-xs text-muted-foreground">{t.huntWizard.placeLabel}</Label>
              <PlaceAutocomplete id="region" placeholder={t.huntWizard.placePlaceholder} value={region} onChange={setRegion} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hunt-language" className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="size-3.5 text-primary" />
                <span>{t.huntWizard.langLabel}</span>
              </Label>
              <select
                id="hunt-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-10 w-full rounded-full border-0 bg-secondary px-4 text-sm text-foreground outline-none cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="auto">🌐 Auto (Español)</option>
                <option value="es">🇪🇸 Español (LatAm / ES)</option>
                <option value="en">🇺🇸 English (US/Global)</option>
                <option value="pt">🇧🇷 Português (Brasil / PT)</option>
              </select>
            </div>
          </div>
          <Button disabled={!region} onClick={() => setStep("niches")}>
            <span>{t.huntWizard.nextNiches}</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {step === "niches" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
                {t.huntWizard.selectNiches}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-primary">
                {selectedKeys.size} / {NICHE_PACKAGE.length} {t.huntWizard.selectedCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectAllNiches}>
                <CheckCheck className="size-3.5 text-primary" />
                {t.huntWizard.selectAll}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={deselectAllNiches}>
                <X className="size-3.5 text-muted-foreground" />
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
                    "flex items-center gap-2.5 p-3 rounded-2xl border text-xs cursor-pointer transition-all",
                    checked
                      ? "bg-primary/10 border-primary/30 text-foreground font-medium"
                      : "bg-secondary border-transparent text-muted-foreground hover:bg-muted"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleNiche(n.key)}
                    className="accent-primary size-4"
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
                <div key={n.key} className="text-xs text-primary">
                  + {n.label} ({n.queryVariants[0]})
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Label htmlFor="leadsPerNiche" className="text-xs text-muted-foreground">{t.huntWizard.leadsPerNiche}</Label>
              <Input
                id="leadsPerNiche"
                type="number"
                min={5}
                max={60}
                className="w-24 h-8 px-3"
                value={leadsPerNiche}
                onChange={(e) => setLeadsPerNiche(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep("place")}>
                <ArrowLeft className="size-4" /> {t.huntWizard.back}
              </Button>
              <Button disabled={allNiches.length === 0} onClick={() => setStep("run")}>
                <span>{t.huntWizard.reviewRun}</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "run" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-secondary flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-sm font-semibold text-foreground">{region}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {allNiches.length} {t.huntWizard.selectedNichesSummary} {allNiches.length * leadsPerNiche} max
              </p>
            </div>
            {!running && !huntSessionId && (
              <Button onClick={startHunt}>
                <Sparkles className="size-4" />
                <span>{t.huntWizard.launchHunt}</span>
              </Button>
            )}
            {running && (
              <div className="flex items-center gap-2 text-xs text-primary">
                <Loader2 className="size-4 animate-spin" />
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
                  className="flex items-center justify-between p-3 rounded-2xl bg-secondary text-xs"
                >
                  <span className="font-medium text-foreground">{n.label}</span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {isRunning && <Loader2 className="size-3.5 text-primary animate-spin" />}
                    {isDone && <CheckCircle2 className="size-3.5 text-emerald-400" />}
                    <span className={isDone ? "text-emerald-400 font-semibold" : isRunning ? "text-primary" : "text-muted-foreground"}>
                      {!p || p.status === "pending" ? t.huntWizard.queued : `${p.count} ${t.huntWizard.found}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {huntSessionId && !running && (
            <div className="pt-2 flex justify-between items-center border-t border-border">
              <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-4" /> {t.huntWizard.discoveryComplete}
              </span>
              <Button onClick={() => setStep("interview")}>
                <span>{t.huntWizard.generateOutreachPlan}</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {step === "interview" && (
        <div className="space-y-4">
          <h3 className="font-heading text-sm font-semibold text-foreground">{t.huntWizard.outreachSetup}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="capacity" className="text-xs text-muted-foreground">{t.huntWizard.capacityLabel}</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={100}
                className="w-32"
                value={capacityPerWeek}
                onChange={(e) => setCapacityPerWeek(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">{t.huntWizard.channelLabel}</Label>
              <div className="flex gap-3">
                {(["whatsapp", "call", "email"] as const).map((m) => (
                  <label key={m} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="contactMethod"
                      checked={contactMethod === m}
                      onChange={() => setContactMethod(m)}
                      className="accent-primary size-4"
                    />
                    <span>{t.huntWizard.channels[m]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">{t.huntWizard.priorityLabel}</Label>
            <div className="space-y-1.5">
              {priorityOrder.map((key, i) => {
                const niche = allNiches.find((n) => n.key === key);
                if (!niche) return null;
                return (
                  <div key={key} className="flex items-center justify-between p-2.5 rounded-2xl bg-secondary text-xs text-foreground">
                    <span>
                      <span className="text-primary font-semibold mr-2">#{i + 1}</span> {niche.label}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="xs" onClick={() => movePriority(key, -1)} disabled={i === 0}>
                        {t.huntWizard.up}
                      </Button>
                      <Button variant="outline" size="xs" onClick={() => movePriority(key, 1)} disabled={i === priorityOrder.length - 1}>
                        {t.huntWizard.down}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button disabled={generating} onClick={submitInterview}>
            {generating ? (
              <span className="flex items-center gap-1.5"><Loader2 className="size-4 animate-spin" /> {t.huntWizard.generatingPlan}</span>
            ) : (
              <span>{t.huntWizard.generatePlanBtn}</span>
            )}
          </Button>
        </div>
      )}

      {step === "timeline" && timelineMarkdown && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold text-foreground">{t.huntWizard.timelineHeading}</h3>
            <Button variant="outline" size="sm" onClick={() => setStep("place")}>
              <RefreshCw className="size-3.5" /> {t.huntWizard.newHunt}
            </Button>
          </div>
          <div className="p-4 rounded-2xl bg-secondary text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {timelineMarkdown}
          </div>
          <Button asChild>
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
        <Label htmlFor="customLabel" className="text-[11px] text-muted-foreground">{nameLabel}</Label>
        <Input
          id="customLabel"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={namePlaceholder || "e.g. Solar Energy Installers"}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 w-full">
        <Label htmlFor="customQuery" className="text-[11px] text-muted-foreground">{queryLabel}</Label>
        <Input
          id="customQuery"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={queryPlaceholder || "e.g. solar panel contractors"}
        />
      </div>
      <Button variant="outline" onClick={add} disabled={!label || !query}>
        {addLabel}
      </Button>
    </div>
  );
}
