import { useState } from "react";
import { createHuntSession, createSource, generateOutreachTimeline, runSourceNow } from "../api";
import type { NicheDef } from "../types";
import { NICHE_PACKAGE } from "../types";
import { PlaceAutocomplete } from "./PlaceAutocomplete";

type Step = "place" | "niches" | "run" | "interview" | "timeline";

type NicheProgress = { status: "pending" | "running" | "done"; count: number };

export function HuntWizard() {
  const [step, setStep] = useState<Step>("place");
  const [region, setRegion] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(NICHE_PACKAGE.map((n) => n.key)));
  const [customNiches, setCustomNiches] = useState<NicheDef[]>([]);
  const [leadsPerNiche, setLeadsPerNiche] = useState(20);

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

    const { id: sessionId } = await createHuntSession({ region, niches: allNiches, leadsPerNiche });
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
    <div className="card">
      <h2>Hunt Wizard</h2>

      {step === "place" && (
        <>
          <div className="form-row">
            <label htmlFor="region">Place</label>
            <PlaceAutocomplete id="region" placeholder="Santa Cruz de la Sierra, Bolivia" value={region} onChange={setRegion} />
          </div>
          <button className="btn btn-primary" disabled={!region} onClick={() => setStep("niches")}>
            Next: Niches
          </button>
        </>
      )}

      {step === "niches" && (
        <>
          <h3>Niches</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {NICHE_PACKAGE.map((n) => (
              <label key={n.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={selectedKeys.has(n.key)} onChange={() => toggleNiche(n.key)} />
                {n.label}
              </label>
            ))}
          </div>
          <CustomNicheForm onAdd={(n) => setCustomNiches((prev) => [...prev, n])} />
          {customNiches.length > 0 && (
            <ul style={{ marginTop: 8 }}>
              {customNiches.map((n) => (
                <li key={n.key} style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {n.label} — {n.queryVariants[0]}
                </li>
              ))}
            </ul>
          )}
          <div className="form-row" style={{ marginTop: 16 }}>
            <label htmlFor="leadsPerNiche">Leads per niche</label>
            <input
              id="leadsPerNiche"
              type="number"
              value={leadsPerNiche}
              onChange={(e) => setLeadsPerNiche(Number(e.target.value))}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => setStep("place")}>
              Back
            </button>
            <button className="btn btn-primary" disabled={allNiches.length === 0} onClick={() => setStep("run")}>
              Next: Review & Run
            </button>
          </div>
        </>
      )}

      {step === "run" && (
        <>
          <h3>Review & Run</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {region} · {allNiches.length} niche(s) · up to {leadsPerNiche} leads each
          </p>
          {!running && !huntSessionId && (
            <button className="btn btn-primary" onClick={startHunt}>
              Start Hunt
            </button>
          )}
          <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
            {allNiches.map((n) => {
              const p = progress[n.key];
              return (
                <li key={n.key} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{n.label}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    {!p || p.status === "pending" ? "pending" : p.status === "running" ? `running… ${p.count} found` : `${p.count} found`}
                  </span>
                </li>
              );
            })}
          </ul>
          {huntSessionId && !running && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setStep("interview")}>
              Next: Outreach Interview
            </button>
          )}
        </>
      )}

      {step === "interview" && (
        <>
          <h3>Outreach Interview</h3>
          <div className="form-row">
            <label htmlFor="capacity">Leads you can follow up on per week</label>
            <input
              id="capacity"
              type="number"
              value={capacityPerWeek}
              onChange={(e) => setCapacityPerWeek(Number(e.target.value))}
            />
          </div>
          <div className="form-row">
            <label>Preferred contact method</label>
            <div style={{ display: "flex", gap: 12 }}>
              {(["whatsapp", "call", "email"] as const).map((m) => (
                <label key={m} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="radio" name="contactMethod" checked={contactMethod === m} onChange={() => setContactMethod(m)} />
                  {m}
                </label>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>Niche priority (highest first)</label>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {priorityOrder.map((key, i) => {
                const niche = allNiches.find((n) => n.key === key);
                if (!niche) return null;
                return (
                  <li key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                    <span>
                      {i + 1}. {niche.label}
                    </span>
                    <span style={{ display: "flex", gap: 4 }}>
                      <button className="btn" onClick={() => movePriority(key, -1)} disabled={i === 0}>
                        ↑
                      </button>
                      <button className="btn" onClick={() => movePriority(key, 1)} disabled={i === priorityOrder.length - 1}>
                        ↓
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <button className="btn btn-primary" disabled={generating} onClick={submitInterview}>
            {generating ? "Building timeline…" : "Generate Outreach Timeline"}
          </button>
        </>
      )}

      {step === "timeline" && timelineMarkdown && (
        <>
          <h3>Outreach Timeline</h3>
          <div className="prd-markdown">{timelineMarkdown}</div>
          <a className="btn" style={{ marginTop: 16 }} href="#/">
            View leads from this hunt
          </a>
        </>
      )}
    </div>
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
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
      <div className="form-row" style={{ flex: 1, margin: 0 }}>
        <label htmlFor="customLabel">Custom niche label</label>
        <input id="customLabel" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Veterinary Clinics" />
      </div>
      <div className="form-row" style={{ flex: 1, margin: 0 }}>
        <label htmlFor="customQuery">Search query</label>
        <input id="customQuery" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="veterinary clinics" />
      </div>
      <button className="btn" onClick={add} disabled={!label || !query}>
        Add
      </button>
    </div>
  );
}
