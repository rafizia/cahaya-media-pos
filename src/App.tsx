import { useState, useEffect } from "react";
import "./App.css";
import { Product } from "./types";
import { posApi } from "./services/api";
import { IconKasir, IconStok, IconLaporan } from "./components/common/Icons";
import { CashierView } from "./components/cashier/CashierView";
import { InventoryView } from "./components/inventory/InventoryView";
import { ReportsView } from "./components/reports/ReportsView";

function App() {
  const [mode, setMode] = useState<"kasir" | "input" | "laporan">("kasir");
  const [products, setProducts] = useState<Product[]>([]);

  const fetchAllProducts = async () => {
    try {
      const data = await posApi.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Gagal mengambil data produk:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, [mode]);

  return (
    <div className="flex h-screen p-6 gap-4 font-sans">
      {/* SIDEBAR NAVIGATION */}
      <div className="w-60 flex flex-col">
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold tracking-wide">Cahaya Media</h1>
        </div>
        <div className="bg-white text-lg rounded-2xl p-3 flex-1 flex flex-col gap-2 shadow-sm">
          <button
            type="button"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer font-semibold transition-all duration-200 w-full text-left ${
              mode === "kasir" ? "bg-[#0b5d8a] text-white" : "text-[#1a1a1a] hover:bg-gray-100"
            }`}
            onClick={() => setMode("kasir")}
          >
            <IconKasir />
            <span>Kasir</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer font-semibold transition-all duration-200 w-full text-left ${
              mode === "input" ? "bg-[#0b5d8a] text-white" : "text-[#1a1a1a] hover:bg-gray-100"
            }`}
            onClick={() => setMode("input")}
          >
            <IconStok />
            <span>Stok</span>
          </button>
          <button
            type="button"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer font-semibold transition-all duration-200 w-full text-left ${
              mode === "laporan" ? "bg-[#0b5d8a] text-white" : "text-[#1a1a1a] hover:bg-gray-100"
            }`}
            onClick={() => setMode("laporan")}
          >
            <IconLaporan />
            <span>Laporan</span>
          </button>
        </div>
      </div>

      {/* MAIN VIEW CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {mode === "kasir" && (
          <CashierView products={products} onTransactionSuccess={fetchAllProducts} />
        )}
        {mode === "input" && (
          <InventoryView products={products} onRefreshProducts={fetchAllProducts} />
        )}
        {mode === "laporan" && <ReportsView />}
      </div>
    </div>
  );
}

export default App;
