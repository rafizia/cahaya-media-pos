import React, { useState, useEffect } from "react";
import { Product } from "../../types";
import { posApi } from "../../services/api";

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSaveSuccess: () => void;
}

const CATEGORY_OPTIONS = ["Umum", "Alat Tulis", "Kertas", "Fotocopy & Print", "Jasa", "Aksesoris"];

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  onClose,
  onSaveSuccess,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Umum");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [minStock, setMinStock] = useState<number | "">(5);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category || "Umum");
      setCostPrice(product.cost_price ?? 0);
      setPrice(product.price);
      setStock(product.stock);
      setMinStock(product.min_stock ?? 5);
      setErrorMsg("");
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === "" || stock === "") {
      setErrorMsg("Nama, harga, dan stok wajib diisi!");
      return;
    }

    try {
      await posApi.updateProduct({
        barcode: product.barcode,
        name: name.trim(),
        category: category || "Umum",
        cost_price: Number(costPrice) || 0,
        price: Number(price),
        stock: Number(stock),
        min_stock: Number(minStock) || 5,
      });
      onSaveSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(`Gagal update produk: ${err}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-center">Edit Data Produk</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nama Produk</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:border-[#0b5d8a] outline-none"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Kategori</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:border-[#0b5d8a] outline-none"
            />
            <div className="flex flex-wrap gap-1 mt-1">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                    category === cat
                      ? "bg-[#0b5d8a] text-white border-[#0b5d8a]"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Harga Modal (Rp)</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : "")}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:border-[#0b5d8a] outline-none"
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-bold text-[#0b5d8a] focus:border-[#0b5d8a] outline-none"
                required
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Stok Saat Ini</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:border-[#0b5d8a] outline-none"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Min. Stok (Alert)</label>
              <input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value ? Number(e.target.value) : "")}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:border-[#0b5d8a] outline-none"
                min={0}
              />
            </div>
          </div>

          <div className="flex gap-3 w-full mt-3">
            <button
              type="button"
              className="flex-1 p-2.5 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors cursor-pointer text-sm"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 p-2.5 bg-[#0b5d8a] text-white rounded-xl font-bold hover:bg-[#084c70] transition-colors cursor-pointer text-sm"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
