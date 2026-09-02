use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::models::{SaleDetailResponse, SaleItemDetail, SaleItemInput, SaleReport};

pub fn process_transaction(
    conn: &mut Connection,
    items: Vec<SaleItemInput>,
    total: i64,
    amount_paid: i64,
    change_amount: i64,
    payment_method: Option<String>,
) -> Result<String, String> {
    if items.is_empty() {
        return Err("Keranjang belanja kosong".to_string());
    }

    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let sale_id = Uuid::new_v4().to_string();
    let method = payment_method.unwrap_or_else(|| "CASH".to_string());

    let mut total_cost: i64 = 0;
    for item in &items {
        total_cost += item.cost_price * (item.quantity as i64);
    }
    let total_profit = total - total_cost;

    tx.execute(
        "INSERT INTO sales (id, total_price, total_cost, total_profit, amount_paid, change_amount, payment_method) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![sale_id, total, total_cost, total_profit, amount_paid, change_amount, method],
    ).map_err(|e| e.to_string())?;

    for item in items {
        let item_id = Uuid::new_v4().to_string();
        let cat = item.category.unwrap_or_else(|| "Umum".to_string());
        let subtotal = item.price * (item.quantity as i64);
        let subtotal_cost = item.cost_price * (item.quantity as i64);
        let profit = subtotal - subtotal_cost;

        tx.execute(
            "INSERT INTO sale_items (id, sale_id, barcode, product_name, category, quantity, cost_price, price, subtotal, profit)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![item_id, sale_id, item.barcode, item.name, cat, item.quantity, item.cost_price, item.price, subtotal, profit],
        ).map_err(|e| format!("Gagal menyimpan rincian item: {}", e))?;

        tx.execute(
            "UPDATE products SET stock = stock - ?1 WHERE barcode = ?2",
            params![item.quantity, item.barcode],
        ).map_err(|e| format!("Gagal potong stok untuk {}: {}", item.barcode, e))?;
    }

    tx.commit().map_err(|e| e.to_string())?;

    Ok(sale_id)
}

pub fn get_sale_details(conn: &Connection, sale_id: &str) -> Result<SaleDetailResponse, String> {
    let mut sale_stmt = conn.prepare(
        "SELECT id, total_price, total_cost, total_profit, amount_paid, change_amount, payment_method, datetime(created_at, 'localtime')
         FROM sales WHERE id = ?"
    ).map_err(|e| e.to_string())?;

    let sale = sale_stmt.query_row([sale_id], |row| {
        Ok(SaleReport {
            id: row.get(0)?,
            total_price: row.get(1)?,
            total_cost: row.get(2)?,
            total_profit: row.get(3)?,
            amount_paid: row.get(4)?,
            change_amount: row.get(5)?,
            payment_method: row.get(6)?,
            created_at: row.get(7)?,
            item_count: 0,
        })
    }).map_err(|_| "Data transaksi tidak ditemukan".to_string())?;

    let mut items_stmt = conn.prepare(
        "SELECT id, sale_id, barcode, product_name, category, quantity, cost_price, price, subtotal, profit
         FROM sale_items WHERE sale_id = ? ORDER BY id ASC"
    ).map_err(|e| e.to_string())?;

    let rows = items_stmt.query_map([sale_id], |row| {
        Ok(SaleItemDetail {
            id: row.get(0)?,
            sale_id: row.get(1)?,
            barcode: row.get(2)?,
            product_name: row.get(3)?,
            category: row.get(4)?,
            quantity: row.get(5)?,
            cost_price: row.get(6)?,
            price: row.get(7)?,
            subtotal: row.get(8)?,
            profit: row.get(9)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut items = Vec::new();
    for row in rows {
        items.push(row.map_err(|e| e.to_string())?);
    }

    Ok(SaleDetailResponse {
        sale,
        items,
    })
}

pub fn get_sales_report(conn: &Connection, month: &str, year: &str) -> Result<Vec<SaleReport>, String> {
    let mut query = "SELECT s.id, s.total_price, s.total_cost, s.total_profit, s.amount_paid, s.change_amount, s.payment_method, datetime(s.created_at, 'localtime'), COALESCE(COUNT(si.id), 0)
                     FROM sales s
                     LEFT JOIN sale_items si ON s.id = si.sale_id".to_string();
    let mut conditions = Vec::new();
    let mut param_values: Vec<String> = Vec::new();

    if !year.is_empty() {
        conditions.push("strftime('%Y', datetime(s.created_at, 'localtime')) = ?".to_string());
        param_values.push(year.to_string());
    }
    if !month.is_empty() {
        conditions.push("strftime('%m', datetime(s.created_at, 'localtime')) = ?".to_string());
        param_values.push(month.to_string());
    }
    
    if !conditions.is_empty() {
        query.push_str(" WHERE ");
        query.push_str(&conditions.join(" AND "));
    }
    
    query.push_str(" GROUP BY s.id ORDER BY s.created_at DESC LIMIT 2000");

    let mut stmt = conn
        .prepare(&query)
        .map_err(|e| e.to_string())?;

    let rows = stmt.query_map(rusqlite::params_from_iter(param_values.iter()), |row| {
        Ok(SaleReport {
            id: row.get(0)?,
            total_price: row.get(1)?,
            total_cost: row.get(2)?,
            total_profit: row.get(3)?,
            amount_paid: row.get(4)?,
            change_amount: row.get(5)?,
            payment_method: row.get(6)?,
            created_at: row.get(7)?,
            item_count: row.get(8)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut reports = Vec::new();
    for row in rows {
        reports.push(row.map_err(|e| e.to_string())?);
    }

    Ok(reports)
}
