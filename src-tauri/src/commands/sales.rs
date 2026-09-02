use tauri::State;
use crate::models::{SaleDetailResponse, SaleItemInput, SaleReport};
use crate::state::DbState;
use crate::db::sales as db_sales;

#[tauri::command]
pub fn process_transaction(
    state: State<'_, DbState>,
    items: Vec<SaleItemInput>,
    total: i64,
    amount_paid: i64,
    change_amount: i64,
    payment_method: Option<String>,
) -> Result<String, String> {
    let mut conn_guard = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    db_sales::process_transaction(&mut conn_guard, items, total, amount_paid, change_amount, payment_method)
}

#[tauri::command]
pub fn get_sale_details(state: State<'_, DbState>, sale_id: String) -> Result<SaleDetailResponse, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    db_sales::get_sale_details(&conn, &sale_id)
}

#[tauri::command]
pub fn get_sales_report(state: State<'_, DbState>, month: String, year: String) -> Result<Vec<SaleReport>, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    db_sales::get_sales_report(&conn, &month, &year)
}
