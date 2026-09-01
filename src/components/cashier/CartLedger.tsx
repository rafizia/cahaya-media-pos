import React, { useRef, useEffect } from "react";
import { CartItem } from "../../types";
import { IconTrash } from "../common/Icons";
import { KeyBadge } from "../common/KeyBadge";

interface CartLedgerProps {
  cart: CartItem[];
  scanInput: string;
  onScanChange: (val: string) => void;
  onScanSubmit: (e: React.KeyboardEvent | React.FormEvent) => void;
  onUpdateQuantity: (barcode: string, quantity: number) => void;
  onRemoveItem: (barcode: string) => void;
  onClearCart?: () => void;
  barcodeInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const CartLedger: React.FC<CartLedgerProps> = ({
  cart,
  scanInput,
  onScanChange,
  onScanSubmit,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  barcodeInputRef,
}) => {
  const localRef = useRef<HTMLInputElement>(null);
  const inputRef = barcodeInputRef || localRef;

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  const totalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
      {/* Barcode Scanner Input Header */}
      <div className="p-3.5 bg-pos-light-dark border-b border-neutral-800 flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <KeyBadge shortcut="F1" variant="dark" />
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider hidden sm:inline">
            Scan
          </span>
        </div>
        <div className="relative flex-1">
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={scanInput}
            onChange={(e) => onScanChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onScanSubmit(e);
            }}
            placeholder="Scan Barcode / Ketik Kode... (Tekan Enter)"
            className="w-full pl-3 pr-20 py-2 bg-pos-blue text-white placeholder-neutral-400 rounded-lg text-sm font-mono outline-none focus:border-[#0F62FE] focus:ring-1 focus:ring-[#0F62FE] transition-all"
            autoFocus
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <KeyBadge shortcut="Enter ↵" variant="dark" />
          </span>
        </div>
        {cart.length > 0 && onClearCart && (
          <button
            onClick={onClearCart}
            className="px-2.5 py-2 text-xs font-semibold text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Kosongkan Keranjang"
          >
            Reset
          </button>
        )}
      </div>

      {/* Cart Summary Subheader */}
      <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
        <span>
          Struk Aktif:{" "}
          <strong className="text-neutral-800">
            {cart.length} Jenis Produk
          </strong>
        </span>
        <span>
          Total:{" "}
          <strong className="text-neutral-800 font-mono">
            {totalItemCount} Pcs
          </strong>
        </span>
      </div>

      {/* Monospaced Receipt Ledger Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-100/75 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-600 border-b border-neutral-200 sticky top-0 z-10">
              <th className="py-2 px-3 w-10 text-center">No</th>
              <th className="py-2 px-3">Nama Produk</th>
              <th className="py-2 px-3 text-center w-28">Qty</th>
              <th className="py-2 px-3 text-right">Harga</th>
              <th className="py-2 px-3 text-right">Total</th>
              <th className="py-2 px-2 text-center w-9"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm font-mono tabular-nums">
            {cart.map((item, idx) => {
              const subtotal = item.price * item.quantity;
              return (
                <tr
                  key={item.barcode}
                  className="hover:bg-neutral-50 transition-colors group"
                >
                  <td className="py-2.5 px-3 text-center text-xs text-neutral-400">
                    {(idx + 1).toString().padStart(2, "0")}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-semibold text-neutral-900 text-[13px] leading-tight">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      {item.category && `${item.category} • `}
                      {item.barcode}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center border border-neutral-200 rounded-lg bg-neutral-50 p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(
                            item.barcode,
                            Math.max(0, item.quantity - 1),
                          )
                        }
                        className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 rounded font-bold text-xs cursor-pointer transition-colors"
                        title="Kurangi 1"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 0) {
                            onUpdateQuantity(item.barcode, val);
                          }
                        }}
                        className="w-8 text-center text-xs font-bold text-neutral-800 bg-transparent outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item.barcode, item.quantity + 1)
                        }
                        className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 rounded font-bold text-xs cursor-pointer transition-colors"
                        title="Tambah 1"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-neutral-600 text-xs">
                    {item.price.toLocaleString("id-ID")}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-neutral-900 text-xs">
                    {subtotal.toLocaleString("id-ID")}
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.barcode)}
                      className="text-neutral-300 hover:text-red-600 p-1 rounded transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Hapus dari keranjang (Del)"
                    >
                      <IconTrash size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {cart.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-16 text-center text-neutral-400 font-sans"
                >
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 mb-3">
                      <span className="text-xl font-mono font-bold">↵</span>
                    </div>
                    <p className="font-semibold text-neutral-700 text-sm">
                      Keranjang Belanja Kosong
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Scan barcode di atas atau klik produk dari katalog sebelah
                      kanan.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
