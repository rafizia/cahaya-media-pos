import React, { useState } from "react";
import { posApi } from "../../services/api";
import { IconCheck, IconX } from "../common/Icons";

interface ProductFormProps {
  onProductAdded: () => void;
}

const CATEGORY_OPTIONS = [
  "Umum",
  "Alat Tulis",
  "Kertas",
  "Fotocopy & Print",
  "Jasa",
  "Aksesoris",
];

export const ProductForm: React.FC<ProductFormProps> = ({ onProductAdded }) => {
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Umum");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [minStock, setMinStock] = useState<number | "">(5);
  const [statusModal, setStatusModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await posApi.addProduct({
        barcode,
        name,
        category: category || "Umum",
        cost_price: Number(costPrice) || 0,
        price: Number(price),
        stock: Number(stock) || 0,
        min_stock: Number(minStock) || 5,
      });

      setStatusModal({
        type: "success",
        message: `${name} berhasil ditambahkan`,
      });
      setBarcode("");
      setName("");
      setCategory("Umum");
      setCostPrice("");
      setPrice("");
      setStock("");
      setMinStock(5);
      onProductAdded();
    } catch (error) {
      setStatusModal({ type: "error", message: String(error) });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col h-full flex-5 shadow-sm overflow-y-auto w-full">
      <h1 className="text-2xl font-bold text-center mb-6 mt-2">
        Input Barang Baru
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto flex flex-col gap-4"
      >
        {/* Barcode */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-base">Barcode Produk:</label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan barcode di sini..."
            autoFocus
            required
            className="p-3 border border-gray-300 rounded-lg text-base focus:border-[#0b5d8a] outline-none shadow-sm"
          />
        </div>

        {/* Nama Produk */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-base">Nama Produk:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Kertas A4 Sinar Dunia"
            required
            className="p-3 border border-gray-300 rounded-lg text-base focus:border-[#0b5d8a] outline-none shadow-sm"
          />
        </div>

        {/* Kategori */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-base">Kategori Produk:</label>
          <div className="flex flex-wrap gap-1.5 mb-1">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  category === cat
                    ? "bg-[#0b5d8a] text-white border-[#0b5d8a] font-bold"
                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Kategori (misal: Alat Tulis)"
            className="p-3 border border-gray-300 rounded-lg text-sm focus:border-[#0b5d8a] outline-none shadow-sm"
          />
        </div>

        {/* Harga Modal & Jual */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-base">
              Harga Modal (Beli):
            </label>
            <input
              type="number"
              value={costPrice}
              onChange={(e) =>
                setCostPrice(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="Rp 0"
              min={0}
              className="p-3 border border-gray-300 rounded-lg text-base focus:border-[#0b5d8a] outline-none shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-base">Harga Jual:</label>
            <input
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="Rp 0"
              required
              min={0}
              className="p-3 border border-gray-300 rounded-lg text-base focus:border-[#0b5d8a] outline-none shadow-sm font-bold text-[#0b5d8a]"
            />
          </div>
        </div>

        {/* Stok & Min Stok */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-base">Stok Awal:</label>
            <input
              type="number"
              value={stock}
              onChange={(e) =>
                setStock(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="0"
              required
              min={0}
              className="p-3 border border-gray-300 rounded-lg text-base focus:border-[#0b5d8a] outline-none shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-base">
              Min. Stok (Alert):
            </label>
            <input
              type="number"
              value={minStock}
              onChange={(e) =>
                setMinStock(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="5"
              min={0}
              className="p-3 border border-gray-300 rounded-lg text-sm focus:border-[#0b5d8a] outline-none shadow-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-[#0b5d8a] text-white p-3.5 rounded-lg text-base font-bold cursor-pointer hover:bg-[#084c70] transition-colors mt-2 shadow-sm w-full"
        >
          Simpan ke Database
        </button>
      </form>

      {/* MODAL STATUS TAMBAH PRODUK */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg flex flex-col items-center">
            {statusModal.type === "success" ? (
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                <IconCheck />
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
                <IconX />
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
              {statusModal.type === "success"
                ? "Berhasil Disimpan!"
                : "Gagal Menyimpan!"}
            </h2>
            <p className="text-center text-gray-600 mb-8 font-medium">
              {statusModal.message}
            </p>
            <button
              className={`w-full p-4 text-white rounded-xl font-bold text-lg transition-colors cursor-pointer ${
                statusModal.type === "success"
                  ? "bg-[#0b5d8a] hover:bg-[#084c70]"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={() => setStatusModal(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
