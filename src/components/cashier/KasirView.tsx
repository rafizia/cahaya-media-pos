import React, { useRef } from "react";
import { Product, CartItem } from "../../types";
import { CartLedger } from "./CartLedger";
import { PaymentHUD } from "./PaymentHUD";
import { CatalogFastGrid } from "./CatalogFastGrid";

interface KasirViewProps {
  cart: CartItem[];
  products: Product[];
  scanInput: string;
  payment: number | "";
  message: string;
  isProcessing: boolean;
  onScanChange: (val: string) => void;
  onScanSubmit: (e: React.KeyboardEvent | React.FormEvent) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (barcode: string, quantity: number) => void;
  onRemoveItem: (barcode: string) => void;
  onClearCart: () => void;
  onPaymentChange: (val: number | "") => void;
  onCheckout: () => void;
}

export const KasirView: React.FC<KasirViewProps> = ({
  cart,
  products,
  scanInput,
  payment,
  message,
  isProcessing,
  onScanChange,
  onScanSubmit,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPaymentChange,
  onCheckout,
}) => {
  const barcodeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="flex-1 p-4 overflow-hidden h-full flex gap-4 bg-[#F8F9FA]">
      {/* Left Column (60%): Cart Ledger Tape + Payment HUD */}
      <div className="flex-5 flex flex-col gap-3.5 h-full overflow-hidden">
        {/* Active Cart Ledger Tape */}
        <div className="flex-1 overflow-hidden">
          <CartLedger
            cart={cart}
            scanInput={scanInput}
            onScanChange={onScanChange}
            onScanSubmit={onScanSubmit}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onClearCart={onClearCart}
            barcodeInputRef={barcodeRef}
          />
        </div>

        {/* Payment HUD */}
        <div className="shrink-0">
          <PaymentHUD
            total={total}
            payment={payment}
            onPaymentChange={onPaymentChange}
            onCheckout={onCheckout}
            message={message}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Right Column (40%): Rapid Catalog Search & Filter Grid */}
      <div className="flex-4 h-full overflow-hidden">
        <CatalogFastGrid
          products={products}
          onAddToCart={onAddToCart}
          searchInputRef={searchRef}
        />
      </div>
    </div>
  );
};
