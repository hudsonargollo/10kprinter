import type { Env, LeadRow } from "../types";

/**
 * Push a lead into this project's provisioned TheLeadMachine CRM instance
 * once it's reached a terminal automation state (prd_ready or reviewed) —
 * see theleadmachine/docs/PRD.md §2 and §6.2. Non-fatal by design: CRM
 * tracking is a side integration, not a core pipeline correctness
 * requirement, so a sync failure is logged and swallowed rather than
 * failing (or endlessly retrying) the Workflow.
 */
export async function syncLeadToCrm(
  env: Env,
  lead: LeadRow,
  scoring: { score: number; tier: string } | null,
): Promise<{ ok: boolean; error?: string }> {
  if (!env.THELEADMACHINE_SYNC_URL || !env.THELEADMACHINE_SYNC_TOKEN) {
    return { ok: false, error: "CRM sync not configured" };
  }
  try {
    const res = await fetch(env.THELEADMACHINE_SYNC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sync-Token": env.THELEADMACHINE_SYNC_TOKEN,
      },
      body: JSON.stringify({
        externalRef: lead.id,
        name: lead.business_name ?? lead.url,
        phone: lead.phone ?? undefined,
        company: lead.business_name ?? undefined,
        segment: lead.category ?? undefined,
        score: scoring?.score ?? lead.score ?? undefined,
        tier: scoring?.tier ?? lead.tier ?? undefined,
      }),
    });
    if (!res.ok) return { ok: false, error: `CRM sync HTTP ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Verifies the X-TheLeadMachine-Signature header on an inbound won-webhook call. */
export async function verifyCrmWebhookSignature(
  secret: string,
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;
  const expected = await hmacHex(secret, rawBody);
  return expected === signature;
}
