"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { apiUrl } from "@/lib/api";

const METHODS = [
  {
    key: "prophet",
    label: "Prophet",
    color: "#001FB0",
    desc: "Detects seasonality & trends in historical patterns to project future stock levels.",
  },
  {
    key: "moving_avg",
    label: "Moving Average",
    color: "#059669",
    desc: "Averages the last 3 weeks to smooth out noise and show the underlying stock trend.",
  },
  {
    key: "croston",
    label: "Croston's",
    color: "#0891b2",
    desc: "Built for intermittent demand — separates 'how much' from 'how often' to avoid fake waves.",
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-xl p-3"
      style={{ minWidth: 180 }}
    >
      <p className="font-semibold text-gray-800 text-[10px] mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 text-[10px] py-0.5"
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-500">{entry.name}</span>
          </div>
          <span className="font-medium text-gray-900">
            {typeof entry.value === "number"
              ? entry.value.toLocaleString("en-IN")
              : (entry.value ?? "—")}
          </span>
        </div>
      ))}
    </div>
  );
};

function Spinner({ size = 5 }) {
  const sizes = { 5: "h-5 w-5", 8: "h-8 w-8", 12: "h-12 w-12" };
  return (
    <span
      className={`${sizes[size] || "h-5 w-5"} rounded-full border-2 border-[#001a8e] border-t-transparent animate-spin inline-block`}
    />
  );
}

