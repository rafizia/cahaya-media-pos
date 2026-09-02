import React, { useState, useMemo } from "react";
import { Product } from "../../types";
import { IconTrash } from "../common/Icons";

interface InventoryTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["Semua", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

      const matchesCat =
        categoryFilter === "Semua" ||
        (p.category || "Umum").toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [products, search, categoryFilter]);

  const lowStockCount = products.filter(
    (p) => p.stock <= (p.min_stock ?? 5),
  ).length;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
      {/* Search & Filter Header */}
      <div className="p-3.5 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari barcode / nama produk..."
            className="w-full pl-3 pr-8 py-2 bg-white text-neutral-900 placeholder-neutral-400 rounded-lg text-sm font-medium border border-neutral-300 outline-none focus:border-pos-blue transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white text-neutral-800 rounded-lg text-xs font-semibold border border-neutral-300 outline-none focus:border-pos-blue cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "Semua" ? "Semua Kategori" : c}
              </option>
            ))}
          </select>

          {lowStockCount > 0 && (
            <div className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
              {lowStockCount} Menipis
            </div>
          )}
        </div>
      </div>

      {/* High-Density Inventory Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-100/75 text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 border-b border-neutral-200 sticky top-0 z-10">
              <th className="py-2.5 px-3">Produk & Barcode</th>
              <th className="py-2.5 px-2 text-center w-20">Stok</th>
              <th className="py-2.5 px-3 text-right">Modal (Rp)</th>
              <th className="py-2.5 px-3 text-right">Jual (Rp)</th>
              <th className="py-2.5 px-2 text-center w-16">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            {filteredProducts.map((p) => {
              const isLowStock = p.stock <= (p.min_stock ?? 5);

              return (
                <tr
                  key={p.id}
                  className="hover:bg-neutral-50 transition-colors group cursor-pointer"
                  onClick={() => onEditProduct(p)}
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-neutral-900 text-sm group-hover:text-pos-blue transition-colors">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-neutral-400 font-mono">
                        {p.barcode}
                      </span>
                      <span className="text-xs bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded border border-neutral-200">
                        {p.category || "Umum"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center font-mono tabular-nums">
                    <div className="font-bold text-sm text-neutral-800">
                      {p.stock}
                    </div>
                    {isLowStock ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        Min: {p.min_stock ?? 5}
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400">
                        Min: {p.min_stock ?? 5}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-neutral-500 tabular-nums">
                    {(p.cost_price ?? 0).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-sm text-neutral-900 tabular-nums">
                    {p.price.toLocaleString("id-ID")}
                  </td>
                  <td
                    className="py-3 px-2 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditProduct(p)}
                        className="text-neutral-400 hover:text-[#0F62FE] p-1 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Ubah Data Produk"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(p)}
                        className="text-neutral-300 hover:text-red-600 p-1 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Hapus Produk"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-neutral-400 text-xs"
                >
                  Tidak ada data produk ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Inventory Table Footer */}
      <div className="px-3.5 py-2 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 font-mono flex items-center justify-between">
        <span>
          Total: <strong>{products.length} Produk</strong>
        </span>
        <span>
          Filter: <strong>{filteredProducts.length} Ditampilkan</strong>
        </span>
      </div>
    </div>
  );
};
