import React, { useState, useMemo } from "react";
import { Product } from "../../types";
import { KeyBadge } from "../common/KeyBadge";

interface CatalogFastGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const CatalogFastGrid: React.FC<CatalogFastGridProps> = ({
  products,
  onAddToCart,
  searchInputRef,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const categories = [
    "Semua",
    "Alat Tulis",
    "Kertas",
    "Fotocopy & Print",
    "Jasa",
    "Aksesoris",
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category &&
          p.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        selectedCategory === "Semua" ||
        (p.category || "Umum").toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
      {/* Search Bar & Category Header */}
      <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex flex-col gap-2">
        <div className="relative flex items-center">
          <input
            ref={searchInputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Nama Produk / Barcode... (F5)"
            className="w-full pl-3 pr-16 py-2 bg-white text-neutral-900 placeholder-neutral-400 rounded-lg text-xs font-medium border border-neutral-300 outline-none focus:border-[#0F62FE] focus:ring-1 focus:ring-[#0F62FE] transition-all"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
            <KeyBadge shortcut="F5" variant="light" />
          </div>
        </div>

        {/* Category Horizontal Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-pos-light-dark text-white"
                    : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-100/75 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-600 border-b border-neutral-200 sticky top-0 z-10">
              <th className="py-2 px-3">Produk & Barcode</th>
              <th className="py-2 px-2 text-center w-16">Stok</th>
              <th className="py-2 px-3 text-right">Harga</th>
              <th className="py-2 px-2 text-center w-12">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stock <= 0;
              const isLowStock = p.stock <= (p.min_stock ?? 5);

              return (
                <tr
                  key={p.id}
                  onClick={() => {
                    if (!isOutOfStock) onAddToCart(p);
                  }}
                  className={`hover:bg-blue-50/50 transition-colors cursor-pointer group ${
                    isOutOfStock
                      ? "opacity-45 bg-neutral-50/80 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <td className="py-2 px-3">
                    <div className="font-semibold text-neutral-900 text-xs group-hover:text-[#0F62FE] transition-colors leading-snug">
                      {p.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {p.barcode}
                      </span>
                      {p.category && (
                        <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.2 rounded border border-neutral-200">
                          {p.category}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center font-mono tabular-nums">
                    <div className="font-bold text-xs text-neutral-800">
                      {p.stock}
                    </div>
                    {isOutOfStock ? (
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.2 rounded border border-red-200">
                        Habis
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                        Menipis
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-xs text-neutral-900 tabular-nums">
                    Rp {p.price.toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isOutOfStock) onAddToCart(p);
                      }}
                      className={`px-2 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                        isOutOfStock
                          ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                          : "bg-blue-50 text-[#0F62FE] hover:bg-[#0F62FE] hover:text-white border border-blue-200"
                      }`}
                    >
                      +
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-neutral-400">
                  <p className="text-xs">Tidak ada produk ditemukan</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Catalog Status Footer */}
      <div className="px-3 py-1.5 bg-neutral-50 border-t border-neutral-200 text-[11px] text-neutral-500 font-mono flex items-center justify-between">
        <span>
          Menampilkan {filteredProducts.length} dari {products.length} produk
        </span>
      </div>
    </div>
  );
};
