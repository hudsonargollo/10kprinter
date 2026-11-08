import type { AuditFinding, BrandTokens, LeadRow, LeadStatus, ScrapeSummary, VerticalKey } from "../types";
import type { LeadTier } from "./scoring";

type SalesStage = "reviewed" | "proposal_sent" | "won" | "lost";

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

export async function setLeadScoring(db: D1Database, leadId: string, score: number, tier: LeadTier): Promise<void> {
  await db.prepare("UPDATE leads SET score = ?, tier = ? WHERE id = ?").bind(score, tier, leadId).run();
}

export async function setLeadNotes(db: D1Database, leadId: string, notes: string): Promise<void> {
  await db.prepare("UPDATE leads SET notes = ? WHERE id = ?").bind(notes, leadId).run();
}

export type QualificationInput = {
  contactName?: string;
  email?: string;
  companySize?: string;
  marketingSpend?: string;
  painPoints?: string;
  goals?: string;
  status: "qualified" | "disqualified" | "needs_review";
  score?: number;
  answers?: Record<string, string | number | boolean>;
};

export async function saveQualification(db: D1Database, leadId: string, input: QualificationInput): Promise<void> {
  await db.prepare(`
    UPDATE leads SET contact_name = ?, email = ?, company_size = ?, marketing_spend = ?,
      pain_points = ?, goals = ?, qualification_status = ?, qualification_score = ?, qualification_json = ?
    WHERE id = ?
  `).bind(
    input.contactName ?? null,
    input.email ?? null,
    input.companySize ?? null,
    input.marketingSpend ?? null,
    input.painPoints ?? null,
    input.goals ?? null,
    input.status,
    input.score ?? null,
    JSON.stringify(input.answers ?? {}),
    leadId,
  ).run();
  await logEvent(db, leadId, "qualification", input.status, input.score == null ? undefined : `score=${input.score}`);
}

export async function saveSalesArtifact(
  db: D1Database,
  leadId: string,
  artifact: { type: string; title?: string; content: string; source?: string },
): Promise<string> {
  const id = newId();
  await db.prepare(
    "INSERT INTO sales_artifacts (id, lead_id, artifact_type, title, content, source) VALUES (?, ?, ?, ?, ?, ?)",
  ).bind(id, leadId, artifact.type, artifact.title ?? null, artifact.content, artifact.source ?? null).run();
  await logEvent(db, leadId, "sales-enablement", artifact.type, artifact.title);
  return id;
}

export async function saveNextAction(
  db: D1Database,
  leadId: string,
  action: { type: string; at?: string | null },
): Promise<void> {
  await db.prepare("UPDATE leads SET next_action_type = ?, next_action_at = ? WHERE id = ?")
    .bind(action.type, action.at ?? null, leadId).run();
  await logEvent(db, leadId, "sales", "next_action", `${action.type}${action.at ? ` @ ${action.at}` : ""}`);
}

export async function updateOnboarding(
  db: D1Database,
  leadId: string,
  onboarding: { status: string; firstWin?: string; shareConsent?: boolean },
): Promise<void> {
  await db.prepare("UPDATE leads SET onboarding_status = ?, first_win = COALESCE(?, first_win), win_share_consent = COALESCE(?, win_share_consent) WHERE id = ?")
    .bind(onboarding.status, onboarding.firstWin ?? null, onboarding.shareConsent == null ? null : onboarding.shareConsent ? 1 : 0, leadId).run();
  await logEvent(db, leadId, "delivery", onboarding.status, onboarding.firstWin);
}

/**
 * The CRM-owned counterpart to setLeadStatus, for the manually-driven sales
 * stages only — captures the side-effect fields those stages need and logs
 * to pipeline_events. setLeadStatus remains the primitive the Workflow uses.
 */
