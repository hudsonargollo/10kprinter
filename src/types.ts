export interface Env {
  DB: D1Database;
  ASSETS_BUCKET: R2Bucket;
  BROWSER: Fetcher;
  LEAD_PIPELINE: Workflow;
  ANTHROPIC_API_KEY: string;
  GOOGLE_PLACES_API_KEY: string;
  GEMINI_API_KEY: string;
  FALAI_TOKEN: string;
  TEKTONE_AI_ENDPOINT?: string;
  TEKTONE_AI_TOKEN?: string;
  SESSION_SECRET: string;
  // TheLeadMachine CRM integration (this project's provisioned instance —
  // see theleadmachine/docs/PRD.md §2). Sync is best-effort/non-fatal;
  // these being unset just means sync/webhook silently no-op.
  THELEADMACHINE_SYNC_URL?: string;
  THELEADMACHINE_SYNC_TOKEN?: string;
  THELEADMACHINE_WEBHOOK_SECRET?: string;
}

export type VerticalKey =
  | "website-redesign"
  | "marketing-automation"
  | "email-marketing"
  | "social-media";

export type LeadStatus =
  | "discovered"
  | "scraping"
  | "scraped"
  | "audited"
  | "prd_ready"
  | "reviewed"
  | "proposal_sent"
  | "won"
  | "lost"
  | "failed";

export interface LeadRow {
  id: string;
  business_name: string | null;
  url: string;
  place_id: string | null;
  phone: string | null;
  address: string | null;
  category: string | null;
  source_id: string | null;
  status: LeadStatus;
  workflow_instance_id: string | null;
  discovered_at: string;
  showcase_url: string | null;
  tier: "hot" | "warm" | "cold" | null;
  score: number | null;
  notes: string | null;
  lost_reason: string | null;
  closed_amount_usd: number | null;
  closed_at: string | null;
  language?: string | null;
}

export interface ScrapeSummary {
  title: string | null;
  metaDescription: string | null;
  headings: string[];
  bodyText: string;
  imageAltTexts: string[];
  ctaTexts: string[];
  phoneNumbersFound: string[];
  hasEmailCaptureForm: boolean;
  loadTimeMs: number;
}

export interface AuditFinding {
  vertical: VerticalKey;
  qualifies: boolean;
  score: number;
  good: string[];
  bad: string[];
  fix: string[];
}

export interface BrandTokens {
  primary: string;
  background: string;
  backgroundAlt: string;
  textOnPrimary: string;
  textOnBackground: string;
  rationale: string;
}

export interface WorkflowPayload {
  leadId: string;
}

export interface LeadSourceRow {
  id: string;
  query: string;
  region: string | null;
  category: string | null;
  cron_enabled: number;
  last_run_at: string | null;
  created_at: string;
  hunt_session_id: string | null;
}

export interface HuntSessionRow {
  id: string;
  region: string;
  niches_json: string;
  leads_per_niche: number;
  created_at: string;
}

export interface OutreachTimelineRow {
  id: string;
  hunt_session_id: string;
  capacity_per_week: number;
  priority_order_json: string;
  contact_method: string;
  timeline_markdown: string;
  created_at: string;
}
