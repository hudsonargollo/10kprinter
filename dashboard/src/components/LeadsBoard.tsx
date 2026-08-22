import { useCallback, useEffect, useRef, useState } from "react";
import { listLeads } from "../api";
import type { Lead, LeadStatus } from "../types";
import { STATUS_LABELS, STATUS_ORDER } from "../types";
import { NewLeadForm } from "./NewLeadForm";

const IN_PROGRESS: LeadStatus[] = ["discovered", "scraping", "scraped", "audited"];

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

  const columns = STATUS_ORDER.filter((s) => leads?.some((l) => l.status === s));

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
          {columns.map((status) => (
            <div className="board-column" key={status}>
              <h3>
                {STATUS_LABELS[status]} ({leads.filter((l) => l.status === status).length})
              </h3>
              {leads
                .filter((l) => l.status === status)
                .map((lead) => (
                  <a className="lead-card" key={lead.id} href={`#/leads/${lead.id}`}>
                    <div className="name">{lead.business_name || lead.url}</div>
                    <div className="url">{lead.url}</div>
                  </a>
                ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
