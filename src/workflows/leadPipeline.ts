import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import type { AuditFinding, BrandTokens, Env, LeadRow, ScrapeSummary, WorkflowPayload } from "../types";
import { scrapeSite } from "../lib/scrape";
import { putHtml, putScreenshot, putPrdMarkdown, getScreenshotBase64 } from "../lib/r2";
import { getLead, setLeadStatus, insertScrape, insertAudit, insertPrd, logEvent } from "../lib/db";
import { generateStructured, generateText, generateStructuredFromImage } from "../lib/anthropic";
import { VERTICALS } from "../verticals";

const AUDIT_SCHEMA = {
  type: "object",
  properties: {
    qualifies: { type: "boolean" },
    score: { type: "integer", minimum: 0, maximum: 100 },
    good: { type: "array", items: { type: "string" } },
    bad: { type: "array", items: { type: "string" } },
    fix: { type: "array", items: { type: "string" } },
  },
  required: ["qualifies", "score", "good", "bad", "fix"],
};

const BRAND_TOKENS_SCHEMA = {
  type: "object",
  properties: {
    primary: { type: "string" },
    background: { type: "string" },
    backgroundAlt: { type: "string" },
    textOnPrimary: { type: "string" },
    textOnBackground: { type: "string" },
    rationale: { type: "string" },
  },
  required: ["primary", "background", "backgroundAlt", "textOnPrimary", "textOnBackground", "rationale"],
};

export class LeadPipeline extends WorkflowEntrypoint<Env, WorkflowPayload> {
  async run(event: WorkflowEvent<WorkflowPayload>, step: WorkflowStep) {
    const { leadId } = event.payload;
    const env = this.env;

    try {
      await this.runPipeline(leadId, step);
    } catch (err) {
      await step.do("mark-failed", async () => {
        await setLeadStatus(env.DB, leadId, "failed");
        await logEvent(env.DB, leadId, "pipeline", "failed", err instanceof Error ? err.message : String(err));
      });
      throw err;
    }
  }

  private async runPipeline(leadId: string, step: WorkflowStep) {
    const env = this.env;

    const lead = await step.do("load-lead", async () => {
      const row = await getLead(env.DB, leadId);
      if (!row) throw new Error(`Lead not found: ${leadId}`);
      return row;
    });

    const scrapeData = await step.do("scrape", async () => {
      await setLeadStatus(env.DB, leadId, "scraping");
      const { html, screenshot, summary } = await scrapeSite(env.BROWSER, lead.url);
      const r2HtmlKey = await putHtml(env.ASSETS_BUCKET, leadId, html);
      const r2ScreenshotKey = await putScreenshot(env.ASSETS_BUCKET, leadId, screenshot);
      await insertScrape(env.DB, leadId, { r2HtmlKey, r2ScreenshotKey, summary });
      await setLeadStatus(env.DB, leadId, "scraped");
      await logEvent(env.DB, leadId, "scrape", "completed");
      return { r2HtmlKey, r2ScreenshotKey, summary };
    });

    const audits: AuditFinding[] = [];
    for (const vertical of VERTICALS) {
      const finding = await step.do(`audit-${vertical.key}`, async () => {
        const result = await generateStructured<Omit<AuditFinding, "vertical">>(env.ANTHROPIC_API_KEY, {
          system: `You are a blunt, conversion-focused consultant auditing small business websites for a specific service opportunity.\n${vertical.auditRubric}`,
          user: buildScrapeContextPrompt(lead, scrapeData.summary),
          toolName: "submit_audit",
          schema: AUDIT_SCHEMA,
        });
        return { vertical: vertical.key, ...result } as AuditFinding;
      });
      audits.push(finding);
      await step.do(`persist-audit-${vertical.key}`, async () => {
        await insertAudit(env.DB, leadId, finding);
      });
    }

    await step.do("mark-audited", async () => {
      await setLeadStatus(env.DB, leadId, "audited");
      const qualifyingCount = audits.filter((a) => a.qualifies).length;
      await logEvent(env.DB, leadId, "audit", "completed", `${qualifyingCount}/${audits.length} verticals qualify`);
    });

    const qualifyingVerticals = VERTICALS.filter((v) =>
      audits.some((a) => a.vertical === v.key && a.qualifies),
    );

    if (qualifyingVerticals.length === 0) {
      await step.do("no-qualifying-verticals", async () => {
        await setLeadStatus(env.DB, leadId, "reviewed");
        await logEvent(env.DB, leadId, "pipeline", "no-op", "No verticals qualified; skipping PRD generation");
      });
      return;
    }

    const brandTokens = await step.do("brand-tokens", async () => {
      const imageBase64 = await getScreenshotBase64(env.ASSETS_BUCKET, scrapeData.r2ScreenshotKey);
      return generateStructuredFromImage<BrandTokens>(env.ANTHROPIC_API_KEY, {
        system:
          "You are a brand designer extracting a usable Tailwind color-token palette from a screenshot of a business's existing website.",
        user:
          "Extract the dominant/logo brand colors visible in this screenshot and propose a high-contrast " +
          "primary action color, a background color, an alt background, and text colors for use on each, " +
          "all as hex codes. Briefly justify the choice in one sentence.",
        imageBase64,
        mediaType: "image/png",
        toolName: "submit_brand_tokens",
        schema: BRAND_TOKENS_SCHEMA,
      });
    });

    for (const vertical of qualifyingVerticals) {
      const finding = audits.find((a) => a.vertical === vertical.key)!;
      await step.do(`prd-${vertical.key}`, async () => {
        const markdown = await generateText(env.ANTHROPIC_API_KEY, {
          system: `You are a product architect writing a PRD for a development team.\n${vertical.prdTemplate.replace("{{businessName}}", lead.business_name ?? lead.url)}`,
          user: buildPrdContextPrompt(lead, scrapeData.summary, finding, brandTokens),
          maxTokens: 4096,
        });
        const r2Key = await putPrdMarkdown(env.ASSETS_BUCKET, leadId, vertical.key, markdown);
        await insertPrd(env.DB, leadId, vertical.key, r2Key, brandTokens);
      });
    }

    await step.do("mark-prd-ready", async () => {
      await setLeadStatus(env.DB, leadId, "prd_ready");
      await logEvent(env.DB, leadId, "prd", "completed", `${qualifyingVerticals.length} PRD(s) generated`);
    });
  }
}

