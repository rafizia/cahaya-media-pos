import React, { useState } from "react";
import { KeyBadge } from "../common/KeyBadge";

interface ProductEntryFormProps {
  onAddProduct: (payload: {
    barcode: string;
    name: string;
    category: string;
    cost_price: number;
    price: number;
    stock: number;
    min_stock: number;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export const ProductEntryForm: React.FC<ProductEntryFormProps> = ({
  onAddProduct,
  isSubmitting = false,
}) => {
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Umum");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [minStock, setMinStock] = useState<number | "">(5);

  const categories = [
    "Umum",
    "Alat Tulis",
    "Kertas",
    "Fotocopy & Print",
    "Jasa",
    "Aksesoris",
  ];

  const costNum = typeof costPrice === "number" ? costPrice : 0;
  const priceNum = typeof price === "number" ? price : 0;
  const marginRp = priceNum - costNum;
  const marginPct = costNum > 0 ? ((marginRp / costNum) * 100).toFixed(1) : "0";

  const handleGenerateBarcode = () => {
    // Generate an 8-digit random barcode starting with 899
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    setBarcode(`899${randomSuffix}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || !name.trim() || price === "" || stock === "") return;

    await onAddProduct({
      barcode: barcode.trim(),
      name: name.trim(),
      category: category || "Umum",
      cost_price: costNum,
      price: priceNum,
      stock: typeof stock === "number" ? stock : 0,
      min_stock: typeof minStock === "number" ? minStock : 5,
    });

    // Reset form after submit
    setBarcode("");
    setName("");
    setCategory("Umum");
    setCostPrice("");
    setPrice("");
    setStock("");
    setMinStock(5);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-col h-full overflow-y-auto shadow-xs">
      <div className="border-b border-neutral-100 pb-3 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-neutral-900">
            Input Barang Baru
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Tambah produk ke database inventaris
          </p>
        </div>
        <KeyBadge shortcut="F2" variant="light" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Barcode Input */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-neutral-700">
              Barcode / Kode Produk
            </label>
            <button
              type="button"
              onClick={handleGenerateBarcode}
              className="text-[11px] font-semibold text-[#0F62FE] hover:underline cursor-pointer"
            >
              + Acak Barcode
            </button>
          </div>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Contoh: 899123456789"
            required
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-medium outline-none focus:border-[#0F62FE] focus:bg-white transition-all"
          />
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Nama Produk
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Buku Tulis Sinar Dunia 38L"
            required
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium outline-none focus:border-[#0F62FE] focus:bg-white transition-all"
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Kategori
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-medium outline-none focus:border-[#0F62FE] focus:bg-white transition-all mb-1.5"
          />
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-[10px] px-2 py-0.5 rounded font-medium border transition-colors cursor-pointer ${
                  category === cat
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-100">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              Harga Modal (Rp)
            </label>
            <input
              type="number"
              min={0}
              value={costPrice}
              onChange={(e) =>
                setCostPrice(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="0"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-[#0F62FE] focus:bg-white transition-all tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              Harga Jual (Rp) *
            </label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="0"
              required
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold text-[#0F62FE] outline-none focus:border-[#0F62FE] focus:bg-white transition-all tabular-nums"
            />
          </div>
        </div>

        {/* Profit Margin Indicator */}
        {priceNum > 0 && (
          <div className="px-3 py-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs flex items-center justify-between text-emerald-800 font-mono">
            <span className="font-sans text-[11px] font-medium text-emerald-700">
              Estimasi Margin Laba:
            </span>
            <span className="font-bold tabular-nums">
              +Rp {marginRp.toLocaleString("id-ID")} ({marginPct}%)
            </span>
          </div>
        )}

        {/* Stock & Minimum Alert Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-100">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              Stok Awal *
            </label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) =>
                setStock(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="0"
              required
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-[#0F62FE] focus:bg-white transition-all tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
              Batas Minimum (Alert)
            </label>
            <input
              type="number"
              min={0}
              value={minStock}
              onChange={(e) =>
                setMinStock(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="5"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-medium outline-none focus:border-[#0F62FE] focus:bg-white transition-all tabular-nums"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
        >
          <span>{isSubmitting ? "Menyimpan..." : "Simpan ke Database"}</span>
          <KeyBadge shortcut="Enter ↵" variant="dark" />
        </button>
      </form>
    </div>
  );
};
