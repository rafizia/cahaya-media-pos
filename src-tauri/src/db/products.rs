use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::models::Product;

pub fn add_product(
    conn: &Connection,
    barcode: String,
    name: String,
    category: Option<String>,
    cost_price: i64,
    price: i64,
    stock: i32,
    min_stock: Option<i32>,
) -> Result<(), String> {
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

pub fn get_product_by_barcode(conn: &Connection, barcode: &str) -> Result<Product, String> {
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

pub fn get_all_products(conn: &Connection) -> Result<Vec<Product>, String> {
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

pub fn update_product(
    conn: &Connection,
    barcode: String,
    name: String,
    category: Option<String>,
    cost_price: i64,
    price: i64,
    stock: i32,
    min_stock: Option<i32>,
) -> Result<(), String> {
    let cat = category.unwrap_or_else(|| "Umum".to_string());
    let min_stk = min_stock.unwrap_or(5);

    conn.execute(
        "UPDATE products SET name = ?1, category = ?2, cost_price = ?3, price = ?4, stock = ?5, min_stock = ?6 WHERE barcode = ?7",
        params![name, cat, cost_price, price, stock, min_stk, barcode],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn delete_product(conn: &Connection, barcode: &str) -> Result<(), String> {
    conn.execute(
        "DELETE FROM products WHERE barcode = ?1",
        params![barcode],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