function buildScrapeContextPrompt(lead: LeadRow, summary: ScrapeSummary): string {
  return `
Business: ${lead.business_name ?? "unknown"}
URL: ${lead.url}
Category: ${lead.category ?? "unknown"}

Page title: ${summary.title ?? "(none)"}
Meta description: ${summary.metaDescription ?? "(none)"}
Load time: ${summary.loadTimeMs}ms
Has email capture form: ${summary.hasEmailCaptureForm}
Phone numbers found: ${summary.phoneNumbersFound.join(", ") || "(none)"}

Headings:
${summary.headings.map((h) => `- ${h}`).join("\n") || "(none)"}

CTA / link / button text found:
${summary.ctaTexts.slice(0, 40).map((t) => `- ${t}`).join("\n") || "(none)"}

Image alt text found (blank = missing alt text, a red flag):
${summary.imageAltTexts.slice(0, 30).map((t) => `- "${t}"`).join("\n") || "(none)"}

Body text (truncated):
${summary.bodyText}
`.trim();
}

function buildPrdContextPrompt(
  lead: LeadRow,
  summary: ScrapeSummary,
  finding: AuditFinding,
  tokens: BrandTokens,
): string {
  return `
Business: ${lead.business_name ?? "unknown"}
URL: ${lead.url}

Audit findings for this vertical (score ${finding.score}/100):
GOOD:
${finding.good.map((g) => `- ${g}`).join("\n")}
BAD:
${finding.bad.map((b) => `- ${b}`).join("\n")}
FIX:
${finding.fix.map((f) => `- ${f}`).join("\n")}

Brand tokens already generated for this lead (reference them, don't re-derive):
- primary: ${tokens.primary}
- background: ${tokens.background}
- backgroundAlt: ${tokens.backgroundAlt}
- textOnPrimary: ${tokens.textOnPrimary}
- textOnBackground: ${tokens.textOnBackground}
- rationale: ${tokens.rationale}

Original scraped page context, for grounding specific features in what actually exists on the site:
${summary.bodyText.slice(0, 3000)}
`.trim();
}
