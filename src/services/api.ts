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
    return await invoke<void>("add_product", { ...payload });
  },

  updateProduct: async (payload: UpdateProductPayload): Promise<void> => {
    return await invoke<void>("update_product", { ...payload });
  },

  deleteProduct: async (barcode: string): Promise<void> => {
    return await invoke<void>("delete_product", { barcode });
  },

  // --- Transactions & Cashier ---
  processTransaction: async (payload: CheckoutPayload): Promise<void> => {
    return await invoke<void>("process_transaction", { ...payload });
  },

  // --- Reports & Analytics ---
  getSalesReport: async (month: string, year: string): Promise<SaleReport[]> => {
    return await invoke<SaleReport[]>("get_sales_report", { month, year });
  },

  getSalesAnalytics: async (): Promise<AnalyticsResponse> => {
    return await invoke<AnalyticsResponse>("get_sales_analytics");
  },

  getSaleDetails: async (saleId: string): Promise<SaleDetailResponse> => {
    return await invoke<SaleDetailResponse>("get_sale_details", { saleId });
  },
};
