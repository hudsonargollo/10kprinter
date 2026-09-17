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

type Step = "place" | "niches" | "run" | "interview" | "timeline";

const STEPS: { key: Step; label: string }[] = [
  { key: "place", label: "Place" },
  { key: "niches", label: "Niches" },
  { key: "run", label: "Review & Run" },
  { key: "interview", label: "Interview" },
  { key: "timeline", label: "Timeline" },
];

type NicheProgress = { status: "pending" | "running" | "done"; count: number };

export function HuntWizard() {
  const [step, setStep] = useState<Step>("place");
  const [region, setRegion] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(NICHE_PACKAGE.map((n) => n.key)));
  const [customNiches, setCustomNiches] = useState<NicheDef[]>([]);
  const [leadsPerNiche, setLeadsPerNiche] = useState(20);
  const [language, setLanguage] = useState("auto");

  const [huntSessionId, setHuntSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, NicheProgress>>({});
  const [running, setRunning] = useState(false);

  const [capacityPerWeek, setCapacityPerWeek] = useState(10);
  const [priorityOrder, setPriorityOrder] = useState<string[]>([]);
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "call" | "email">("whatsapp");
  const [timelineMarkdown, setTimelineMarkdown] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const allNiches: NicheDef[] = [...NICHE_PACKAGE.filter((n) => selectedKeys.has(n.key)), ...customNiches];

  function toggleNiche(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function startHunt() {
    setRunning(true);
    const initial: Record<string, NicheProgress> = {};
    for (const n of allNiches) initial[n.key] = { status: "pending", count: 0 };
    setProgress(initial);

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
      }
      finalCounts[niche.key] = found;
      setProgress((prev) => ({ ...prev, [niche.key]: { status: "done", count: found } }));
    }

    setRunning(false);
    setPriorityOrder(allNiches.filter((n) => finalCounts[n.key] > 0).map((n) => n.key));
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
    try {
      const { timelineMarkdown } = await generateOutreachTimeline(huntSessionId, {
        capacityPerWeek,
        priorityOrder,
        contactMethod,
      });
      setTimelineMarkdown(timelineMarkdown);
      setStep("timeline");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Card className="p-5">
      <h2 className="mb-1 font-heading text-[15px] font-bold">Hunt Wizard</h2>

      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        {STEPS.map((s, i) => (
          <span
            key={s.key}
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wide",
              s.key === step
                ? "bg-primary text-primary-foreground"
                : i < STEPS.findIndex((x) => x.key === step)
                  ? "bg-muted text-foreground"
                  : "bg-muted/50 text-muted-foreground"
            )}
          >
            {i + 1}. {s.label}
          </span>
        ))}
      </div>

      {step === "place" && (
        <>
          <div className="mb-4 flex flex-col gap-1">
            <Label htmlFor="region">Place</Label>
            <PlaceAutocomplete id="region" placeholder="Santa Cruz de la Sierra, Bolivia" value={region} onChange={setRegion} />
          </div>
          <div className="mb-4 flex flex-col gap-1">
            <Label htmlFor="hunt-language">Generation & Output Language</Label>
            <select
              id="hunt-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-card border border-input rounded-md px-3 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="auto">Auto-detect from Region / Country</option>
              <option value="en">English (US/UK/Global)</option>
              <option value="pt">Português (Brasil / Portugal)</option>
              <option value="es">Español (LatAm / España)</option>
            </select>
          </div>
          <Button disabled={!region} onClick={() => setStep("niches")}>
            Next: Niches
          </Button>
        </>
      )}

      {step === "niches" && (
        <>
          <h3 className="mb-2.5 font-heading text-sm font-bold">Niches</h3>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {NICHE_PACKAGE.map((n) => (
              <Label key={n.key} className="font-normal normal-case">
                <input type="checkbox" checked={selectedKeys.has(n.key)} onChange={() => toggleNiche(n.key)} />
                {n.label}
              </Label>
            ))}
          </div>
          <CustomNicheForm onAdd={(n) => setCustomNiches((prev) => [...prev, n])} />
          {customNiches.length > 0 && (
            <ul className="mt-2 list-none p-0">
              {customNiches.map((n) => (
                <li key={n.key} className="text-[13px] text-muted-foreground">
                  {n.label} — {n.queryVariants[0]}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 mb-4 flex flex-col gap-1">
            <Label htmlFor="leadsPerNiche">Leads per niche</Label>
            <Input
              id="leadsPerNiche"
              type="number"
              className="w-32"
              value={leadsPerNiche}
              onChange={(e) => setLeadsPerNiche(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("place")}>
              Back
            </Button>
            <Button disabled={allNiches.length === 0} onClick={() => setStep("run")}>
              Next: Review & Run
            </Button>
          </div>
        </>
      )}

      {step === "run" && (
        <>
          <h3 className="mb-2.5 font-heading text-sm font-bold">Review & Run</h3>
          <p className="text-[13px] text-muted-foreground">
            {region} · {allNiches.length} niche(s) · up to {leadsPerNiche} leads each
          </p>
          {!running && !huntSessionId && (
            <Button className="mt-3" onClick={startHunt}>
              Start Hunt
            </Button>
          )}
          <ul className="mt-4 list-none p-0">
            {allNiches.map((n) => {
              const p = progress[n.key];
              return (
                <li key={n.key} className="flex justify-between border-b border-border py-1.5">
                  <span>{n.label}</span>
                  <span className="text-[13px] text-muted-foreground">
                    {!p || p.status === "pending" ? "pending" : p.status === "running" ? `running… ${p.count} found` : `${p.count} found`}
                  </span>
                </li>
              );
            })}
          </ul>
          {huntSessionId && !running && (
            <Button className="mt-4" onClick={() => setStep("interview")}>
              Next: Outreach Interview
            </Button>
          )}
        </>
      )}

      {step === "interview" && (
        <>
          <h3 className="mb-2.5 font-heading text-sm font-bold">Outreach Interview</h3>
          <div className="mb-4 flex flex-col gap-1">
            <Label htmlFor="capacity">Leads you can follow up on per week</Label>
            <Input
              id="capacity"
              type="number"
              className="w-32"
              value={capacityPerWeek}
              onChange={(e) => setCapacityPerWeek(Number(e.target.value))}
            />
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <Label>Preferred contact method</Label>
            <div className="flex gap-3">
              {(["whatsapp", "call", "email"] as const).map((m) => (
                <Label key={m} className="font-normal normal-case">
                  <input type="radio" name="contactMethod" checked={contactMethod === m} onChange={() => setContactMethod(m)} />
                  {m}
                </Label>
              ))}
            </div>
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <Label>Niche priority (highest first)</Label>
            <ul className="list-none p-0">
              {priorityOrder.map((key, i) => {
                const niche = allNiches.find((n) => n.key === key);
                if (!niche) return null;
                return (
                  <li key={key} className="flex items-center justify-between py-1.5">
                    <span>
                      {i + 1}. {niche.label}
                    </span>
                    <span className="flex gap-1">
                      <Button variant="outline" size="icon-sm" onClick={() => movePriority(key, -1)} disabled={i === 0}>
                        ↑
                      </Button>
                      <Button variant="outline" size="icon-sm" onClick={() => movePriority(key, 1)} disabled={i === priorityOrder.length - 1}>
                        ↓
                      </Button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <Button disabled={generating} onClick={submitInterview}>
            {generating ? "Building timeline…" : "Generate Outreach Timeline"}
          </Button>
        </>
      )}

      {step === "timeline" && timelineMarkdown && (
        <>
          <h3 className="mb-2.5 font-heading text-sm font-bold">Outreach Timeline</h3>
          <div className="prd-markdown">{timelineMarkdown}</div>
          <Button asChild variant="outline" className="mt-4">
            <a href="#/">View leads from this hunt</a>
          </Button>
        </>
      )}
    </Card>
  );
}

function CustomNicheForm({ onAdd }: { onAdd: (niche: NicheDef) => void }) {
  const [label, setLabel] = useState("");
  const [query, setQuery] = useState("");

  function add() {
    if (!label || !query) return;
    onAdd({ key: `custom-${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`, label, queryVariants: [query] });
    setLabel("");
    setQuery("");
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex flex-1 flex-col gap-1">
        <Label htmlFor="customLabel">Custom niche label</Label>
        <Input id="customLabel" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Veterinary Clinics" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <Label htmlFor="customQuery">Search query</Label>
        <Input id="customQuery" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="veterinary clinics" />
      </div>
      <Button variant="outline" onClick={add} disabled={!label || !query}>
        Add
      </Button>
    </div>
  );
}
