use tauri::State;

use crate::error::Error;
use crate::integrations::gmail::client::{GmailClient, GmailLabel};
use crate::integrations::gmail::oauth;
use crate::state::AppState;
use super::inbox::resolve_account_id;

/// Fetch all labels from the user's Gmail account.
#[tauri::command]
pub async fn list_labels(state: State<'_, AppState>) -> Result<Vec<GmailLabel>, Error> {
    let account_id = {
        let conn = state.db.lock().map_err(|e| Error::Internal(format!("DB lock: {e}")))?;
        resolve_account_id(&conn)?
    };

    let token = oauth::get_valid_token(&state.db, &account_id).await?;
    let client = GmailClient::new(token);
    let resp = client.list_labels().await?;
    Ok(resp.labels.unwrap_or_default())
}
