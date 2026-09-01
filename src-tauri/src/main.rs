// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Serialize, Deserialize};
use rusqlite::{Connection, Result, params};
use std::sync::Mutex;
use tauri::{Manager, State};
use uuid::Uuid;

struct DbState(Mutex<Connection>);

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Product {
    pub id: String,
    pub barcode: String,
    pub name: String,
    pub category: String,
    pub cost_price: i64,
    pub price: i64,
    pub stock: i32,
    pub min_stock: i32,
}

#[derive(Deserialize, Debug)]
pub struct SaleItemInput {
    pub barcode: String,
    pub name: String,
    pub category: Option<String>,
    pub quantity: i32,
    pub cost_price: i64,
    pub price: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleItemDetail {
    pub id: String,
    pub sale_id: String,
    pub barcode: String,
    pub product_name: String,
    pub category: String,
    pub quantity: i32,
    pub cost_price: i64,
    pub price: i64,
    pub subtotal: i64,
    pub profit: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleReport {
    pub id: String,
    pub total_price: i64,
    pub total_cost: i64,
    pub total_profit: i64,
    pub amount_paid: i64,
    pub change_amount: i64,
    pub payment_method: String,
    pub created_at: String,
    pub item_count: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SaleDetailResponse {
    pub sale: SaleReport,
    pub items: Vec<SaleItemDetail>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AnalyticsResponse {
    pub today_revenue: i64,
    pub today_profit: i64,
    pub weekly_revenue: i64,
    pub weekly_profit: i64,
}

fn init_db(db_path: std::path::PathBuf) -> Result<Connection> {
    let conn = Connection::open(db_path)?;
    conn.execute("PRAGMA foreign_keys = ON;", [])?;
    
    // Check if products table has INTEGER id (from old version) to reset schema cleanly
    let needs_reset = {
        let mut stmt = conn.prepare("PRAGMA table_info(products)")?;
        let mut rows = stmt.query([])?;
        let mut is_old = false;
        while let Some(row) = rows.next()? {
            let name: String = row.get(1)?;
            let col_type: String = row.get(2)?;
            if name == "id" && col_type.to_uppercase().contains("INT") {
                is_old = true;
                break;
            }
        }
        is_old
    };

    if needs_reset {
        let _ = conn.execute("DROP TABLE IF EXISTS sale_items", []);
        let _ = conn.execute("DROP TABLE IF EXISTS sales", []);
        let _ = conn.execute("DROP TABLE IF EXISTS products", []);
    }

    conn.execute(
        "CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            barcode TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'Umum',
            cost_price INTEGER NOT NULL DEFAULT 0,
            price INTEGER NOT NULL,
            stock INTEGER NOT NULL,
            min_stock INTEGER NOT NULL DEFAULT 5
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS sales (
            id TEXT PRIMARY KEY,
            total_price INTEGER NOT NULL,
            total_cost INTEGER NOT NULL DEFAULT 0,
            total_profit INTEGER NOT NULL DEFAULT 0,
            amount_paid INTEGER NOT NULL DEFAULT 0,
            change_amount INTEGER NOT NULL DEFAULT 0,
            payment_method TEXT NOT NULL DEFAULT 'CASH',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS sale_items (
            id TEXT PRIMARY KEY,
            sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
            barcode TEXT NOT NULL,
            product_name TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'Umum',
            quantity INTEGER NOT NULL,
            cost_price INTEGER NOT NULL DEFAULT 0,
            price INTEGER NOT NULL,
            subtotal INTEGER NOT NULL,
            profit INTEGER NOT NULL DEFAULT 0
        )",
        [],
    )?;

    Ok(conn)
}

#[tauri::command]
fn add_product(
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
    let id = Uuid::new_v4().to_string();
    let cat = category.unwrap_or_else(|| "Umum".to_string());
    let min_stk = min_stock.unwrap_or(5);

    conn.execute(
        "INSERT INTO products (id, barcode, name, category, cost_price, price, stock, min_stock) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![id, barcode, name, cat, cost_price, price, stock, min_stk],
    )
    .map_err(|e| {
        if e.to_string().contains("UNIQUE constraint failed") {
            "Produk dengan barcode ini sudah terdaftar!".to_string()
        } else {
            e.to_string()
        }
    })?;

    Ok(())
}

#[tauri::command]
fn get_product_by_barcode(state: State<'_, DbState>, barcode: String) -> Result<Product, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    
    let mut stmt = conn
        .prepare("SELECT id, barcode, name, category, cost_price, price, stock, min_stock FROM products WHERE barcode = ?")
        .map_err(|e| e.to_string())?;

    let product = stmt.query_row([barcode], |row| {
        Ok(Product {
            id: row.get(0)?,
            barcode: row.get(1)?,
            name: row.get(2)?,
            category: row.get(3)?,
            cost_price: row.get(4)?,
            price: row.get(5)?,
            stock: row.get(6)?,
            min_stock: row.get(7)?,
        })
    }).map_err(|_| "Produk tidak ditemukan".to_string());

    product
}

#[tauri::command]
fn get_all_products(state: State<'_, DbState>) -> Result<Vec<Product>, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    
    let mut stmt = conn
        .prepare("SELECT id, barcode, name, category, cost_price, price, stock, min_stock FROM products ORDER BY name ASC")
        .map_err(|e| e.to_string())?;

    let rows = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            barcode: row.get(1)?,
            name: row.get(2)?,
            category: row.get(3)?,
            cost_price: row.get(4)?,
            price: row.get(5)?,
            stock: row.get(6)?,
            min_stock: row.get(7)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut products = Vec::new();
    for row in rows {
        products.push(row.map_err(|e| e.to_string())?);
    }

    Ok(products)
}

#[tauri::command]
fn update_product(state: State<'_, DbState>, barcode: String, name: String, price: i64, stock: i32) -> Result<(), String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;

    conn.execute(
        "UPDATE products SET name = ?1, price = ?2, stock = ?3 WHERE barcode = ?4",
        rusqlite::params![name, price, stock, barcode],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn delete_product(state: State<'_, DbState>, barcode: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;

    conn.execute(
        "DELETE FROM products WHERE barcode = ?1",
        rusqlite::params![barcode],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn process_transaction(state: State<'_, DbState>, items: Vec<SaleItem>, total: i64) -> Result<(), String> {
    let mut conn_guard = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    let tx = conn_guard.transaction().map_err(|e| e.to_string())?;

    tx.execute(
        "INSERT INTO sales (total_price) VALUES (?1)",
        [&total],
    ).map_err(|e| e.to_string())?;

    for item in items {
        tx.execute(
            "UPDATE products SET stock = stock - ?1 WHERE barcode = ?2",
            rusqlite::params![item.quantity, item.barcode],
        ).map_err(|e| format!("Gagal potong stok untuk {}: {}", item.barcode, e))?;
    }

    tx.commit().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_sales_report(state: State<'_, DbState>, month: String, year: String) -> Result<Vec<SaleReport>, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    
    let mut query = "SELECT id, total_price, datetime(created_at, 'localtime') FROM sales".to_string();
    let mut conditions = Vec::new();

    if !year.is_empty() {
        conditions.push(format!("strftime('%Y', datetime(created_at, 'localtime')) = '{}'", year));
    }
    if !month.is_empty() {
        conditions.push(format!("strftime('%m', datetime(created_at, 'localtime')) = '{}'", month));
    }
    
    if !conditions.is_empty() {
        query.push_str(" WHERE ");
        query.push_str(&conditions.join(" AND "));
    }
    
    query.push_str(" ORDER BY id DESC LIMIT 2000");

    let mut stmt = conn
        .prepare(&query)
        .map_err(|e| e.to_string())?;

    let rows = stmt.query_map([], |row| {
        Ok(SaleReport {
            id: row.get(0)?,
            total_price: row.get(1)?,
            created_at: row.get(2)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut reports = Vec::new();
    for row in rows {
        reports.push(row.map_err(|e| e.to_string())?);
    }

    Ok(reports)
}

#[tauri::command]
fn get_weekly_revenue(state: State<'_, DbState>) -> Result<i64, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    
    let mut stmt = conn
        .prepare("SELECT COALESCE(SUM(total_price), 0) FROM sales WHERE datetime(created_at, 'localtime') >= datetime('now', '-7 days', 'localtime')")
        .map_err(|e| e.to_string())?;

    let sum_total: i64 = stmt.query_row([], |row| row.get(0)).unwrap_or(0);

    Ok(sum_total)
}

#[tauri::command]
fn get_today_revenue(state: State<'_, DbState>) -> Result<i64, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    
    let mut stmt = conn
        .prepare("SELECT COALESCE(SUM(total_price), 0) FROM sales WHERE date(created_at, 'localtime') = date('now', 'localtime')")
        .map_err(|e| e.to_string())?;

    let sum_total: i64 = stmt.query_row([], |row| row.get(0)).unwrap_or(0);

    Ok(sum_total)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Gunakan API Tauri v2: app.path()
            let app_dir = app.path().app_data_dir().expect("Gagal mendapatkan path data");
            
            // Buat folder jika belum ada (misalnya: C:\Users\User\AppData\Roaming\com.tauri.dev)
            std::fs::create_dir_all(&app_dir).unwrap();
            
            let db_path = app_dir.join("cahaya_media.db");
            
            // Inisialisasi DB di path absolut yang aman
            let conn = init_db(db_path).expect("Gagal inisialisasi database");
            
            // Simpan koneksi SQLite ke dalam State Tauri agar bisa diakses berulang 
            // tanpa perlu membuka tutup file .db yang sering memicu error 'force close' di OS Windows
            app.manage(DbState(Mutex::new(conn)));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_product_by_barcode, 
            add_product,
            process_transaction,
            get_sales_report,
            get_all_products,
            update_product,
            delete_product,
            get_weekly_revenue,
            get_today_revenue
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
