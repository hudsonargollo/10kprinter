import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import type { AuditFinding, BrandTokens, Env, LeadRow, ScrapeSummary, WorkflowPayload } from "../types";
import { scrapeSite } from "../lib/scrape";
import {
  putHtml,
  putScreenshot,
  putHeroScreenshot,
  putPrdMarkdown,
  putCoverImage,
  putProposalHtml,
  getScreenshotBase64,
} from "../lib/r2";
import {
  getLead,
  setLeadStatus,
  setLeadScoring,
  insertScrape,
  insertAudit,
  insertPrd,
  insertProposal,
  logEvent,
} from "../lib/db";
import { computeLeadScoring } from "../lib/scoring";
import { generateStructured, generateStructuredFromImage } from "../lib/anthropic";
import { generateCoverImageGemini } from "../lib/imageGen";
import { buildCoverImagePrompt, buildProposalHtml, buildWaLink } from "../lib/proposal";
import { syncLeadToCrm } from "../lib/crmSync";
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

const PRD_SCHEMA = {
  type: "object",
  properties: {
    markdown: { type: "string" },
    priceUsd: { type: "integer", minimum: 100, maximum: 300 },
  },
  required: ["markdown", "priceUsd"],
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
      const { html, screenshot, heroScreenshot, summary } = await scrapeSite(env.BROWSER, lead.url);
      const r2HtmlKey = await putHtml(env.ASSETS_BUCKET, leadId, html);
      const r2ScreenshotKey = await putScreenshot(env.ASSETS_BUCKET, leadId, screenshot);
      const r2HeroScreenshotKey = await putHeroScreenshot(env.ASSETS_BUCKET, leadId, heroScreenshot);
      await insertScrape(env.DB, leadId, { r2HtmlKey, r2ScreenshotKey, r2HeroScreenshotKey, summary });
      await setLeadStatus(env.DB, leadId, "scraped");
      await logEvent(env.DB, leadId, "scrape", "completed");
      return { r2HtmlKey, r2ScreenshotKey, r2HeroScreenshotKey, summary };
    });

    // The Groq fallback proxy enforces two shared caps per model across the whole org: an
    // 8000-tokens/minute window (recovers within ~60s) AND a much harder ~200,000-tokens/day
    // rolling window that, under heavy same-day usage, has been observed reporting "try again
    // in ~15 minutes" — recovering only as old requests age out of the rolling day window, not
    // on a short timer. Both are purely transient (never a malformed-request problem), so
    // LLM-calling steps get a long, patient retry budget instead of exhausting into a permanent
    // failure while capacity is temporarily contested.
    //
    // A single fixed delay is a trap here: dozens of leads retried together end up retrying in
    // near-lockstep, all colliding on the same thin per-window headroom at once (observed live —
    // the queue stopped draining even though isolated calls succeeded). A *dynamic delay
    // function* (Math.random() per attempt) was tried first, but that's non-deterministic across
    // Workflow replay, which this platform's execution model doesn't support cleanly for delays —
    // confirmed by a real `NonRetryableDelayError: did not return within 5 seconds` failure, and
    // by `wrangler workflows instances describe` hard-crashing (RangeError: Invalid time value,
    // in wrangler's own formatDistanceStrict) on any step using one, which made this impossible to
    // verify further. A *static* per-lead jitter — computed once, deterministically, from the
    // leadId — gets the same cross-lead desynchronization without a dynamic function at all.
    function hashString(s: string): number {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
      return h;
    }
    // First attempt at this used a 20-45s delay with a 90-attempt limit (~30-48min max
    // runway). That undershot reality badly: with 100+ leads retrying concurrently, observed
    // recovery windows ran 15-25+ minutes, and every sliver of headroom that opened was
    // immediately reabsorbed by the whole queue before most instances got a turn — so a large
    // fraction exhausted their budget and permanently failed despite nothing being wrong. A
    // 3-6 minute per-lead delay both gives each lead's total runway (limit × delay) enough
    // reach to outlast the true recovery timescale, and — just as important — thins out how
    // many leads are simultaneously eligible to retry at any given instant, so the queue stops
    // acting like a herd stampeding the same narrow window.
    const LLM_STEP_RETRIES = {
      limit: 300,
      delay: 180_000 + (hashString(leadId) % 180) * 1000,
      backoff: "constant" as const,
    };

    const audits: AuditFinding[] = [];
    for (const vertical of VERTICALS) {
      const finding = await step.do(`audit-${vertical.key}`, { retries: LLM_STEP_RETRIES }, async () => {
        const result = await generateStructured<Omit<AuditFinding, "vertical">>(env.ANTHROPIC_API_KEY, {
          system: `You are a blunt, conversion-focused consultant auditing small business websites for a specific service opportunity.\n${vertical.auditRubric}`,
          user: buildScrapeContextPrompt(lead, scrapeData.summary),
          toolName: "submit_audit",
          schema: AUDIT_SCHEMA,
          geminiApiKey: env.GEMINI_API_KEY,
          groqProxyToken: env.FALAI_TOKEN,
        });
        return {
          vertical: vertical.key,
          qualifies: result.qualifies,
          score: result.score,
          good: toStringArray(result.good),
          bad: toStringArray(result.bad),
          fix: toStringArray(result.fix),
        } as AuditFinding;
      });
      audits.push(finding);
      await step.do(`persist-audit-${vertical.key}`, async () => {
        await insertAudit(env.DB, leadId, finding);
      });
    }

    const scoring = await step.do("mark-audited", async () => {
      await setLeadStatus(env.DB, leadId, "audited");
      const qualifyingCount = audits.filter((a) => a.qualifies).length;
      await logEvent(env.DB, leadId, "audit", "completed", `${qualifyingCount}/${audits.length} verticals qualify`);

      const { score, tier } = computeLeadScoring(audits);
      await setLeadScoring(env.DB, leadId, score, tier);
      await logEvent(env.DB, leadId, "scoring", "computed", `score=${score} tier=${tier}`);
      return { score, tier };
    });

    const qualifyingVerticals = VERTICALS.filter((v) =>
      audits.some((a) => a.vertical === v.key && a.qualifies),
    );

    if (qualifyingVerticals.length === 0) {
      await step.do("no-qualifying-verticals", async () => {
        await setLeadStatus(env.DB, leadId, "reviewed");
        await logEvent(env.DB, leadId, "pipeline", "no-op", "No verticals qualified; skipping PRD generation");
      });
      await step.do("sync-crm", async () => {
        const result = await syncLeadToCrm(env, lead, scoring);
        await logEvent(env.DB, leadId, "crm-sync", result.ok ? "completed" : "skipped", result.error);
      });
      return;
    }

    const brandTokens = await step.do("brand-tokens", { retries: LLM_STEP_RETRIES }, async () => {
      const imageBase64 = await getScreenshotBase64(env.ASSETS_BUCKET, scrapeData.r2HeroScreenshotKey);
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
        geminiApiKey: env.GEMINI_API_KEY,
        groqProxyToken: env.FALAI_TOKEN,
      });
    });

    for (const vertical of qualifyingVerticals) {
      const finding = audits.find((a) => a.vertical === vertical.key)!;
      const { priceUsd } = await step.do(`prd-${vertical.key}`, { retries: LLM_STEP_RETRIES }, async () => {
        const { markdown, priceUsd } = await generateStructured<{ markdown: string; priceUsd: number }>(
          env.ANTHROPIC_API_KEY,
          {
            system: `You are a product architect writing a PRD for a development team.\n${vertical.prdTemplate.replace("{{businessName}}", lead.business_name ?? lead.url)}`,
            user: buildPrdContextPrompt(lead, scrapeData.summary, finding, brandTokens),
            toolName: "submit_prd",
            schema: PRD_SCHEMA,
            maxTokens: 4096,
            geminiApiKey: env.GEMINI_API_KEY,
            groqProxyToken: env.FALAI_TOKEN,
          },
        );
        const r2Key = await putPrdMarkdown(env.ASSETS_BUCKET, leadId, vertical.key, markdown);
        await insertPrd(env.DB, leadId, vertical.key, r2Key, brandTokens, priceUsd);
        return { priceUsd };
      });

      const coverImageKey = await step.do(`cover-image-${vertical.key}`, { retries: LLM_STEP_RETRIES }, async () => {
        const { bytes, mimeType } = await generateCoverImageGemini(env.GEMINI_API_KEY, {
          prompt: buildCoverImagePrompt(brandTokens),
        });
        return putCoverImage(env.ASSETS_BUCKET, leadId, vertical.key, bytes, mimeType);
      });

      await step.do(`proposal-draft-${vertical.key}`, async () => {
        const html = buildProposalHtml({
          lead,
          verticalLabel: vertical.label,
          scrapeSummary: scrapeData.summary,
          finding,
          brandTokens,
          priceUsd,
          coverImageUrl: `/api/leads/${leadId}/proposals/${vertical.key}/cover`,
          waLink: buildWaLink(lead.phone, `Hi ${lead.business_name ?? "there"}, `),
        });
        const r2Key = await putProposalHtml(env.ASSETS_BUCKET, leadId, vertical.key, html);
        await insertProposal(env.DB, leadId, vertical.key, r2Key, coverImageKey);
      });
    }

    await step.do("mark-prd-ready", async () => {
      await setLeadStatus(env.DB, leadId, "prd_ready");
      await logEvent(env.DB, leadId, "prd", "completed", `${qualifyingVerticals.length} PRD(s) generated`);
    });

    await step.do("sync-crm", async () => {
      const result = await syncLeadToCrm(env, lead, scoring);
      await logEvent(env.DB, leadId, "crm-sync", result.ok ? "completed" : "skipped", result.error);
    });
  }
}

/**
 * Some pages make the phone-number regex in scrape.ts match hundreds/thousands of false
 * positives (tracking pixel IDs, JSON-LD numeric fields, etc. — observed one page with 1134
 * "phone numbers"). Left unbounded, joining that into the prompt balloons it past any LLM's
 * per-request token cap, which is a permanent failure no retry can fix. Dedupe + cap defensively.
 */
function dedupeAndCap(values: string[], limit: number): string[] {
  return Array.from(new Set(values)).slice(0, limit);
}

/** Claude's tool-forced JSON isn't always perfectly schema-conformant — guard against a stray string. */
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
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
Phone numbers found: ${dedupeAndCap(summary.phoneNumbersFound, 10).join(", ") || "(none)"}

Headings:
${summary.headings.slice(0, 30).map((h) => `- ${h}`).join("\n") || "(none)"}

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
