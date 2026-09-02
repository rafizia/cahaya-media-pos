import React, { useState } from "react";
import { Product } from "../../types";
import { IconTrash } from "../common/Icons";

interface ProductTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase())),
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
              <th className="text-base text-[#111] font-bold px-4 py-2 text-left">
                Nama & Kategori
              </th>
              <th className="text-base text-[#111] font-bold px-4 py-2 text-center">
                Stok
              </th>
              <th className="text-base text-[#111] font-bold px-4 py-2 text-right">
                Harga Jual
              </th>
              <th className="text-base text-[#111] font-bold px-4 py-2 text-center w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const isLowStock = p.stock <= (p.min_stock ?? 5);
              return (
                <tr key={p.id} className="group transition-colors duration-100">
                  <td
                    className="px-4 py-3 text-sm bg-[#f6f6f6] first:rounded-l-xl transition-colors cursor-pointer hover:text-[#0b5d8a]! hover:underline"
                    onClick={() => onEditProduct(p)}
                    title="Klik untuk mengubah data produk"
                  >
                    <div className="font-semibold text-gray-900">{p.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-medium">
                        {p.category || "Umum"}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {p.barcode}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-sm bg-[#f6f6f6] text-center transition-colors cursor-pointer hover:text-[#0b5d8a]! hover:underline"
                    onClick={() => onEditProduct(p)}
                    title="Klik untuk mengubah stok"
                  >
                    <div className="font-bold text-base">{p.stock}</div>
                    {isLowStock ? (
                      <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                        Stok Menipis
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">
                        Min: {p.min_stock ?? 5}
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 text-sm bg-[#f6f6f6] text-right transition-colors cursor-pointer hover:text-[#0b5d8a]! hover:underline"
                    onClick={() => onEditProduct(p)}
                    title="Klik untuk mengubah harga"
                  >
                    <div className="font-bold text-gray-900">
                      Rp {p.price.toLocaleString("id-ID")}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Modal: Rp {(p.cost_price ?? 0).toLocaleString("id-ID")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm bg-[#f6f6f6] text-center last:rounded-r-xl transition-colors">
                    <button
                      onClick={() => onDeleteProduct(p)}
                      className="text-red-500 hover:text-red-700 cursor-pointer p-1 transition-colors"
                      title="Hapus produk"
                    >
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-gray-500 py-4 bg-transparent border-none"
                >
                  Tidak ada produk
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
