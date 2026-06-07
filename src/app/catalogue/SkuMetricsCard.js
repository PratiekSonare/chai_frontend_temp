"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  startTransition,
} from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatMetricValue } from "../orders/utils/formatMetricValue";
import { SemiCircle } from "../components/SemiCircle";

const S3_BASE = "https://chupps-data-portal.s3.amazonaws.com";
const SKU_PREFIX = "sku-metrics/";

const CHART_COLORS = [
  "#1e40af",
  "#4f46e5",
  "#059669",
  "#7c3aed",
  "#dc2626",
  "#ea580c",
  "#0891b2",
  "#065f46",
];

const SECTIONS = [
  { key: "overview", label: "Overview", subtitle: "Cumulative KPIs" },
  { key: "marketplace", label: "By Marketplace", subtitle: "Channel metrics" },
  { key: "pricing", label: "Pricing & Margins", subtitle: "Price history" },
  { key: "geographic", label: "Geographic", subtitle: "State breakdown" },
  { key: "size", label: "Size Breakdown", subtitle: "Size mix" },
  { key: "daily", label: "Daily Trends", subtitle: "Revenue & units" },
  { key: "fulfillment", label: "Fulfillment", subtitle: "Courier & warehouse" },
];

const OVERVIEW_FIELDS = [
  { key: "total_revenue", label: "Total Revenue", currency: true },
  { key: "total_units_sold", label: "Units Sold" },
  { key: "total_orders", label: "Total Orders" },
  { key: "avg_order_value", label: "Avg Order Value", currency: true },
  { key: "total_cogs", label: "Total COGS", currency: true },
  { key: "gross_margin_pct", label: "Gross Margin", percent: true },
  { key: "cancellation_rate", label: "Cancellation Rate", percent: true },
  { key: "return_rate", label: "Return Rate", percent: true },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-xl p-5"
      style={{ minWidth: 200 }}
    >
      <p className="font-semibold text-gray-800 text-sm mb-2">{label}</p>
      {payload.map((entry, i) => (
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
      ))}
    </div>
  );
};

const SPINNER_SIZES = {
  5: "h-5 w-5",
  8: "h-8 w-8",
  12: "h-12 w-12",
};

function Spinner({ size = 5 }) {
  return (
    <span
      className={`${SPINNER_SIZES[size] || "h-5 w-5"} rounded-full border-2 border-[#001a8e] border-t-transparent animate-spin inline-block`}
    />
  );
}

function EmptyState({ message }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <span className="text-sm text-gray-500">{message}</span>
    </div>
  );
}

// ── Section renderers ──────────────────────────────────────────────────────

