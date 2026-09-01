use serde::{Deserialize, Serialize};

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
