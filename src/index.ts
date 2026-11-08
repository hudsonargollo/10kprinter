import { Hono } from "hono";
import type { Context, Next } from "hono";
import type { AuditFinding, BrandTokens, Env, HuntSessionRow, LeadRow, LeadSourceRow, OutreachTimelineRow, VerticalKey } from "./types";
import { newId, setLeadNotes, transitionLeadStage, saveQualification, saveSalesArtifact, saveNextAction, updateOnboarding, logEvent, insertWebsiteBuild, attachKrikkitBuild, syncWebsiteBuild, listWebsiteBuilds, getWebsiteBuild } from "./lib/db";
import { runHunterCycle, runHunterForSource } from "./hunter";
import { generateText } from "./lib/anthropic";
import { autocompleteCities } from "./lib/places";
import { verifyCrmWebhookSignature } from "./lib/crmSync";
import { getSessionUserId, getUserByEmail, getUserById, verifyPassword, hashPassword, createSessionCookie, clearSessionCookie } from "./lib/auth";
import { resolveTargetLanguage, getLanguagePromptInstruction } from "./lib/language";
import { createBuild, getBuild, publishBuild, buildProposalBrief, suggestSubdomain, KrikkitError } from "./lib/krikkit";

export { LeadPipeline } from "./workflows/leadPipeline";

const app = new Hono<{ Bindings: Env }>();

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message }, 500);
});

