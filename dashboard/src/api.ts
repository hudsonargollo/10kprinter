import type { HuntSession, Lead, LeadDetail, LeadSource, LeadStatus, NicheDef, OutreachTimeline } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function listLeads(): Promise<Lead[]> {
  return request("/api/leads");
}

export function getLead(id: string): Promise<LeadDetail> {
  return request(`/api/leads/${id}`);
}

export function createLead(input: { url: string; businessName?: string; category?: string }): Promise<{ id: string }> {
  return request("/api/leads", { method: "POST", body: JSON.stringify(input) });
}

export function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  return request(`/api/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function retryLead(id: string): Promise<{ workflowInstanceId: string }> {
  return request(`/api/leads/${id}/retry`, { method: "POST" });
}

export function setShowcaseUrl(id: string, showcaseUrl: string): Promise<void> {
  return request(`/api/leads/${id}/showcase`, { method: "PATCH", body: JSON.stringify({ showcaseUrl }) });
}

export function transitionLeadStage(
  id: string,
  status: "reviewed" | "proposal_sent" | "won" | "lost",
  opts?: { lostReason?: string; closedAmountUsd?: number },
): Promise<void> {
  return request(`/api/leads/${id}/stage`, { method: "POST", body: JSON.stringify({ status, ...opts }) });
}

export function setLeadNotes(id: string, notes: string): Promise<void> {
  return request(`/api/leads/${id}/notes`, { method: "PATCH", body: JSON.stringify({ notes }) });
}

export async function getPrdMarkdown(leadId: string, prdId: string): Promise<string> {
  const res = await fetch(`/api/leads/${leadId}/prds/${prdId}/markdown`);
  if (!res.ok) throw new Error(`Failed to load PRD: ${res.status}`);
  return res.text();
}

export function listSources(): Promise<LeadSource[]> {
  return request("/api/sources");
}

export function createSource(input: {
  query: string;
  region?: string;
  category?: string;
  huntSessionId?: string;
}): Promise<{ id: string }> {
  return request("/api/sources", { method: "POST", body: JSON.stringify(input) });
}

export function setSourceCronEnabled(id: string, cronEnabled: boolean): Promise<void> {
  return request(`/api/sources/${id}`, { method: "PATCH", body: JSON.stringify({ cronEnabled }) });
}

export function deleteSource(id: string): Promise<void> {
  return request(`/api/sources/${id}`, { method: "DELETE" });
}

export function runSourceNow(id: string): Promise<{ newLeadIds: string[]; skippedNoWebsite: number; skippedExisting: number }> {
  return request(`/api/sources/${id}/run`, { method: "POST" });
}

export function createHuntSession(input: { region: string; niches: NicheDef[]; leadsPerNiche: number }): Promise<{ id: string }> {
  return request("/api/hunt-sessions", { method: "POST", body: JSON.stringify(input) });
}

export function getHuntSession(
  id: string,
): Promise<{ session: HuntSession; sources: LeadSource[]; leads: Lead[]; timeline: OutreachTimeline | null }> {
  return request(`/api/hunt-sessions/${id}`);
}

export function generateOutreachTimeline(
  id: string,
  input: { capacityPerWeek: number; priorityOrder: string[]; contactMethod: string },
): Promise<{ id: string; timelineMarkdown: string }> {
  return request(`/api/hunt-sessions/${id}/timeline`, { method: "POST", body: JSON.stringify(input) });
}
