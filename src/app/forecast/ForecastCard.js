"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { apiUrl, fetchForecastPresetsFromS3 } from "@/lib/api";

const CHART_COLORS = {
  historical: "#1e40af",
  forecast: "#7c3aed",
  confidenceFill: "#c4b5fd",
  grid: "#e5e7eb",
  text: "#6b7280",
};

function Spinner({ size = 5 }) {
  return (
    <span
      className={`h-${size} w-${size} rounded-full border-2 border-[#001a8e] border-t-transparent animate-spin inline-block`}
    />
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-xl p-4"
      style={{ minWidth: 180 }}
    >
      <p className="font-semibold text-gray-800 text-sm mb-2">{label}</p>
      {payload.map((entry, i) => {
        if (entry.dataKey === "upper" || entry.dataKey === "lower") return null;
        return (
          <div
            key={i}
            className="flex items-center justify-between gap-4 text-sm py-0.5"
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-500">{entry.name}</span>
            </div>
            <span className="font-medium text-gray-900">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString("en-IN")
                : entry.value}
            </span>
          </div>
        );
      })}
      {payload.some((p) => p.dataKey === "lower") && (
        <div className="mt-1 pt-1 border-t border-gray-100 text-xs text-gray-400">
          95% confidence interval
        </div>
      )}
    </div>
  );
};

