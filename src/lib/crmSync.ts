import type { Env, LeadRow } from "../types";

/**
 * Push a lead into Twenty CRM or TheLeadMachine instance once it's reached
 * a terminal automation state (prd_ready or reviewed).
 * Non-fatal by design: CRM tracking is a side integration, not a core pipeline correctness
 * requirement, so a sync failure is logged and swallowed rather than failing the Workflow.
 */
export async function syncLeadToCrm(
  env: Env,
  lead: LeadRow,
  scoring: { score: number; tier: string } | null,
): Promise<{ ok: boolean; error?: string }> {
  let syncedAny = false;
  const errors: string[] = [];

  // 1. Sync to Twenty CRM if TWENTY_API_KEY configured
  if (env.TWENTY_API_KEY) {
    const twentyUrl = (env.TWENTY_API_URL || "https://api.twenty.com").replace(/\/$/, "");
    try {
      const companyName = lead.business_name || lead.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      const res = await fetch(`${twentyUrl}/rest/people`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.TWENTY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: {
            firstName: lead.business_name || "Lead",
            lastName: scoring ? `[${scoring.tier.toUpperCase()} ${scoring.score}]` : "",
          },
          ...(lead.phone ? { phones: { primaryPhone: lead.phone } } : {}),
          jobTitle: lead.category ? `Lead in ${lead.category}` : "Lead",
          company: companyName,
        }),
      });

      if (res.ok) {
        syncedAny = true;
      } else {
        const errText = await res.text().catch(() => "");
        errors.push(`Twenty CRM HTTP ${res.status}: ${errText.slice(0, 120)}`);
      }
    } catch (twentyErr) {
      errors.push(`Twenty CRM error: ${twentyErr instanceof Error ? twentyErr.message : String(twentyErr)}`);
    }
  }

  // 2. Sync to TheLeadMachine if configured
  if (env.THELEADMACHINE_SYNC_URL && env.THELEADMACHINE_SYNC_TOKEN) {
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
      if (res.ok) {
        syncedAny = true;
      } else {
        errors.push(`TheLeadMachine HTTP ${res.status}`);
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  if (!env.TWENTY_API_KEY && !env.THELEADMACHINE_SYNC_URL) {
    return { ok: false, error: "No CRM endpoints configured" };
  }

  if (syncedAny) {
    return { ok: true };
  }

  return { ok: false, error: errors.join(" | ") };
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
