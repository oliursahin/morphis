use rusqlite::Connection;

use crate::error::Error;

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TrackingRecord {
    pub id: String,
    pub tracking_id: String,
    pub account_id: String,
    pub provider_thread_id: String,
    pub recipient_email: String,
    pub created_at: String,
}

pub fn insert_tracking(
    conn: &Connection,
    id: &str,
    tracking_id: &str,
    account_id: &str,
    provider_thread_id: &str,
    recipient_email: &str,
) -> Result<(), Error> {
    conn.execute(
        "INSERT INTO email_tracking (id, tracking_id, account_id, provider_thread_id, recipient_email)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![id, tracking_id, account_id, provider_thread_id, recipient_email],
    )?;
    Ok(())
}

pub fn get_tracking_ids_for_thread(
    conn: &Connection,
    account_id: &str,
    provider_thread_id: &str,
) -> Result<Vec<TrackingRecord>, Error> {
    let mut stmt = conn.prepare(
        "SELECT id, tracking_id, account_id, provider_thread_id, recipient_email, created_at
         FROM email_tracking
         WHERE account_id = ?1 AND provider_thread_id = ?2
         ORDER BY created_at ASC",
    )?;
    let rows = stmt
        .query_map(rusqlite::params![account_id, provider_thread_id], |row| {
            Ok(TrackingRecord {
                id: row.get(0)?,
                tracking_id: row.get(1)?,
                account_id: row.get(2)?,
                provider_thread_id: row.get(3)?,
                recipient_email: row.get(4)?,
                created_at: row.get(5)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
    Ok(rows)
}
