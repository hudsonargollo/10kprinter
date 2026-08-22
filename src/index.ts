import { Hono } from "hono";
import type { Env, LeadRow } from "./types";
import { newId } from "./lib/db";

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
    c.env.DB.prepare("SELECT * FROM scrapes WHERE lead_id = ?").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM audits WHERE lead_id = ?").bind(id).all(),
    c.env.DB.prepare("SELECT * FROM prds WHERE lead_id = ?").bind(id).all(),
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

export default {
  fetch: app.fetch,
  async scheduled(_controller: ScheduledController, _env: Env, _ctx: ExecutionContext) {
    // Hunter (bulk lead discovery) lands in a later phase.
  },
};
