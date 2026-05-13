// RTO page - allow user to instantly view returned or cancelled orders with associated metrics
// Features: date range input (allow user to choose dates of interest for order investigation)

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header";
import { Button } from "@/components/ui/button";
import DataTableComponent from "../components/table/DataTableComponent";
import { apiUrl } from "@/lib/api";

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

  const fetchRtoData = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError("");

    try {
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
  }, [startDate, endDate]);

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
    <div className="relative overflow-x-hidden h-screen bg-zinc-50 overflow-y-auto font-sans snap-y snap-mandatory scroll-smooth">
      <div className="flex flex-row gap-2 z-50! fixed bottom-5 right-5">
        <Button
          variant="outline"
          className="rounded-full! active:scale-80 scale-100 transition-all duration-75 ease-in"
          onClick={handleRefreshComponents}
        >
          ↻
        </Button>
      </div>

      <Sidebar onHoverChange={setSidebarHovered} />
      <Header />

      <div
        className={`relative ${sidebarHovered ? "ml-[3.56%]" : "ml-[3%]"} transition-[margin] duration-100 ease-in w-full shrink-0 flex items-center justify-center`}
      >
        <div
          className="w-[90%] h-screen flex flex-col justify-center items-start gap-10 overflow-y-auto"
          key={refreshKey}
        >
          <div className="flex flex-col items-start text-left">
            <span className="poppins font-extrabold text-3xl">
              Chupps RTO Management
            </span>
            <span className="poppins text-lg text-gray-500">
              Track returned, cancelled, and pending orders. Analyze order
              failure patterns and trends.
            </span>
          </div>

          <div className="poppins w-[96%] relative">
            <div className="relative bg-[#001a8e] rounded-xl flex h-[85vh] min-h-[600px]">
              {/* Left Sidebar */}
              <div className="border-r border-white/20 z-10 pb-4 text-white h-full flex flex-col justify-between w-1/4 bg-[#001a8e] rounded-l-xl overflow-y-auto sticky top-0">
                {/* === SECTION NAVIGATION - Top === */}
                <div className="flex-shrink-0 px-4 pt-4 pb-3">
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
                          <span className="translate-y-3 group-hover:translate-y-0 ease-in duration-100 text-sm font-medium">
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
              <div className="w-3/4 h-full bg-[#001a8e] border border-transparent flex flex-col rounded-xl overflow-y-auto">
                {/* Metrics Grid */}
                <div className="flex-1 flex flex-col p-3 min-h-0 overflow-y-auto">
                  <div className="flex-1 flex flex-col p-3 min-h-0 overflow-y-auto">
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
                            <span className="oswald uppercase tracking-wider text-[#001a8e] text-xs">
                              Total orders
                            </span>
                            <p className="mt-2 text-2xl font-bold text-[#001a8e]">
                              {payload?.totals?.orders ?? 0}
                            </p>
                          </div>
                          <div className="metric-sdw rounded-xl bg-zinc-50 border-l border-b border-r border-[#001a8e] p-4 flex flex-col">
                            <span className="oswald uppercase tracking-wider text-red-700 text-xs">
                              Cancelled
                            </span>
                            <p className="mt-2 text-2xl font-bold text-red-700">
                              {payload?.totals?.cancelled ?? 0}
                            </p>
                          </div>
                          <div className="metric-sdw rounded-xl bg-zinc-50 border-l border-b border-r border-[#001a8e] p-4 flex flex-col">
                            <span className="oswald uppercase tracking-wider text-amber-700 text-xs">
                              Returned
                            </span>
                            <p className="mt-2 text-2xl font-bold text-amber-700">
                              {payload?.totals?.returned ?? 0}
                            </p>
                          </div>
                          <div className="metric-sdw rounded-xl bg-zinc-50 border-l border-b border-r border-[#001a8e] p-4 flex flex-col">
                            <span className="oswald uppercase tracking-wider text-violet-700 text-xs">
                              Pending
                            </span>
                            <p className="mt-2 text-2xl font-bold text-violet-700">
                              {payload?.totals?.pending_returns ?? 0}
                            </p>
                          </div>
                        </div>

                        {/* Active Section Details */}
                        <div className="bg-white rounded-xl border border-[#001a8e]/20 p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="oswald uppercase tracking-widest text-[#001a8e] text-xs font-bold opacity-70">
                                {sections.find(
                                  (item) => item.key === activeSection,
                                )?.label || "Active Section"}
                              </span>
                              <p className="mt-1.5 text-lg font-bold text-zinc-900">
                                {activeOrders.length}{" "}
                                <span className="text-sm font-semibold text-zinc-600">
                                  Orders
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-zinc-500 uppercase tracking-wide">
                                Date Range
                              </p>
                              <p className="mt-1 text-sm font-semibold text-zinc-700">
                                {startDate} — {endDate}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-zinc-200/50">
                            <div className="bg-red-50/50 rounded-lg p-3 border border-red-100/30 hover:border-red-200/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-red-700 font-semibold uppercase tracking-wider">
                                  Impact
                                </p>
                              </div>
                              <p className="mt-2 text-base font-bold text-red-600">
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
                                <p className="text-xs text-[#001a8e] font-semibold uppercase tracking-wider">
                                  Avg Days
                                </p>
                              </div>
                              <p className="mt-2 text-base font-bold text-[#001a8e]">
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
                                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
                                  Top State
                                </p>
                              </div>
                              <p className="mt-2 text-base font-bold text-amber-700">
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
                              <span className="oswald uppercase tracking-wider text-[#001a8e] text-xs font-bold">
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
                                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-100 text-[#001a8e] font-bold text-xs">
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
                              <span className="oswald uppercase tracking-wider text-emerald-700 text-xs font-bold">
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
                              <span className="oswald uppercase tracking-wider text-purple-700 text-xs font-bold">
                                Payment
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {(activeData.payment_mode_breakdown || []).map(
                                (item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-xs p-2 rounded-md bg-purple-50/40 hover:bg-purple-50/70 transition-colors"
                                  >
                                    <span className="text-zinc-700 font-semibold">
                                      {item.mode}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                                        {item.count}
                                      </span>
                                      <span className="text-purple-600 font-semibold">
                                        {item.percentage}%
                                      </span>
                                    </div>
                                  </div>
                                ),
                              )}
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
                              <span className="oswald uppercase tracking-wider text-orange-700 text-xs font-bold">
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
                                    <span className="text-zinc-700 font-semibold">
                                      {item.marketplace}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-orange-100 text-orange-700 font-bold text-xs">
                                        {item.count}
                                      </span>
                                      <span className="text-orange-600 font-semibold">
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
  );
}
