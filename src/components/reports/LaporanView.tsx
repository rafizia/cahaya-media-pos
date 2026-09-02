import React, { useState } from "react";
import { AnalyticsResponse, SaleReport, SaleDetailResponse } from "../../types";
import { MetricsRibbon } from "./MetricsRibbon";
import { SalesLedgerTable } from "./SalesLedgerTable";
import { ReceiptDetailModal } from "./ReceiptDetailModal";

interface LaporanViewProps {
  analytics: AnalyticsResponse;
  reports: SaleReport[];
  filterMonth: string;
  filterYear: string;
  onMonthChange: (m: string) => void;
  onYearChange: (y: string) => void;
  onFetchSaleDetail: (saleId: string) => Promise<SaleDetailResponse>;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  analytics,
  reports,
  filterMonth,
  filterYear,
  onMonthChange,
  onYearChange,
  onFetchSaleDetail,
}) => {
  const [selectedDetail, setSelectedDetail] = useState<SaleDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleViewDetail = async (saleId: string) => {
    setLoading(true);
    try {
      const detail = await onFetchSaleDetail(saleId);
      setSelectedDetail(detail);
    } catch (err) {
      console.error("Gagal memuat detail struk:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 overflow-hidden h-full flex flex-col gap-4 bg-[#F8F9FA]">
      {/* Financial Metrics Summary Ribbon */}
      <div className="shrink-0">
        <MetricsRibbon analytics={analytics} reports={reports} />
      </div>

      {/* Sales Transactions History Ledger */}
      <div className="flex-1 overflow-hidden">
        <SalesLedgerTable
          reports={reports}
          filterMonth={filterMonth}
          filterYear={filterYear}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
          onViewSaleDetail={handleViewDetail}
        />
      </div>

      {/* Itemized Receipt Detail Modal */}
      {selectedDetail && (
        <ReceiptDetailModal
          detail={selectedDetail}
          isOpen={Boolean(selectedDetail)}
          onClose={() => setSelectedDetail(null)}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white px-5 py-3 rounded-xl shadow-lg border border-neutral-200 flex items-center gap-2.5">
            <div className="w-4 h-4 border-2 border-[#0F62FE] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-neutral-700">Memuat Struk...</span>
          </div>
        </div>
      )}
    </div>
  );
};
