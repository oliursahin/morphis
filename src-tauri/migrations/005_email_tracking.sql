CREATE TABLE email_tracking (
    id TEXT PRIMARY KEY,
    tracking_id TEXT NOT NULL UNIQUE,
    account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    provider_thread_id TEXT NOT NULL DEFAULT '',
    recipient_email TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_tracking_thread ON email_tracking(account_id, provider_thread_id);
