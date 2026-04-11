use tauri::State;

use crate::error::Error;
use crate::state::AppState;

use super::inbox::resolve_account_id;

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Contact {
    pub name: String,
    pub email: String,
}

/// Search previously-interacted contacts from cached threads.
/// Returns unique (name, email) pairs matching the query, ordered by recency.
#[tauri::command]
pub async fn search_contacts(
    state: State<'_, AppState>,
    query: String,
) -> Result<Vec<Contact>, Error> {
    let query = query.trim().to_lowercase();
    if query.is_empty() {
        return Ok(vec![]);
    }

    let contacts = {
        let conn = state.db.lock().map_err(|e| Error::Internal(format!("DB lock: {e}")))?;
        let account_id = resolve_account_id(&conn)?;

        // Get the user's own email to exclude from results
        let own_email: String = conn
            .query_row(
                "SELECT email FROM accounts WHERE id = ?1",
                [&account_id],
                |row| row.get(0),
            )?;

        let pattern = format!("%{query}%");

        let mut stmt = conn.prepare(
            "SELECT from_name, from_email, MAX(CAST(last_message_at AS INTEGER)) as recency
             FROM threads
             WHERE account_id = ?1
               AND from_email != ''
               AND (LOWER(from_email) LIKE ?2 OR LOWER(from_name) LIKE ?2)
             GROUP BY LOWER(from_email)
             ORDER BY recency DESC
             LIMIT 8"
        )?;

        let rows = stmt.query_map(rusqlite::params![&account_id, &pattern], |row| {
            Ok(Contact {
                name: row.get(0)?,
                email: row.get(1)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

        // Filter out the user's own email
        rows.into_iter()
            .filter(|c| c.email.to_lowercase() != own_email.to_lowercase())
            .collect::<Vec<_>>()
    };

    Ok(contacts)
}
