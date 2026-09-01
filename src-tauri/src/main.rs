// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::Manager;

pub mod models;
pub mod state;
pub mod db;
pub mod commands;

use state::DbState;
use commands::*;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Gunakan API Tauri v2: app.path()
            let app_dir = app.path().app_data_dir().expect("Gagal mendapatkan path data");
            
            // Buat folder jika belum ada (misalnya: C:\Users\User\AppData\Roaming\com.tauri.dev)
            std::fs::create_dir_all(&app_dir).unwrap();
            
            let db_path = app_dir.join("cahaya_media.db");
            
            // Inisialisasi DB di path absolut yang aman
            let conn = db::init_db(db_path).expect("Gagal inisialisasi database");
            
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
            get_sale_details,
            get_sales_analytics,
            get_all_products,
            update_product,
            delete_product
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
