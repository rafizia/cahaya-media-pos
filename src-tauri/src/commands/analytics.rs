use tauri::State;
use crate::models::AnalyticsResponse;
use crate::state::DbState;
use crate::db::analytics as db_analytics;

#[tauri::command]
pub fn get_sales_analytics(state: State<'_, DbState>) -> Result<AnalyticsResponse, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    db_analytics::get_sales_analytics(&conn)
}
