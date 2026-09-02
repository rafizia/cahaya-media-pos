import React, { useState } from "react";
import { Product } from "../../types";
import { ProductEntryForm } from "./ProductEntryForm";
import { InventoryTable } from "./InventoryTable";
import { ProductEditModal } from "./ProductEditModal";
import { ModalContainer } from "../common/ModalContainer";
import { IconTrash } from "../common/Icons";

interface StokViewProps {
  products: Product[];
  onAddProduct: (payload: {
    barcode: string;
    name: string;
    category: string;
    cost_price: number;
    price: number;
    stock: number;
    min_stock: number;
  }) => Promise<void>;
  onUpdateProduct: (payload: {
    barcode: string;
    name: string;
    category: string;
    cost_price: number;
    price: number;
    stock: number;
    min_stock: number;
  }) => Promise<void>;
  onDeleteProduct: (barcode: string) => Promise<void>;
}

export const StokView: React.FC<StokViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await onDeleteProduct(deletingProduct.barcode);
      setDeletingProduct(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 p-4 overflow-hidden h-full flex gap-4 bg-pos-canvas">
      {/* Left Column (35%): Compact Entry Form */}
      <div className="flex-4 h-full overflow-hidden">
        <ProductEntryForm onAddProduct={onAddProduct} />
      </div>

      {/* Right Column (65%): High-Density Inventory Table */}
      <div className="flex-6 h-full overflow-hidden">
        <InventoryTable
          products={products}
          onEditProduct={(p) => setEditingProduct(p)}
          onDeleteProduct={(p) => setDeletingProduct(p)}
        />
      </div>

      {/* Product Edit Modal */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          isOpen={Boolean(editingProduct)}
          onClose={() => setEditingProduct(null)}
          onSave={onUpdateProduct}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingProduct && (
        <ModalContainer
          isOpen={Boolean(deletingProduct)}
          onClose={() => setDeletingProduct(null)}
          title="Hapus Produk dari Database?"
          maxWidth="sm"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <IconTrash size={22} />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-mono">
                #{deletingProduct.barcode}
              </p>
              <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                {deletingProduct.name}
              </h3>
              <p className="text-xs text-neutral-600 mt-2">
                Tindakan ini akan menghapus produk secara permanen dari
                database.
              </p>
            </div>

            <div className="flex gap-2.5 w-full mt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </ModalContainer>
      )}
    </div>
  );
};
