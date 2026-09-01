import React from "react";
import { SaleReport } from "../../types";

interface SalesTableProps {
  reports: SaleReport[];
  onSelectSale: (saleId: string) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({ reports, onSelectSale }) => {
  return (
    <table className="w-full border-collapse mt-5">
      <thead>
        <tr>
          <th className="p-3 border-b border-gray-200 text-left font-bold text-[12px] uppercase tracking-wider text-gray-500">
            ID Struk
          </th>
          <th className="p-3 border-b border-gray-200 text-left font-bold text-[12px] uppercase tracking-wider text-gray-500">
            Waktu
          </th>
          <th className="p-3 border-b border-gray-200 text-center font-bold text-[12px] uppercase tracking-wider text-gray-500">
            Jumlah Item
          </th>
          <th className="p-3 border-b border-gray-200 text-right font-bold text-[12px] uppercase tracking-wider text-gray-500">
            Total Omzet
          </th>
          <th className="p-3 border-b border-gray-200 text-right font-bold text-[12px] uppercase tracking-wider text-gray-500">
            Laba Kotor
          </th>
          <th className="p-3 border-b border-gray-200 text-center font-bold text-[12px] uppercase tracking-wider text-gray-500 w-28">
            Aksi
          </th>
        </tr>
      </thead>
      <tbody>
        {reports.map((s) => (
          <tr
            key={s.id}
            onClick={() => onSelectSale(s.id)}
            className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
          >
            <td className="p-3 border-b border-gray-100 text-sm font-mono font-medium text-gray-800">
              #{s.id.length > 8 ? s.id.substring(0, 8) + "..." : s.id}
            </td>
            <td className="p-3 border-b border-gray-100 text-sm text-gray-600">{s.created_at}</td>
            <td className="p-3 border-b border-gray-100 text-center text-sm font-medium text-gray-700">
              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                {s.item_count} item
              </span>
            </td>
            <td className="p-3 border-b border-gray-100 text-right font-bold text-sm text-gray-900">
              Rp {s.total_price.toLocaleString("id-ID")}
            </td>
            <td className="p-3 border-b border-gray-100 text-right font-bold text-sm text-green-700">
              +Rp {s.total_profit.toLocaleString("id-ID")}
            </td>
            <td className="p-3 border-b border-gray-100 text-center text-sm">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSale(s.id);
                }}
                className="px-2.5 py-1 text-xs bg-[#0b5d8a] text-white font-semibold rounded-lg hover:bg-[#084c70] transition-colors cursor-pointer"
              >
                Rincian
              </button>
            </td>
          </tr>
        ))}
        {reports.length === 0 && (
          <tr>
            <td colSpan={6} className="text-center py-8 text-gray-400 font-medium">
              Tidak ada transaksi pada periode ini
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
