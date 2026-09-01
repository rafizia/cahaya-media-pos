import React from "react";
import { AnalyticsResponse } from "../../types";

interface SummaryCardsProps {
  analytics: AnalyticsResponse;
  filteredRevenue: number;
  filteredProfit: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  analytics,
  filteredRevenue,
  filteredProfit,
}) => {
  return (
    <div className="flex gap-4 max-w-[850px] mx-auto mb-6">
      {/* Today */}
      <div className="p-5 bg-[#f6f6f6] rounded-2xl flex-1 text-center shadow-sm transition-all border border-gray-100 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Hari Ini</h3>
          <h2 className="text-2xl font-extrabold text-orange-600">
            Rp {analytics.today_revenue.toLocaleString("id-ID")}
          </h2>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-center gap-1.5 text-xs text-green-700 font-bold bg-green-50 py-1 px-2 rounded-lg">
          <span>Laba:</span>
          <span>Rp {analytics.today_profit.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Last 7 Days */}
      <div className="p-5 bg-[#f6f6f6] rounded-2xl flex-1 text-center shadow-sm transition-all border border-gray-100 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">7 Hari Terakhir</h3>
          <h2 className="text-2xl font-extrabold text-[#0b5d8a]">
            Rp {analytics.weekly_revenue.toLocaleString("id-ID")}
          </h2>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-center gap-1.5 text-xs text-green-700 font-bold bg-green-50 py-1 px-2 rounded-lg">
          <span>Laba:</span>
          <span>Rp {analytics.weekly_profit.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Filtered Period */}
      <div className="p-5 bg-[#0b5d8a] text-white rounded-2xl flex-1 text-center shadow-sm transition-all flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">Sesuai Filter</h3>
          <h2 className="text-2xl font-extrabold">Rp {filteredRevenue.toLocaleString("id-ID")}</h2>
        </div>
        <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-center gap-1.5 text-xs text-white font-bold bg-white/10 py-1 px-2 rounded-lg">
          <span>Laba:</span>
          <span>Rp {filteredProfit.toLocaleString("id-ID")}</span>
        </div>
      </div>
    </div>
  );
};
