export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  cost_price: number;
  price: number;
  stock: number;
  min_stock: number;
}

export interface CartItem {
  barcode: string;
  name: string;
  category?: string;
  cost_price: number;
  price: number;
  quantity: number;
}

export interface SaleReport {
  id: string;
  total_price: number;
  total_cost: number;
  total_profit: number;
  amount_paid: number;
  change_amount: number;
  payment_method: string;
  created_at: string;
  item_count: number;
}

export interface SaleItemDetail {
  id: string;
  sale_id: string;
  barcode: string;
  product_name: string;
  category: string;
  quantity: number;
  cost_price: number;
  price: number;
  subtotal: number;
  profit: number;
}

export interface SaleDetailResponse {
  sale: SaleReport;
  items: SaleItemDetail[];
}

export interface AnalyticsResponse {
  today_revenue: number;
  today_profit: number;
  weekly_revenue: number;
  weekly_profit: number;
}

export interface NewProductPayload {
  barcode: string;
  name: string;
  category: string;
  cost_price: number;
  price: number;
  stock: number;
  min_stock: number;
}

export interface UpdateProductPayload {
  barcode: string;
  name: string;
  category: string;
  cost_price: number;
  price: number;
  stock: number;
  min_stock: number;
}

export interface CheckoutItemPayload {
  barcode: string;
  name: string;
  category: string;
  quantity: number;
  cost_price: number;
  price: number;
}

export interface CheckoutPayload {
  items: CheckoutItemPayload[];
  total: number;
  amount_paid: number;
  change_amount: number;
  payment_method: string;
}
