# 🌟 Cahaya POS

<div align="center">

![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8D8?style=for-the-badge&logo=tauri&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-1.80+-DEA584?style=for-the-badge&logo=rust&logoColor=black)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Bundled-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Windows_x64-0078D6?style=for-the-badge&logo=windows&logoColor=white)

**High-Performance, Keyboard-First Offline Point of Sale (POS) & Inventory System**

*Didesain untuk kecepatan transaksi, keandalan offline, dan akurasi keuangan toko retail, ATK, fotokopi, dan percetakan.*

</div>

---

## 📌 Tentang Cahaya POS

**Cahaya POS** adalah aplikasi kasir (*Point of Sale*) desktop modern yang dibangun di atas **Tauri v2** dan **Rust**, dipadukan dengan antarmuka **React 19 + Tailwind CSS**.

Berbeda dengan sistem kasir berbasis web (*cloud-only*) yang rentan terganggu oleh koneksi internet atau aplikasi berbasis Electron yang boros memori, Cahaya POS menawarkan:
- **Zero Cloud Dependency**: 100% beroperasi secara offline menggunakan embedded **SQLite**.
- **Ergonomi Keyboard Kasir**: Semua alur kerja transaksi dapat dioperasikan penuh melalui shortcut keyboard (tanpa mouse).
- **Performa Ringan**: Konsumsi RAM sangat hemat (< 80 MB) dengan ukuran binary instalasi yang ringkas.
- **Transparansi Keuangan**: Perhitungan HPP (Harga Pokok Penjualan), margin keuntungan, dan laba kotor dihitung secara otomatis dan real-time pada setiap transaksi.

---

## ✨ Fitur Utama

### 🛒 1. Kasir Cepat (Cashier HUD)
- **Integrasi Barcode Scanner**: Scan barcode instan dengan auto-focus input. Tekan `Enter` untuk langsung memasukkan barang ke keranjang belanja.
- **Katalog Cepat & Kategori**: Cari barang berdasarkan nama produk atau barcode. Dilengkapi pill filter kategori (*Semua, Alat Tulis, Kertas, Fotocopy & Print, Jasa, Aksesoris*).
- **Tombol Cepat Uang Tunai (Quick Cash Presets)**: Tombol instan untuk `Uang Pas (F6)`, `10.000`, `20.000`, `50.000 (F7)`, `100.000 (F8)`, dan `200.000 (F9)`, plus tombol penambahan nominal `+5k`, `+10k`, `+20k`, `+50k`.
- **Kalkulasi Real-Time**: Otomatis menghitung total belanja, uang diterima, dan kembalian.
- **Indikator Stok**: Visual badge saat stok habis (*Habis*) atau menipis (*Menipis*).

### 📦 2. Manajemen Stok & Inventaris (Inventory Control)
- **Input Produk Lengkap**: Barcode/SKU, nama produk, kategori, harga modal (*Cost Price/HPP*), harga jual, stok fisik, dan batas minimum stok (*Min Stock*).
- **Kalkulator Margin Otomatis**: Menampilkan estimasi keuntungan kotor per barang dalam nominal Rupiah dan persentase (%) saat menginput harga.
- **Peringatan Stok Menipis (Low Stock Badge)**: Notifikasi visual otomatis ketika stok produk mencapai atau berada di bawah batas minimum.
- **Edit & Hapus Data**: Modal pengubahan data produk yang responsif dan proteksi penghapusan aman.

### 📊 3. Laporan & Analitik Keuangan (Sales & Analytics)
- **Ringkasan KPI Real-Time**:
  - Omzet & Laba Bersih Hari Ini
  - Omzet & Laba Bersih 7 Hari Terakhir
  - Omzet & Total Laba Kotor berdasarkan periode filter terpilih
- **Filter Fleksibel**: Filter riwayat transaksi penjualan berdasarkan Bulan dan Tahun.
- **Buku Besar Penjualan (Sales Ledger)**: Tabel riwayat transaksi dengan UUID transaksi, jumlah pcs fisik terjual, total omzet, dan laba kotor.
- **Rincian Struk Pembelian (Receipt Breakdown)**: Modal rincian transaksi interaktif yang menampilkan daftar produk yang dibeli, harga satuan, subtotal, laba per item, uang diterima, dan kembalian.
- **Cetak Struk/Nota**: Dukungan cetak struk via dialog cetak sistem operasi.

---

## ⌨️ Panduan Shortcut Keyboard (Cashier Ergonomics)

Semua fungsi utama dapat diakses dengan cepat melalui tombol keyboard:

