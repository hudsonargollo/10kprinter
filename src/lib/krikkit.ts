import type { AuditFinding, BrandTokens, Env, LeadRow } from "../types";

export type KrikkitBuildStatus =
  | "queued"
  | "planning"
  | "building"
  | "ready"
  | "publishing"
  | "live"
  | "failed";

export interface KrikkitBuild {
  id: string;
  kind: "site" | "proposal";
  status: KrikkitBuildStatus;
  stage: string | null;
  turns: number;
  files: number;
  preview_url: string | null;
  live_url: string | null;
  error: string | null;
}

export class KrikkitError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "KrikkitError";
  }
}

function baseUrl(env: Env): string {
  return (env.KRIKKIT_BASE_URL ?? "https://web.clubemkt.digital").replace(/\/$/, "");
}

async function request<T>(
  env: Env,
  method: string,
  path: string,
  body?: unknown,
  idempotencyKey?: string,
): Promise<T> {
  if (!env.KRIKKIT_API_KEY) throw new KrikkitError("KRIKKIT_API_KEY is not configured", 503);
  const headers: Record<string, string> = { "X-MoneyMachine-Key": env.KRIKKIT_API_KEY };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const res = await fetch(`${baseUrl(env)}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const message =
      data && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : text.slice(0, 200);
    throw new KrikkitError(`Krikkit ${method} ${path} -> ${res.status}: ${message}`, res.status);
  }
  return data as T;
}

export interface CreateBuildInput {
  kind: "site" | "proposal";
  title: string;
  brief: Record<string, unknown>;
  model?: string;
}

export async function createBuild(
  env: Env,
  input: CreateBuildInput,
  idempotencyKey: string,
): Promise<{ id: string; status: KrikkitBuildStatus; poll_url: string }> {
  return request(env, "POST", "/api/v1/builds", input, idempotencyKey);
}

export async function getBuild(env: Env, id: string): Promise<KrikkitBuild> {
  return request(env, "GET", `/api/v1/builds/${encodeURIComponent(id)}`);
}

export async function publishBuild(env: Env, id: string, subdomain: string): Promise<KrikkitBuild> {
  return request(env, "POST", `/api/v1/builds/${encodeURIComponent(id)}/publish`, { subdomain });
}

export function buildProposalBrief(
  lead: LeadRow,
  finding: AuditFinding,
  priceUsd: number,
  brand: BrandTokens | null,
  consultAddonUsd = 100,
  roadmapDays = 7,
): Record<string, unknown> {
  return {
    locale: lead.language ?? "en",
    business: { name: lead.business_name, url: lead.url, phone: lead.phone },
    audit: { score: finding.score, good: finding.good, bad: finding.bad, fix: finding.fix },
    offer: { price_usd: priceUsd, consult_addon_usd: consultAddonUsd, roadmap_days: roadmapDays },
    design: { primary_color: brand?.primary ?? "#0ea5e9" },
  };
}

const SUBDOMAIN_RE = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;

export function suggestSubdomain(lead: LeadRow): string {
  const hex = lead.id.replace(/-/g, "").slice(0, 8).toLowerCase();
  const slug = (lead.business_name ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  const candidate = slug ? `${slug}-${hex}` : `site-${hex}`;
  return SUBDOMAIN_RE.test(candidate) ? candidate : `site-${hex}`;
}