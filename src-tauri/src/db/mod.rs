pub mod products;
pub mod sales;
pub mod analytics;

use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub fn init_db(db_path: PathBuf) -> Result<Connection> {
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

    // Indexes for high-performance joins, lookups, and analytics queries
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)",
        [],
    )?;

    Ok(conn)
}