function OverviewSection({ cumulative }) {
  if (!cumulative) return <EmptyState message="No cumulative data" />;
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 p-5 overflow-y-auto h-full">
      {OVERVIEW_FIELDS.map(({ key, label, currency, percent }) => {
        const val = cumulative[key];
        const isNegative = val < 0;
        const bgColor = isNegative ? "bg-red-50" : "bg-zinc-50";
        const borderColor = isNegative ? "border-red-200" : "border-gray-200";
        const textColor = isNegative ? "text-red-700" : "text-[#001a8e]";
        return (
          <div
            key={key}
            className={`hover:border-[#001a8e]/30 metric-sdw ${bgColor} border ${borderColor} rounded-xl p-5 flex flex-col gap-2`}
          >
            <span className="oswald uppercase tracking-wider text-gray-600 text-sm">
              {label}
            </span>
            {percent ? (
              <div className="flex flex-col items-start">
                <span className={`text-2xl font-bold ${textColor}`}>
                  {formatMetricValue(val, { percent: true })}
                </span>
              </div>
            ) : (
              <span className={`text-2xl font-bold ${textColor}`}>
                {formatMetricValue(val, { currency })}
              </span>
            )}

            {percent ? (
              <div className="w-full h-full flex items-center justify-center">
                <SemiCircle pct={val ?? 0} />
              </div>
            ) : (
              <></>
            )}
          </div>
        );
      })}

      {/* Order status breakdown */}
      {cumulative.order_status_breakdown && (
        <div className="metric-sdw col-span-2 bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#001a8e]/30 transition-all">
          <span className="oswald uppercase tracking-wider text-[#001a8e] text-sm block mb-3 font-bold">
            Order Status Breakdown
          </span>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
            {Object.entries(cumulative.order_status_breakdown).map(
              ([status, count]) => {
                const isNegative = count < 0;
                return (
                  <div
                    key={status}
                    className={`${isNegative ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"} rounded-lg p-3 border transition-all`}
                  >
                    <div className="text-gray-600 text-xs uppercase tracking-wide font-semibold mb-1">
                      {status}
                    </div>
                    <div
                      className={`text-xl font-bold ${isNegative ? "text-red-700" : "text-[#001a8e]"}`}
                    >
                      {count}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Payment split */}
      {cumulative.payment_split && (
        <div className="metric-sdw col-span-2 bg-gradient-to-br from-zinc-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#001a8e]/30 transition-all">
          <span className="oswald uppercase tracking-wider text-[#001a8e] text-sm block mb-3 font-bold">
            Payment Split
          </span>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
            {Object.entries(cumulative.payment_split).map(([mode, data]) => {
              const isNegativeRevenue = data.revenue < 0;
              return (
                <div
                  key={mode}
                  className={`${isNegativeRevenue ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"} rounded-lg p-3 border transition-all`}
                >
                  <div className="text-gray-600 text-xs uppercase tracking-wide font-semibold mb-2 capitalize">
                    {mode}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Orders</span>
                      <span
                        className={`font-bold text-sm ${isNegativeRevenue ? "text-red-700" : "text-gray-900"}`}
                      >
                        {data.orders}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-xs">Revenue</span>
                      <span
                        className={`font-bold text-sm ${isNegativeRevenue ? "text-red-700" : "text-amber-700"}`}
                      >
                        {formatMetricValue(data.revenue, { currency: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MarketplaceSection({ byMarketplace }) {
  if (!byMarketplace || !Object.keys(byMarketplace).length)
    return <EmptyState message="No marketplace data" />;

  const chartData = Object.entries(byMarketplace).map(([mp, d]) => ({
    marketplace: mp,
    revenue: d.revenue,
    units_sold: d.units_sold,
    orders: d.order_count,
    gross_margin_pct: d.gross_margin_pct,
  }));

  return (
    <div className="p-5 h-full overflow-y-auto flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData.map((d) => ({
            ...d,
            revenue: d.revenue || 0,
            units_sold: d.units_sold || 0,
            orders: d.orders || 0,
            gross_margin_pct: d.gross_margin_pct || 0,
          }))}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="marketplace"
            tick={{ fontSize: 11, fontFamily: "poppins" }}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            name="Revenue (₹)"
            fill={CHART_COLORS[0]}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="units_sold"
            name="Units Sold"
            fill={CHART_COLORS[2]}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {Object.entries(byMarketplace).map(([mp, d]) => (
          <div
            key={mp}
            className="metric-sdw bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-[#001a8e]/30 transition-all"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <span className="oswald uppercase tracking-wider text-[#001a8e] text-base font-bold">
                {mp}
              </span>
              <span
                className={`text-xs poppins font-semibold px-2.5 py-1 rounded-full ${d.revenue_share_pct < 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
              >
                {d.revenue_share_pct}% share
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm poppins">
              <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                <p className="text-gray-600 text-xs uppercase tracking-wide font-semibold">
                  Revenue
                </p>
                <p
                  className={`font-bold mt-1 ${d.revenue < 0 ? "text-red-700" : "text-[#001a8e]"}`}
                >
                  {formatMetricValue(d.revenue, { currency: true })}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                <p className="text-gray-600 text-xs uppercase tracking-wide font-semibold">
                  Units
                </p>
                <p
                  className={`font-bold mt-1 ${d.units_sold < 0 ? "text-red-700" : "text-[#001a8e]"}`}
                >
                  {d.units_sold}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                <p className="text-gray-600 text-xs uppercase tracking-wide font-semibold">
                  Orders
                </p>
                <p
                  className={`font-bold mt-1 ${d.order_count < 0 ? "text-red-700" : "text-[#001a8e]"}`}
                >
                  {d.order_count}
                </p>
              </div>
              <div
                className={`${d.avg_selling_price < 0 ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"} rounded-lg p-2.5 border`}
              >
                <p className="text-gray-600 text-xs uppercase tracking-wide font-semibold">
                  Avg SP
                </p>
                <p
                  className={`font-bold mt-1 ${d.avg_selling_price < 0 ? "text-red-700" : "text-amber-700"}`}
                >
                  {formatMetricValue(d.avg_selling_price, { currency: true })}
                </p>
              </div>
              <div
                className={`${d.avg_mrp < 0 ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"} rounded-lg p-2.5 border`}
              >
                <p className="text-gray-600 text-xs uppercase tracking-wide font-semibold">
                  Avg MRP
                </p>
                <p
                  className={`font-bold mt-1 ${d.avg_mrp < 0 ? "text-red-700" : "text-amber-700"}`}
                >
                  {formatMetricValue(d.avg_mrp, { currency: true })}
                </p>
              </div>
              <div
                className={`${d.gross_margin_pct < 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"} rounded-lg p-2.5 border`}
              >
                <p className="text-gray-600 text-xs uppercase tracking-wide font-semibold">
                  Margin
                </p>
                <p
                  className={`font-bold mt-1 ${d.gross_margin_pct < 0 ? "text-red-700" : "text-green-700"}`}
                >
                  {d.gross_margin_pct}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingSection({ priceHistory }) {
  const marketplaces = useMemo(
    () => [...new Set((priceHistory || []).map((d) => d.marketplace))],
    [priceHistory],
  );
  const [activeMp, setActiveMp] = useState(() => marketplaces[0] || null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && marketplaces.length && !activeMp) {
      initializedRef.current = true;
      startTransition(() => {
        setActiveMp(marketplaces[0]);
      });
    }
  }, [marketplaces, activeMp]);

  if (!priceHistory?.length)
    return <EmptyState message="No price history data" />;

  const filtered = priceHistory.filter((d) => d.marketplace === activeMp);

  return (
    <div className="p-5 h-full overflow-y-auto flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {marketplaces.map((mp) => (
          <button
            key={mp}
            onClick={() => setActiveMp(mp)}
            className={`px-3 py-1 rounded-full text-sm poppins transition-all ${activeMp === mp ? "bg-[#001a8e] text-white" : "bg-[#001a8e]/10 text-[#001a8e] hover:bg-[#001a8e]/20"}`}
          >
            {mp}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={filtered.map((d) => ({
            ...d,
            avg_sp: d.avg_sp || 0,
            avg_cp: d.avg_cp || 0,
            avg_mrp: d.avg_mrp || 0,
          }))}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontFamily: "poppins" }}
            tickFormatter={(d) => d.slice(5)}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="avg_sp"
            name="SP (₹)"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="avg_cp"
            name="CP (₹)"
            stroke={CHART_COLORS[4]}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="avg_mrp"
            name="MRP (₹)"
            stroke={CHART_COLORS[2]}
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={filtered.map((d) => ({
            ...d,
            gross_margin_pct: d.gross_margin_pct || 0,
            mrp_discount_pct: d.mrp_discount_pct || 0,
          }))}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontFamily: "poppins" }}
            tickFormatter={(d) => d.slice(5)}
          />
          <YAxis tick={{ fontSize: 11 }} unit="%" domain={[null, null]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="gross_margin_pct"
            name="Gross Margin %"
            stroke={CHART_COLORS[2]}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="mrp_discount_pct"
            name="MRP Discount %"
            stroke={CHART_COLORS[3]}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function GeographicSection({ byState, topStates }) {
  if (!byState || !Object.keys(byState).length)
    return <EmptyState message="No geographic data" />;

  const sorted = Object.entries(byState)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(([state, d]) => ({ state, ...d }));

  return (
    <div className="p-5 h-full overflow-y-auto flex flex-col gap-4">
      {topStates?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs poppins text-gray-500 self-center">
            Top states:
          </span>
          {topStates.map((s, i) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-full text-xs poppins font-medium"
              style={{
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + "22",
                color: CHART_COLORS[i % CHART_COLORS.length],
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted.map((d) => ({
            ...d,
            revenue: d.revenue || 0,
            units_sold: d.units_sold || 0,
          }))}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis
            type="category"
            dataKey="state"
            tick={{ fontSize: 11, fontFamily: "poppins" }}
            width={75}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="revenue"
            name="Revenue (₹)"
            fill={CHART_COLORS[0]}
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="units_sold"
            name="Units Sold"
            fill={CHART_COLORS[2]}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SizeSection({ bySize, totalRevenue }) {
  if (!bySize || !Object.keys(bySize).length)
    return <EmptyState message="No size data" />;

  const data = Object.entries(bySize)
    .sort(([, a], [, b]) => b.units_sold - a.units_sold)
    .map(([size, d]) => ({ size, ...d }));

  return (
    <div className="p-5 h-full overflow-y-auto flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data.map((d) => ({
            ...d,
            units_sold: d.units_sold || 0,
            revenue_share_pct: d.revenue_share_pct || 0,
          }))}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="size"
            tick={{ fontSize: 11, fontFamily: "poppins" }}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11 }}
            unit="%"
            domain={[null, null]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="units_sold"
            name="Units Sold"
            fill={CHART_COLORS[0]}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="revenue_share_pct"
            name="Revenue Share %"
            fill={CHART_COLORS[2]}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 xl:grid-cols-5 gap-3">
        {data.map(({ size, units_sold, revenue, revenue_share_pct }) => (
          <div
            key={size}
            className="bg-gradient-to-br from-zinc-50 to-white border border-gray-200 rounded-xl p-5 text-center hover:shadow-md hover:border-[#001a8e]/30 transition-all"
          >
            <div className="oswald text-[#001a8e] text-xl font-bold mb-3">
              Size {size}
            </div>

            <div className="space-y-2">
              <div
                className={`${units_sold < 0 ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"} rounded-lg p-2 border`}
              >
                <div className="poppins text-gray-600 text-xs uppercase tracking-wide font-semibold">
                  Units Sold
                </div>
                <div
                  className={`poppins text-lg font-bold ${units_sold < 0 ? "text-red-700" : "text-[#001a8e]"}`}
                >
                  {units_sold}
                </div>
              </div>

              <div
                className={`${revenue_share_pct < 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"} rounded-lg p-2 border`}
              >
                <div className="poppins text-gray-600 text-xs uppercase tracking-wide font-semibold">
                  Revenue Share
                </div>
                <div
                  className={`poppins text-lg font-bold ${revenue_share_pct < 0 ? "text-red-700" : "text-green-700"}`}
                >
                  {revenue_share_pct}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailySection({ dailySeries }) {
  if (!dailySeries?.length) return <EmptyState message="No daily data" />;

  const data = dailySeries.map((d) => ({
    ...d,
    date_short: d.order_date?.slice(5),
  }));

  return (
    <div className="p-5 h-full overflow-y-auto flex flex-col gap-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data.map((d) => ({
            ...d,
            revenue: d.revenue || 0,
            units_sold: d.units_sold || 0,
          }))}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date_short"
            tick={{ fontSize: 10, fontFamily: "poppins" }}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            name="Revenue (₹)"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="units_sold"
            name="Units Sold"
            stroke={CHART_COLORS[2]}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data.map((d) => ({
            ...d,
            gross_margin_pct: d.gross_margin_pct || 0,
            mrp_discount_pct: d.mrp_discount_pct || 0,
          }))}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date_short"
            tick={{ fontSize: 10, fontFamily: "poppins" }}
          />
          <YAxis tick={{ fontSize: 11 }} unit="%" domain={[null, null]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="gross_margin_pct"
            name="Gross Margin %"
            stroke={CHART_COLORS[2]}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="mrp_discount_pct"
            name="MRP Discount %"
            stroke={CHART_COLORS[3]}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function FulfillmentSection({ courierDist, warehouseDist }) {
  const courierData = Object.entries(courierDist || {}).map(
    ([name, orders]) => ({ name, orders }),
  );
  const warehouseData = Object.entries(warehouseDist || {}).map(
    ([name, units]) => ({ name, units }),
  );

  if (!courierData.length && !warehouseData.length)
    return <EmptyState message="No fulfillment data" />;

  return (
    <div className="p-5 h-full overflow-y-auto flex flex-col gap-6">
      {courierData.length > 0 && (
        <div>
          <span className="oswald uppercase tracking-wider text-[#001a8e] text-base block mb-3">
            Courier Distribution
          </span>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={courierData.map((d) => ({
                ...d,
                orders: d.orders || 0,
              }))}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontFamily: "poppins" }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="Orders" radius={[4, 4, 0, 0]}>
                {courierData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {warehouseData.length > 0 && (
        <div>
          <span className="oswald uppercase tracking-wider text-[#001a8e] text-base block mb-3">
            Warehouse Distribution
          </span>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={warehouseData.map((d) => ({
                ...d,
                units: d.units || 0,
              }))}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontFamily: "poppins" }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="units" name="Units" radius={[4, 4, 0, 0]}>
                {warehouseData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function SkuMetricsCard({ refreshKey }) {
  const [skuList, setSkuList] = useState([]);
  const [skuSearch, setSkuSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState(null);
  const [skuData, setSkuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [selectedSection, setSelectedSection] = useState("overview");
  const [skuDataCache, setSkuDataCache] = useState({}); // Cache for all SKU metadata
  const [rollingWindowIndex, setRollingWindowIndex] = useState(0);

  const fetchSkuList = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch(
        `${S3_BASE}/?list-type=2&prefix=${SKU_PREFIX}&max-keys=1000`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const keys = [...doc.querySelectorAll("Contents Key")]
        .map((el) => el.textContent)
        .filter((k) => !k.includes("_meta/") && k.endsWith(".json"))
        .map((k) => k.replace(SKU_PREFIX, "").replace(".json", ""))
        .sort();
      setSkuList(keys);

      // Fetch all SKU data in parallel
      const dataCache = {};
      await Promise.all(
        keys.map((sku) =>
          fetch(`${S3_BASE}/${SKU_PREFIX}${sku}.json`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data) {
                dataCache[sku] = data;
              }
            })
            .catch(() => {
              // Silently fail for individual SKU fetches
            }),
        ),
      );
      setSkuDataCache(dataCache);
    } catch (e) {
      setListError(
        "Could not load SKU list. Ensure public listing is enabled on s3://chupps-data-portal/sku-metrics/.",
      );
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkuList();
  }, [fetchSkuList, refreshKey]);

  const fetchSkuData = useCallback(async (sku) => {
    setLoading(true);
    setSkuData(null);
    try {
      const res = await fetch(`${S3_BASE}/${SKU_PREFIX}${sku}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSkuData(data);
      setSelectedSection("overview");
    } catch (e) {
      console.error("Failed to fetch SKU data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectSku = useCallback(
    (sku) => {
      setSelectedSku(sku);
      setSkuSearch(sku);
      setDropdownOpen(false);
      fetchSkuData(sku);
    },
    [fetchSkuData],
  );

  const filteredSkus = skuList.filter((s) => {
    const searchLower = skuSearch.toLowerCase();
    const data = skuDataCache[s];

    // Search in SKU
    if (s.toLowerCase().includes(searchLower)) return true;

    // Search in model_no
    if (data?.suborder_model_no) {
      const modelNo = Array.isArray(data.suborder_model_no)
        ? data.suborder_model_no.join(" ")
        : data.suborder_model_no;
      if (modelNo?.toLowerCase().includes(searchLower)) return true;
    }

    // Search in productName
    if (data?.suborder_productName) {
      const productName = Array.isArray(data.suborder_productName)
        ? data.suborder_productName.join(" ")
        : data.suborder_productName;
      if (productName?.toLowerCase().includes(searchLower)) return true;
    }

    return false;
  });

  const rolling = skuData?.rolling;

  const renderSection = () => {
    if (!skuData) return null;
    switch (selectedSection) {
      case "overview":
        return <OverviewSection cumulative={skuData.cumulative} />;
      case "marketplace":
        return <MarketplaceSection byMarketplace={skuData.by_marketplace} />;
      case "pricing":
        return (
          <PricingSection priceHistory={skuData.price_history_by_marketplace} />
        );
      case "geographic":
        return (
          <GeographicSection
            byState={skuData.by_state}
            topStates={skuData.top_states}
          />
        );
      case "size":
        return (
          <SizeSection
            bySize={skuData.by_size}
            totalRevenue={skuData.cumulative?.total_revenue}
          />
        );
      case "daily":
        return <DailySection dailySeries={skuData.daily_series} />;
      case "fulfillment":
        return (
          <FulfillmentSection
            courierDist={skuData.courier_distribution}
            warehouseDist={skuData.warehouse_distribution}
          />
        );
      default:
        return null;
    }
  };

  // Load default SKU on startup when list is ready
  useEffect(() => {
    if (skuList.length > 0 && !selectedSku) {
      handleSelectSku("11200-850");
    }
  }, [skuList.length, selectedSku, handleSelectSku]);

  // Cycle through rolling windows every 3 seconds
  useEffect(() => {
    if (!rolling) return;
    const windows = [
      { key: "7d", label: "Last 7 days" },
      { key: "30d", label: "Last 30 days" },
      { key: "all_time", label: "All time" },
    ].filter(({ key }) => rolling[key]);

    if (windows.length === 0) return;

    const interval = setInterval(() => {
      setRollingWindowIndex((prev) => (prev + 1) % windows.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [rolling]);

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-3 overflow-y-auto">
      <div className="flex flex-col items-center">
        <span className="poppins font-extrabold text-3xl">
          Chupps SKU Catalogue
        </span>
        <span className="poppins text-lg text-gray-500">
          Select a SKU from the dropdown to explore its full metrics profile.
        </span>
      </div>

      <div className="poppins w-full relative">
        <div className="rounded-xl flex h-[75vh] min-h-[600px] p-10 pt-0">
          {/* Loading Overlay */}
          {listLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
              <div className="flex flex-col items-center gap-3">
                <Spinner size={12} />
                <span className="text-sm text-white font-medium poppins">
                  Loading SKU Metrics...
                </span>
              </div>
            </div>
          )}
          {/* ── Left Sidebar ── */}
          <div className="w-1/3 z-10 p-5 text-white border-r border-white/20 h-full flex flex-col justify-between gap-4 bg-[#001a8e] rounded-l-xl overflow-y-auto">
            {/* SKU Selector */}
            <div className="">
              <span className="text-xs uppercase tracking-widest text-white/60 mb-2 block">
                Select SKU
              </span>
              <div className="relative">
                <input
                  className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm poppins focus:outline-none focus:border-white/60 transition-colors"
                  placeholder={
                    listLoading ? "Loading SKUs..." : "Search SKU..."
                  }
                  value={skuSearch}
                  onChange={(e) => {
                    setSkuSearch(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  disabled={listLoading}
                  autoFocus
                />
                {dropdownOpen && filteredSkus.length > 0 && (
                  <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                    {filteredSkus.map((sku) => {
                      const data = skuDataCache[sku];
                      return (
                        <button
                          key={sku}
                          onMouseDown={() => handleSelectSku(sku)}
                          className={`w-full text-left px-3 py-2 text-sm poppins hover:bg-[#001a8e]/10 transition-colors ${selectedSku === sku ? "bg-[#001a8e]/10 font-semibold text-[#001a8e]" : "text-gray-800"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="truncate">{sku}</div>
                            <div className="text-xs text-gray-500 ml-2 truncate">
                              {data
                                ? Array.isArray(data.suborder_model_no)
                                  ? data.suborder_model_no.join(", ")
                                  : data.suborder_model_no
                                : null}
                            </div>
                          </div>
                          {data?.suborder_productName && (
                            <div className="text-xs text-gray-400 mt-0.5 truncate">
                              {Array.isArray(data.suborder_productName)
                                ? data.suborder_productName.join(", ")
                                : data.suborder_productName}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {listError && (
                <p className="text-xs text-red-300 mt-2 leading-relaxed">
                  {listError}
                </p>
              )}
              {!listLoading && !listError && (
                <>
                  <p className="text-xs text-white/40 mt-3 text-center">
                    Select an SKU from the dropdown above!
                  </p>
                  <p className="text-xs text-white/40 text-center">
                    {skuList.length} SKUs available
                  </p>
                </>
              )}
            </div>

            <div className="my-auto"></div>

            {/* Section Navigation */}
            <div className="px-4 pt-4 shrink-0 border-t border-white/20">
              <span className="text-xs uppercase tracking-widest text-white/60 mb-2 block">
                Sections
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SECTIONS.map(({ key, label, subtitle }, index) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSection(key)}
                    disabled={!skuData}
                    className={`group overflow-hidden px-3 py-2.5 rounded-lg poppins transition-all flex flex-col items-start gap-1 disabled:opacity-40 disabled:cursor-not-allowed ${index === 0 ? "col-span-2" : ""}
                                            ${
                                              selectedSection === key
                                                ? "bg-white text-[#001a8e] shadow-lg"
                                                : "bg-white/10 text-white hover:bg-white/20 border border-white/30"
                                            }`}
                  >
                    <span className="translate-y-2.5 group-hover:translate-y-0 ease-in duration-100 text-xs font-semibold leading-tight">
                      {label}
                    </span>
                    <span className="-translate-x-44 group-hover:translate-x-0 ease-in duration-100 text-xs opacity-60">
                      {subtitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rolling Window Quick Stats */}
            {rolling && (
              <div className="px-4 flex-1 pt-4 border-t border-white/20 flex flex-col justify-between h-full">
                <style>{`
                  @keyframes blurIn {
                    from {
                      opacity: 0;
                      filter: blur(8px);
                    }
                    to {
                      opacity: 1;
                      filter: blur(0px);
                    }
                  }
                  .rolling-window {
                    animation: blurIn 0.6s ease-out forwards;
                  }
                `}</style>
                <span className="text-xs uppercase tracking-widest text-white/60 mb-2 block">
                  Rolling Windows
                </span>
                <div className="flex flex-col gap-0">
                  {(() => {
                    const windows = [
                      { key: "7d", label: "Last 7 days" },
                      { key: "30d", label: "Last 30 days" },
                      { key: "all_time", label: "All time" },
                    ].filter(({ key }) => rolling[key]);

                    if (windows.length === 0) return null;

                    const current = windows[rollingWindowIndex];
                    const w = rolling[current.key];

                    return (
                      <div
                        key={rollingWindowIndex}
                        className="rolling-window bg-white/10 border border-white/20 rounded-lg p-3 mb-2"
                      >
                        <div className="text-white/70 text-xs uppercase tracking-wider mb-2">
                          {current.label}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <div>
                            <div className="text-white/50">Revenue</div>
                            <div className="text-white font-semibold">
                              {formatMetricValue(w.revenue, { currency: true })}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/50">Units</div>
                            <div className="text-white font-semibold">
                              {w.units_sold}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/50">Orders</div>
                            <div className="text-white font-semibold">
                              {w.orders}
                            </div>
                          </div>
                          <div>
                            <div className="text-white/50">Margin</div>
                            <div className="text-white font-semibold">
                              {w.gross_margin_pct}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {skuData?.last_updated && (
                    <p className="text-xs text-white/30 mt-2">
                      Updated:{" "}
                      {new Date(skuData.last_updated).toLocaleDateString(
                        "en-IN",
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Content Area ── */}
          <div className="w-full h-full bg-[#001a8e] border border-transparent flex flex-col rounded-r-xl">
            <div className="flex-1 m-3 bg-zinc-50 rounded-xl overflow-hidden flex flex-col">
              {/* Section header */}
              {skuData && (
                <div className="py-4 w-full flex flex-row items-center justify-between px-4 border-b border-gray-200">
                  <span className="oswald uppercase tracking-wider text-[#001a8e] text-lg">
                    {SECTIONS.find((s) => s.key === selectedSection)?.label}
                  </span>
                  <div className="poppins text-sm text-gray-700">
                    <span className="font-semibold">
                      {(Array.isArray(skuData.suborder_model_no)
                        ? skuData.suborder_model_no.join(", ")
                        : skuData.suborder_model_no) || skuData.sku}
                    </span>
                    {skuData.suborder_productName && (
                      <div className="text-xs text-gray-500">
                        {Array.isArray(skuData.suborder_productName)
                          ? skuData.suborder_productName.join(", ")
                          : skuData.suborder_productName}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Spinner size={8} />
                    <span className="poppins text-sm text-gray-500">
                      Loading SKU data...
                    </span>
                  </div>
                ) : !selectedSku ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
                    <svg
                      className="w-16 h-16 text-gray-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="poppins text-gray-400 text-sm">
                      Select a SKU from the sidebar to view its metrics
                    </p>
                  </div>
                ) : !skuData ? (
                  <EmptyState message="No data found for this SKU" />
                ) : (
                  renderSection()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
