use rusqlite::Connection;
use crate::models::AnalyticsResponse;

pub fn get_sales_analytics(conn: &Connection) -> Result<AnalyticsResponse, String> {
    let mut today_stmt = conn.prepare(
        "SELECT COALESCE(SUM(total_price), 0), COALESCE(SUM(total_profit), 0)
         FROM sales WHERE date(created_at, 'localtime') = date('now', 'localtime')"
    ).map_err(|e| e.to_string())?;

    let (today_revenue, today_profit): (i64, i64) = today_stmt.query_row([], |row| {
        Ok((row.get(0)?, row.get(1)?))
    }).unwrap_or((0, 0));

    let mut weekly_stmt = conn.prepare(
        "SELECT COALESCE(SUM(total_price), 0), COALESCE(SUM(total_profit), 0)
         FROM sales WHERE datetime(created_at, 'localtime') >= datetime('now', '-7 days', 'localtime')"
    ).map_err(|e| e.to_string())?;

    let (weekly_revenue, weekly_profit): (i64, i64) = weekly_stmt.query_row([], |row| {
        Ok((row.get(0)?, row.get(1)?))
    }).unwrap_or((0, 0));

    Ok(AnalyticsResponse {
        today_revenue,
        today_profit,
        weekly_revenue,
        weekly_profit,
    })
}
