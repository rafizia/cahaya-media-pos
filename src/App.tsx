import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { Product, CartItem, SaleReport, AnalyticsResponse } from "./types";
import { posApi } from "./services/api";
import { TopNav } from "./components/layout/TopNav";
import { KasirView } from "./components/cashier/KasirView";
import { StokView } from "./components/inventory/StokView";
import { LaporanView } from "./components/reports/LaporanView";
import { ModalContainer } from "./components/common/ModalContainer";
import { IconCheck } from "./components/common/Icons";
import { PosMode, useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

function App() {
  const [mode, setMode] = useState<PosMode>("kasir");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [payment, setPayment] = useState<number | "">("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Reports state
  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState(
    (currentDate.getMonth() + 1).toString().padStart(2, "0")
  );
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear().toString());
  const [reports, setReports] = useState<SaleReport[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse>({
    today_revenue: 0,
    today_profit: 0,
    weekly_revenue: 0,
    weekly_profit: 0,
  });

  // Fetch all products from SQLite
  const fetchAllProducts = useCallback(async () => {
    try {
      const data = await posApi.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Gagal mengambil data produk:", error);
    }
  }, []);

  // Fetch sales reports
  const fetchReports = useCallback(async () => {
    try {
      const data = await posApi.getSalesReport(filterMonth, filterYear);
      setReports(data);
    } catch (error) {
      console.error("Gagal mengambil laporan penjualan:", error);
    }
  }, [filterMonth, filterYear]);

  // Fetch analytics metrics
  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await posApi.getSalesAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Gagal mengambil analytics:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  useEffect(() => {
    if (mode === "laporan") {
      fetchReports();
      fetchAnalytics();
    }
  }, [mode, fetchReports, fetchAnalytics]);

  // --- Cart Actions ---
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.barcode === product.barcode);
      if (existing) {
        return prevCart.map((item) =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
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

  const handleScanSubmit = async (e: React.KeyboardEvent | React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    try {
      const product = await posApi.getProductByBarcode(scanInput.trim());
      handleAddToCart(product);
      setScanInput("");
    } catch (error) {
      setMessage(`Barang tidak ditemukan: ${scanInput}`);
      setTimeout(() => setMessage(""), 3000);
      setScanInput("");
    }
  };

  const handleUpdateQuantity = (barcode: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(barcode);
    } else {
      setCart((prev) =>
        prev.map((item) => (item.barcode === barcode ? { ...item, quantity } : item))
      );
    }
  };

  const handleRemoveItem = (barcode: string) => {
    setCart((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  const handleClearCart = () => {
    setCart([]);
    setPayment("");
  };

  // --- Checkout Action ---
  const totalHarga = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setMessage("Keranjang belanja masih kosong!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const payAmount = typeof payment === "number" ? payment : 0;
    if (totalHarga > 0 && payAmount < totalHarga) {
      setMessage("Uang bayar masih kurang dari total belanja!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const kembalian = Math.max(0, payAmount - totalHarga);
    setIsProcessing(true);

    try {
      await posApi.processTransaction({
        items: cart.map((item) => ({
          barcode: item.barcode,
          name: item.name,
          category: item.category || "Umum",
          quantity: item.quantity,
          cost_price: item.cost_price,
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
      fetchAllProducts();
    } catch (error) {
      setMessage(`Gagal memproses transaksi: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Inventory CRUD Handlers ---
  const handleAddProduct = async (payload: {
    barcode: string;
    name: string;
    category: string;
    cost_price: number;
    price: number;
    stock: number;
    min_stock: number;
  }) => {
    await posApi.addProduct(payload);
    await fetchAllProducts();
  };

  const handleUpdateProduct = async (payload: {
    barcode: string;
    name: string;
    category: string;
    cost_price: number;
    price: number;
    stock: number;
    min_stock: number;
  }) => {
    await posApi.updateProduct(payload);
    await fetchAllProducts();
  };

  const handleDeleteProduct = async (barcode: string) => {
    await posApi.deleteProduct(barcode);
    await fetchAllProducts();
  };

  // --- Global Keyboard Shortcuts ---
  useKeyboardShortcuts(
    {
      onSwitchMode: (newMode) => setMode(newMode),
      onQuickExactCash: () => {
        if (mode === "kasir" && totalHarga > 0) {
          setPayment(totalHarga);
        }
      },
      onQuickCash50k: () => {
        if (mode === "kasir") setPayment(50000);
      },
      onQuickCash100k: () => {
        if (mode === "kasir") setPayment(100000);
      },
      onQuickCash200k: () => {
        if (mode === "kasir") setPayment(200000);
      },
      onCheckout: () => {
        if (mode === "kasir" && !showSuccessModal) {
          handleCheckout();
        }
      },
      onEscape: () => {
        if (showSuccessModal) {
          setShowSuccessModal(false);
        }
      },
    },
    showSuccessModal
  );

  return (
    <div className="flex flex-col h-screen bg-[#090A0C] font-sans antialiased overflow-hidden select-none">
      {/* 1. Industrial Top Navigation Header */}
      <TopNav activeMode={mode} onSelectMode={(m) => setMode(m)} />

      {/* 2. Main High-Performance Workspace */}
      <main className="flex-1 overflow-hidden">
        {mode === "kasir" && (
          <KasirView
            cart={cart}
            products={products}
            scanInput={scanInput}
            payment={payment}
            message={message}
            isProcessing={isProcessing}
            onScanChange={setScanInput}
            onScanSubmit={handleScanSubmit}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onPaymentChange={setPayment}
            onCheckout={handleCheckout}
          />
        )}

        {mode === "input" && (
          <StokView
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {mode === "laporan" && (
          <LaporanView
            analytics={analytics}
            reports={reports}
            filterMonth={filterMonth}
            filterYear={filterYear}
            onMonthChange={setFilterMonth}
            onYearChange={setFilterYear}
            onFetchSaleDetail={posApi.getSaleDetails}
          />
        )}
      </main>

      {/* 3. Transaction Success Modal */}
      {showSuccessModal && (
        <ModalContainer
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Transaksi Berhasil!"
          maxWidth="sm"
        >
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <IconCheck size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Pembayaran Sukses</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Data transaksi dan pengurangan stok telah tersimpan di SQLite.
              </p>
            </div>

            <button
              type="button"
              autoFocus
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Tutup & Transaksi Baru (Esc / Enter)
            </button>
          </div>
        </ModalContainer>
      )}
    </div>
  );
}

export default App;
