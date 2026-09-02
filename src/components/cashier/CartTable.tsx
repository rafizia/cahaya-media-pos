import React, { useState, useRef, useEffect } from "react";
import { CartItem } from "../../types";
import { IconTrash } from "../common/Icons";

interface CartTableProps {
  cart: CartItem[];
  scanInput: string;
  onScanChange: (val: string) => void;
  onScanSubmit: (e: React.KeyboardEvent | React.FormEvent) => void;
  onUpdateQuantity: (barcode: string, quantity: number) => void;
  onRemoveItem: (barcode: string) => void;
}

export const CartTable: React.FC<CartTableProps> = ({
  cart,
  scanInput,
  onScanChange,
  onScanSubmit,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const [itemToEdit, setItemToEdit] = useState<CartItem | null>(null);
  const [editQuantity, setEditQuantity] = useState<number | "">("");
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleEditClick = (item: CartItem) => {
    setItemToEdit(item);
    setEditQuantity(item.quantity);
  };

  const saveEditedQuantity = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemToEdit && editQuantity !== "") {
      const q = Number(editQuantity);
      onUpdateQuantity(itemToEdit.barcode, q);
      setItemToEdit(null);
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onRemoveItem(itemToDelete.barcode);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <div className="mb-4">
        <input
          ref={inputRef}
          type="text"
          value={scanInput}
          onChange={(e) => onScanChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onScanSubmit(e);
          }}
          placeholder="Scan Barcode... (Tekan Enter)"
          autoFocus
          className="w-full px-4 py-3 border border-gray-300 rounded-[20px] text-sm outline-none focus:border-[#0b5d8a] transition-colors shadow-inner"
        />
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-base text-[#111] font-bold px-4 py-2 text-left">
                Nama
              </th>
              <th className="text-base text-[#111] font-bold px-4 py-2 text-center">
                Jumlah
              </th>
              <th className="text-base text-[#111] font-bold px-4 py-2 text-right">
                Harga Satuan
              </th>
              <th className="text-base text-[#111] font-bold px-4 py-2 text-right">
                Harga Total
              </th>
              <th className="text-base text-[#111] font-bold px-4 py-2 text-center w-12"></th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, i) => (
              <tr key={i} className="group">
                <td className="px-4 py-3.5 text-sm bg-[#f6f6f6] first:rounded-l-xl group-hover:bg-[#eee] transition-colors">
                  {item.name}
                </td>
                <td
                  className="px-4 py-3.5 text-sm bg-[#f6f6f6] text-center group-hover:bg-[#eee] transition-colors cursor-pointer hover:text-[#0b5d8a] hover:underline"
                  onClick={() => handleEditClick(item)}
                  title="Klik untuk mengubah kuantitas"
                >
                  {item.quantity}
                </td>
                <td className="px-4 py-3.5 text-sm bg-[#f6f6f6] text-right group-hover:bg-[#eee] transition-colors">
                  {item.price.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3.5 text-sm bg-[#f6f6f6] text-right group-hover:bg-[#eee] transition-colors">
                  {(item.price * item.quantity).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3.5 text-sm bg-[#f6f6f6] text-center last:rounded-r-xl group-hover:bg-[#eee] transition-colors">
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="text-red-500 hover:text-red-700 cursor-pointer p-1 transition-colors"
                  >
                    <IconTrash />
                  </button>
                </td>
              </tr>
            ))}
            {cart.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-500 py-8 bg-transparent border-none"
                >
                  Belum ada barang di keranjang
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL KONFIRMASI HAPUS ITEM DARI KERANJANG */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-100 shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
              <IconTrash size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Hapus Barang?</h2>
            <p className="text-center text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus{" "}
              <strong>{itemToDelete.name}</strong> dari keranjang?
            </p>
            <div className="flex gap-4 w-full">
              <button
                className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors cursor-pointer"
                onClick={() => setItemToDelete(null)}
              >
                Batal
              </button>
              <button
                className="flex-1 p-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors cursor-pointer"
                onClick={confirmDelete}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT JUMLAH BARANG */}
      {itemToEdit && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-100 shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Edit Jumlah</h2>
            <p className="text-center text-gray-600 mb-6 font-medium">
              {itemToEdit.name}
            </p>
            <form
              onSubmit={saveEditedQuantity}
              className="w-full flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Jumlah Barang
                </label>
                <input
                  type="number"
                  value={editQuantity}
                  onChange={(e) =>
                    setEditQuantity(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  className="w-full p-4 border border-gray-300 rounded-xl text-lg font-bold text-center focus:border-[#0b5d8a] outline-none"
                  autoFocus
                  min={0}
                />
              </div>
              <div className="flex gap-4 w-full mt-2">
                <button
                  type="button"
                  className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors cursor-pointer"
                  onClick={() => setItemToEdit(null)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 p-3 bg-[#0b5d8a] text-white rounded-xl font-bold hover:bg-[#084c70] transition-colors cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
