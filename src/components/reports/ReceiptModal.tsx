import React from "react";
import { SaleDetailResponse } from "../../types";
import { IconX } from "../common/Icons";

interface ReceiptModalProps {
  saleDetail: SaleDetailResponse | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ saleDetail, onClose }) => {
  if (!saleDetail) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Rincian Struk</h2>
            <p className="text-xs text-gray-500 font-mono mt-0.5">#{saleDetail.sale.id}</p>
            <p className="text-xs text-gray-500 mt-0.5">{saleDetail.sale.created_at}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <IconX />
          </button>
        </div>

        {/* Itemized List */}
        <div className="flex-1 overflow-y-auto mb-4 pr-1">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="pb-2">Barang</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Harga</th>
                <th className="pb-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {saleDetail.items.map((item) => (
                <tr key={item.id} className="py-2">
                  <td className="py-2.5">
                    <div className="font-semibold text-gray-800">{item.product_name}</div>
                    <div className="text-[10px] text-gray-400">
                      {item.category} • {item.barcode}
                    </div>
                  </td>
                  <td className="py-2.5 text-center font-medium text-gray-700">{item.quantity}</td>
                  <td className="py-2.5 text-right text-gray-600 font-mono text-xs">
                    {item.price.toLocaleString("id-ID")}
                  </td>
                  <td className="py-2.5 text-right font-bold text-gray-900 font-mono text-xs">
                    {item.subtotal.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-sm flex flex-col gap-2">
          <div className="flex justify-between items-center text-gray-600 text-xs">
            <span>Metode Pembayaran</span>
            <span className="font-bold text-gray-800">{saleDetail.sale.payment_method}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-base text-gray-900 pt-1 border-t border-gray-200/60">
            <span>Total Belanja</span>
            <span>Rp {saleDetail.sale.total_price.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 text-xs">
            <span>Uang Diterima</span>
            <span>Rp {saleDetail.sale.amount_paid.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 text-xs">
            <span>Kembalian</span>
            <span>Rp {saleDetail.sale.change_amount.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center text-green-700 font-bold text-xs pt-1.5 border-t border-gray-200/60">
            <span>Keuntungan (Laba Kotor)</span>
            <span>+Rp {saleDetail.sale.total_profit.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full mt-4 p-3 bg-[#0b5d8a] text-white rounded-xl font-bold text-sm hover:bg-[#084c70] transition-colors cursor-pointer shadow-sm"
        >
          Tutup Struk
        </button>
      </div>
    </div>
  );
};
