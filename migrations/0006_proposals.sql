CREATE TABLE proposals (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  vertical TEXT NOT NULL,
  r2_html_key TEXT NOT NULL,
  r2_cover_image_key TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_proposals_lead ON proposals(lead_id);
