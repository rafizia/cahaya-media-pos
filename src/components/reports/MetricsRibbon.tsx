import React from "react";
import { AnalyticsResponse, SaleReport } from "../../types";

interface MetricsRibbonProps {
  analytics: AnalyticsResponse;
  reports: SaleReport[];
}

export const MetricsRibbon: React.FC<MetricsRibbonProps> = ({
  analytics,
  reports,
}) => {
  const filteredRevenue = reports.reduce((acc, curr) => acc + curr.total_price, 0);
  const filteredProfit = reports.reduce((acc, curr) => acc + curr.total_profit, 0);
  const filteredProfitMargin =
    filteredRevenue > 0 ? ((filteredProfit / filteredRevenue) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {/* Metric 1: Hari Ini */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
            Hari Ini
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
        </div>
        <div className="my-2">
          <span className="text-3xl font-extrabold font-mono text-neutral-900 tabular-nums">
            Rp {analytics.today_revenue.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-500">Laba Bersih:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 tabular-nums text-xs">
            +Rp {analytics.today_profit.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Metric 2: 7 Hari Terakhir */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
            7 Hari Terakhir
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#0B5D8A]"></span>
        </div>
        <div className="my-2">
          <span className="text-3xl font-extrabold font-mono text-neutral-900 tabular-nums">
            Rp {analytics.weekly_revenue.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-500">Laba Bersih:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 tabular-nums text-xs">
            +Rp {analytics.weekly_profit.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Metric 3: Total Filter Periode */}
      <div className="bg-[#0B3C5D] text-white rounded-xl border border-[#082E47] p-4.5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-200/80">
            Sesuai Filter Periode
          </span>
          <span className="text-xs font-mono text-blue-200/80 bg-[#082E47] px-2 py-0.5 rounded border border-[#0F4C75]/60">
            {reports.length} Transaksi
          </span>
        </div>
        <div className="my-2">
          <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
            Rp {filteredRevenue.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="pt-2 border-t border-[#082E47] flex items-center justify-between text-xs font-mono">
          <span className="text-blue-200/80">Laba Kotor:</span>
          <span className="font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/60 tabular-nums text-xs">
            +Rp {filteredProfit.toLocaleString("id-ID")} ({filteredProfitMargin}%)
          </span>
        </div>
      </div>
    </div>
  );
};
