import { useCallback, useEffect, useRef, useState } from "react";
import {
  getLead,
  getPrdMarkdown,
  retryLead,
  setLeadNotes,
  setShowcaseUrl,
  transitionLeadStage,
  updateLeadStatus,
} from "../api";
import { waLink } from "../lib/waLink";
import type { AuditFinding, BrandTokens, LeadDetail as LeadDetailData, LeadStatus, Prd, Proposal } from "../types";
import { CONSULT_ADDON_USD, STATUS_LABELS, STATUS_ORDER, TIER_LABELS, VERTICAL_LABELS } from "../types";

const IN_PROGRESS: LeadStatus[] = ["discovered", "scraping", "scraped", "audited"];

type Tab = "offer" | "sales" | "overview" | "audits" | "prds" | "timeline";

export function LeadDetailView({ leadId }: { leadId: string }) {
  const [data, setData] = useState<LeadDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("offer");
  const pollRef = useRef<number | null>(null);

  const refresh = useCallback(() => {
    getLead(leadId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load lead"));
  }, [leadId]);

  useEffect(() => {
    setData(null);
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (data && IN_PROGRESS.includes(data.lead.status)) {
      pollRef.current = window.setInterval(refresh, 4000);
      return () => {
        if (pollRef.current) window.clearInterval(pollRef.current);
      };
    }
  }, [data, refresh]);

  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return <p className="empty-state">Loading…</p>;

  const { lead, scrapes, audits, prds, proposals, events } = data;
  const latestScrape = scrapes[scrapes.length - 1];

  async function onStatusChange(status: LeadStatus) {
    await updateLeadStatus(leadId, status);
    refresh();
  }

  return (
    <>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>{lead.business_name || lead.url}</h2>
            <a href={lead.url} target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {lead.url}
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {lead.tier && (
              <span className={`badge tier-${lead.tier}`}>
                {TIER_LABELS[lead.tier]} · {lead.score}
              </span>
            )}
            <span className="badge">{STATUS_LABELS[lead.status]}</span>
            {lead.status === "failed" && (
              <button className="btn" onClick={() => retryLead(leadId).then(refresh)}>
                Retry
              </button>
            )}
            <select value={lead.status} onChange={(e) => onStatusChange(e.target.value as LeadStatus)}>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="tabs">
        {(["offer", "sales", "overview", "audits", "prds", "timeline"] as Tab[]).map((t) => (
          <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "offer"
              ? "Offer"
              : t === "sales"
                ? "Sales"
                : t === "overview"
                  ? "Overview"
                  : t === "audits"
                    ? `Audits (${audits.length})`
                    : t === "prds"
                      ? `PRDs (${prds.length})`
                      : "Timeline"}
          </div>
        ))}
      </div>

      {tab === "offer" && <OfferTab lead={lead} prds={prds} proposals={proposals} onRefresh={refresh} />}
      {tab === "sales" && <SalesTab lead={lead} audits={audits} prds={prds} onRefresh={refresh} />}
      {tab === "overview" && <OverviewTab leadId={leadId} scrape={latestScrape} />}
      {tab === "audits" && <AuditsTab audits={audits} />}
      {tab === "prds" && <PrdsTab leadId={leadId} prds={prds} />}
      {tab === "timeline" && <TimelineTab events={events} />}
    </>
  );
}

