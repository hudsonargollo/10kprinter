import { Hono } from "hono";
import type { Env, HuntSessionRow, LeadRow, LeadSourceRow, OutreachTimelineRow } from "./types";
import { newId, setLeadNotes, transitionLeadStage } from "./lib/db";
import { runHunterCycle, runHunterForSource } from "./hunter";
import { generateText } from "./lib/anthropic";
import { autocompleteCities } from "./lib/places";
import { verifyCrmWebhookSignature } from "./lib/crmSync";

export { LeadPipeline } from "./workflows/leadPipeline";

const app = new Hono<{ Bindings: Env }>();

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message }, 500);
});

// Create a lead and immediately kick off its pipeline run (the "manual single-URL" path).
app.post("/api/leads", async (c) => {
  const body = await c.req.json<{ url: string; businessName?: string; category?: string }>();
  if (!body.url) return c.json({ error: "url is required" }, 400);

  const id = newId();
  await c.env.DB.prepare(
    "INSERT INTO leads (id, business_name, url, category, status) VALUES (?, ?, ?, ?, 'discovered')",
  )
    .bind(id, body.businessName ?? null, body.url, body.category ?? null)
    .run();

  const instance = await c.env.LEAD_PIPELINE.create({ id, params: { leadId: id } });
  await c.env.DB.prepare("UPDATE leads SET workflow_instance_id = ? WHERE id = ?")
    .bind(instance.id, id)
    .run();

  return c.json({ id, workflowInstanceId: instance.id }, 201);
});

app.get("/api/leads", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM leads ORDER BY discovered_at DESC").all<LeadRow>();
  return c.json(results);
});

app.get("/api/leads/:id", async (c) => {
  const id = c.req.param("id");
  const lead = await c.env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first<LeadRow>();
  if (!lead) return c.json({ error: "not found" }, 404);

  const [scrapes, audits, prds, events] = await Promise.all([
    c.env.DB.prepare("SELECT * FROM scrapes WHERE lead_id = ? ORDER BY scraped_at").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM audits WHERE lead_id = ? ORDER BY created_at").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM prds WHERE lead_id = ? ORDER BY created_at").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM pipeline_events WHERE lead_id = ? ORDER BY created_at").bind(id).all(),
  ]);

  return c.json({
    lead,
    scrapes: scrapes.results,
    audits: audits.results,
    prds: prds.results,
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
  }>();
  if (!body.region || !body.niches?.length) return c.json({ error: "region and niches are required" }, 400);
  const id = newId();
  await c.env.DB.prepare(
    "INSERT INTO hunt_sessions (id, region, niches_json, leads_per_niche) VALUES (?, ?, ?, ?)",
  )
    .bind(id, body.region, JSON.stringify(body.niches), body.leadsPerNiche)
    .run();
  return c.json({ id }, 201);
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

  const timelineMarkdown = await generateText(c.env.ANTHROPIC_API_KEY, {
    system:
      "You are a sales operations consultant writing a week-by-week outreach plan for a solo operator working through a freshly-hunted batch of local-business leads. Be concrete: name actual businesses from the list provided, group them into weekly batches sized to the stated capacity, and respect the given niche priority order (earlier niches get contacted first). Output clean markdown with a heading per week.",
    user: `Region: ${session.region}\nWeekly capacity: ${body.capacityPerWeek} leads/week\nPreferred contact method: ${body.contactMethod}\nNiche priority order (highest first): ${body.priorityOrder.map(nicheLabel).join(" > ")}\n\nLeads found, grouped by niche:\n${leadListText}\n\nWrite the week-by-week outreach plan.`,
    maxTokens: 2048,
    geminiApiKey: c.env.GEMINI_API_KEY,
    groqProxyToken: c.env.FALAI_TOKEN,
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
