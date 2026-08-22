export type VerticalKey = "website-redesign" | "marketing-automation" | "email-marketing" | "social-media";

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

export interface Lead {
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

export interface Scrape {
  id: string;
  lead_id: string;
  r2_html_key: string | null;
  r2_screenshot_key: string | null;
  summary_json: string | null;
  load_time_ms: number | null;
  scraped_at: string;
}

export interface Audit {
  id: string;
  lead_id: string;
  vertical: VerticalKey;
  qualifies: number;
  score: number;
  findings_json: string;
  created_at: string;
}

export interface AuditFinding {
  good: string[];
  bad: string[];
  fix: string[];
}

export interface Prd {
  id: string;
  lead_id: string;
  vertical: VerticalKey;
  r2_markdown_key: string;
  brand_tokens_json: string;
  status: string;
  created_at: string;
}

export interface BrandTokens {
  primary: string;
  background: string;
  backgroundAlt: string;
  textOnPrimary: string;
  textOnBackground: string;
  rationale: string;
}

export interface PipelineEvent {
  id: string;
  lead_id: string;
  stage: string;
  status: string;
  message: string | null;
  created_at: string;
}

export interface LeadDetail {
  lead: Lead;
  scrapes: Scrape[];
  audits: Audit[];
  prds: Prd[];
  events: PipelineEvent[];
}

export const VERTICAL_LABELS: Record<VerticalKey, string> = {
  "website-redesign": "Website Redesign",
  "marketing-automation": "Marketing Automation",
  "email-marketing": "Email Marketing",
  "social-media": "Social Media Management",
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  discovered: "Discovered",
  scraping: "Scraping",
  scraped: "Scraped",
  audited: "Audited",
  prd_ready: "PRD Ready",
  reviewed: "Reviewed",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
  failed: "Failed",
};

export const STATUS_ORDER: LeadStatus[] = [
  "discovered",
  "scraping",
  "scraped",
  "audited",
  "prd_ready",
  "reviewed",
  "proposal_sent",
  "won",
  "lost",
  "failed",
];