// ── Auth (self-contained, no external provider — see AGENTS.md) ────────
app.get("/api/auth/me", async (c) => {
  const userId = await getSessionUserId(c.req.raw, c.env);
  if (!userId) return c.json({ error: "not signed in" }, 401);
  const user = await getUserById(c.env.DB, userId);
  if (!user) return c.json({ error: "not signed in" }, 401);
  return c.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();
  const user = await getUserByEmail(c.env.DB, email || "");
  if (!user || !(await verifyPassword(password || "", user.password_hash))) {
    return c.json({ error: "Incorrect email or password." }, 401);
  }
  c.header("Set-Cookie", await createSessionCookie(c.env, user.id));
  return c.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

// Registration exists only to create the very first account. Once any user
// exists the endpoint is closed: otherwise anyone on the internet can mint a
// super_admin session. Later accounts are seeded by an administrator.
app.get("/api/auth/registration", async (c) => {
  const row = await c.env.DB.prepare("SELECT count(*) AS n FROM users").first<{ n: number }>();
  return c.json({ open: (row?.n ?? 0) === 0 });
});

app.post("/api/auth/register", async (c) => {
  const { email, password, name } = await c.req.json<{ email: string; password: string; name?: string }>();
  if (!email || !email.includes("@")) {
    return c.json({ error: "A valid email address is required." }, 400);
  }
  if (!password || password.length < 6) {
    return c.json({ error: "Password must be at least 6 characters." }, 400);
  }
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await getUserByEmail(c.env.DB, normalizedEmail);
  if (existing) {
    return c.json({ error: "An account with this email already exists." }, 409);
  }
  const id = newId();
  const password_hash = await hashPassword(password);
  // Single statement so two concurrent first-registrations cannot both pass a
  // check-then-insert: the second one inserts zero rows.
  const result = await c.env.DB.prepare(
    `INSERT INTO users (id, email, name, password_hash, role)
     SELECT ?, ?, ?, ?, 'super_admin'
     WHERE NOT EXISTS (SELECT 1 FROM users)`,
  )
    .bind(id, normalizedEmail, name?.trim() ?? null, password_hash)
    .run();

  if ((result.meta.changes ?? 0) === 0) {
    return c.json({ error: "Registration is closed. Ask an administrator to create your account." }, 403);
  }

  c.header("Set-Cookie", await createSessionCookie(c.env, id));
  return c.json({ user: { id, email: normalizedEmail, name: name?.trim() ?? null, role: "super_admin" } }, 201);
});

app.post("/api/auth/logout", async (c) => {
  c.header("Set-Cookie", clearSessionCookie());
  return c.json({ ok: true });
});

async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const userId = await getSessionUserId(c.req.raw, c.env);
  if (!userId) return c.json({ error: "unauthorized" }, 401);
  // A deleted user's cookie keeps its valid signature until it expires.
  if (!(await getUserById(c.env.DB, userId))) return c.json({ error: "unauthorized" }, 401);
  await next();
}

// Every internal ops route requires a session. Deliberately excluded:
// /api/auth/*, the two /api/leads/:id/proposals/* routes (meant to be sent
// to prospects), and /api/webhooks/* (HMAC-verified, not cookie-based).
for (const path of [
  "/api/leads",
  "/api/leads/:id",
  "/api/leads/:leadId/prds/:prdId/markdown",
  "/api/leads/:id/retry",
  "/api/leads/:id/screenshot",
  "/api/leads/:id/stage",
  "/api/leads/:id/notes",
  "/api/leads/:id/qualification",
  "/api/leads/:id/artifacts",
  "/api/leads/:id/next-action",
  "/api/leads/:id/onboarding",
  "/api/leads/:id/showcase",
  "/api/leads/:id/status",
  "/api/leads/:id/website-build",
  "/api/leads/:id/website-builds",
  "/api/website-builds/:id",
  "/api/website-builds/:id/publish",
  "/api/sources",
  "/api/sources/:id",
  "/api/sources/:id/run",
  "/api/places/autocomplete",
  "/api/hunt-sessions",
  "/api/hunt-sessions/:id",
  "/api/hunt-sessions/:id/timeline",
]) {
  app.use(path, requireAuth);
}

// Create a lead and immediately kick off its pipeline run (the "manual single-URL" path).
app.post("/api/leads", async (c) => {
  const body = await c.req.json<{ url: string; businessName?: string; category?: string; language?: string }>();
  if (!body.url) return c.json({ error: "url is required" }, 400);

  const id = newId();
  const lang = resolveTargetLanguage(body.language, null, body.url);
  await c.env.DB.prepare(
    "INSERT INTO leads (id, business_name, url, category, status, language) VALUES (?, ?, ?, ?, 'discovered', ?)",
  )
    .bind(id, body.businessName ?? null, body.url, body.category ?? null, lang)
    .run();

  const instance = await c.env.LEAD_PIPELINE.create({ id, params: { leadId: id } });
  await c.env.DB.prepare("UPDATE leads SET workflow_instance_id = ? WHERE id = ?")
    .bind(instance.id, id)
    .run();

  return c.json({ id, workflowInstanceId: instance.id, language: lang }, 201);
});

app.get("/api/leads", async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT leads.*,
      (SELECT count(*) FROM audits WHERE audits.lead_id = leads.id) AS audit_count,
      (SELECT count(*) FROM prds WHERE prds.lead_id = leads.id) AS prd_count,
      (SELECT count(*) FROM scrapes WHERE scrapes.lead_id = leads.id) AS scrape_count,
      (SELECT count(*) FROM proposals WHERE proposals.lead_id = leads.id) AS proposal_count,
      (SELECT message FROM pipeline_events WHERE pipeline_events.lead_id = leads.id AND pipeline_events.status = 'failed' ORDER BY created_at DESC LIMIT 1) AS last_error
    FROM leads
    ORDER BY discovered_at DESC
  `).all<LeadRow & { audit_count: number; prd_count: number; scrape_count: number; proposal_count: number }>();
  return c.json(results);
});

app.get("/api/leads/:id", async (c) => {
  const id = c.req.param("id");
  const lead = await c.env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first<LeadRow>();
  if (!lead) return c.json({ error: "not found" }, 404);

  const [scrapes, audits, prds, proposals, events] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM scrapes WHERE lead_id = ? ORDER BY scraped_at").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM audits WHERE lead_id = ? ORDER BY created_at").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM prds WHERE lead_id = ? ORDER BY created_at").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM proposals WHERE lead_id = ? ORDER BY created_at").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM pipeline_events WHERE lead_id = ? ORDER BY created_at").bind(id).all(),
  ]);

  return c.json({
    lead,
    scrapes: scrapes.results,
    audits: audits.results,
    prds: prds.results,
    proposals: proposals.results,
    events: events.results,
  });
});

app.get("/api/leads/:leadId/prds/:prdId/markdown", async (c) => {
  const { prdId } = c.req.param();
  const prd = await c.env.DB.prepare("SELECT * FROM prds WHERE id = ?").bind(prdId).first<{ r2_markdown_key: string }>();
  if (!prd) return c.json({ error: "not found" }, 404);
  const obj = await c.env.ASSETS_BUCKET.get(prd.r2_markdown_key);
  if (!obj) return c.json({ error: "markdown not found in storage" }, 404);
  return new Response(obj.body, { headers: { "content-type": "text/markdown; charset=utf-8" } });
});

// Re-run a lead's pipeline from scratch (e.g. after a failed/errored run) with a fresh Workflow instance.
app.post("/api/leads/:id/retry", async (c) => {
  const id = c.req.param("id");
  const lead = await c.env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first<LeadRow>();
  if (!lead) return c.json({ error: "not found" }, 404);

  // Clear stale rows from prior attempts so a retry doesn't leave duplicate/superseded data.
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM scrapes WHERE lead_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM audits WHERE lead_id = ?").bind(id),
    c.env.DB.prepare("DELETE FROM prds WHERE lead_id = ?").bind(id),
    c.env.DB.prepare("UPDATE leads SET status = 'discovered' WHERE id = ?").bind(id),
  ]);
  const instance = await c.env.LEAD_PIPELINE.create({ params: { leadId: id } });
  await c.env.DB.prepare("UPDATE leads SET workflow_instance_id = ? WHERE id = ?").bind(instance.id, id).run();

  return c.json({ workflowInstanceId: instance.id });
});

app.get("/api/leads/:id/screenshot", async (c) => {
  const id = c.req.param("id");
  const scrape = await c.env.DB.prepare("SELECT r2_screenshot_key FROM scrapes WHERE lead_id = ? ORDER BY scraped_at DESC LIMIT 1")
    .bind(id)
    .first<{ r2_screenshot_key: string | null }>();
  if (!scrape?.r2_screenshot_key) return c.json({ error: "not found" }, 404);
  const obj = await c.env.ASSETS_BUCKET.get(scrape.r2_screenshot_key);
  if (!obj) return c.json({ error: "screenshot not found in storage" }, 404);
  return new Response(obj.body, { headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000" } });
});

// Public, shareable — this is the auto-generated proposal draft's actual delivery URL (see
// theleadmachine-style AGENTS.md note: never require auth on a link meant to be sent to a prospect).
app.get("/api/leads/:id/proposals/:vertical/cover", async (c) => {
  const { id, vertical } = c.req.param();
  const proposal = await c.env.DB.prepare(
    "SELECT r2_cover_image_key FROM proposals WHERE lead_id = ? AND vertical = ? ORDER BY created_at DESC LIMIT 1",
  )
    .bind(id, vertical)
    .first<{ r2_cover_image_key: string | null }>();
  if (!proposal?.r2_cover_image_key) return c.json({ error: "not found" }, 404);
  const obj = await c.env.ASSETS_BUCKET.get(proposal.r2_cover_image_key);
  if (!obj) return c.json({ error: "cover image not found in storage" }, 404);
  const contentType = proposal.r2_cover_image_key.endsWith(".png") ? "image/png" : "image/jpeg";
  return new Response(obj.body, { headers: { "content-type": contentType, "cache-control": "public, max-age=31536000" } });
});

app.get("/api/leads/:id/proposals/:vertical", async (c) => {
  const { id, vertical } = c.req.param();
  const proposal = await c.env.DB.prepare(
    "SELECT r2_html_key FROM proposals WHERE lead_id = ? AND vertical = ? ORDER BY created_at DESC LIMIT 1",
  )
    .bind(id, vertical)
    .first<{ r2_html_key: string }>();
  if (!proposal) return c.json({ error: "not found" }, 404);
  const obj = await c.env.ASSETS_BUCKET.get(proposal.r2_html_key);
  if (!obj) return c.json({ error: "proposal not found in storage" }, 404);
  return new Response(obj.body, { headers: { "content-type": "text/html; charset=utf-8" } });
});

const SALES_STAGES = new Set(["reviewed", "proposal_sent", "won", "lost"]);

app.post("/api/leads/:id/stage", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ status: string; lostReason?: string; closedAmountUsd?: number }>();
  if (!SALES_STAGES.has(body.status)) {
    return c.json({ error: `invalid sales stage: ${body.status}` }, 400);
  }
  await transitionLeadStage(c.env.DB, id, body.status as "reviewed" | "proposal_sent" | "won" | "lost", {
    lostReason: body.lostReason,
    closedAmountUsd: body.closedAmountUsd,
  });
  return c.json({ ok: true });
});

app.patch("/api/leads/:id/notes", async (c) => {
  const id = c.req.param("id");
  const { notes } = await c.req.json<{ notes: string }>();
  await setLeadNotes(c.env.DB, id, notes);
  return c.json({ ok: true });
});

// Sales enablement: qualification is intentionally explicit and human-reviewable.
app.post("/api/leads/:id/qualification", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{
    contactName?: string; email?: string; companySize?: string; marketingSpend?: string;
    painPoints?: string; goals?: string;
    status: "qualified" | "disqualified" | "needs_review";
    score?: number; answers?: Record<string, string | number | boolean>;
  }>();
  if (!["qualified", "disqualified", "needs_review"].includes(body.status)) {
    return c.json({ error: "status must be qualified, disqualified, or needs_review" }, 400);
  }
  if (body.score != null && (body.score < 0 || body.score > 100)) {
    return c.json({ error: "score must be between 0 and 100" }, 400);
  }
  await saveQualification(c.env.DB, id, body);
  return c.json({ ok: true, qualificationStatus: body.status, score: body.score ?? null });
});

// Store transcripts, objection reviews, proposal briefs, and call summaries in one auditable timeline.
app.post("/api/leads/:id/artifacts", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ type: "call_transcript" | "objection_review" | "proposal_brief" | "roleplay_review"; title?: string; content: string; source?: string }>();
  if (!body.type || !body.content?.trim()) return c.json({ error: "type and content are required" }, 400);
  const artifactId = await saveSalesArtifact(c.env.DB, id, body);
  if (body.type === "call_transcript") {
    await c.env.DB.prepare("UPDATE leads SET call_transcript = ? WHERE id = ?").bind(body.content, id).run();
  }
  if (body.type === "objection_review") {
    await c.env.DB.prepare("UPDATE leads SET objection_notes = ? WHERE id = ?").bind(body.content, id).run();
  }
  return c.json({ ok: true, artifactId }, 201);
});

app.patch("/api/leads/:id/next-action", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ type: string; at?: string | null }>();
  if (!body.type?.trim()) return c.json({ error: "type is required" }, 400);
  await saveNextAction(c.env.DB, id, body);
  return c.json({ ok: true });
});

app.patch("/api/leads/:id/onboarding", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ status: "not_started" | "invited" | "in_progress" | "activated" | "first_win"; firstWin?: string; shareConsent?: boolean }>();
  if (!["not_started", "invited", "in_progress", "activated", "first_win"].includes(body.status)) {
    return c.json({ error: "invalid onboarding status" }, 400);
  }
  await updateOnboarding(c.env.DB, id, body);
  return c.json({ ok: true });
});

app.patch("/api/leads/:id/showcase", async (c) => {
  const id = c.req.param("id");
  const { showcaseUrl } = await c.req.json<{ showcaseUrl: string }>();
  await c.env.DB.prepare("UPDATE leads SET showcase_url = ? WHERE id = ?").bind(showcaseUrl, id).run();
  return c.json({ ok: true });
});

app.patch("/api/leads/:id/status", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json<{ status: string }>();
  await c.env.DB.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(status, id).run();
  return c.json({ ok: true });
});

// Won-webhook receiver, called by this project's provisioned TheLeadMachine
// CRM instance when a synced lead is marked won there — see
// theleadmachine/docs/PRD.md §2. HMAC-verified against the shared secret
// set on both sides; externalRef is this project's own lead id (round-
// tripped from the sync call), so no lookup table is needed.
app.post("/api/webhooks/theleadmachine-won", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("X-TheLeadMachine-Signature");
  if (!c.env.THELEADMACHINE_WEBHOOK_SECRET) {
    return c.json({ error: "webhook not configured" }, 501);
  }
  const valid = await verifyCrmWebhookSignature(c.env.THELEADMACHINE_WEBHOOK_SECRET, rawBody, signature ?? null);
  if (!valid) return c.json({ error: "invalid signature" }, 401);

  const body = JSON.parse(rawBody) as { externalRef?: string };
  const leadId = body.externalRef;
  if (!leadId) return c.json({ error: "externalRef is required" }, 400);

  const lead = await c.env.DB.prepare("SELECT id, status FROM leads WHERE id = ?").bind(leadId).first<{ id: string; status: string }>();
  if (!lead) return c.json({ error: "not found" }, 404);
  if (lead.status !== "won") {
    await transitionLeadStage(c.env.DB, leadId, "won", {});
  }
  return c.json({ ok: true });
});

// --- Lead sources (Hunter configuration) ---

// ── Krikkit website builds (lead → published proposal site) ───────────
// Operator-triggered bridge to the Krikkit headless build API. The lead's real
// audit + PRD price/brand become a proposal brief; Krikkit generates and (on a
// separate publish call) serves it at <slug>.clubemkt.digital. See
// docs/KRIKKIT_BUILD_API.md. All four routes are session-gated above.
app.post("/api/leads/:id/website-build", async (c) => {
  const id = c.req.param("id");
  if (!c.env.KRIKKIT_API_KEY) return c.json({ error: "Krikkit integration is not configured" }, 503);
  const lead = await c.env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first<LeadRow>();
  if (!lead) return c.json({ error: "not found" }, 404);

  const body = await c.req.json<{ vertical?: VerticalKey }>().catch(() => ({}) as { vertical?: VerticalKey });
  const audits = await c.env.DB.prepare(
    "SELECT vertical, qualifies, score, findings_json FROM audits WHERE lead_id = ? ORDER BY score DESC, created_at",
  ).bind(id).all<{ vertical: VerticalKey; qualifies: number; score: number; findings_json: string }>();
  const rows = audits.results ?? [];
  const chosen = body.vertical
    ? rows.find((a) => a.vertical === body.vertical)
    : rows.find((a) => a.qualifies === 1);
  if (!chosen) return c.json({ error: "no qualifying audit for this lead" }, 409);

  const finding = JSON.parse(chosen.findings_json) as AuditFinding;
  const prd = await c.env.DB.prepare(
    "SELECT price_usd, brand_tokens_json FROM prds WHERE lead_id = ? AND vertical = ? ORDER BY created_at DESC LIMIT 1",
  ).bind(id, chosen.vertical).first<{ price_usd: number | null; brand_tokens_json: string | null }>();
  const priceUsd = prd?.price_usd ?? 250;
  const brand = prd?.brand_tokens_json ? (JSON.parse(prd.brand_tokens_json) as BrandTokens) : null;

  const brief = buildProposalBrief(lead, finding, priceUsd, brand);
  const subdomain = suggestSubdomain(lead);
  const rowId = await insertWebsiteBuild(c.env.DB, { subjectType: "lead", subjectId: id, kind: "proposal", subdomain });

  try {
    const created = await createBuild(c.env, { kind: "proposal", title: lead.business_name ?? lead.url, brief }, rowId);
    await attachKrikkitBuild(c.env.DB, rowId, created.id, created.status);
    await logEvent(c.env.DB, id, "website-build", "queued", created.id);
    return c.json({ id: rowId, krikkitBuildId: created.id, status: created.status, subdomain }, 202);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await syncWebsiteBuild(c.env.DB, rowId, { status: "failed", error: message });
    await logEvent(c.env.DB, id, "website-build", "failed", message);
    return c.json({ error: message }, 502);
  }
});

app.get("/api/leads/:id/website-builds", async (c) => {
  const id = c.req.param("id");
  const builds = await listWebsiteBuilds(c.env.DB, "lead", id);
  return c.json({ builds });
});

app.get("/api/website-builds/:id", async (c) => {
  const id = c.req.param("id");
  const row = await getWebsiteBuild(c.env.DB, id);
  if (!row) return c.json({ error: "not found" }, 404);
  // Best-effort refresh from Krikkit while the build is still in flight; on a
  // transient failure fall back to the last known local state.
  if (row.krikkit_build_id && row.status !== "live" && row.status !== "failed") {
    try {
      const remote = await getBuild(c.env, row.krikkit_build_id);
      await syncWebsiteBuild(c.env.DB, id, { status: remote.status, liveUrl: remote.live_url, error: remote.error });
      row.status = remote.status;
      row.live_url = remote.live_url;
      row.last_error = remote.error;
    } catch {
      // keep last known state
    }
  }
  return c.json({ build: row });
});

app.post("/api/website-builds/:id/publish", async (c) => {
  const id = c.req.param("id");
  const row = await getWebsiteBuild(c.env.DB, id);
  if (!row) return c.json({ error: "not found" }, 404);
  if (!row.krikkit_build_id) return c.json({ error: "build has no Krikkit id" }, 409);
  const body = await c.req.json<{ subdomain?: string }>().catch(() => ({}) as { subdomain?: string });
  const subdomain = (body.subdomain ?? row.subdomain ?? "").trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/.test(subdomain)) {
    return c.json({ error: "invalid subdomain" }, 422);
  }
  try {
    const published = await publishBuild(c.env, row.krikkit_build_id, subdomain);
    await syncWebsiteBuild(c.env.DB, id, { status: published.status, liveUrl: published.live_url, subdomain });
    return c.json({ id, status: published.status, liveUrl: published.live_url, subdomain }, 202);
  } catch (err) {
    if (err instanceof KrikkitError) {
      await syncWebsiteBuild(c.env.DB, id, { status: row.status, error: err.message });
      if (err.status === 409) return c.json({ error: err.message }, 409);
      if (err.status === 422) return c.json({ error: err.message }, 422);
      return c.json({ error: err.message }, 502);
    }
    const message = err instanceof Error ? err.message : String(err);
    await syncWebsiteBuild(c.env.DB, id, { status: "failed", error: message });
    return c.json({ error: message }, 502);
  }
});

app.get("/api/sources", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM lead_sources ORDER BY created_at DESC").all<LeadSourceRow>();
  return c.json(results);
});

app.post("/api/sources", async (c) => {
  const body = await c.req.json<{
    query: string;
    region?: string;
    category?: string;
    cronEnabled?: boolean;
    huntSessionId?: string;
  }>();
  if (!body.query) return c.json({ error: "query is required" }, 400);
  const id = newId();
  await c.env.DB.prepare(
    "INSERT INTO lead_sources (id, query, region, category, cron_enabled, hunt_session_id) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(id, body.query, body.region ?? null, body.category ?? null, body.cronEnabled === false ? 0 : 1, body.huntSessionId ?? null)
    .run();
  return c.json({ id }, 201);
});

app.patch("/api/sources/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ cronEnabled?: boolean }>();
  if (typeof body.cronEnabled === "boolean") {
    await c.env.DB.prepare("UPDATE lead_sources SET cron_enabled = ? WHERE id = ?").bind(body.cronEnabled ? 1 : 0, id).run();
  }
  return c.json({ ok: true });
});

app.delete("/api/sources/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM lead_sources WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

// Manually trigger a single source's discovery run right now (doesn't wait for cron).
app.post("/api/sources/:id/run", async (c) => {
  const id = c.req.param("id");
  const source = await c.env.DB.prepare("SELECT * FROM lead_sources WHERE id = ?").bind(id).first<LeadSourceRow>();
  if (!source) return c.json({ error: "not found" }, 404);

  const result = await runHunterForSource(c.env, source);
  if (result.newLeadIds.length > 0) {
    const instances = await c.env.LEAD_PIPELINE.createBatch(
      result.newLeadIds.map((leadId) => ({ id: leadId, params: { leadId } })),
    );
    for (const instance of instances) {
      await c.env.DB.prepare("UPDATE leads SET workflow_instance_id = ? WHERE id = ?").bind(instance.id, instance.id).run();
    }
  }
  return c.json(result);
});

// Proxies Google Places Autocomplete so the API key never reaches the browser.
app.get("/api/places/autocomplete", async (c) => {
  const input = c.req.query("input") ?? "";
  if (input.length < 2) return c.json([]);
  const predictions = await autocompleteCities(c.env.GOOGLE_PLACES_API_KEY, input);
  return c.json(predictions.map((p) => ({ description: p.description, placeId: p.place_id })));
});

// --- Hunt sessions (the Hunt Wizard) ---

app.post("/api/hunt-sessions", async (c) => {
  const body = await c.req.json<{
    region: string;
    niches: { key: string; label: string; queryVariants: string[] }[];
    leadsPerNiche: number;
    language?: string;
  }>();
  if (!body.region || !body.niches?.length) return c.json({ error: "region and niches are required" }, 400);
  const id = newId();
  const lang = resolveTargetLanguage(body.language, body.region);
  await c.env.DB.prepare(
    "INSERT INTO hunt_sessions (id, region, niches_json, leads_per_niche, language) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(id, body.region, JSON.stringify(body.niches), body.leadsPerNiche, lang)
    .run();
  return c.json({ id, language: lang }, 201);
});

app.get("/api/hunt-sessions/:id", async (c) => {
  const id = c.req.param("id");
  const session = await c.env.DB.prepare("SELECT * FROM hunt_sessions WHERE id = ?").bind(id).first<HuntSessionRow>();
  if (!session) return c.json({ error: "not found" }, 404);

  const [sources, leads, timeline] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM lead_sources WHERE hunt_session_id = ?").bind(id).all<LeadSourceRow>(),
    c.env.DB.prepare(
      "SELECT leads.* FROM leads JOIN lead_sources ON leads.source_id = lead_sources.id WHERE lead_sources.hunt_session_id = ? ORDER BY leads.discovered_at",
    )
      .bind(id)
      .all<LeadRow>(),
    c.env.DB.prepare("SELECT * FROM outreach_timelines WHERE hunt_session_id = ? ORDER BY created_at DESC LIMIT 1")
      .bind(id)
      .first<OutreachTimelineRow>(),
  ]);

  return c.json({ session, sources: sources.results, leads: leads.results, timeline: timeline ?? null });
});

app.post("/api/hunt-sessions/:id/timeline", async (c) => {
  const id = c.req.param("id");
  const session = await c.env.DB.prepare("SELECT * FROM hunt_sessions WHERE id = ?").bind(id).first<HuntSessionRow>();
  if (!session) return c.json({ error: "not found" }, 404);

  const body = await c.req.json<{ capacityPerWeek: number; priorityOrder: string[]; contactMethod: string }>();

  const { results: leads } = await c.env.DB.prepare(
    "SELECT leads.business_name, leads.category, leads.url FROM leads JOIN lead_sources ON leads.source_id = lead_sources.id WHERE lead_sources.hunt_session_id = ? ORDER BY leads.discovered_at",
  )
    .bind(id)
    .all<{ business_name: string | null; category: string | null; url: string }>();

  const niches: { key: string; label: string }[] = JSON.parse(session.niches_json);
  const nicheLabel = (key: string) => niches.find((n) => n.key === key)?.label ?? key;

  const leadsByNiche = new Map<string, string[]>();
  for (const lead of leads) {
    const label = lead.category ?? "Uncategorized";
    if (!leadsByNiche.has(label)) leadsByNiche.set(label, []);
    leadsByNiche.get(label)!.push(lead.business_name ?? lead.url);
  }

  const leadListText = body.priorityOrder
    .map((key) => {
      const label = nicheLabel(key);
      const names = leadsByNiche.get(label) ?? [];
      return names.length ? `${label} (${names.length}): ${names.join(", ")}` : null;
    })
    .filter(Boolean)
    .join("\n");

  const sessionLang = resolveTargetLanguage((session as unknown as { language?: string }).language, session.region);
  const langInstruction = getLanguagePromptInstruction(sessionLang);

  const timelineMarkdown = await generateText(c.env.ANTHROPIC_API_KEY, {
    system:
      `You are a sales operations consultant writing a week-by-week outreach plan for a solo operator working through a freshly-hunted batch of local-business leads. Be concrete: name actual businesses from the list provided, group them into weekly batches sized to the stated capacity, and respect the given niche priority order (earlier niches get contacted first). Output clean markdown with a heading per week.${langInstruction}`,
    user: `Region: ${session.region}\nWeekly capacity: ${body.capacityPerWeek} leads/week\nPreferred contact method: ${body.contactMethod}\nNiche priority order (highest first): ${body.priorityOrder.map(nicheLabel).join(" > ")}\n\nLeads found, grouped by niche:\n${leadListText}\n\nWrite the week-by-week outreach plan.`,
    maxTokens: 2048,
    geminiApiKey: c.env.GEMINI_API_KEY,
    groqProxyToken: c.env.TEKTONE_AI_TOKEN || c.env.FALAI_TOKEN,
    tektoneAiEndpoint: c.env.TEKTONE_AI_ENDPOINT || "https://ai.tektone.com.br/v1",
  });

  const timelineId = newId();
  await c.env.DB.prepare(
    "INSERT INTO outreach_timelines (id, hunt_session_id, capacity_per_week, priority_order_json, contact_method, timeline_markdown) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(timelineId, id, body.capacityPerWeek, JSON.stringify(body.priorityOrder), body.contactMethod, timelineMarkdown)
    .run();

  return c.json({ id: timelineId, timelineMarkdown });
});

export default {
  fetch: app.fetch,
  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext) {
    await runHunterCycle(env);
  },
};
