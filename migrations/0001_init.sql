-- Hudson System / 10kPrinter initial schema

CREATE TABLE lead_sources (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  region TEXT,
  category TEXT,
  cron_enabled INTEGER NOT NULL DEFAULT 1,
  last_run_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  business_name TEXT,
  url TEXT NOT NULL,
  place_id TEXT,
  phone TEXT,
  address TEXT,
  category TEXT,
  source_id TEXT REFERENCES lead_sources(id),
  status TEXT NOT NULL DEFAULT 'discovered',
  workflow_instance_id TEXT,
  discovered_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX idx_leads_url ON leads(url);
CREATE UNIQUE INDEX idx_leads_place_id ON leads(place_id) WHERE place_id IS NOT NULL;
CREATE INDEX idx_leads_status ON leads(status);

CREATE TABLE scrapes (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  r2_html_key TEXT,
  r2_screenshot_key TEXT,
  summary_json TEXT,
  load_time_ms INTEGER,
  scraped_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_scrapes_lead_id ON scrapes(lead_id);

CREATE TABLE audits (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  vertical TEXT NOT NULL,
  qualifies INTEGER NOT NULL DEFAULT 0,
  score INTEGER,
  findings_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_audits_lead_id ON audits(lead_id);

CREATE TABLE prds (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  vertical TEXT NOT NULL,
  r2_markdown_key TEXT,
  brand_tokens_json TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_prds_lead_id ON prds(lead_id);

CREATE TABLE pipeline_events (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_pipeline_events_lead_id ON pipeline_events(lead_id);
