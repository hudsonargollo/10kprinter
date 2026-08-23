import { useCallback, useEffect, useRef, useState } from "react";
import { listLeads } from "../api";
import type { Lead, LeadStatus } from "../types";
import { STATUS_LABELS, STATUS_ORDER } from "../types";
import { NewLeadForm } from "./NewLeadForm";

const IN_PROGRESS: LeadStatus[] = ["discovered", "scraping", "scraped", "audited"];
const SALES_COLUMNS = STATUS_ORDER.filter((s) => !IN_PROGRESS.includes(s));

export function LeadsBoard() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  const refresh = useCallback(() => {
    listLeads()
      .then(setLeads)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load leads"));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const hasInProgress = leads?.some((l) => IN_PROGRESS.includes(l.status));
    if (hasInProgress) {
      pollRef.current = window.setInterval(refresh, 5000);
      return () => {
        if (pollRef.current) window.clearInterval(pollRef.current);
      };
    }
  }, [leads, refresh]);

  const inProgressLeads = leads?.filter((l) => IN_PROGRESS.includes(l.status)) ?? [];
  const salesColumns = SALES_COLUMNS.filter((s) => leads?.some((l) => l.status === s));

  function sortedByScore(items: Lead[]): Lead[] {
    return [...items].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  function LeadCard({ lead }: { lead: Lead }) {
    return (
      <a className="lead-card" href={`#/leads/${lead.id}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div className="name">{lead.business_name || lead.url}</div>
          {lead.tier && (
            <span className={`badge tier-${lead.tier}`} style={{ fontSize: 11, flexShrink: 0 }}>
              {lead.score}
            </span>
          )}
        </div>
        <div className="url">{lead.url}</div>
      </a>
    );
  }

  return (
    <>
      <NewLeadForm onCreated={refresh} />

      {error && <div className="error-banner">{error}</div>}

      {leads === null ? (
        <p className="empty-state">Loading…</p>
      ) : leads.length === 0 ? (
        <p className="empty-state">No leads yet — audit your first prospect above.</p>
      ) : (
        <div className="board">
          {inProgressLeads.length > 0 && (
            <div className="board-column">
              <h3>In Progress ({inProgressLeads.length})</h3>
              {inProgressLeads.map((lead) => (
                <a className="lead-card" key={lead.id} href={`#/leads/${lead.id}`}>
                  <div className="name">{lead.business_name || lead.url}</div>
                  <div className="url">
                    {lead.url} · {STATUS_LABELS[lead.status]}
                  </div>
                </a>
              ))}
            </div>
          )}
          {salesColumns.map((status) => (
            <div className="board-column" key={status}>
              <h3>
                {STATUS_LABELS[status]} ({leads.filter((l) => l.status === status).length})
              </h3>
              {sortedByScore(leads.filter((l) => l.status === status)).map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
