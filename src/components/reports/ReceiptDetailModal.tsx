import React from "react";
import { SaleDetailResponse } from "../../types";
import { ModalContainer } from "../common/ModalContainer";

interface ReceiptDetailModalProps {
  detail: SaleDetailResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  detail,
  isOpen,
  onClose,
}) => {
  if (!detail) return null;

  const { sale, items } = detail;

  const handlePrint = () => {
    window.print();
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="Rincian Struk Penjualan"
      subtitle={`ID: #${sale.id}`}
      maxWidth="md"
    >
      <div className="flex flex-col gap-4 font-mono">
        {/* Receipt Header Info */}
        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs flex flex-col gap-1 text-neutral-600">
          <div className="flex justify-between">
            <span className="font-sans font-medium">Waktu Transaksi:</span>
            <span className="font-bold text-neutral-800">{sale.created_at}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-sans font-medium">Metode Pembayaran:</span>
            <span className="font-bold text-neutral-800">{sale.payment_method}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-sans font-medium">Jumlah Item:</span>
            <span className="font-bold text-neutral-800">{sale.item_count} pcs</span>
          </div>
        </div>

        {/* Itemized Line Items Table */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100/80 text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-200">
                <th className="py-2 px-2.5">Barang</th>
                <th className="py-2 px-2 text-center w-12">Qty</th>
                <th className="py-2 px-2 text-right">Harga</th>
                <th className="py-2 px-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 tabular-nums">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50">
                  <td className="py-2 px-2.5">
                    <div className="font-sans font-semibold text-neutral-800 leading-tight">
                      {item.product_name}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      {item.category && `${item.category} • `}{item.barcode}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-neutral-700">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-2 text-right text-neutral-500">
                    {(item.price).toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-2.5 text-right font-bold text-neutral-900">
                    {(item.subtotal).toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown Summary */}
        <div className="p-3.5 bg-neutral-900 text-white rounded-xl border border-neutral-800 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-baseline pt-0.5">
            <span className="font-sans text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
              Total Belanja:
            </span>
            <span className="text-lg font-extrabold text-white tabular-nums">
              Rp {sale.total_price.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex justify-between text-neutral-400 pt-1 border-t border-neutral-800">
            <span>Uang Diterima:</span>
            <span className="text-neutral-200 tabular-nums">Rp {sale.amount_paid.toLocaleString("id-ID")}</span>
          </div>

          <div className="flex justify-between text-neutral-400">
            <span>Kembalian:</span>
            <span className="text-neutral-200 tabular-nums">Rp {sale.change_amount.toLocaleString("id-ID")}</span>
          </div>

          <div className="flex justify-between text-emerald-400 pt-1.5 border-t border-neutral-800 font-bold">
            <span>Keuntungan (Laba Kotor):</span>
            <span className="tabular-nums">+Rp {sale.total_profit.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Actions: Print and Close */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span>Cetak Struk</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup (Esc)
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};
