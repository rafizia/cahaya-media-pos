import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface CartItem {
  barcode: string;
  name: string;
  price: number;
  quantity: number;
}

interface SaleReport {
  id: number;
  total_price: number;
  created_at: string;
}

interface Product {
  id: number;
  barcode: string;
  name: string;
  price: number;
  stock: number;
}

function App() {
  // Input Product State
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [message, setMessage] = useState("");

  const [mode, setMode] = useState<"kasir" | "input" | "laporan">("kasir");
  const [scanInput, setScanInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [reports, setReports] = useState<SaleReport[]>([]);
  
  // New States for Cashier page
  const [products, setProducts] = useState<Product[]>([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [payment, setPayment] = useState<number | "">("");
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<CartItem | null>(null);
  const [editQuantity, setEditQuantity] = useState<number | "">("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addStatusModal, setAddStatusModal] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [editProductName, setEditProductName] = useState("");
  const [editProductPrice, setEditProductPrice] = useState<number | "">("");
  const [editProductStock, setEditProductStock] = useState<number | "">("");
  
  const [dbProductToDelete, setDbProductToDelete] = useState<Product | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const totalHarga = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const kembalian = typeof payment === 'number' ? Math.max(0, payment - totalHarga) : 0;

  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState((currentDate.getMonth() + 1).toString().padStart(2, '0'));
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear().toString());
  const [weeklyRevenue, setWeeklyRevenue] = useState<number>(0);

  useEffect(() => {
    if (mode === "laporan") {
      fetchReports();
      fetchWeeklyRevenue();
    } else if (mode === "kasir" || mode === "input") {
      fetchAllProducts();
    }
  }, [mode, filterMonth, filterYear]);

  const fetchAllProducts = async () => {
    try {
      const data: Product[] = await invoke("get_all_products");
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReports = async () => {
    try {
      const data: SaleReport[] = await invoke("get_sales_report", { month: filterMonth, year: filterYear });
      setReports(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWeeklyRevenue = async () => {
    try {
      const data: number = await invoke("get_weekly_revenue");
      setWeeklyRevenue(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await invoke("add_product", {
        barcode,
        name,
        price: Number(price),
        stock: Number(stock),
      });

      setAddStatusModal({ type: 'success', message: `Barang ${name} berhasil disimpan ke database` });
      setBarcode("");
      setName("");
      setPrice("");
      setStock("");
      if (mode === 'input' || mode === 'kasir') {
         fetchAllProducts();
      }
    } catch (error) {
      setAddStatusModal({ type: 'error', message: String(error) });
    }
  };

  const handleScan = async (e: React.KeyboardEvent | React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    try {
      const product: Product = await invoke("get_product_by_barcode", { barcode: scanInput });
      addToCart(product);
      setScanInput("");
    } catch (error) {
      setMessage("Barang tidak terdaftar!");
      setTimeout(() => setMessage(""), 3000);
      setScanInput("");
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.barcode === product.barcode);
      if (existing) {
        return prevCart.map((item) =>
          item.barcode === product.barcode 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    /*
    if (totalHarga > 0 && (typeof payment !== 'number' || payment < totalHarga)) {
      setMessage("Uang bayar kurang!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }*/

    try {
      await invoke("process_transaction", {
        items: cart.map(item => ({
          barcode: item.barcode,
          quantity: item.quantity,
          price: item.price
        })),
        total: totalHarga
      });

      setShowSuccessModal(true);
      setCart([]); 
      setPayment("");
      fetchAllProducts(); // Refresh stock list after transaction
    } catch (error) {
      setMessage("Gagal memproses transaksi: " + error);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.barcode.includes(searchProduct));

  const confirmDelete = () => {
    if (itemToDelete) {
      setCart(cart.filter(item => item.barcode !== itemToDelete.barcode));
      setItemToDelete(null);
    }
  };

  const handleEditClick = (item: CartItem) => {
    setItemToEdit(item);
    setEditQuantity(item.quantity);
  };

  const saveEditedQuantity = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemToEdit && editQuantity !== "") {
      const q = Number(editQuantity);
      if (q > 0) {
         setCart(cart.map(item => item.barcode === itemToEdit.barcode ? { ...item, quantity: q } : item));
      } else {
         // jika kuantitas diisi 0, maka hapus dari keranjang
         setCart(cart.filter(item => item.barcode !== itemToEdit.barcode));
      }
      setItemToEdit(null);
    }
  };

  const handleEditProductClick = (p: Product) => {
    setProductToEdit(p);
    setEditProductName(p.name);
    setEditProductPrice(p.price);
    setEditProductStock(p.stock);
  };

  const saveProductEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productToEdit && editProductName !== "" && editProductPrice !== "" && editProductStock !== "") {
       try {
          await invoke("update_product", {
             barcode: productToEdit.barcode,
             name: editProductName,
             price: Number(editProductPrice),
             stock: Number(editProductStock),
          });
          setMessage(`Berhasil mengubah data produk: ${productToEdit.name}`);
          setTimeout(() => setMessage(""), 3000);
          setProductToEdit(null);
          fetchAllProducts();
       } catch (err) {
          setMessage(`Gagal update produk: ${err}`);
       }
    }
  };

  const confirmDeleteDbProduct = async () => {
    if (dbProductToDelete) {
      try {
        await invoke("delete_product", { barcode: dbProductToDelete.barcode });
        setMessage(`Barang ${dbProductToDelete.name} berhasil dihapus`);
        setTimeout(() => setMessage(""), 3000);
        setDbProductToDelete(null);
        fetchAllProducts();
      } catch (err) {
        setMessage(`Gagal menghapus produk: ${err}`);
      }
    }
  };

  // Icons as functional components to keep it clean
  const IconKasir = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
  );
  const IconStok = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
  );
  const IconLaporan = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
  );
  const IconTrash = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
  );
  const IconCheck = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
  );
  const IconX = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  );

  return (
    <div className="flex h-screen p-6 gap-4 font-sans">
      {/* SIDEBAR */}
      <div className="w-60 flex flex-col">
        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold tracking-wide">POS SYSTEM</h1>
        </div>
        <div className="bg-white text-lg rounded-2xl p-3 flex-1 flex flex-col gap-2 shadow-sm">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer font-semibold transition-all duration-200 ${mode === 'kasir' ? 'bg-[#0b5d8a] text-white' : 'text-[#1a1a1a] hover:bg-gray-100'}`} onClick={() => setMode('kasir')}>
            <IconKasir />
            <span>Kasir</span>
          </div>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer font-semibold transition-all duration-200 ${mode === 'input' ? 'bg-[#0b5d8a] text-white' : 'text-[#1a1a1a] hover:bg-gray-100'}`} onClick={() => setMode('input')}>
            <IconStok />
            <span>Stok</span>
          </div>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer font-semibold transition-all duration-200 ${mode === 'laporan' ? 'bg-[#0b5d8a] text-white' : 'text-[#1a1a1a] hover:bg-gray-100'}`} onClick={() => setMode('laporan')}>
            <IconLaporan />
            <span>Laporan</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {mode === "kasir" && (
          <div className="flex gap-4 h-full">
            {/* Kolom Tengah: Keranjang */}
            <div className="bg-white rounded-2xl p-6 flex flex-col h-full flex-5">
              <div className="mb-4">
                 <input
                    ref={inputRef}
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleScan(e);
                    }}
                    placeholder="Scan Barcode... (Tekan Enter)"
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-300 rounded-[20px] text-sm outline-none focus:border-[#0b5d8a] transition-colors shadow-inner"
                  />
              </div>

              <div className="flex-1 overflow-y-auto mb-6">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="text-lg text-[#111] font-bold px-4 py-2 text-left">Nama</th>
                      <th className="text-lg text-[#111] font-bold px-4 py-2 text-center">Jumlah</th>
                      <th className="text-lg text-[#111] font-bold px-4 py-2 text-right">Harga Satuan</th>
                      <th className="text-lg text-[#111] font-bold px-4 py-2 text-right">Harga Total</th>
                      <th className="text-lg text-[#111] font-bold px-4 py-2 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, i) => (
                      <tr key={i} className="group">
                        <td className="px-4 py-3.5 text-lg bg-[#f6f6f6] first:rounded-l-xl group-hover:bg-[#eee] transition-colors">{item.name}</td>
                        <td 
                          className="px-4 py-3.5 text-lg bg-[#f6f6f6] text-center group-hover:bg-[#eee] transition-colors cursor-pointer hover:text-[#0b5d8a] hover:underline"
                          onClick={() => handleEditClick(item)}
                          title="Klik untuk mengubah kuantitas"
                        >
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3.5 text-lg bg-[#f6f6f6] text-right group-hover:bg-[#eee] transition-colors">{(item.price).toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3.5 text-lg bg-[#f6f6f6] text-right group-hover:bg-[#eee] transition-colors">{(item.price * item.quantity).toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3.5 text-lg bg-[#f6f6f6] text-center last:rounded-r-xl group-hover:bg-[#eee] transition-colors">
                          <button onClick={() => setItemToDelete(item)} className="text-red-500 hover:text-red-700 cursor-pointer p-1 transition-colors">
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr>
                         <td colSpan={5} className="text-center text-gray-500 py-4 bg-transparent border-none">Belum ada barang di keranjang</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-white pt-4 border-t-2 border-[#f0f0f0]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="m-0 text-[28px] font-bold">Total</h2>
                  <h2 className="m-0 text-[28px] font-bold">Rp {totalHarga.toLocaleString('id-ID')}</h2>
                </div>
                <div className="text-lg flex justify-between items-center mb-3 font-medium">
                  <span>Bayar</span>
                  <div>
                    <span className="text-lg">Rp </span>
                    <input 
                      type="number" 
                      value={payment} 
                      onChange={(e) => setPayment(e.target.value ? Number(e.target.value) : "")}
                      className="w-37.5 px-3.5 py-2.5 bg-gray-100 rounded-xl text-right text-base font-semibold outline-none focus:bg-gray-200 transition-colors shadow-inner"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="text-lg flex justify-between items-center mb-3 font-medium">
                  <span>Kembalian</span>
                  <span>Rp {kembalian.toLocaleString('id-ID')}</span>
                </div>
                
                {message && <div className="text-center text-red-600 font-bold mt-2">{message}</div>}

                <button className="w-full p-4 bg-[#a3ff99] text-[#111] text-xl font-bold rounded-xl mt-2 cursor-pointer transition-transform duration-100 hover:opacity-90 active:translate-y-0.5" onClick={handleCheckout}>
                  Selesai
                </button>
              </div>
            </div>

            {/* Kolom Kanan: List Stok */}
            <div className="bg-white rounded-2xl p-6 flex flex-col h-full flex-4 shadow-sm">
              <div className="mb-4">
                <input 
                  type="text" 
                  placeholder="Cari Produk" 
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-3xl text-sm outline-none focus:border-[#0b5d8a] transition-colors shadow-inner"
                />
              </div>
              <div className="flex-1 overflow-y-auto mb-6">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="text-lg text-[#111] font-bold px-4 py-2 text-left">Nama</th>
                      <th className="text-lg text-[#111] font-bold px-4 py-2 text-center">Stok</th>
                      <th className="text-lg text-[#111] font-bold px-4 py-2 text-right">Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} onClick={() => addToCart(p)} className="cursor-pointer group active:scale-[0.99] transition-transform duration-100">
                        <td className="px-4 py-3.5 text-lg bg-[#f6f6f6] first:rounded-l-xl group-hover:bg-[#eee] transition-colors">{p.name}</td>
                        <td className="px-4 py-3.5 text-lg bg-[#f6f6f6] text-center group-hover:bg-[#eee] transition-colors">{p.stock}</td>
                        <td className="px-4 py-3.5 text-lg bg-[#f6f6f6] text-right last:rounded-r-xl group-hover:bg-[#eee] transition-colors">{(p.price).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-gray-500 py-4 bg-transparent border-none">Tidak ada produk</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {mode === "input" && (
          <div className="flex gap-4 h-full">
            {/* Kolom Kiri: Input Form */}
            <div className="bg-white rounded-2xl p-6 flex flex-col h-full flex-5 shadow-sm overflow-y-auto w-full">
              <h1 className="text-2xl font-bold text-center mb-6 mt-2">Input Barang Baru</h1>
              <form onSubmit={handleSubmit} className="w-full mx-auto flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-lg">Barcode Produk:</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan barcode di sini..."
                    required
                    autoFocus
                    className="p-3 border border-gray-300 rounded-lg text-sm focus:border-[#0b5d8a] outline-none shadow-sm"
                  />
                </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-lg">Nama Barang:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Buku Tulis AA"
                  required
                  className="p-3 border border-gray-300 rounded-lg text-sm focus:border-[#0b5d8a] outline-none shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-lg">Harga Jual (Rp):</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                  className="p-3 border border-gray-300 rounded-lg text-sm focus:border-[#0b5d8a] outline-none shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-lg">Stok Awal:</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="p-3 border border-gray-300 rounded-lg text-sm focus:border-[#0b5d8a] outline-none shadow-sm"
                />
              </div>

              <button type="submit" className="bg-[#0b5d8a] text-white p-3 rounded-lg text-base font-bold cursor-pointer hover:bg-[#084c70] transition-colors mt-4 shadow-sm w-full">Simpan ke Database</button>
            </form>
          </div>

          {/* Kolom Kanan: List Stok */}
          <div className="bg-white rounded-2xl p-6 flex flex-col h-full flex-4 shadow-sm">
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Cari Produk" 
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl text-sm outline-none focus:border-[#0b5d8a] transition-colors shadow-inner"
              />
            </div>
            <div className="flex-1 overflow-y-auto mb-6">
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="text-lg text-[#111] font-bold px-4 py-2 text-left">Nama</th>
                    <th className="text-lg text-[#111] font-bold px-4 py-2 text-center">Stok</th>
                    <th className="text-lg text-[#111] font-bold px-4 py-2 text-right">Harga</th>
                    <th className="text-lg text-[#111] font-bold px-4 py-2 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="group transition-colors duration-100">
                      <td 
                        className="px-4 py-3.5 text-lg bg-[#f6f6f6] first:rounded-l-xl transition-colors cursor-pointer hover:!text-[#0b5d8a] hover:underline"
                        onClick={() => handleEditProductClick(p)}
                        title="Klik untuk mengubah nama"
                      >
                         {p.name}
                      </td>
                      <td 
                        className="px-4 py-3.5 text-lg bg-[#f6f6f6] text-center transition-colors cursor-pointer hover:!text-[#0b5d8a] hover:underline"
                        onClick={() => handleEditProductClick(p)}
                        title="Klik untuk mengubah stok"
                      >
                         {p.stock}
                      </td>
                      <td 
                        className="px-4 py-3.5 text-lg bg-[#f6f6f6] text-right transition-colors cursor-pointer hover:!text-[#0b5d8a] hover:underline"
                        onClick={() => handleEditProductClick(p)}
                        title="Klik untuk mengubah harga"
                      >
                         {(p.price).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3.5 text-lg bg-[#f6f6f6] text-center last:rounded-r-xl transition-colors">
                        <button onClick={() => setDbProductToDelete(p)} className="text-red-500 hover:text-red-700 cursor-pointer p-1 transition-colors">
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 py-4 bg-transparent border-none">Tidak ada produk</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}

        {mode === "laporan" && (
           <div className="bg-white rounded-2xl p-6 flex-1 overflow-y-auto shadow-sm">
             <h1 className="text-2xl font-bold text-center mb-6 mt-4">Laporan Penjualan</h1>
             
             <div className="flex gap-4 max-w-[500px] mx-auto mb-6">
                <select 
                  value={filterMonth} 
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-base font-medium outline-none focus:border-[#0b5d8a] cursor-pointer shadow-sm transition-colors"
                >
                  <option value="">Semua Bulan</option>
                  <option value="01">Januari</option>
                  <option value="02">Februari</option>
                  <option value="03">Maret</option>
                  <option value="04">April</option>
                  <option value="05">Mei</option>
                  <option value="06">Juni</option>
                  <option value="07">Juli</option>
                  <option value="08">Agustus</option>
                  <option value="09">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>

                <select 
                  value={filterYear} 
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-base font-medium outline-none focus:border-[#0b5d8a] cursor-pointer shadow-sm transition-colors"
                >
                  <option value="">Semua Tahun</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
             </div>

             <div className="flex gap-4 max-w-150 mx-auto mb-6">
                 <div className="p-6 bg-[#f6f6f6] rounded-2xl flex-1 text-center shadow-sm transition-all">
                     <h3 className="text-sm font-bold mb-2 text-gray-500">Pendapatan 7 Hari Terakhir</h3>
                     <h2 className="text-3xl font-extrabold text-[#0b5d8a]">Rp {weeklyRevenue.toLocaleString('id-ID')}</h2>
                 </div>
                 <div className="p-6 bg-[#0b5d8a] text-white rounded-2xl flex-1 text-center shadow-sm transition-all">
                     <h3 className="text-sm font-bold mb-2 text-white/80">Pendapatan Sesuai Filter</h3>
                     <h2 className="text-3xl font-extrabold">Rp {reports.reduce((acc, curr) => acc + curr.total_price, 0).toLocaleString('id-ID')}</h2>
                 </div>
             </div>
 
             <table className="w-full border-collapse mt-5">
               <thead>
                 <tr>
                   <th className="p-3 border-b border-gray-200 text-left font-bold text-[13px] uppercase tracking-wider text-gray-500">ID</th>
                   <th className="p-3 border-b border-gray-200 text-left font-bold text-[13px] uppercase tracking-wider text-gray-500">Waktu</th>
                   <th className="p-3 border-b border-gray-200 text-right font-bold text-[13px] uppercase tracking-wider text-gray-500">Total Bayar</th>
                 </tr>
               </thead>
               <tbody>
                 {reports.map((s) => (
                   <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                     <td className="p-3 border-b border-gray-100 text-sm">#{s.id}</td>
                     <td className="p-3 border-b border-gray-100 text-sm">{s.created_at}</td>
                     <td className="p-3 border-b border-gray-100 text-right font-medium text-sm">Rp {(s.total_price).toLocaleString('id-ID')}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
               <IconTrash />
            </div>
            <h2 className="text-xl font-bold mb-2">Hapus Barang?</h2>
            <p className="text-center text-gray-600 mb-6">Apakah Anda yakin ingin menghapus <strong>{itemToDelete.name}</strong> dari keranjang?</p>
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

      {/* MODAL EDIT JUMLAH */}
      {itemToEdit && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Edit Jumlah</h2>
            <p className="text-center text-gray-600 mb-6 font-medium">{itemToEdit.name}</p>
            <form onSubmit={saveEditedQuantity} className="w-full flex flex-col gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah Barang</label>
                  <input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value ? Number(e.target.value) : "")}
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

      {/* MODAL TRANSAKSI BERHASIL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg flex flex-col items-center">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
               <IconCheck />
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Transaksi Berhasil!</h2>
            <button 
              className="w-full p-4 bg-[#0b5d8a] text-white rounded-xl font-bold text-lg hover:bg-[#084c70] transition-colors cursor-pointer"
              onClick={() => setShowSuccessModal(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL EDIT PRODUK DATABSE */}
      {productToEdit && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-6 text-center">Edit Data Produk</h2>
            <form onSubmit={saveProductEdits} className="w-full flex flex-col gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nama Produk Baru</label>
                  <input
                    type="text"
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-lg font-bold text-center focus:border-[#0b5d8a] outline-none"
                    autoFocus
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stok Baru</label>
                  <input
                    type="number"
                    value={editProductStock}
                    onChange={(e) => setEditProductStock(e.target.value ? Number(e.target.value) : "")}
                    className="w-full p-3 border border-gray-300 rounded-xl text-lg font-bold text-center focus:border-[#0b5d8a] outline-none"
                    autoFocus
                    min={0}
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Harga Baru (Rp)</label>
                  <input
                    type="number"
                    value={editProductPrice}
                    onChange={(e) => setEditProductPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full p-3 border border-gray-300 rounded-xl text-lg font-bold text-center focus:border-[#0b5d8a] outline-none"
                    min={0}
                  />
               </div>
               <div className="flex gap-4 w-full mt-4">
                 <button 
                   type="button"
                   className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors cursor-pointer"
                   onClick={() => setProductToEdit(null)}
                 >
                   Batal
                 </button>
                 <button 
                   type="submit"
                   className="flex-1 p-3 bg-[#0b5d8a] text-white rounded-xl font-bold hover:bg-[#084c70] transition-colors cursor-pointer"
                 >
                   Simpan Perubahan
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS PRODUK DARI DATABASE */}
      {dbProductToDelete && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
               <IconTrash />
            </div>
            <h2 className="text-xl font-bold mb-2">Hapus Produk Permanen?</h2>
            <p className="text-center text-gray-600 mb-6">Apakah Anda yakin ingin menghapus <strong>{dbProductToDelete.name}</strong> dari database?</p>
            <div className="flex gap-4 w-full">
              <button 
                className="flex-1 p-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors cursor-pointer"
                onClick={() => setDbProductToDelete(null)}
              >
                Batal
              </button>
              <button 
                className="flex-1 p-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors cursor-pointer"
                onClick={confirmDeleteDbProduct}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STATUS TAMBAH PRODUK */}
      {addStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
          <div className="bg-white rounded-2xl p-6 w-[400px] shadow-lg flex flex-col items-center">
            {addStatusModal.type === 'success' ? (
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                 <IconCheck />
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
                 <IconX />
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
              {addStatusModal.type === 'success' ? 'Berhasil Disimpan!' : 'Gagal Menyimpan!'}
            </h2>
            <p className="text-center text-gray-600 mb-8 font-medium">{addStatusModal.message}</p>
            <button 
              className={`w-full p-4 text-white rounded-xl font-bold text-lg transition-colors cursor-pointer ${addStatusModal.type === 'success' ? 'bg-[#0b5d8a] hover:bg-[#084c70]' : 'bg-red-500 hover:bg-red-600'}`}
              onClick={() => setAddStatusModal(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