export default function ForecastCard({ refreshKey }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [granularity, setGranularity] = useState("weekly");
  const [forecastMonths, setForecastMonths] = useState(3);

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (granularity === "daily") {
        const s3Data = await fetchForecastPresetsFromS3();
        const s3Key = `all_daily_${forecastMonths}m`;
        if (s3Data && s3Data[s3Key] && s3Data[s3Key].success !== false) {
          setForecastData(s3Data[s3Key]);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(apiUrl("/forecast/demand"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: "2025-09-01",
          forecast_months: forecastMonths,
          granularity,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setForecastData(data);
    } catch (err) {
      setError(err.message || "Failed to load forecast");
    } finally {
      setLoading(false);
    }
  }, [granularity, forecastMonths]);

  const chartData = (() => {
    if (!forecastData) return [];

    const { historical = [], forecast = [] } = forecastData;
    const map = new Map();

    historical.forEach((h) => {
      map.set(h.date, {
        date: h.date,
        order_count: h.order_count,
        type: "historical",
      });
    });

    forecast.forEach((f) => {
      const existing = map.get(f.date) || { date: f.date };
      map.delete(f.date);
      map.set(f.date, {
        ...existing,
        date: f.date,
        predicted: f.predicted,
        lower: f.lower,
        upper: f.upper,
        type: existing.type === "historical" ? "both" : "forecast",
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  })();

  const lastHistoricalDate = forecastData?.historical?.at(-1)?.date;

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-5 overflow-y-auto">
      <div className="flex flex-col items-center">
        <span className="poppins font-extrabold text-3xl">
          Order Demand Forecast
        </span>
        <span className="poppins text-lg text-gray-500">
          Prophet-powered demand forecasting for seasonal footwear orders.
        </span>
      </div>

      <div className="poppins w-full relative">
        <div className="rounded-xl flex h-[75vh] min-h-[600px] p-10 pt-0">
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
              <div className="flex flex-col items-center gap-3">
                <Spinner size={12} />
                <span className="text-sm text-white font-medium poppins">
                  Generating Forecast...
                </span>
              </div>
            </div>
          )}

          {/* ── Left Sidebar ── */}
          <div className="w-1/3 z-10 p-5 text-white border-r border-white/20 h-full flex flex-col justify-between gap-4 bg-[#001a8e] rounded-l-xl overflow-y-auto">
            {/* Granularity Toggle */}
            <div>
              <span className="text-xs uppercase tracking-widest text-white/60 mb-2 block">
                Granularity
              </span>
              <div className="flex gap-2">
                {["daily", "weekly"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGranularity(g)}
                    className={`flex-1 px-4 py-2.5 rounded-lg poppins text-sm font-semibold transition-all ${
                      granularity === g
                        ? "bg-white text-[#001a8e] shadow-lg"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/30"
                    }`}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Forecast Period */}
            <div>
              <span className="text-xs uppercase tracking-widest text-white/60 mb-2 block">
                Forecast Horizon
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 6].map((m) => (
                  <button
                    key={m}
                    onClick={() => setForecastMonths(m)}
                    className={`flex-1 px-3 py-2 rounded-lg poppins text-xs font-semibold transition-all ${
                      forecastMonths === m
                        ? "bg-white text-[#001a8e] shadow-lg"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/30"
                    }`}
                  >
                    {m}M
                  </button>
                ))}
              </div>
            </div>

            {/* Model Info */}
            <div>
              <span className="text-xs uppercase tracking-widest text-white/60 mb-2 block">
                Model
              </span>
              <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm font-semibold">Prophet (Meta)</span>
                </div>
                <div className="text-xs text-white/50 space-y-1">
                  <p>Yearly seasonality: ON</p>
                  <p>Seasonality mode: Multiplicative</p>
                  <p>Confidence interval: 95%</p>
                  <p>Changepoint prior: 0.05</p>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            {forecastData?.summary && (
              <div>
                <span className="text-xs uppercase tracking-widest text-white/60 mb-2 block">
                  Summary
                </span>
                <div className="bg-white/10 border border-white/20 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Historical Orders</span>
                    <span className="font-semibold">
                      {forecastData.summary.total_historical_orders?.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Forecasted Orders</span>
                    <span className="font-semibold text-green-300">
                      {forecastData.summary.total_forecasted_orders?.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Avg/Period</span>
                    <span className="font-semibold">
                      {forecastData.summary.avg_orders_per_period}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Data Points</span>
                    <span className="font-semibold">
                      {forecastData.summary.data_points_used}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Refresh */}
            <div className="mt-auto">
              <button
                onClick={fetchForecast}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-semibold poppins transition-all disabled:opacity-40"
              >
                {loading ? "Forecasting..." : "Refresh Forecast"}
              </button>
            </div>
          </div>

          {/* ── Right Content Area ── */}
          <div className="w-full h-full bg-[#001a8e] border border-transparent flex flex-col rounded-r-xl">
            <div className="flex-1 m-3 bg-zinc-50 rounded-xl overflow-hidden flex flex-col">
              {/* Section header */}
              <div className="py-4 w-full flex flex-row items-center justify-between px-4 border-b border-gray-200">
                <span className="oswald uppercase tracking-wider text-[#001a8e] text-lg">
                  Demand Forecast
                </span>
                <div className="poppins text-sm text-gray-700">
                  <span className="font-semibold capitalize">
                    {granularity}
                  </span>
                  <span className="text-gray-400 mx-1">&middot;</span>
                  <span>
                    {forecastMonths} month{forecastMonths > 1 ? "s" : ""} ahead
                  </span>
                </div>
              </div>

              {/* Chart Area */}
              <div className="flex-1 overflow-hidden p-4">
                {error ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <svg
                      className="w-12 h-12 text-red-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                    <p className="poppins text-sm text-red-500 text-center max-w-md">
                      {error}
                    </p>
                    <button
                      onClick={fetchForecast}
                      className="mt-2 px-4 py-2 rounded-lg bg-[#001a8e] text-white text-sm font-semibold hover:bg-[#001570] transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
                    <svg
                      className="w-16 h-16 text-gray-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M22 7L14.6203 14.3347C13.6227 15.3263 13.1238 15.822 12.5051 15.822C11.8864 15.8219 11.3876 15.326 10.3902 14.3342L10.1509 14.0962C9.15254 13.1035 8.65338 12.6071 8.03422 12.6074C7.41506 12.6076 6.91626 13.1043 5.91867 14.0977L2 18M22 7V12.5458M22 7H16.4179"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="poppins text-gray-400 text-sm">
                      Configure parameters and click Refresh to generate a
                      forecast.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="confidenceGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={CHART_COLORS.confidenceFill}
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_COLORS.confidenceFill}
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                        <linearGradient
                          id="historicalGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={CHART_COLORS.historical}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_COLORS.historical}
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={CHART_COLORS.grid}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: CHART_COLORS.text }}
                        tickFormatter={(v) => {
                          const d = new Date(v);
                          return `${d.getDate()}/${d.getMonth() + 1}`;
                        }}
                        interval="preserveStartEnd"
                        minTickGap={50}
                      />
                      <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.text }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                        formatter={(value) => {
                          if (value === "order_count") return "Actual Orders";
                          if (value === "predicted") return "Forecast";
                          return value;
                        }}
                      />
                      {lastHistoricalDate && (
                        <ReferenceLine
                          x={lastHistoricalDate}
                          stroke="#9ca3af"
                          strokeDasharray="4 4"
                          label={{
                            value: "Today",
                            position: "insideTopLeft",
                            fontSize: 11,
                            fill: "#9ca3af",
                          }}
                        />
                      )}
                      {/* Confidence interval band */}
                      <Area
                        type="monotone"
                        dataKey="upper"
                        stroke="none"
                        fill="url(#confidenceGradient)"
                        name="upper"
                        legendType="none"
                      />
                      <Area
                        type="monotone"
                        dataKey="lower"
                        stroke="none"
                        fill="white"
                        name="lower"
                        legendType="none"
                      />
                      {/* Historical actuals */}
                      <Line
                        type="monotone"
                        dataKey="order_count"
                        stroke={CHART_COLORS.historical}
                        strokeWidth={2.5}
                        dot={false}
                        name="order_count"
                        connectNulls={false}
                      />
                      {/* Forecast */}
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke={CHART_COLORS.forecast}
                        strokeWidth={2.5}
                        strokeDasharray="8 4"
                        dot={false}
                        name="predicted"
                        connectNulls={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
