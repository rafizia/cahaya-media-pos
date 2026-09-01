import React, { useState } from "react";
import { Product } from "../../types";
import { ProductForm } from "./ProductForm";
import { ProductTable } from "./ProductTable";
import { EditProductModal } from "./EditProductModal";
import { DeleteProductModal } from "./DeleteProductModal";

interface InventoryViewProps {
  products: Product[];
  onRefreshProducts: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onRefreshProducts,
}) => {
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  return (
    <div className="flex gap-4 h-full">
      {/* Kolom Kiri: Form Input Barang */}
      <ProductForm onProductAdded={onRefreshProducts} />

      {/* Kolom Kanan: List Stok */}
      <ProductTable
        products={products}
        onEditProduct={(p) => setProductToEdit(p)}
        onDeleteProduct={(p) => setProductToDelete(p)}
      />

      {/* Modal Edit Produk */}
      <EditProductModal
        product={productToEdit}
        onClose={() => setProductToEdit(null)}
        onSaveSuccess={onRefreshProducts}
      />

      {/* Modal Hapus Produk */}
      <DeleteProductModal
        product={productToDelete}
        onClose={() => setProductToDelete(null)}
        onDeleteSuccess={onRefreshProducts}
      />
    </div>
  );
};