export async function transitionLeadStage(
  db: D1Database,
  leadId: string,
  status: SalesStage,
  opts: { lostReason?: string; closedAmountUsd?: number } = {},
): Promise<void> {
  if (status === "won") {
    await db
      .prepare("UPDATE leads SET status = ?, closed_amount_usd = ?, closed_at = datetime('now') WHERE id = ?")
      .bind(status, opts.closedAmountUsd ?? null, leadId)
      .run();
  } else if (status === "lost") {
    await db
      .prepare("UPDATE leads SET status = ?, lost_reason = ? WHERE id = ?")
      .bind(status, opts.lostReason ?? null, leadId)
      .run();
  } else {
    await db.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(status, leadId).run();
  }
  const message = status === "won" ? `$${opts.closedAmountUsd ?? "?"}` : status === "lost" ? (opts.lostReason ?? null) : null;
  await logEvent(db, leadId, "sales", status, message ?? undefined);
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
  priceUsd: number,
): Promise<string> {
  const id = newId();
  await db
    .prepare(
      "INSERT INTO prds (id, lead_id, vertical, r2_markdown_key, brand_tokens_json, price_usd, status) VALUES (?, ?, ?, ?, ?, ?, 'draft')",
    )
    .bind(id, leadId, vertical, r2MarkdownKey, JSON.stringify(brandTokens), priceUsd)
    .run();
  return id;
}

export async function insertProposal(
  db: D1Database,
  leadId: string,
  vertical: VerticalKey,
  r2HtmlKey: string,
  r2CoverImageKey: string | null,
): Promise<string> {
  const id = newId();
  await db
    .prepare(
      "INSERT INTO proposals (id, lead_id, vertical, r2_html_key, r2_cover_image_key, status) VALUES (?, ?, ?, ?, ?, 'draft')",
    )
    .bind(id, leadId, vertical, r2HtmlKey, r2CoverImageKey)
    .run();
  return id;
}

export async function getProposal(
  db: D1Database,
  leadId: string,
  vertical: VerticalKey,
): Promise<{ id: string; r2_html_key: string; r2_cover_image_key: string | null; status: string } | null> {
  const row = await db
    .prepare(
      "SELECT id, r2_html_key, r2_cover_image_key, status FROM proposals WHERE lead_id = ? AND vertical = ? ORDER BY created_at DESC LIMIT 1",
    )
    .bind(leadId, vertical)
    .first<{ id: string; r2_html_key: string; r2_cover_image_key: string | null; status: string }>();
  return row ?? null;
}


// ── website_builds (MoneyMachine ↔ Krikkit bridge) ────────────────────
export interface WebsiteBuildRow {
  id: string;
  subject_type: "lead" | "niche";
  subject_id: string;
  kind: "site" | "proposal";
  krikkit_build_id: string | null;
  subdomain: string | null;
  live_url: string | null;
  status: string;
  attempts: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export async function insertWebsiteBuild(
  db: D1Database,
  input: { subjectType: "lead" | "niche"; subjectId: string; kind: "site" | "proposal"; subdomain?: string | null },
): Promise<string> {
  const id = newId();
  await db.prepare(
    "INSERT INTO website_builds (id, subject_type, subject_id, kind, subdomain) VALUES (?, ?, ?, ?, ?)",
  ).bind(id, input.subjectType, input.subjectId, input.kind, input.subdomain ?? null).run();
  return id;
}

export async function attachKrikkitBuild(db: D1Database, id: string, krikkitBuildId: string, status: string): Promise<void> {
  await db.prepare(
    "UPDATE website_builds SET krikkit_build_id = ?, status = ?, updated_at = datetime('now') WHERE id = ?",
  ).bind(krikkitBuildId, status, id).run();
}

export async function syncWebsiteBuild(
  db: D1Database,
  id: string,
  patch: { status: string; liveUrl?: string | null; subdomain?: string | null; error?: string | null },
): Promise<void> {
  await db.prepare(
    "UPDATE website_builds SET status = ?, live_url = COALESCE(?, live_url), subdomain = COALESCE(?, subdomain), last_error = ?, updated_at = datetime('now') WHERE id = ?",
  ).bind(patch.status, patch.liveUrl ?? null, patch.subdomain ?? null, patch.error ?? null, id).run();
}

export async function listWebsiteBuilds(db: D1Database, subjectType: string, subjectId: string): Promise<WebsiteBuildRow[]> {
  const res = await db.prepare(
    "SELECT * FROM website_builds WHERE subject_type = ? AND subject_id = ? ORDER BY created_at DESC",
  ).bind(subjectType, subjectId).all<WebsiteBuildRow>();
  return res.results ?? [];
}

export async function getWebsiteBuild(db: D1Database, id: string): Promise<WebsiteBuildRow | null> {
  const row = await db.prepare("SELECT * FROM website_builds WHERE id = ?").bind(id).first<WebsiteBuildRow>();
  return row ?? null;
}
