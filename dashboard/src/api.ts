import type { Lead, LeadDetail, LeadStatus } from "./types";

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

export async function getPrdMarkdown(leadId: string, prdId: string): Promise<string> {
  const res = await fetch(`/api/leads/${leadId}/prds/${prdId}/markdown`);
  if (!res.ok) throw new Error(`Failed to load PRD: ${res.status}`);
  return res.text();
}
