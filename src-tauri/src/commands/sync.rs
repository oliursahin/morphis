use std::sync::atomic::AtomicBool;
use std::sync::Arc;

use tauri::{Emitter, State};

use crate::error::Error;
use crate::state::AppState;
use crate::sync::engine::SyncEngine;

#[tauri::command]
pub async fn trigger_sync(
    state: State<'_, AppState>,
    app: tauri::AppHandle,
) -> Result<(), Error> {
    let engine = SyncEngine::new(
        app.clone(),
        state.db.clone(),
        Arc::new(AtomicBool::new(false)),
    );
    match engine.do_sync_once().await {
        Ok(Some(event)) => {
            let _ = app.emit("sync:update", &event);
            Ok(())
        }
        Ok(None) => Ok(()),
        Err(e) => {
            log::warn!("Manual sync failed: {e}");
            Err(e)
        }
    }
}
