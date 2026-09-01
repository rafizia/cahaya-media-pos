import React, { useState, useEffect } from "react";
import { SaleReport, SaleDetailResponse, AnalyticsResponse } from "../../types";
import { posApi } from "../../services/api";
import { SummaryCards } from "./SummaryCards";
import { SalesTable } from "./SalesTable";
import { ReceiptModal } from "./ReceiptModal";

export const ReportsView: React.FC = () => {
  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState((currentDate.getMonth() + 1).toString().padStart(2, "0"));
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear().toString());
  const [reports, setReports] = useState<SaleReport[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse>({
    today_revenue: 0,
    today_profit: 0,
    weekly_revenue: 0,
    weekly_profit: 0,
  });
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<SaleDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchAnalytics();
  }, [filterMonth, filterYear]);

  const fetchReports = async () => {
    try {
      const data = await posApi.getSalesReport(filterMonth, filterYear);
      setReports(data);
    } catch (error) {
      console.error("Gagal memuat laporan penjualan:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await posApi.getSalesAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Gagal memuat analitik:", error);
    }
  };

  const handleSelectSale = async (saleId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await posApi.getSaleDetails(saleId);
      setSelectedSaleDetail(detail);
    } catch (error) {
      console.error("Gagal mengambil rincian transaksi:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredRevenue = reports.reduce((acc, curr) => acc + curr.total_price, 0);
  const filteredProfit = reports.reduce((acc, curr) => acc + curr.total_profit, 0);

  return (
    <div className="bg-white rounded-2xl p-6 flex-1 overflow-y-auto shadow-sm">
      <h1 className="text-2xl font-bold text-center mb-6 mt-4">Laporan Penjualan</h1>

      {/* Filter Month & Year */}
      <div className="flex gap-4 max-w-[500px] mx-auto mb-6">
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-base font-medium outline-none focus:border-[#0b5d8a] cursor-pointer shadow-sm transition-colors"
        >
          <option value="">Semua Bulan</option>
          <option value="01">Januari</option>
          <option value="02">Februari</option>
          <option value="03">Maret</option>
          <option value="04">April</option>
          <option value="05">Mei</option>
          <option value="06">Juni</option>
          <option value="07">Juli</option>
          <option value="08">Agustus</option>
          <option value="09">September</option>
          <option value="10">Oktober</option>
          <option value="11">November</option>
          <option value="12">Desember</option>
        </select>

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-base font-medium outline-none focus:border-[#0b5d8a] cursor-pointer shadow-sm transition-colors"
        >
          <option value="">Semua Tahun</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
          <option value="2028">2028</option>
        </select>
      </div>

      {/* Summary KPI Cards */}
      <SummaryCards
        analytics={analytics}
        filteredRevenue={filteredRevenue}
        filteredProfit={filteredProfit}
      />

      {/* Interactive Sales Table */}
      <SalesTable reports={reports} onSelectSale={handleSelectSale} />

      {/* Itemized Receipt Breakdown Modal */}
      <ReceiptModal
        saleDetail={selectedSaleDetail}
        onClose={() => setSelectedSaleDetail(null)}
      />

      {/* Loading Overlay */}
      {loadingDetail && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-[70]">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3 border border-gray-100">
            <div className="w-5 h-5 border-2 border-[#0b5d8a] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-gray-700">Memuat rincian struk...</span>
          </div>
        </div>
      )}
    </div>
  );
};
