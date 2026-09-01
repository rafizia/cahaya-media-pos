use serde::{Deserialize, Serialize};

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