function SalesTab({
  lead,
  audits,
  prds,
  onRefresh,
}: {
  lead: LeadDetailData["lead"];
  audits: LeadDetailData["audits"];
  prds: Prd[];
  onRefresh: () => void;
}) {
  const [notesDraft, setNotesDraft] = useState(lead.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [amountDraft, setAmountDraft] = useState(
    String(prds.reduce((sum, p) => sum + (p.price_usd ?? 0), 0) + CONSULT_ADDON_USD),
  );
  const [lostReasonDraft, setLostReasonDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const qualifyingCount = audits.filter((a) => a.qualifies).length;

  async function saveNotes() {
    setSavingNotes(true);
    try {
      await setLeadNotes(lead.id, notesDraft);
      onRefresh();
    } finally {
      setSavingNotes(false);
    }
  }

  async function doTransition(status: "reviewed" | "proposal_sent" | "won" | "lost", opts?: { closedAmountUsd?: number; lostReason?: string }) {
    setBusy(true);
    try {
      await transitionLeadStage(lead.id, status, opts);
      onRefresh();
    } finally {
      setBusy(false);
    }
  }

  const wa = waLink(lead.phone, `Hi ${lead.business_name ?? "there"}, `);

  return (
    <div className="card">
      <h2>Lead thermometer</h2>
      {lead.tier ? (
        <p style={{ marginTop: -6 }}>
          <span className={`badge tier-${lead.tier}`}>
            {TIER_LABELS[lead.tier]} · {lead.score}
          </span>{" "}
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {qualifyingCount}/{audits.length} verticals qualify
          </span>
        </p>
      ) : (
        <p className="empty-state">Not scored yet — waiting on audits.</p>
      )}

      <h2 style={{ marginTop: 24 }}>Contact</h2>
      {wa ? (
        <a className="btn" href={wa} target="_blank" rel="noreferrer">
          Message on WhatsApp
        </a>
      ) : (
        <p className="empty-state">No phone number found.</p>
      )}

      <h2 style={{ marginTop: 24 }}>Notes</h2>
      <textarea
        style={{ width: "100%", minHeight: 80, padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontFamily: "inherit" }}
        value={notesDraft}
        onChange={(e) => setNotesDraft(e.target.value)}
      />
      <div style={{ marginTop: 8 }}>
        <button className="btn btn-primary" onClick={saveNotes} disabled={savingNotes}>
          {savingNotes ? "Saving…" : "Save notes"}
        </button>
      </div>

      <h2 style={{ marginTop: 24 }}>Stage</h2>
      {(lead.status === "prd_ready" || lead.status === "reviewed") && (
        <button className="btn btn-primary" onClick={() => doTransition("proposal_sent")} disabled={busy}>
          Send Proposal
        </button>
      )}
      {lead.status === "proposal_sent" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number"
              style={{ width: 120, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
              value={amountDraft}
              onChange={(e) => setAmountDraft(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => doTransition("won", { closedAmountUsd: Number(amountDraft) })} disabled={busy}>
              Mark Won
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="Reason (optional)"
              style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
              value={lostReasonDraft}
              onChange={(e) => setLostReasonDraft(e.target.value)}
            />
            <button className="btn" onClick={() => doTransition("lost", { lostReason: lostReasonDraft })} disabled={busy}>
              Mark Lost
            </button>
          </div>
        </div>
      )}
      {lead.status === "won" && (
        <p>
          Closed <strong>${lead.closed_amount_usd}</strong> on {lead.closed_at ? new Date(lead.closed_at).toLocaleDateString() : "—"}
        </p>
      )}
      {lead.status === "lost" && (
        <>
          <p>Lost: {lead.lost_reason || "no reason given"}</p>
          <button className="btn" onClick={() => doTransition("proposal_sent")} disabled={busy}>
            Reopen
          </button>
        </>
      )}
      {!["prd_ready", "reviewed", "proposal_sent", "won", "lost"].includes(lead.status) && (
        <p className="empty-state">Sales stages open up once this lead reaches PRD Ready.</p>
      )}
    </div>
  );
}

function OfferTab({
  lead,
  prds,
  proposals,
  onRefresh,
}: {
  lead: LeadDetailData["lead"];
  prds: Prd[];
  proposals: Proposal[];
  onRefresh: () => void;
}) {
  const [urlDraft, setUrlDraft] = useState(lead.showcase_url ?? "");
  const [saving, setSaving] = useState(false);

  const itemTotal = prds.reduce((sum, p) => sum + (p.price_usd ?? 0), 0);
  const bundleTotal = itemTotal + CONSULT_ADDON_USD;

  async function saveShowcaseUrl(url: string) {
    setSaving(true);
    try {
      await setShowcaseUrl(lead.id, url);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h2>Showcase page</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: -6, marginBottom: 12 }}>
        Send this first — before walking the prospect through pain points or pricing. Auto-generated
        drafts below are a starting point — review/polish (or hand-build a Premium one) before sending.
      </p>

      {proposals.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {proposals.map((p) => {
            const url = `${window.location.origin}/api/leads/${lead.id}/proposals/${p.vertical}`;
            return (
              <div
                key={p.id}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)" }}
              >
                <span>{VERTICAL_LABELS[p.vertical]} draft</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <a className="btn" href={url} target="_blank" rel="noreferrer">
                    Preview
                  </a>
                  <button className="btn btn-primary" onClick={() => { setUrlDraft(url); saveShowcaseUrl(url); }} disabled={saving}>
                    Use as showcase
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: lead.showcase_url ? 12 : 0 }}>
        <input
          style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
          placeholder="https://... (paste a hand-built demo page link, or use a draft above)"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => saveShowcaseUrl(urlDraft)} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      {lead.showcase_url && (
        <a className="btn" href={lead.showcase_url} target="_blank" rel="noreferrer">
          Open showcase page →
        </a>
      )}

      <h2 style={{ marginTop: 24 }}>Offer</h2>
      {prds.length === 0 ? (
        <p className="empty-state">No priced line items yet — waiting on audits/PRDs.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px" }}>
            {prds.map((p) => (
              <li key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span>{VERTICAL_LABELS[p.vertical]}</span>
                <strong>${p.price_usd ?? "—"}</strong>
              </li>
            ))}
            <li style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span>+ Add-on: 1-hour strategy consultation with Hudson</span>
              <strong>${CONSULT_ADDON_USD}</strong>
            </li>
          </ul>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
            <span>Full bundle total</span>
            <span>${bundleTotal}</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>
            Each line item is also sellable standalone at its own price — lead with the cheapest, highest-impact
            one, then stack.
          </p>
        </>
      )}
    </div>
  );
}

function OverviewTab({ leadId, scrape }: { leadId: string; scrape: LeadDetailData["scrapes"][number] | undefined }) {
  if (!scrape) return <p className="empty-state">Scrape hasn't completed yet.</p>;
  const summary = scrape.summary_json ? JSON.parse(scrape.summary_json) : null;
  return (
    <div className="card">
      <h2>Scraped page</h2>
      <img
        src={`/api/leads/${leadId}/screenshot`}
        alt="Site screenshot"
        style={{ maxWidth: "100%", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 16 }}
      />
      {summary && (
        <dl style={{ fontSize: 13, display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 6 }}>
          <dt style={{ color: "var(--text-muted)" }}>Title</dt>
          <dd style={{ margin: 0 }}>{summary.title ?? "—"}</dd>
          <dt style={{ color: "var(--text-muted)" }}>Load time</dt>
          <dd style={{ margin: 0 }}>{summary.loadTimeMs}ms</dd>
          <dt style={{ color: "var(--text-muted)" }}>Email capture form</dt>
          <dd style={{ margin: 0 }}>{summary.hasEmailCaptureForm ? "Yes" : "No"}</dd>
          <dt style={{ color: "var(--text-muted)" }}>Phone numbers found</dt>
          <dd style={{ margin: 0 }}>{summary.phoneNumbersFound?.join(", ") || "—"}</dd>
        </dl>
      )}
    </div>
  );
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

function AuditsTab({ audits }: { audits: LeadDetailData["audits"] }) {
  if (audits.length === 0) return <p className="empty-state">No audits yet.</p>;
  return (
    <>
      {audits.map((audit) => {
        const raw = JSON.parse(audit.findings_json);
        const finding: AuditFinding = { good: asStringArray(raw.good), bad: asStringArray(raw.bad), fix: asStringArray(raw.fix) };
        return (
          <div className="card" key={audit.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>{VERTICAL_LABELS[audit.vertical]}</h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className={`badge ${audit.qualifies ? "badge-good" : "badge-bad"}`}>
                  {audit.qualifies ? "Qualifies" : "Does not qualify"}
                </span>
                <span className="badge">Score {audit.score}/100</span>
              </div>
            </div>
            <div className="findings-grid">
              <div className="findings-col">
                <h4>Good</h4>
                <ul>{finding.good.map((g, i) => <li key={i}>{g}</li>)}</ul>
              </div>
              <div className="findings-col">
                <h4>Bad</h4>
                <ul>{finding.bad.map((b, i) => <li key={i}>{b}</li>)}</ul>
              </div>
              <div className="findings-col">
                <h4>Fix</h4>
                <ul>{finding.fix.map((f, i) => <li key={i}>{f}</li>)}</ul>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function PrdsTab({ leadId, prds }: { leadId: string; prds: Prd[] }) {
  const [activeId, setActiveId] = useState<string | null>(prds[0]?.id ?? null);
  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    getPrdMarkdown(leadId, activeId)
      .then(setMarkdown)
      .finally(() => setLoading(false));
  }, [leadId, activeId]);

  if (prds.length === 0) return <p className="empty-state">No PRDs generated yet — this lead may not have qualified for any vertical.</p>;

  const active = prds.find((p) => p.id === activeId);
  const tokens: BrandTokens | null = active ? JSON.parse(active.brand_tokens_json) : null;

  function download() {
    if (!active) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.vertical}-prd.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card">
      <div className="tabs" style={{ marginBottom: 12 }}>
        {prds.map((p) => (
          <div key={p.id} className={`tab ${p.id === activeId ? "active" : ""}`} onClick={() => setActiveId(p.id)}>
            {VERTICAL_LABELS[p.vertical]}
          </div>
        ))}
      </div>

      {tokens && (
        <div style={{ marginBottom: 16 }}>
          <div className="swatch-row">
            {(["primary", "background", "backgroundAlt"] as const).map((key) => (
              <div key={key} className="swatch" style={{ background: tokens[key], color: tokens.textOnBackground }}>
                {key}
              </div>
            ))}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 6 }}>{tokens.rationale}</p>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button className="btn" onClick={download} disabled={loading}>
          Download .md
        </button>
      </div>

      <div className="prd-markdown">{loading ? "Loading…" : markdown}</div>
    </div>
  );
}

function TimelineTab({ events }: { events: LeadDetailData["events"] }) {
  if (events.length === 0) return <p className="empty-state">No events yet.</p>;
  return (
    <div className="card">
      <ul className="event-timeline">
        {events.map((e) => (
          <li key={e.id}>
            <span>
              <span className="stage">{e.stage}</span> — {e.status}
              {e.message ? `: ${e.message}` : ""}
            </span>
            <span className="time">{e.created_at}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