| Tombol | Aksi / Fungsi |
| :--- | :--- |
| **`F1`** | Pindah ke **Mode Kasir** & fokus otomatis ke input scan barcode |
| **`F2`** | Pindah ke **Mode Stok Barang** |
| **`F3`** | Pindah ke **Mode Laporan Penjualan** |
| **`F5`** | Fokus instan ke kotak pencarian katalog produk |
| **`F6`** | Bayar dengan **Uang Pas** (nominal persis sama dengan total belanja) |
| **`F7`** | Set uang bayar ke **Rp 50.000** |
| **`F8`** | Set uang bayar ke **Rp 100.000** |
| **`F9`** | Set uang bayar ke **Rp 200.000** |
| **`Enter ↵`** | Konfirmasi scan barcode / Selesaikan transaksi belanja / Konfirmasi simpan modal |
| **`Esc`** | Tutup modal struk, modal edit, atau modal konfirmasi |
| **`Delete`** | Hapus item terpilih dari keranjang belanja |

---

## 🏗️ Arsitektur & Teknologi

```
cahaya-pos/
├── src/                          # Frontend (React 19 + TypeScript)
│   ├── components/
│   │   ├── cashier/              # KasirView, CartLedger, PaymentHUD, CatalogFastGrid
│   │   ├── inventory/            # StokView, ProductEntryForm, InventoryTable, ProductEditModal
│   │   ├── reports/              # LaporanView, MetricsRibbon, SalesLedgerTable, ReceiptDetailModal
│   │   ├── common/               # ModalContainer, KeyBadge, Icons, Badge
│   │   └── layout/               # TopNav
│   ├── hooks/                    # useKeyboardShortcuts (useRef stabilized)
│   ├── services/                 # api.ts (Tauri IPC invoke wrapper)
│   ├── types/                    # Product, CartItem, SaleReport, Analytics
│   ├── App.tsx                   # Main state & view orchestrator
│   └── main.tsx                  # React DOM entry
│
└── src-tauri/                    # Backend (Rust + Tauri v2)
    ├── src/
    │   ├── commands/             # products.rs, sales.rs, analytics.rs
    │   ├── db/                   # mod.rs (SQLite schema & indexes), products.rs, sales.rs, analytics.rs
    │   ├── models/               # Struct definitions (serde serializable)
    │   ├── state.rs              # DbState (Thread-safe Mutex<Connection>)
    │   └── main.rs               # Application lifecycle & IPC handlers
    ├── capabilities/             # Desktop permissions schema
    ├── Cargo.toml                # Rust dependencies (rusqlite, uuid, serde, tauri)
    └── tauri.conf.json           # Tauri v2 configuration & Content Security Policy
```

### 🔒 Keamanan & Integritas Data
- **Parameterized Queries**: Seluruh query SQLite menggunakan parameter binding (`?`) untuk mencegah risiko *SQL Injection*.
- **Content Security Policy (CSP)**: Kebijakan keamanan CSP aktif membatasi eksekusi skrip dan pemuatan aset ke origin lokal aplikasi.
- **Foreign Key Constraints**: Relasi antar tabel (`sale_items -> sales`) diproteksi dengan foreign keys dan `ON DELETE CASCADE`.
- **Indeks Database**: Dilengkapi index pada `sale_items(sale_id)`, `sales(created_at)`, dan `products(name)` untuk performa query instan.

---

## 🚀 Memulai Pengembangan (Developer Setup)

### Prasyarat
1. **Node.js**: Versi 18 atau lebih baru ([Unduh Node.js](https://nodejs.org/))
2. **Rust & Cargo**: Versi stabil terbaru ([Unduh Rust](https://rustup.rs/))
3. **C++ Build Tools**: Microsoft C++ Build Tools (untuk Windows SDK)

### Langkah Instalasi
1. Clone repositori ini:
   ```powershell
   git clone https://github.com/rafizia/cahaya-pos.git
   cd cahaya-pos
   ```

2. Install dependensi Node.js:
   ```powershell
   npm install
   ```

3. Jalankan aplikasi dalam mode pengembangan (*Hot-Reload*):
   ```powershell
   npm run tauri dev
   ```

---

## 📦 Membangun File Installer Produksi (Build)

Untuk mengompilasi aplikasi menjadi file installer mandiri Windows (`.msi` dan `.exe`):

```powershell
npm run tauri build
```

Hasil installer dapat ditemukan di:
```text
src-tauri/target/release/bundle/msi/    # Windows Installer (.msi)
src-tauri/target/release/bundle/nsis/   # Windows Executable (.exe)
```

---

## 💾 Lokasi Penyimpanan Database SQLite

Database disimpan di direktori data aplikasi lokal sistem operasi Windows:
```text
%APPDATA%\com.rafi.cahaya-pos\cahaya_pos.db
(C:\Users\<Username>\AppData\Roaming\com.rafi.cahaya-pos\cahaya_pos.db)
```
> **Catatan**: Data transaksi dan stok produk Anda tetap tersimpan aman di lokasi ini meskipun aplikasi di-update atau diinstal ulang.

---

## 📄 Lisensi

Hak Cipta © 2026 **Cahaya POS**. Dikelola dan dikembangkan oleh [Rafi](https://github.com/rafizia).
