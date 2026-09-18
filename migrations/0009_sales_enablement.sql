-- Sales enablement layer: human-in-the-loop qualification through onboarding.
ALTER TABLE leads ADD COLUMN contact_name TEXT;
ALTER TABLE leads ADD COLUMN email TEXT;
ALTER TABLE leads ADD COLUMN company_size TEXT;
ALTER TABLE leads ADD COLUMN marketing_spend TEXT;
ALTER TABLE leads ADD COLUMN pain_points TEXT;
ALTER TABLE leads ADD COLUMN goals TEXT;
ALTER TABLE leads ADD COLUMN qualification_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE leads ADD COLUMN qualification_score INTEGER;
ALTER TABLE leads ADD COLUMN qualification_json TEXT;
ALTER TABLE leads ADD COLUMN call_transcript TEXT;
ALTER TABLE leads ADD COLUMN objection_notes TEXT;
ALTER TABLE leads ADD COLUMN next_action_type TEXT;
ALTER TABLE leads ADD COLUMN next_action_at TEXT;
ALTER TABLE leads ADD COLUMN onboarding_status TEXT NOT NULL DEFAULT 'not_started';
ALTER TABLE leads ADD COLUMN first_win TEXT;
ALTER TABLE leads ADD COLUMN win_share_consent INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_leads_qualification_status ON leads(qualification_status);
CREATE INDEX idx_leads_next_action_at ON leads(next_action_at);
CREATE INDEX idx_leads_onboarding_status ON leads(onboarding_status);

CREATE TABLE sales_artifacts (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  artifact_type TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  source TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_sales_artifacts_lead ON sales_artifacts(lead_id, artifact_type);
