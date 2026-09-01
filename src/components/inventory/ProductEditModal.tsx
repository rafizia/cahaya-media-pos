import React, { useState, useEffect } from "react";
import { Product } from "../../types";
import { ModalContainer } from "../common/ModalContainer";
import { KeyBadge } from "../common/KeyBadge";

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    barcode: string;
    name: string;
    category: string;
    cost_price: number;
    price: number;
    stock: number;
    min_stock: number;
  }) => Promise<void>;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Umum");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [minStock, setMinStock] = useState<number | "">(5);
  const [isSaving, setIsSaving] = useState(false);

  const categories = ["Umum", "Alat Tulis", "Kertas", "Fotocopy & Print", "Jasa", "Aksesoris"];

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category || "Umum");
      setCostPrice(product.cost_price ?? 0);
      setPrice(product.price);
      setStock(product.stock);
      setMinStock(product.min_stock ?? 5);
    }
  }, [product]);

  if (!product) return null;

  const costNum = typeof costPrice === "number" ? costPrice : 0;
  const priceNum = typeof price === "number" ? price : 0;
  const marginRp = priceNum - costNum;
  const marginPct = costNum > 0 ? ((marginRp / costNum) * 100).toFixed(1) : "0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === "" || stock === "") return;

    setIsSaving(true);
    try {
      await onSave({
        barcode: product.barcode,
        name: name.trim(),
        category: category || "Umum",
        cost_price: costNum,
        price: priceNum,
        stock: typeof stock === "number" ? stock : 0,
        min_stock: typeof minStock === "number" ? minStock : 5,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Data Produk"
      subtitle={`Barcode: ${product.barcode}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Product Name */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">Nama Produk</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold outline-none focus:border-[#0F62FE] focus:bg-white transition-all"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">Kategori</label>
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

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-100">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">Harga Modal (Rp)</label>
            <input
              type="number"
              min={0}
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-[#0F62FE] focus:bg-white transition-all tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">Harga Jual (Rp) *</label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
              required
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold text-[#0F62FE] outline-none focus:border-[#0F62FE] focus:bg-white transition-all tabular-nums"
            />
          </div>
        </div>

        {/* Margin Preview */}
        {priceNum > 0 && (
          <div className="px-3 py-1.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs flex items-center justify-between text-emerald-800 font-mono">
            <span className="font-sans text-[11px] font-medium text-emerald-700">Margin Laba:</span>
            <span className="font-bold tabular-nums">
              +Rp {marginRp.toLocaleString("id-ID")} ({marginPct}%)
            </span>
          </div>
        )}

        {/* Stock & Minimum Alert */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-100">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">Stok Saat Ini *</label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
              required
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-[#0F62FE] focus:bg-white transition-all tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 mb-1">Batas Minimum (Alert)</label>
            <input
              type="number"
              min={0}
              value={minStock}
              onChange={(e) => setMinStock(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-mono font-medium outline-none focus:border-[#0F62FE] focus:bg-white transition-all tabular-nums"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            <KeyBadge shortcut="Enter ↵" variant="dark" />
          </button>
        </div>
      </form>
    </ModalContainer>
  );
};
