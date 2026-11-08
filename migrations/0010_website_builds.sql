CREATE TABLE website_builds (
  id                TEXT PRIMARY KEY,
  subject_type      TEXT NOT NULL CHECK (subject_type IN ('lead','niche')),
  subject_id        TEXT NOT NULL,
  kind              TEXT NOT NULL CHECK (kind IN ('site','proposal')),
  krikkit_build_id  TEXT,
  subdomain         TEXT,
  live_url          TEXT,
  status            TEXT NOT NULL DEFAULT 'queued',
  attempts          INTEGER NOT NULL DEFAULT 0,
  last_error        TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_website_builds_subject ON website_builds(subject_type, subject_id);
CREATE UNIQUE INDEX idx_website_builds_krikkit
  ON website_builds(krikkit_build_id) WHERE krikkit_build_id IS NOT NULL;