CREATE TABLE hunt_sessions (
  id TEXT PRIMARY KEY,
  region TEXT NOT NULL,
  niches_json TEXT NOT NULL,
  leads_per_niche INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE lead_sources ADD COLUMN hunt_session_id TEXT REFERENCES hunt_sessions(id);

CREATE TABLE outreach_timelines (
  id TEXT PRIMARY KEY,
  hunt_session_id TEXT NOT NULL REFERENCES hunt_sessions(id),
  capacity_per_week INTEGER NOT NULL,
  priority_order_json TEXT NOT NULL,
  contact_method TEXT NOT NULL,
  timeline_markdown TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
