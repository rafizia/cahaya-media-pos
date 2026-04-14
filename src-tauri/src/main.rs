// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Serialize, Deserialize};
use rusqlite::{Connection, Result};
use std::sync::Mutex;
use tauri::{Manager, State};

struct DbState(Mutex<Connection>);

#[derive(Serialize, Deserialize, Debug)]
struct Product {
    id: i32,
    barcode: String,
    name: String,
    price: i64,
    stock: i32,
}

#[derive(Deserialize)]
struct SaleItem {
    barcode: String,
    quantity: i32,
    price: i64,
}

#[derive(Serialize)]
struct SaleReport {
    id: i32,
    total_price: i64,
    created_at: String,
}

fn init_db(db_path: std::path::PathBuf) -> Result<Connection> {
    let conn = Connection::open(db_path)?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            barcode TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            stock INTEGER NOT NULL
        )",
        [],
    )?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_price INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;
    Ok(conn)
}

#[tauri::command]
fn add_product(state: State<'_, DbState>, barcode: String, name: String, price: i64, stock: i32) -> Result<(), String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;

    conn.execute(
        "INSERT INTO products (barcode, name, price, stock) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![barcode, name, price, stock],
    )
    .map_err(|e| {
        if e.to_string().contains("UNIQUE constraint failed") {
            "Produk sudah terdaftar!".to_string()
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
        .prepare("SELECT id, barcode, name, price, stock FROM products WHERE barcode = ?")
        .map_err(|e| e.to_string())?;

    let product = stmt.query_row([barcode], |row| {
        Ok(Product {
            id: row.get(0)?,
            barcode: row.get(1)?,
            name: row.get(2)?,
            price: row.get(3)?,
            stock: row.get(4)?,
        })
    }).map_err(|_| "Produk tidak ditemukan".to_string());

    product
}

#[tauri::command]
fn get_all_products(state: State<'_, DbState>) -> Result<Vec<Product>, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    
    let mut stmt = conn
        .prepare("SELECT id, barcode, name, price, stock FROM products")
        .map_err(|e| e.to_string())?;

    let rows = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            barcode: row.get(1)?,
            name: row.get(2)?,
            price: row.get(3)?,
            stock: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut products = Vec::new();
    for row in rows {
        products.push(row.map_err(|e| e.to_string())?);
    }

    Ok(products)
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
fn get_sales_report(state: State<'_, DbState>) -> Result<Vec<SaleReport>, String> {
    let conn = state.0.lock().map_err(|_| "Gagal mendapatkan koneksi database")?;
    
    let mut stmt = conn
        .prepare("SELECT id, total_price, datetime(created_at, 'localtime') FROM sales ORDER BY id DESC LIMIT 50")
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
            get_all_products
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
