export interface Env {
  DB: D1Database;
  ASSETS_BUCKET: R2Bucket;
  BROWSER: Fetcher;
  LEAD_PIPELINE: Workflow;
  ANTHROPIC_API_KEY: string;
  GOOGLE_PLACES_API_KEY: string;
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
}
