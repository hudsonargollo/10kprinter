import { Hono } from "hono";
import type { Env, LeadRow, LeadSourceRow } from "./types";
import { newId } from "./lib/db";
import { runHunterCycle, runHunterForSource } from "./hunter";

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

  await c.env.DB.prepare("UPDATE leads SET status = 'discovered' WHERE id = ?").bind(id).run();
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

app.patch("/api/leads/:id/status", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json<{ status: string }>();
  await c.env.DB.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(status, id).run();
  return c.json({ ok: true });
});

// --- Lead sources (Hunter configuration) ---

app.get("/api/sources", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM lead_sources ORDER BY created_at DESC").all<LeadSourceRow>();
  return c.json(results);
});

app.post("/api/sources", async (c) => {
  const body = await c.req.json<{ query: string; region?: string; category?: string; cronEnabled?: boolean }>();
  if (!body.query) return c.json({ error: "query is required" }, 400);
  const id = newId();
  await c.env.DB.prepare("INSERT INTO lead_sources (id, query, region, category, cron_enabled) VALUES (?, ?, ?, ?, ?)")
    .bind(id, body.query, body.region ?? null, body.category ?? null, body.cronEnabled === false ? 0 : 1)
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

export default {
  fetch: app.fetch,
  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext) {
    await runHunterCycle(env);
  },
};
