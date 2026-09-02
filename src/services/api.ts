import { invoke } from "@tauri-apps/api/core";
import {
  Product,
  SaleReport,
  SaleDetailResponse,
  AnalyticsResponse,
  NewProductPayload,
  UpdateProductPayload,
  CheckoutPayload,
} from "../types";

export const posApi = {
  // --- Inventory & Products ---
  getAllProducts: async (): Promise<Product[]> => {
    return await invoke<Product[]>("get_all_products");
  },

  getProductByBarcode: async (barcode: string): Promise<Product> => {
    return await invoke<Product>("get_product_by_barcode", { barcode });
  },

  addProduct: async (payload: NewProductPayload): Promise<void> => {
    return await invoke<void>("add_product", {
      barcode: payload.barcode,
      name: payload.name,
      category: payload.category,
      costPrice: payload.cost_price,
      cost_price: payload.cost_price,
      price: payload.price,
      stock: payload.stock,
      minStock: payload.min_stock,
      min_stock: payload.min_stock,
    });
  },

  updateProduct: async (payload: UpdateProductPayload): Promise<void> => {
    return await invoke<void>("update_product", {
      barcode: payload.barcode,
      name: payload.name,
      category: payload.category,
      costPrice: payload.cost_price,
      cost_price: payload.cost_price,
      price: payload.price,
      stock: payload.stock,
      minStock: payload.min_stock,
      min_stock: payload.min_stock,
    });
  },

  deleteProduct: async (barcode: string): Promise<void> => {
    return await invoke<void>("delete_product", { barcode });
  },

  // --- Transactions & Cashier ---
  processTransaction: async (payload: CheckoutPayload): Promise<void> => {
    return await invoke<void>("process_transaction", {
      items: payload.items.map((item) => ({
        barcode: item.barcode,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        cost_price: item.cost_price,
        costPrice: item.cost_price,
        price: item.price,
      })),
      total: payload.total,
      amountPaid: payload.amount_paid,
      amount_paid: payload.amount_paid,
      changeAmount: payload.change_amount,
      change_amount: payload.change_amount,
      paymentMethod: payload.payment_method,
      payment_method: payload.payment_method,
    });
  },

  // --- Reports & Analytics ---
  getSalesReport: async (month: string, year: string): Promise<SaleReport[]> => {
    return await invoke<SaleReport[]>("get_sales_report", { month, year });
  },

  getSalesAnalytics: async (): Promise<AnalyticsResponse> => {
    return await invoke<AnalyticsResponse>("get_sales_analytics");
  },

  getSaleDetails: async (saleId: string): Promise<SaleDetailResponse> => {
    return await invoke<SaleDetailResponse>("get_sale_details", {
      saleId,
      sale_id: saleId,
    });
  },
};
