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
  contact_name?: string | null;
  email?: string | null;
  company_size?: string | null;
  marketing_spend?: string | null;
  pain_points?: string | null;
  goals?: string | null;
  qualification_status?: "pending" | "qualified" | "disqualified" | "needs_review";
  qualification_score?: number | null;
  qualification_json?: string | null;
  call_transcript?: string | null;
  objection_notes?: string | null;
  next_action_type?: string | null;
  next_action_at?: string | null;
  onboarding_status?: "not_started" | "invited" | "in_progress" | "activated" | "first_win";
  first_win?: string | null;
  win_share_consent?: number;
  audit_count?: number;
  prd_count?: number;
  scrape_count?: number;
  proposal_count?: number;
  last_error?: string | null;
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
  { key: "dental", label: "Dental Clinics", queryVariants: ["dentists", "dental clinics", "dental offices", "odontologia", "dentistas"] },
  { key: "real-estate", label: "Real Estate Agencies", queryVariants: ["real estate agencies", "realtors", "property agents", "inmobiliarias", "imobiliarias"] },
  { key: "law", label: "Law Firms", queryVariants: ["law firms", "attorneys", "legal services", "abogados", "advogados"] },
  { key: "restaurants", label: "Restaurants & Gastronomy", queryVariants: ["restaurants", "family restaurants", "fine dining restaurants", "restaurantes", "gastronomia"] },
  { key: "gyms", label: "Gyms & Fitness Centers", queryVariants: ["gyms", "fitness centers", "crossfit", "gimnasios", "academias"] },
  { key: "auto-repair", label: "Auto Repair Shops", queryVariants: ["auto repair shops", "car mechanics", "auto service centers", "talleres mecanicos", "oficinas mecanicas"] },
  { key: "beauty", label: "Beauty Salons & Spas", queryVariants: ["beauty salons", "hair salons", "spas", "salones de belleza", "salao de beleza"] },
  { key: "contractors", label: "General Contractors", queryVariants: ["general contractors", "construction companies", "home renovation contractors", "constructoras", "empreiteiras"] },
  { key: "medical", label: "Medical & Health Clinics", queryVariants: ["medical clinics", "private doctors", "health centers", "clinicas medicas", "consultorios medicos"] },
  { key: "accounting", label: "Accounting & Tax Firms", queryVariants: ["accounting firms", "cpa", "tax advisors", "estudios contables", "contabilidade"] },
  { key: "veterinary", label: "Veterinary & Pet Care", queryVariants: ["veterinary clinics", "animal hospitals", "vet care", "veterinarias", "clinicas veterinarias"] },
  { key: "hvac", label: "HVAC & Air Conditioning", queryVariants: ["hvac services", "air conditioning repair", "heating contractors", "aire acondicionado", "climatizacao"] },
  { key: "plumbing", label: "Plumbing & Drain Services", queryVariants: ["plumbing services", "emergency plumbers", "drain cleaning", "plomeria fontaneria", "encanadores"] },
  { key: "roofing", label: "Roofing & Siding", queryVariants: ["roofing contractors", "roof repair", "siding contractors", "techos y cubiertas", "telhados e reformas"] },
  { key: "solar", label: "Solar & Clean Energy", queryVariants: ["solar energy contractors", "solar panel installers", "clean energy", "energia solar", "instaladores solares"] },
  { key: "landscaping", label: "Landscaping & Lawn Care", queryVariants: ["landscaping companies", "lawn care services", "tree services", "jardineria y paisajismo", "paisagismo e jardinagem"] },
  { key: "architecture", label: "Architecture & Interior Design", queryVariants: ["architecture firms", "interior designers", "architects", "estudios de arquitectura", "arquitetura e interiores"] },
  { key: "cleaning", label: "Cleaning & Janitorial", queryVariants: ["commercial cleaning services", "house cleaning companies", "maid services", "empresas de limpieza", "servicos de limpeza"] },
  { key: "event-planning", label: "Event Planning & Venues", queryVariants: ["event planners", "wedding venues", "party planners", "organizacion de eventos", "espacos para eventos"] },
  { key: "it-services", label: "IT Support & Managed Services", queryVariants: ["it support companies", "managed it services", "computer repair", "soporte ti y tecnologia", "suporte de ti e informatica"] },
  { key: "photography", label: "Photography & Video Studios", queryVariants: ["photography studios", "videographers", "commercial photo studios", "estudios de fotografia", "estudio fotografico"] },
  { key: "pet-grooming", label: "Pet Grooming & Boarding", queryVariants: ["pet grooming", "dog daycares", "pet boarding", "peluqueria canina", "banho e tosa pet"] },
  { key: "auto-dealers", label: "Car Dealerships & Detailing", queryVariants: ["car dealerships", "auto detailing", "used cars", "concesionarias de autos", "estetica automotiva"] },
  { key: "security", label: "Security & Smart Home", queryVariants: ["security systems", "smart home automation", "locksmiths", "camaras y seguridad privada", "seguranca eletronica"] },
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
