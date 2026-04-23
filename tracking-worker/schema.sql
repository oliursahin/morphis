CREATE TABLE opens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_id TEXT NOT NULL,
    opened_at TEXT NOT NULL DEFAULT (datetime('now')),
    ip TEXT,
    user_agent TEXT
);
CREATE INDEX idx_opens_tracking_id ON opens(tracking_id);
