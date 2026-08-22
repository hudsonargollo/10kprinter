import type { AuditFinding, BrandTokens, LeadRow, LeadStatus, ScrapeSummary, VerticalKey } from "../types";

export function newId(): string {
  return crypto.randomUUID();
}

export async function getLead(db: D1Database, leadId: string): Promise<LeadRow | null> {
  const row = await db.prepare("SELECT * FROM leads WHERE id = ?").bind(leadId).first<LeadRow>();
  return row ?? null;
}

export async function setLeadStatus(db: D1Database, leadId: string, status: LeadStatus): Promise<void> {
  await db.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(status, leadId).run();
}

export async function setLeadWorkflowInstance(db: D1Database, leadId: string, instanceId: string): Promise<void> {
  await db.prepare("UPDATE leads SET workflow_instance_id = ? WHERE id = ?").bind(instanceId, leadId).run();
}

export async function logEvent(
  db: D1Database,
  leadId: string,
  stage: string,
  status: string,
  message?: string,
): Promise<void> {
  await db
    .prepare("INSERT INTO pipeline_events (id, lead_id, stage, status, message) VALUES (?, ?, ?, ?, ?)")
    .bind(newId(), leadId, stage, status, message ?? null)
    .run();
}

export async function insertScrape(
  db: D1Database,
  leadId: string,
  data: { r2HtmlKey: string; r2ScreenshotKey: string; r2HeroScreenshotKey: string; summary: ScrapeSummary },
): Promise<string> {
  const id = newId();
  await db
    .prepare(
      "INSERT INTO scrapes (id, lead_id, r2_html_key, r2_screenshot_key, r2_hero_screenshot_key, summary_json, load_time_ms) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      id,
      leadId,
      data.r2HtmlKey,
      data.r2ScreenshotKey,
      data.r2HeroScreenshotKey,
      JSON.stringify(data.summary),
      data.summary.loadTimeMs,
    )
    .run();
  return id;
}

export async function insertAudit(db: D1Database, leadId: string, finding: AuditFinding): Promise<string> {
  const id = newId();
  await db
    .prepare(
      "INSERT INTO audits (id, lead_id, vertical, qualifies, score, findings_json) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(id, leadId, finding.vertical, finding.qualifies ? 1 : 0, finding.score, JSON.stringify(finding))
    .run();
  return id;
}

export async function insertPrd(
  db: D1Database,
  leadId: string,
  vertical: VerticalKey,
  r2MarkdownKey: string,
  brandTokens: BrandTokens,
): Promise<string> {
  const id = newId();
  await db
    .prepare(
      "INSERT INTO prds (id, lead_id, vertical, r2_markdown_key, brand_tokens_json, status) VALUES (?, ?, ?, ?, ?, 'draft')",
    )
    .bind(id, leadId, vertical, r2MarkdownKey, JSON.stringify(brandTokens))
    .run();
  return id;
}
