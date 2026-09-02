import React from "react";

interface PaymentPanelProps {
  totalHarga: number;
  payment: number | "";
  kembalian: number;
  message: string;
  onPaymentChange: (val: number | "") => void;
  onCheckout: () => void;
}

const QUICK_NOMINALS = [10000, 20000, 50000, 100000];

export const PaymentPanel: React.FC<PaymentPanelProps> = ({
  totalHarga,
  payment,
  kembalian,
  message,
  onPaymentChange,
  onCheckout,
}) => {
  return (
    <div className="bg-white pt-4 border-t-2 border-[#f0f0f0]">
      {/* Total Belanja */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="m-0 text-2xl font-bold">Total</h2>
        <h2 className="m-0 text-2xl font-bold">
          Rp {totalHarga.toLocaleString("id-ID")}
        </h2>
      </div>

      {/* Input Bayar */}
      <div className="text-base flex justify-between items-center mb-2 font-medium">
        <span>Bayar</span>
        <div>
          <span className="text-base">Rp </span>
          <input
            type="number"
            value={payment}
            onChange={(e) =>
              onPaymentChange(e.target.value ? Number(e.target.value) : "")
            }
            className="w-37.5 px-3.5 py-2.5 bg-gray-100 rounded-xl text-right text-base font-semibold outline-none focus:bg-gray-200 transition-colors shadow-inner"
            placeholder="0"
            min={0}
          />
        </div>
      </div>

      {/* Quick Cash Buttons */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          type="button"
          onClick={() => onPaymentChange(totalHarga)}
          className="text-xs px-2.5 py-1.5 bg-blue-50 text-[#0b5d8a] font-bold rounded-lg hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
        >
          Uang Pas
        </button>
        {QUICK_NOMINALS.map((nom) => (
          <button
            key={nom}
            type="button"
            onClick={() => onPaymentChange(nom)}
            className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border border-gray-200"
          >
            {nom >= 1000 ? `Rp ${(nom / 1000).toLocaleString("id-ID")}k` : nom}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPaymentChange("")}
          className="text-xs px-2.5 py-1.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors cursor-pointer border border-red-200 ml-auto"
        >
          Reset
        </button>
      </div>

      {/* Kembalian */}
      <div className="text-base flex justify-between items-center mb-3 font-medium text-green-900">
        <span>Kembalian</span>
        <span>Rp {kembalian.toLocaleString("id-ID")}</span>
      </div>

      {/* Validation / Alert Message */}
      {message && (
        <div className="text-center text-red-600 font-bold mb-2 text-sm">
          {message}
        </div>
      )}

      {/* Selesai Button */}
      <button
        className="w-full p-4 bg-[#a3ff99] text-[#111] text-xl font-bold rounded-xl mt-1 cursor-pointer transition-transform duration-100 hover:opacity-90 active:translate-y-0.5"
        onClick={onCheckout}
      >
        Selesai
      </button>
    </div>
  );
};