export default function InventoryForecast() {
  const [sku, setSku] = useState("ALL");
  const [skuSearch, setSkuSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastMonths, setForecastMonths] = useState(3);
  const [skuList, setSkuList] = useState([]);
  const [skuLoading, setSkuLoading] = useState(true);
  const dropdownRef = useRef(null);

  const fetchSkuList = useCallback(async () => {
    setSkuLoading(true);
    try {
      const res = await fetch(apiUrl("/inventory/sku-list"));
      if (res.ok) {
        const data = await res.json();
        setSkuList(data.skus || []);
      }
    } catch {
    } finally {
      setSkuLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkuList();
  }, [fetchSkuList]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredSkuList = useMemo(() => {
    const term = skuSearch.toLowerCase().trim();
    if (!term) return skuList;
    return skuList.filter((s) => s.toLowerCase().includes(term));
  }, [skuList, skuSearch]);

  const handleSelectSku = useCallback((s) => {
    setSku(s);
    setSkuSearch(s);
    setDropdownOpen(false);
  }, []);

  const generateForecast = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = {
        forecast_months: forecastMonths,
        methods: METHODS.map((m) => m.key),
      };
      if (sku && sku !== "ALL") body.sku = sku.trim();
      const res = await fetch(apiUrl("/inventory/forecast/compare"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const methods = result?.methods || {};
  const summary = result?.summary || {};
  const hasSummary = summary && Object.keys(summary).length > 0;

  // Build merged chart data: historical + all 3 forecasts overlaid
  const chartData = useMemo(() => {
    if (!result) return [];
    const hist = (result.historical || []).map((pt) => ({
      date: pt.date,
      actual: pt.inventory,
    }));

    // Collect all unique forecast dates
    const allDates = new Set();
    METHODS.forEach((m) => {
      (methods[m.key]?.forecast || []).forEach((pt) => allDates.add(pt.date));
    });

    // Build lookup per method
    const lookups = {};
    METHODS.forEach((m) => {
      lookups[m.key] = {};
      (methods[m.key]?.forecast || []).forEach((pt) => {
        lookups[m.key][pt.date] = pt;
      });
    });

    // Build forecast rows
    const fcRows = [...allDates].sort().map((date, i) => {
      const row = { date };
      // Bridge: connect last historical point to first forecast point
      if (i === 0 && hist.length > 0) {
        row.actual = hist[hist.length - 1].actual;
      }
      METHODS.forEach((m) => {
        const pt = lookups[m.key]?.[date];
        if (pt) {
          row[`${m.key}_predicted`] = pt.predicted;
          row[`${m.key}_lower`] = pt.lower;
          row[`${m.key}_upper`] = pt.upper;
        }
      });
      return row;
    });

    return [...hist, ...fcRows];
  }, [result, methods]);

  const stats = useMemo(() => {
    if (!hasSummary) return [];
    return [
      {
        label: "Current Stock",
        value: summary.current_inventory?.toLocaleString() || "—",
        color: "#001FB0",
        bg: "bg-blue-50",
        border: "border-blue-100",
      },
      {
        label: "Avg Outflow",
        value: summary.avg_weekly_outflow?.toLocaleString() || "—",
        color: "#dc2626",
        bg: "bg-red-50",
        border: "border-red-100",
      },
      {
        label: "Avg Inflow",
        value: summary.avg_weekly_inflow?.toLocaleString() || "—",
        color: "#16a34a",
        bg: "bg-green-50",
        border: "border-green-100",
      },
      {
        label: "Weeks Left",
        value: summary.weeks_of_stock_remaining ?? "—",
        color:
          summary.weeks_of_stock_remaining != null &&
          summary.weeks_of_stock_remaining < 4
            ? "#dc2626"
            : "#f59e0b",
        bg:
          summary.weeks_of_stock_remaining != null &&
          summary.weeks_of_stock_remaining < 4
            ? "bg-red-50"
            : "bg-amber-50",
        border:
          summary.weeks_of_stock_remaining != null &&
          summary.weeks_of_stock_remaining < 4
            ? "border-red-100"
            : "border-amber-100",
      },
    ];
  }, [summary, hasSummary]);

  return (
    <div className="w-full flex flex-col justify-center items-center overflow-hidden">
      <div className="poppins w-full relative">
        <div className="rounded-xl flex h-[75vh] min-h-[600px]">
          {/* Loading Overlay */}
          {(loading || skuLoading) && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
              <div className="flex flex-col items-center gap-3">
                <Spinner size={12} />
                <span className="text-sm text-white font-medium poppins">
                  {loading ? "Running models..." : "Loading SKUs..."}
                </span>
              </div>
            </div>
          )}

          {/* ── Left Sidebar ── */}
          <div className="w-64 shrink-0 z-10 p-3 text-white border-r border-white/20 h-full flex flex-col bg-[#001a8e] rounded-l-xl overflow-y-auto">
            {/* SKU Selector */}
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-widest text-white/50 mb-1.5 block">
                Select SKU
              </span>
              <div className="relative" ref={dropdownRef}>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs poppins focus:outline-none focus:border-white/60 transition-colors"
                  placeholder={skuLoading ? "Loading..." : "Search SKU..."}
                  value={skuSearch}
                  onChange={(e) => {
                    setSkuSearch(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  disabled={skuLoading}
                />
                {dropdownOpen && (
                  <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-48 overflow-y-auto">
                    <button
                      onMouseDown={() => handleSelectSku("ALL")}
                      className={`w-full text-left px-3 py-2 text-xs poppins hover:bg-[#001a8e]/10 transition-colors ${sku === "ALL" ? "bg-[#001a8e]/10 font-semibold text-[#001a8e]" : "text-gray-800"}`}
                    >
                      ALL (Aggregate)
                    </button>
                    {filteredSkuList.map((s) => (
                      <button
                        key={s}
                        onMouseDown={() => handleSelectSku(s)}
                        className={`w-full text-left px-3 py-2 text-xs poppins hover:bg-[#001a8e]/10 transition-colors ${sku === s ? "bg-[#001a8e]/10 font-semibold text-[#001a8e]" : "text-gray-800"}`}
                      >
                        {s}
                      </button>
                    ))}
                    {filteredSkuList.length === 0 && skuSearch.trim() && (
                      <div className="px-3 py-2 text-[10px] text-gray-400">
                        No matches
                      </div>
                    )}
                  </div>
                )}
              </div>
              {!skuLoading && (
                <p className="text-[10px] text-white/30 mt-1.5">
                  {skuList.length} SKUs
                </p>
              )}
              {error && (
                <p className="text-[10px] text-red-300 mt-1.5">{error}</p>
              )}
            </div>

            {/* Forecasting Methods — descriptions only, always all 3 */}
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-widest text-white/50 mb-2 block">
                Forecasting Models
              </span>
              <div className="flex flex-col gap-2">
                {METHODS.map((m) => (
                  <div
                    key={m.key}
                    className="bg-white/10 border border-white/15 rounded-lg px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="text-[11px] font-bold text-white poppins">
                        {m.label}
                      </span>
                    </div>
                    <p className="text-[9px] text-white/50 leading-relaxed pl-4.5">
                      {m.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1" />

            {/* Controls */}
            <div className="border-t border-white/20 pt-3 flex flex-col gap-2.5">
              <div>
                <label className="text-[10px] text-white/40 mb-1 block">
                  Forecast Horizon
                </label>
                <select
                  value={forecastMonths}
                  onChange={(e) => setForecastMonths(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-xs poppins focus:outline-none focus:border-white/60"
                >
                  <option value={1} className="text-gray-800">
                    1 month
                  </option>
                  <option value={2} className="text-gray-800">
                    2 months
                  </option>
                  <option value={3} className="text-gray-800">
                    3 months
                  </option>
                  <option value={6} className="text-gray-800">
                    6 months
                  </option>
                  <option value={12} className="text-gray-800">
                    12 months
                  </option>
                </select>
              </div>
              <button
                onClick={generateForecast}
                disabled={loading || skuLoading}
                className="bg-white text-[#001a8e] px-4 py-2.5 rounded-lg text-xs font-bold poppins hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Running..." : "Generate Forecast"}
              </button>
              {result?.timestamp && (
                <p className="text-[9px] text-white/25">
                  Updated:{" "}
                  {new Date(result.timestamp).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          </div>

          {/* ── Right Content ── */}
          <div className="flex-1 h-full bg-[#001a8e] rounded-r-xl overflow-hidden">
            <div className="h-full m-2.5 bg-zinc-50 rounded-xl overflow-hidden flex flex-col">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-2">
                  <Spinner size={8} />
                  <span className="poppins text-xs text-gray-400">
                    Running models...
                  </span>
                </div>
              ) : !result ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
                  <svg
                    className="w-14 h-14 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M3 3v18h18" />
                    <path d="M7 16l4-4 4 4 4-8" />
                  </svg>
                  <p className="poppins text-gray-400 text-xs">
                    Select a SKU and click <strong>Generate Forecast</strong>
                  </p>
                  <p className="text-[10px] text-gray-300 max-w-xs">
                    Three models will run simultaneously — their predictions are
                    overlaid on one chart for easy comparison.
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="poppins uppercase tracking-wider text-[#001a8e] text-sm font-bold">
                        {result.sku || "ALL"}
                      </span>
                      <div className="flex mx-auto items-center gap-3">
                        {METHODS.map((m) => (
                          <div key={m.key} className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: m.color }}
                            />
                            <span className="text-[9px] text-gray-500 font-medium">
                              {m.label}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: "#16a34a" }}
                          />
                          <span className="text-[9px] text-gray-500 font-medium">
                            Actual
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 poppins">
                      {result.snapshots_used} snapshots ·{" "}
                      {result.forecast_months}mo forecast
                    </span>
                  </div>

                  {/* Single Merged Chart */}
                  <div className="flex-1 min-h-0 p-3">
                    {chartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-gray-400">
                        No data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 10, right: 20, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fontFamily: "poppins" }}
                            tickFormatter={(d) => {
                              const dt = new Date(d);
                              return `${dt.getMonth() + 1}/${dt.getDate()}`;
                            }}
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                          />

                          {/* Confidence bands (Prophet only — most meaningful) */}
                          {methods.prophet && (
                            <>
                              <Line
                                type="monotone"
                                dataKey="prophet_upper"
                                stroke="#001FB015"
                                strokeWidth={1}
                                dot={false}
                                name="Prophet Range"
                                strokeDasharray="4 4"
                              />
                              <Line
                                type="monotone"
                                dataKey="prophet_lower"
                                stroke="#001FB015"
                                strokeWidth={1}
                                dot={false}
                                strokeDasharray="4 4"
                                legendType="none"
                              />
                            </>
                          )}

                          {/* Historical */}
                          <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#16a34a"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: "#16a34a", strokeWidth: 0 }}
                            name="Actual Stock"
                            connectNulls={false}
                          />

                          {/* Prophet */}
                          {methods.prophet && (
                            <Line
                              type="monotone"
                              dataKey="prophet_predicted"
                              stroke="#001FB0"
                              strokeWidth={2}
                              dot={false}
                              name="Prophet"
                              strokeDasharray=""
                            />
                          )}

                          {/* Moving Average */}
                          {methods.moving_avg && (
                            <Line
                              type="monotone"
                              dataKey="moving_avg_predicted"
                              stroke="#059669"
                              strokeWidth={2}
                              dot={false}
                              name="Moving Avg"
                              strokeDasharray="8 4"
                            />
                          )}

                          {/* Croston's */}
                          {methods.croston && (
                            <Line
                              type="monotone"
                              dataKey="croston_predicted"
                              stroke="#0891b2"
                              strokeWidth={2}
                              dot={false}
                              name="Croston's"
                              strokeDasharray="3 3"
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Summary Stats */}
                  {hasSummary && (
                    <div className="grid grid-cols-4 gap-2 px-3 pb-2.5 pt-1 shrink-0">
                      {stats.map((s, i) => (
                        <div
                          key={i}
                          className={`${s.bg} border ${s.border} rounded-lg px-2.5 py-2 flex flex-col`}
                        >
                          <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
                            {s.label}
                          </span>
                          <span
                            className="text-sm font-bold mt-0.5"
                            style={{ color: s.color }}
                          >
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
