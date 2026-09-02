use tauri::State;
use crate::models::Product;
use crate::state::DbState;
use crate::db::products as db_products;

#[tauri::command]
pub fn add_product(
    state: State<'_, DbState>,
    barcode: String,
    name: String,
    category: Option<String>,
    cost_price: i64,
    price: i64,
    stock: i32,
    min_stock: Option<i32>,
) -> Result<(), String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    db_products::add_product(&conn, barcode, name, category, cost_price, price, stock, min_stock)
}

#[tauri::command]
pub fn get_product_by_barcode(state: State<'_, DbState>, barcode: String) -> Result<Product, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    db_products::get_product_by_barcode(&conn, &barcode)
}

#[tauri::command]
pub fn get_all_products(state: State<'_, DbState>) -> Result<Vec<Product>, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    db_products::get_all_products(&conn)
}

#[tauri::command]
pub fn update_product(
    state: State<'_, DbState>,
    barcode: String,
    name: String,
    category: Option<String>,
    cost_price: i64,
    price: i64,
    stock: i32,
    min_stock: Option<i32>,
) -> Result<(), String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    db_products::update_product(&conn, barcode, name, category, cost_price, price, stock, min_stock)
}

#[tauri::command]
pub fn delete_product(state: State<'_, DbState>, barcode: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    db_products::delete_product(&conn, &barcode)
}
