ALTER TABLE leads ADD COLUMN tier TEXT;
ALTER TABLE leads ADD COLUMN score INTEGER;
ALTER TABLE leads ADD COLUMN notes TEXT;
ALTER TABLE leads ADD COLUMN lost_reason TEXT;
ALTER TABLE leads ADD COLUMN closed_amount_usd INTEGER;
ALTER TABLE leads ADD COLUMN closed_at TEXT;

CREATE INDEX idx_leads_tier ON leads(tier);
