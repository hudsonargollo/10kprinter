export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

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

export type LeadTier = "hot" | "warm" | "cold";

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
  showcase_url: string | null;
  tier: LeadTier | null;
  score: number | null;
  notes: string | null;
  lost_reason: string | null;
  closed_amount_usd: number | null;
  closed_at: string | null;
  language?: string | null;
  audit_count?: number;
  prd_count?: number;
  scrape_count?: number;
  proposal_count?: number;
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
  price_usd: number | null;
  status: string;
  created_at: string;
}

export interface Proposal {
  id: string;
  lead_id: string;
  vertical: VerticalKey;
  r2_html_key: string;
  r2_cover_image_key: string | null;
  status: string;
  created_at: string;
}

export const CONSULT_ADDON_USD = 100;

export const TIER_LABELS: Record<LeadTier, string> = { hot: "Hot", warm: "Warm", cold: "Cold" };

export interface BrandTokens {
  primary: string;
  background: string;
  backgroundAlt: string;
  textOnPrimary: string;
  textOnBackground: string;
  rationale: string;
}

export interface LeadSource {
  id: string;
  query: string;
  region: string | null;
  category: string | null;
  cron_enabled: number;
  last_run_at: string | null;
  created_at: string;
  hunt_session_id: string | null;
}

export interface NicheDef {
  key: string;
  label: string;
  queryVariants: string[];
}

export const NICHE_PACKAGE: NicheDef[] = [
  { key: "dental", label: "Dental Clinics", queryVariants: ["dentists", "dental clinics", "dental offices"] },
  { key: "real-estate", label: "Real Estate Agencies", queryVariants: ["real estate agencies", "realtors", "property agents"] },
  { key: "law", label: "Law Firms", queryVariants: ["law firms", "attorneys", "legal services"] },
  { key: "restaurants", label: "Restaurants", queryVariants: ["restaurants", "family restaurants", "fine dining restaurants"] },
  { key: "gyms", label: "Gyms", queryVariants: ["gyms", "fitness centers", "crossfit"] },
  { key: "auto-repair", label: "Auto Repair Shops", queryVariants: ["auto repair shops", "car mechanics", "auto service centers"] },
  { key: "beauty", label: "Beauty Salons", queryVariants: ["beauty salons", "hair salons", "spas"] },
  { key: "contractors", label: "General Contractors", queryVariants: ["general contractors", "construction companies", "home renovation contractors"] },
];

export interface HuntSession {
  id: string;
  region: string;
  niches_json: string;
  leads_per_niche: number;
  created_at: string;
}

export interface OutreachTimeline {
  id: string;
  hunt_session_id: string;
  capacity_per_week: number;
  priority_order_json: string;
  contact_method: string;
  timeline_markdown: string;
  created_at: string;
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
  proposals: Proposal[];
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
