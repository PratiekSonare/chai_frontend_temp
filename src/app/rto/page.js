// RTO page - allow user to instantly view returned or cancelled orders with associated metrics
// Features: date range input (allow user to choose dates of interest for order investigation)

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header";
import DotField from "@/components/DotField";
import { Button } from "@/components/ui/button";
import DataTableComponent from "../components/table/DataTableComponent";
import { apiUrl, fetchRtoPresetsFromS3 } from "@/lib/api";

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
};

const orderColumns = [
  "order_id",
  "order_date",
  "order_status",
  "state",
  "pin_code",
  "marketplace",
  "courier",
  "total_amount",
  "payment_mode",
  "order_type",
  "shipping_status",
  "billing_state",
];

export default function RtoPage() {
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [startDate, setStartDate] = useState(getYesterday());
  const [endDate, setEndDate] = useState(getYesterday());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);
  const [activeSection, setActiveSection] = useState("returned");

  const handleRefreshComponents = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const detectRtoPreset = useCallback((start, end) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fmt = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const addDays = (d, n) => {
      const r = new Date(d);
      r.setDate(r.getDate() + n);
      return r;
    };
    const todayStr = fmt(today);
    const yesterdayStr = fmt(addDays(today, -1));
    const d7Ago = fmt(addDays(today, -6));
    const d30Ago = fmt(addDays(today, -29));
    const allStart = "2025-09-01";

    if (start === yesterdayStr && end === yesterdayStr) return "yesterday";
    if (start === d7Ago && end === todayStr) return "7d";
    if (start === d30Ago && end === todayStr) return "30d";
    if (start === allStart && end === todayStr) return "all";
    return null;
  }, []);

  const fetchRtoData = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError("");

    try {
      const preset = detectRtoPreset(startDate, endDate);

      if (preset) {
        const s3Data = await fetchRtoPresetsFromS3();
        if (s3Data && s3Data[preset] && s3Data[preset].success !== false) {
          setPayload(s3Data[preset]);
          setLoading(false);
          return;
        }
      }

      const response = await fetch(apiUrl("/cancellation/rto/dashboard"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`RTO fetch failed with status ${response.status}`);
      }

      const result = await response.json();
      if (!result || !result.success) {
        throw new Error(result?.error || "RTO fetch returned failure");
      }

      setPayload(result);
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load RTO data");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, detectRtoPreset]);

  useEffect(() => {
    // Auto-fetch on component mount with default yesterday's date
    fetchRtoData();
  }, [fetchRtoData]);

  useEffect(() => {
    if (refreshKey > 0) {
      fetchRtoData();
    }
  }, [refreshKey]);

  const sections = useMemo(() => {
    if (!payload) return [];

    return [
      {
        key: "returned",
        label: "Returned",
        accent: "#b45309",
        data: payload.returned || {},
      },
      {
        key: "pending_returns",
        label: "Pending Returns",
        accent: "#7c3aed",
        data: payload.pending_returns || {},
      },
      {
        key: "cancelled",
        label: "Cancelled",
        accent: "#b91c1c",
        data: payload.cancelled || {},
      },
    ];
  }, [payload]);

  const activeData = payload?.[activeSection] || {};
  const activeOrders = activeData.orders || [];

  return (
    <div className="overflow-hidden h-screen">
      <Sidebar onHoverChange={setSidebarHovered} />
      <div className="h-screen bg-[#001fb0] p-5 pt-0">
        <div className="relative h-full landing-sdw overflow-x-hidden bg-zinc-50 overflow-y-hidden font-sans rounded-t-4xl snap-y snap-mandatory scroll-smooth">
          <div className="absolute inset-1 z-0 opacity-70">
            <DotField
              dotRadius={2}
              dotSpacing={15}
              bulgeStrength={500}
              glowRadius={2}
              sparkle={true}
              waveAmplitude={0}
              cursorRadius={25}
              cursorForce={0.1}
              bulgeOnly
              gradientFrom="#A855F7"
              gradientTo="#001FB0"
              glowColor="#000000"
            />
          </div>

          <div
            className={`relative h-full w-full flex flex-col items-center justify-center`}
          >
            <div
              className="w-full flex flex-col justify-center items-center gap-5 overflow-y-auto"
              key={refreshKey}
            >
              <div className="flex flex-col items-center">
                <span className="poppins font-extrabold text-3xl">
                  Chupps RTO Management
                </span>
                <span className="poppins text-lg text-gray-500">
                  Track returned, cancelled, and pending orders. Analyze order
                  failure patterns and trends.
                </span>
              </div>

              <div className="w-full poppins px-10 scale-90">
                <div className="relative bg-[#001a8e] rounded-xl flex h-[75vh] min-h-150">
                  {/* Left Sidebar */}
                  <div className="border-r border-white/20 z-10 pb-4 text-white h-full flex flex-col justify-between w-1/4 bg-[#001a8e] rounded-l-xl overflow-y-auto sticky top-0">
                    {/* === SECTION NAVIGATION - Top === */}
                    <div className="p-4">
                      <div className="w-full grid grid-cols-1 gap-3">
                        {sections.map((section) => (
                          <button
                            key={section.key}
                            onClick={() => setActiveSection(section.key)}
                            className={`group overflow-x-hidden px-4 py-3 rounded-lg poppins transition-all flex flex-col items-start gap-1.5 
                        ${
                          activeSection === section.key
                            ? "bg-white text-[#001a8e] shadow-lg"
                            : "bg-white/10 text-white hover:bg-white/20 border border-white"
                        }`}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <span className="translate-y-3 group-hover:translate-y-0 ease-in duration-100 text-sm font-semibold leading-tight">
                                {section.label}
                              </span>
                            </div>
                            <span className="-translate-x-40 group-hover:translate-x-0 ease-in duration-100 text-xs opacity-70">
                              View metrics
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* === FILTERS - Bottom === */}
                    <div className="flex flex-col gap-0 overflow-hidden">
                      <div className="flex flex-col gap-4 px-4 py-4 border-t border-white/20">
                        <span className="poppins text-sm uppercase font-semibold">
                          Date Range
                        </span>

                        <label className="flex flex-col gap-2 text-xs">
                          <span className="uppercase tracking-wide opacity-80">
                            Start date
                          </span>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 outline-none ring-0 focus:border-white/50 focus:bg-white/20"
                          />
                        </label>

                        <label className="flex flex-col gap-2 text-xs">
                          <span className="uppercase tracking-wide opacity-80">
                            End date
                          </span>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 outline-none ring-0 focus:border-white/50 focus:bg-white/20"
                          />
                        </label>

                        <button
                          onClick={fetchRtoData}
                          disabled={loading}
                          className={`w-full px-4 py-3 rounded-lg poppins font-semibold transition-all flex items-center justify-center gap-2 mt-2 ${
                            loading
                              ? "bg-white/30 text-white/60 cursor-not-allowed"
                              : "bg-white text-[#001a8e] hover:bg-white/90 active:scale-95 shadow-lg"
                          }`}
                        >
                          {loading ? (
                            <>
                              <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                              <span>Fetching...</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                              </svg>
                              <span>Search RTO</span>
                            </>
                          )}
                        </button>
                      </div>

                      {error && (
                        <div className="px-4 py-3 border-t border-white/20 text-xs text-red-200 bg-red-500/20 rounded-lg">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Content Area */}
                  <div className="w-3/4 h-full bg-[#001a8e] border border-transparent flex flex-col rounded-xl overflow-y-auto relative">
                    {/* Loading Overlay */}
                    {loading && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
                        <div className="flex flex-col items-center gap-4">
                          <span className="h-10 w-10 rounded-full border-4 border-white border-t-transparent animate-spin" />
                          <span className="text-white/90 text-sm font-medium">
                            Loading RTO data...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Metrics Grid */}
                    <div className="flex-1 flex flex-col p-2 min-h-0 overflow-y-auto">
                      <div className="flex-1 flex flex-col p-2 min-h-0 overflow-y-auto">
                        {loading && !payload ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-3">
                              <span className="h-8 w-8 rounded-full border-3 border-white border-t-transparent animate-spin" />
                              <span className="text-white/80 text-sm">
                                Loading RTO data...
                              </span>
                            </div>
                          </div>
                        ) : payload ? (
                          <div className="space-y-3">
                            {/* Top Metrics Row */}
                            <div className="grid grid-cols-4 gap-3">
                              <div className="metric-sdw rounded-xl bg-zinc-50 border-l border-b border-r border-[#001a8e] p-4 flex flex-col">
                                <span className="oswald uppercase tracking-wider text-[#001a8e] text-md">
                                  Total orders
                                </span>
                                <p className="mt-2 text-4xl font-bold text-[#001a8e]">
                                  {payload?.totals?.orders ?? 0}
                                </p>
                              </div>
                              <div className="metric-sdw rounded-xl bg-zinc-50 border-l border-b border-r border-[#001a8e] p-4 flex flex-col">
                                <span className="oswald uppercase tracking-wider text-red-700 text-md">
                                  Cancelled
                                </span>
                                <p className="mt-2 text-4xl font-bold text-red-700">
                                  {payload?.totals?.cancelled ?? 0}
                                </p>
                              </div>
                              <div className="metric-sdw rounded-xl bg-zinc-50 border-l border-b border-r border-[#001a8e] p-4 flex flex-col">
                                <span className="oswald uppercase tracking-wider text-amber-700 text-md">
                                  Returned
                                </span>
                                <p className="mt-2 text-4xl font-bold text-amber-700">
                                  {payload?.totals?.returned ?? 0}
                                </p>
                              </div>
                              <div className="metric-sdw rounded-xl bg-zinc-50 border-l border-b border-r border-[#001a8e] p-4 flex flex-col">
                                <span className="oswald uppercase tracking-wider text-violet-700 text-md">
                                  Pending
                                </span>
                                <p className="mt-2 text-4xl font-bold text-violet-700">
                                  {payload?.totals?.pending_returns ?? 0}
                                </p>
                              </div>
                            </div>

                            {/* Active Section Details */}
                            <div className="metric-sdw bg-white rounded-xl border border-[#001a8e]/20 p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="oswald uppercase tracking-wider text-[#001a8e] text-md opacity-70">
                                    {sections.find(
                                      (item) => item.key === activeSection,
                                    )?.label || "Active Section"}
                                  </span>
                                  <p className="mt-1.5 text-2xl font-bold text-zinc-900">
                                    {activeOrders.length}{" "}
                                    <span className="text-sm font-semibold text-zinc-600">
                                      Orders
                                    </span>
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-zinc-500 uppercase tracking-wide">
                                    Date Range
                                  </p>
                                  <p className="mt-1 text-md font-semibold text-zinc-700">
                                    {startDate} — {endDate}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2.5">
                                <div className="bg-red-50/50 rounded-lg p-3 border border-red-100/30 hover:border-red-200/50 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <p className="text-md text-red-700 font-semibold uppercase tracking-wider">
                                      Impact
                                    </p>
                                  </div>
                                  <p className="mt-2 text-xl font-bold text-red-600">
                                    ₹
                                    {(
                                      activeData.revenue_impact || 0
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    })}
                                  </p>
                                </div>
                                <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100/30 hover:border-blue-200/50 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <p className="text-md text-[#001a8e] font-semibold uppercase tracking-wider">
                                      Avg Days to Process
                                    </p>
                                  </div>
                                  <p className="mt-2 text-2xl font-bold text-[#001a8e]">
                                    {(
                                      activeData.avg_days_to_cancellation || 0
                                    ).toFixed(1)}
                                    <span className="text-xs font-semibold text-zinc-600 ml-1">
                                      d
                                    </span>
                                  </p>
                                </div>
                                <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100/30 hover:border-amber-200/50 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <p className="text-md text-amber-700 font-semibold uppercase tracking-wider">
                                      Top State
                                    </p>
                                  </div>
                                  <p className="mt-2 text-2xl font-bold text-amber-700">
                                    {activeData.top_states?.[0]?.key || "—"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Top States */}
                              <div className="metric-sdw bg-white rounded-xl border border-blue-100/30 p-3 hover:border-blue-200/50 transition-all hover:shadow-md">
                                <div className="flex items-center gap-2 mb-2.5">
                                  <span className="oswald uppercase tracking-wider text-[#001a8e] text-md">
                                    Top States
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  {(activeData.top_states || [])
                                    .slice(0, 5)
                                    .map((item, idx) => (
                                      <div
                                        key={`${item.key}-${item.count}`}
                                        className="flex items-center justify-between text-xs p-2 rounded-md bg-blue-50/40 hover:bg-blue-50/70 transition-colors"
                                      >
                                        <span className="text-zinc-700 font-semibold">
                                          {item.key}
                                        </span>
                                        <span className="inline-flex px-4 items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-100 text-[#001a8e] font-bold text-xs">
                                          {item.count}
                                        </span>
                                      </div>
                                    ))}
                                  {(!activeData.top_states ||
                                    activeData.top_states.length === 0) && (
                                    <p className="text-xs text-zinc-400 italic">
                                      No data
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Top Pincodes */}
                              <div className="metric-sdw bg-white rounded-xl border border-emerald-100/30 p-3 hover:border-emerald-200/50 transition-all hover:shadow-md">
                                <div className="flex items-center gap-2 mb-2.5">
                                  <span className="oswald uppercase tracking-wider text-emerald-700 text-md">
                                    Top Pincodes
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  {(activeData.top_pincodes || [])
                                    .slice(0, 5)
                                    .map((item) => (
                                      <div
                                        key={`${item.pincode}-${item.count}`}
                                        className="flex items-center justify-between text-xs p-2 rounded-md bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors"
                                      >
                                        <span className="text-zinc-700 font-semibold font-mono">
                                          {item.pincode}
                                        </span>
                                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                                          {item.count}
                                        </span>
                                      </div>
                                    ))}
                                  {(!activeData.top_pincodes ||
                                    activeData.top_pincodes.length === 0) && (
                                    <p className="text-xs text-zinc-400 italic">
                                      No data
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Payment Breakdown */}
                              <div className="metric-sdw bg-white rounded-xl border border-purple-100/30 p-3 hover:border-purple-200/50 transition-all hover:shadow-md">
                                <div className="flex items-center gap-2 mb-2.5">
                                  <span className="oswald uppercase tracking-wider text-purple-700 text-md">
                                    Payment
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  {(
                                    activeData.payment_mode_breakdown || []
                                  ).map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between text-xs p-2 rounded-md bg-purple-50/40 hover:bg-purple-50/70 transition-colors"
                                    >
                                      <span className="flex-1 text-zinc-700 font-semibold">
                                        {item.mode}
                                      </span>
                                      <div className="flex items-center gap-2 flex-1">
                                        <div className="flex-1 bg-purple-100 rounded-full h-2 overflow-hidden">
                                          <div
                                            className="bg-purple-600 h-full rounded-full"
                                            style={{
                                              width: `${item.percentage}%`,
                                            }}
                                          ></div>
                                        </div>
                                        <span className="text-purple-600 font-semibold text-xs min-w-[40px] text-right">
                                          {item.percentage}%
                                        </span>
                                        {/* <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                                        {item.count}
                                      </span> */}
                                      </div>
                                    </div>
                                  ))}
                                  {(!activeData.payment_mode_breakdown ||
                                    activeData.payment_mode_breakdown.length ===
                                      0) && (
                                    <p className="text-xs text-zinc-400 italic">
                                      No data
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Marketplace Breakdown */}
                              <div className="metric-sdw bg-white rounded-xl border border-orange-100/30 p-3 hover:border-orange-200/50 transition-all hover:shadow-md">
                                <div className="flex items-center gap-2 mb-2.5">
                                  <span className="oswald uppercase tracking-wider text-orange-700 text-md">
                                    Marketplaces
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  {(activeData.marketplace_breakdown || []).map(
                                    (item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center justify-between text-xs p-2 rounded-md bg-orange-50/40 hover:bg-orange-50/70 transition-colors"
                                      >
                                        <span className="flex-1 text-zinc-700 font-semibold">
                                          {item.marketplace}
                                        </span>
                                        <div className="flex items-center gap-2 flex-1">
                                          {/* <span className="inline-flex items-center justify-center text-orange-700 font-bold text-xs">
                                        {item.count}
                                      </span> */}
                                          <div className="flex-1 bg-orange-100 rounded-full h-2 overflow-hidden">
                                            <div
                                              className="bg-orange-600 h-full rounded-full"
                                              style={{
                                                width: `${item.percentage}%`,
                                              }}
                                            ></div>
                                          </div>
                                          <span className="text-orange-600 font-semibold text-xs min-w-[40px] text-right">
                                            {item.percentage}%
                                          </span>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                  {(!activeData.marketplace_breakdown ||
                                    activeData.marketplace_breakdown.length ===
                                      0) && (
                                    <p className="text-xs text-zinc-400 italic">
                                      No data
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Data Table */}
                            {payload && activeOrders.length > 0 && (
                              <div className="metric-sdw bg-zinc-50 rounded-xl p-4 border border-[#001a8e]/10">
                                <DataTableComponent
                                  data={activeOrders}
                                  summarized_query={`${activeSection} orders • ${startDate} to ${endDate}`}
                                  title={`${sections.find((item) => item.key === activeSection)?.label || "RTO"} Orders`}
                                  columnKeys={orderColumns}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-white/60 text-sm">
                              No RTO orders found for the selected range.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
