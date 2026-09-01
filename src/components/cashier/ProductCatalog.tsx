import React, { useState } from "react";
import { Product } from "../../types";

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOutOfStockNotice: (productName: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onOutOfStockNotice,
}) => {
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col h-full flex-4 shadow-sm">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari Produk (Nama, Barcode, Kategori)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-3xl text-sm outline-none focus:border-[#0b5d8a] transition-colors shadow-inner"
        />
      </div>
      <div className="flex-1 overflow-y-auto mb-6">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-base text-[#111] font-bold px-4 py-2 text-left">Nama & Kategori</th>
              <th className="text-base text-[#111] font-bold px-4 py-2 text-center">Stok</th>
              <th className="text-base text-[#111] font-bold px-4 py-2 text-right">Harga</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const isLowStock = p.stock <= (p.min_stock ?? 5);
              const isOutOfStock = p.stock <= 0;
              return (
                <tr
                  key={p.id}
                  onClick={() => {
                    if (!isOutOfStock) onAddToCart(p);
                    else onOutOfStockNotice(p.name);
                  }}
                  className={`cursor-pointer group active:scale-[0.99] transition-transform duration-100 ${
                    isOutOfStock ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-sm bg-[#f6f6f6] first:rounded-l-xl group-hover:bg-[#eee] transition-colors">
                    <div className="font-semibold text-gray-900">{p.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-medium">
                        {p.category || "Umum"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{p.barcode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm bg-[#f6f6f6] text-center group-hover:bg-[#eee] transition-colors">
                    <div className="font-bold text-sm">{p.stock}</div>
                    {isOutOfStock ? (
                      <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                        Habis
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                        Menipis
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-sm bg-[#f6f6f6] text-right last:rounded-r-xl group-hover:bg-[#eee] transition-colors font-bold text-gray-900">
                    Rp {p.price.toLocaleString("id-ID")}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-500 py-8 bg-transparent border-none">
                  Tidak ada produk ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
