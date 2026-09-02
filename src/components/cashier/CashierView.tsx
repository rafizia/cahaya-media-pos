import React, { useState } from "react";
import { Product, CartItem } from "../../types";
import { posApi } from "../../services/api";
import { CartTable } from "./CartTable";
import { PaymentPanel } from "./PaymentPanel";
import { ProductCatalog } from "./ProductCatalog";
import { IconCheck } from "../common/Icons";

interface CashierViewProps {
  products: Product[];
  onTransactionSuccess: () => void;
}

export const CashierView: React.FC<CashierViewProps> = ({
  products,
  onTransactionSuccess,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<number | "">("");
  const [scanInput, setScanInput] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const totalHarga = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const kembalian =
    typeof payment === "number" ? Math.max(0, payment - totalHarga) : 0;

  const showToast = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleScan = async (e: React.KeyboardEvent | React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    try {
      const product = await posApi.getProductByBarcode(scanInput);
      handleAddToCart(product);
      setScanInput("");
    } catch {
      showToast("Barang tidak terdaftar!");
      setScanInput("");
    }
  };

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.barcode === product.barcode,
      );
      if (existing) {
        return prevCart.map((item) =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prevCart,
        {
          barcode: product.barcode,
          name: product.name,
          category: product.category || "Umum",
          cost_price: product.cost_price ?? 0,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (barcode: string, quantity: number) => {
    if (quantity > 0) {
      setCart((prev) =>
        prev.map((item) =>
          item.barcode === barcode ? { ...item, quantity } : item,
        ),
      );
    } else {
      setCart((prev) => prev.filter((item) => item.barcode !== barcode));
    }
  };

  const handleRemoveItem = (barcode: string) => {
    setCart((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast("Keranjang belanja masih kosong!");
      return;
    }

    const payAmount = typeof payment === "number" ? payment : 0;
    if (totalHarga > 0 && payAmount < totalHarga) {
      showToast("Uang bayar masih kurang dari total belanja!");
      return;
    }

    try {
      await posApi.processTransaction({
        items: cart.map((item) => ({
          barcode: item.barcode,
          name: item.name,
          category: item.category || "Umum",
          quantity: item.quantity,
          cost_price: item.cost_price || 0,
          price: item.price,
        })),
        total: totalHarga,
        amount_paid: payAmount,
        change_amount: kembalian,
        payment_method: "CASH",
      });

      setShowSuccessModal(true);
      setCart([]);
      setPayment("");
      onTransactionSuccess();
    } catch (error) {
      showToast("Gagal memproses transaksi: " + error);
    }
  };

  return (
    <div className="flex gap-4 h-full">
      {/* Kolom Kiri: Keranjang & Pembayaran */}
      <div className="bg-white rounded-2xl p-6 flex flex-col h-full flex-5 shadow-sm">
        <CartTable
          cart={cart}
          scanInput={scanInput}
          onScanChange={setScanInput}
          onScanSubmit={handleScan}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />

        <PaymentPanel
          totalHarga={totalHarga}
          payment={payment}
          kembalian={kembalian}
          message={message}
          onPaymentChange={setPayment}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Kolom Kanan: Live Product Search Catalog */}
      <ProductCatalog
        products={products}
        onAddToCart={handleAddToCart}
        onOutOfStockNotice={(name) => showToast(`Stok ${name} habis!`)}
      />

      {/* Modal Transaksi Berhasil */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-100 shadow-lg flex flex-col items-center">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
              <IconCheck size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Transaksi Berhasil!
            </h2>
            <button
              className="w-full p-4 bg-[#0b5d8a] text-white rounded-xl font-bold text-lg hover:bg-[#084c70] transition-colors cursor-pointer"
              onClick={() => setShowSuccessModal(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
