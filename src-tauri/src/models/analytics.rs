use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AnalyticsResponse {
    pub today_revenue: i64,
    pub today_profit: i64,
    pub weekly_revenue: i64,
    pub weekly_profit: i64,
}
