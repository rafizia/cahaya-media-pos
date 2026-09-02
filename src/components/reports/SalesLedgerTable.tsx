import React from "react";
import { SaleReport } from "../../types";

interface SalesLedgerTableProps {
  reports: SaleReport[];
  filterMonth: string;
  filterYear: string;
  onMonthChange: (m: string) => void;
  onYearChange: (y: string) => void;
  onViewSaleDetail: (saleId: string) => void;
}

export const SalesLedgerTable: React.FC<SalesLedgerTableProps> = ({
  reports,
  filterMonth,
  filterYear,
  onMonthChange,
  onYearChange,
  onViewSaleDetail,
}) => {
  const months = [
    { val: "", label: "Semua Bulan" },
    { val: "01", label: "Januari" },
    { val: "02", label: "Februari" },
    { val: "03", label: "Maret" },
    { val: "04", label: "April" },
    { val: "05", label: "Mei" },
    { val: "06", label: "Juni" },
    { val: "07", label: "Juli" },
    { val: "08", label: "Agustus" },
    { val: "09", label: "September" },
    { val: "10", label: "Oktober" },
    { val: "11", label: "November" },
    { val: "12", label: "Desember" },
  ];

  const currentYear = new Date().getFullYear();
  const years = [
    { val: "", label: "Semua Tahun" },
    { val: (currentYear - 2).toString(), label: (currentYear - 2).toString() },
    { val: (currentYear - 1).toString(), label: (currentYear - 1).toString() },
    { val: currentYear.toString(), label: currentYear.toString() },
    { val: (currentYear + 1).toString(), label: (currentYear + 1).toString() },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
      {/* Table Filter Header */}
      <div className="p-3.5 bg-neutral-50 border-b border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-700">Filter Periode:</span>
          <select
            value={filterMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="px-3 py-1.5 bg-white text-neutral-800 rounded-lg text-xs font-semibold border border-neutral-300 outline-none focus:border-[#0B5D8A] cursor-pointer"
          >
            {months.map((m) => (
              <option key={m.val} value={m.val}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={filterYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="px-3 py-1.5 bg-white text-neutral-800 rounded-lg text-xs font-semibold border border-neutral-300 outline-none focus:border-[#0B5D8A] cursor-pointer"
          >
            {years.map((y) => (
              <option key={y.val} value={y.val}>
                {y.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-neutral-600">
          Ditemukan <strong className="text-neutral-900">{reports.length} Struk Penjualan</strong>
        </div>
      </div>

      {/* Sales Transactions Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-100/75 text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 border-b border-neutral-200 sticky top-0 z-10">
              <th className="py-2.5 px-3">ID Struk</th>
              <th className="py-2.5 px-3">Waktu Transaksi</th>
              <th className="py-2.5 px-2 text-center w-24">Item</th>
              <th className="py-2.5 px-3 text-right">Total Omzet</th>
              <th className="py-2.5 px-3 text-right">Laba Bersih</th>
              <th className="py-2.5 px-3 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm font-mono tabular-nums">
            {reports.map((s) => (
              <tr
                key={s.id}
                onClick={() => onViewSaleDetail(s.id)}
                className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
              >
                <td className="py-3 px-3">
                  <span className="font-bold text-neutral-800 group-hover:text-[#0B5D8A] transition-colors text-xs font-mono">
                    #{s.id.length > 8 ? `${s.id.substring(0, 8)}...` : s.id}
                  </span>
                </td>
                <td className="py-3 px-3 text-sm text-neutral-600 font-sans">
                  {s.created_at}
                </td>
                <td className="py-3 px-2 text-center">
                  <span className="text-xs bg-neutral-100 text-neutral-700 font-semibold px-2 py-0.5 rounded border border-neutral-200">
                    {s.item_count} item
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-bold text-neutral-900 text-sm">
                  Rp {s.total_price.toLocaleString("id-ID")}
                </td>
                <td className="py-3 px-3 text-right font-bold text-emerald-700 text-sm">
                  +Rp {s.total_profit.toLocaleString("id-ID")}
                </td>
                <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onViewSaleDetail(s.id)}
                    className="px-3 py-1.5 text-xs font-bold bg-neutral-100 text-neutral-700 hover:bg-[#0B5D8A] hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Rincian
                  </button>
                </td>
              </tr>
            ))}

            {reports.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-neutral-400 font-sans">
                  <p className="text-sm font-semibold text-neutral-600">Tidak ada riwayat transaksi</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Coba pilih filter bulan atau tahun yang berbeda.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
