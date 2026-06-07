"use client";

import { useMemo } from "react";

export default function InventoryCharts({ data }) {
  const { summary } = data;

  const pieData = useMemo(() => {
    if (!summary?.stock_health) return [];
    const h = summary.stock_health;
    return [
      { label: "Available", value: h.total_available || 0, color: "#16a34a" },
      { label: "Reserved", value: h.total_reserved || 0, color: "#2563eb" },
      { label: "Damaged", value: h.total_damaged || 0, color: "#dc2626" },
      { label: "Lost", value: h.total_lost || 0, color: "#7f1d1d" },
      { label: "Quarantine", value: h.total_quarantine || 0, color: "#a16207" },
      { label: "Repair", value: h.total_repair || 0, color: "#7c3aed" },
    ].filter((d) => d.value > 0);
  }, [summary]);

  const channelData = useMemo(() => {
    if (!summary?.channel_distribution?.channels) return [];
    return Object.entries(summary.channel_distribution.channels)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [summary]);

  const categoryData = useMemo(() => {
    if (!summary?.category_breakdown?.categories) return [];
    return summary.category_breakdown.categories.slice(0, 10);
  }, [summary]);

  const qcData = useMemo(() => {
    if (!summary?.qc_performance) return [];
    const qc = summary.qc_performance;
    return [
      { label: "Passed", value: qc.qc_passed || 0, color: "#16a34a" },
      { label: "Failed", value: qc.qc_failed || 0, color: "#dc2626" },
      { label: "Pending", value: qc.qc_pending || 0, color: "#f59e0b" },
    ].filter((d) => d.value > 0);
  }, [summary]);

  function renderBarChart(items, valueKey = "value", labelKey = "label", colorKey = "color", title) {
    const maxVal = Math.max(...items.map((d) => d[valueKey]), 1);
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-bold text-zinc-700 mb-4 poppins text-sm">{title}</h3>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-600 font-medium">{item[labelKey]}</span>
                <span className="text-zinc-400">{item[valueKey]?.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(item[valueKey] / maxVal) * 100}%`,
                    backgroundColor: item[colorKey] || "#001FB0",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderDonut(items, title) {
    const total = items.reduce((s, d) => s + d.value, 0);
    if (total === 0) return null;

    let cumulative = 0;
    const segments = items.map((item) => {
      const pct = (item.value / total) * 100;
      const start = cumulative;
      cumulative += pct;
      return { ...item, start, pct };
    });

    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="font-bold text-zinc-700 mb-4 poppins text-sm">{title}</h3>
        <div className="flex items-center gap-6">
          <div className="relative w-40 h-40 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {segments.map((seg, i) => (
                <circle
                  key={i}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="3.5"
                  strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                  strokeDashoffset={`${-seg.start}`}
                  className="transition-all duration-700"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-zinc-700">{total.toLocaleString()}</div>
                <div className="text-[10px] text-zinc-400">Total</div>
              </div>
            </div>
          </div>
          <div className="space-y-2 flex-1">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-zinc-600 flex-1">{item.label || item.name}</span>
                <span className="text-zinc-400 font-medium">{item.value?.toLocaleString()}</span>
                <span className="text-zinc-300 w-12 text-right">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderDonut(pieData, "Stock Status Distribution")}
        {renderDonut(
          qcData.map((d) => ({ ...d, label: d.label, color: d.color })),
          "QC Status Distribution"
        )}
      </div>

      {channelData.length > 0 &&
        renderBarChart(
          channelData.map((d) => ({
            label: d.name,
            value: d.value,
            color: {
              Marketplace: "#001FB0",
              Website: "#16a34a",
              "E-Commerce": "#f59e0b",
              Retail: "#7c3aed",
              IIA: "#0891b2",
              "Amazon Reserved": "#f97316",
            }[d.name] || "#6b7280",
          })),
          "value",
          "label",
          "color",
          "Channel Distribution"
        )}

      {categoryData.length > 0 &&
        renderBarChart(
          categoryData.map((d) => ({
            label: d.category || "Unknown",
            value: d.available_qty || 0,
            color: "#001FB0",
          })),
          "value",
          "label",
          "color",
          "Inventory by Category (Top 10)"
        )}

      {summary?.brand_breakdown?.brands && (
        renderBarChart(
          summary.brand_breakdown.brands.slice(0, 8).map((d) => ({
            label: d.brand || "Unknown",
            value: d.available_qty || 0,
            color: "#7c3aed",
          })),
          "value",
          "label",
          "color",
          "Inventory by Brand (Top 8)"
        )
      )}

      {summary?.location_breakdown?.locations && (
        renderBarChart(
          summary.location_breakdown.locations.map((d) => ({
            label: d.location || "Unknown",
            value: d.available_qty || 0,
            color: "#0891b2",
          })),
          "value",
          "label",
          "color",
          "Inventory by Location"
        )
      )}
    </div>
  );
}
