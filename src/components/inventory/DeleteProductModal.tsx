import React, { useState } from "react";
import { Product } from "../../types";
import { posApi } from "../../services/api";
import { IconTrash } from "../common/Icons";

interface DeleteProductModalProps {
  product: Product | null;
  onClose: () => void;
  onDeleteSuccess: () => void;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  product,
  onClose,
  onDeleteSuccess,
}) => {
  const [errorMsg, setErrorMsg] = useState("");

  if (!product) return null;

  const handleConfirm = async () => {
    try {
      await posApi.deleteProduct(product.barcode);
      onDeleteSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(`Gagal menghapus produk: ${err}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-100 shadow-lg flex flex-col items-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <IconTrash size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-center">
          Hapus Produk Permanen?
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus <strong>{product.name}</strong> dari
          database?
        </p>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200 mb-4 w-full text-center">
            {errorMsg}
          </div>
        )}

        <div className="flex gap-4 w-full">
          <button
            className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors cursor-pointer"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            className="flex-1 p-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors cursor-pointer"
            onClick={handleConfirm}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};
