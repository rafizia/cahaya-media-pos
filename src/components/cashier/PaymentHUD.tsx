import React from "react";
import { KeyBadge } from "../common/KeyBadge";

interface PaymentHUDProps {
  total: number;
  payment: number | "";
  onPaymentChange: (val: number | "") => void;
  onCheckout: () => void;
  message?: string;
  isProcessing?: boolean;
}

export const PaymentHUD: React.FC<PaymentHUDProps> = ({
  total,
  payment,
  onPaymentChange,
  onCheckout,
  message,
  isProcessing = false,
}) => {
  const paymentNum = typeof payment === "number" ? payment : 0;
  const change = Math.max(0, paymentNum - total);
  const isPaidEnough = total > 0 && paymentNum >= total;
  const isExactPaid = total > 0 && paymentNum === total;

  const quickNominals = [
    { label: "Uang Pas", shortcut: "F6", value: total },
    { label: "50.000", shortcut: "F7", value: 50000 },
    { label: "100.000", shortcut: "F8", value: 100000 },
    { label: "200.000", shortcut: "F9", value: 200000 },
  ];

  const quickAdds = [5000, 10000, 20000, 50000];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-col gap-3 shadow-xs">
      {/* Total Amount Banner */}
      <div className="flex items-baseline justify-between px-4 py-3 bg-pos-light-dark text-white rounded-xl border border-neutral-800">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400">
            Total Belanja
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl lg:text-3xl font-extrabold font-mono tracking-tight tabular-nums text-white">
            Rp {total.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Cash Input & Change Display */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cash Tendered Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex justify-between">
            <span>Uang Diterima (Cash)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-neutral-400">
              Rp
            </span>
            <input
              type="number"
              min={0}
              value={payment}
              onChange={(e) =>
                onPaymentChange(e.target.value ? Number(e.target.value) : "")
              }
              placeholder="0"
              className="w-full pl-9 pr-3 py-2 text-right text-base font-bold font-mono bg-neutral-50 border border-neutral-300 rounded-lg outline-none focus:border-[#0F62FE] focus:bg-white transition-all tabular-nums"
            />
          </div>
        </div>

        {/* Live Change Calculation */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            <span>Kembalian</span>
          </label>
          <div
            className={`px-3 py-2 rounded-lg border text-right font-mono transition-colors flex items-center justify-end ${
              isPaidEnough
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-neutral-50 border-neutral-200 text-neutral-400"
            }`}
          >
            <span className="text-base font-extrabold tabular-nums">
              Rp {change.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Cash Presets */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-neutral-100">
        <div className="grid grid-cols-4 gap-1.5">
          {quickNominals.map((nom) => (
            <button
              key={nom.label}
              type="button"
              onClick={() => onPaymentChange(nom.value)}
              className="flex flex-col items-center justify-center py-1.5 px-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg border border-neutral-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <span className="font-mono text-[11px] leading-tight">
                {nom.label}
              </span>
              <KeyBadge
                shortcut={nom.shortcut}
                variant="light"
                className="text-[8px] scale-90 -mt-0.5"
              />
            </button>
          ))}
        </div>

        {/* Quick Add Increments */}
        <div className="flex items-center gap-1">
          {quickAdds.map((addVal) => (
            <button
              key={addVal}
              type="button"
              onClick={() => onPaymentChange(paymentNum + addVal)}
              className="flex-1 py-1 text-[11px] font-mono font-semibold bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded border border-neutral-200 transition-colors cursor-pointer"
            >
              +{addVal >= 1000 ? `${addVal / 1000}k` : addVal}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPaymentChange("")}
            className="px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors cursor-pointer"
            title="Bersihkan Input"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Feedback Message */}
      {message && (
        <div className="text-center text-xs font-bold text-red-600 py-1 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
          {message}
        </div>
      )}

      {/* Checkout Commit Button */}
      <button
        type="button"
        onClick={onCheckout}
        disabled={isProcessing || total === 0}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
          isExactPaid || isPaidEnough
            ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white"
            : "bg-[#0F62FE] hover:bg-[#0043CE] active:bg-[#002D9C] text-white"
        } ${total === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span>
          {isProcessing ? "Memproses..." : "Selesai Transaksi (Enter)"}
        </span>
        <KeyBadge shortcut="Enter ↵" variant="blue" />
      </button>
    </div>
  );
};
