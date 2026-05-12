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

const metricCardClass =
  "rounded-2xl border border-[#001a8e]/15 bg-white p-4 shadow-sm";

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
      const response = await fetch(apiUrl("/cancellation/rto"), {
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
      if (!result?.success) {
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
    fetchRtoData();
  }, [fetchRtoData, refreshKey]);

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
        <div className="w-11/12 py-6" key={refreshKey}>
          <div className="mb-6 rounded-3xl border border-[#001a8e]/10 bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#001a8e]/70">
                  RTO Orders
                </p>
                <h1 className="mt-2 text-3xl font-bold text-zinc-900">
                  Cancelled + Returned order view
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-zinc-600">
                  Default view loads previous day. Search any date range, then
                  inspect returned and cancelled orders with state and pincode
                  insights.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-115">
                <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-zinc-600">
                  Start date
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none ring-0 focus:border-[#001a8e]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-zinc-600">
                  End date
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none ring-0 focus:border-[#001a8e]"
                  />
                </label>
                <button
                  onClick={fetchRtoData}
                  className="sm:col-span-2 rounded-xl bg-[#001a8e] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Search RTO orders
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className={metricCardClass}>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Total orders
              </p>
              <p className="mt-2 text-3xl font-bold text-zinc-900">
                {payload?.totals?.orders ?? (loading ? "…" : 0)}
              </p>
            </div>
            <div className={metricCardClass}>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Cancelled
              </p>
              <p className="mt-2 text-3xl font-bold text-red-700">
                {payload?.totals?.cancelled ?? (loading ? "…" : 0)}
              </p>
            </div>
            <div className={metricCardClass}>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Returned
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-700">
                {payload?.totals?.returned ?? (loading ? "…" : 0)}
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeSection === section.key ? "bg-[#001a8e] text-white" : "bg-white text-zinc-700 border border-zinc-200"}`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {loading && !payload ? (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center text-sm text-zinc-500">
              Loading RTO orders…
            </div>
          ) : payload ? (
            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-[#001a8e]/10 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Active section
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-zinc-900">
                    {sections.find((item) => item.key === activeSection)?.label}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-600">
                    {activeOrders.length} visible orders in current section.
                  </p>
                </div>

                <div className="rounded-3xl border border-[#001a8e]/10 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Top states
                  </p>
                  <div className="mt-4 space-y-3">
                    {(activeData.top_states || []).length ? (
                      activeData.top_states.map((item) => (
                        <div
                          key={`${item.key}-${item.count}`}
                          className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-zinc-800">
                            {item.key}
                          </span>
                          <span className="text-zinc-600">{item.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No state data</p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-[#001a8e]/10 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Top pincodes
                  </p>
                  <div className="mt-4 space-y-3">
                    {(activeData.top_pincodes || []).length ? (
                      activeData.top_pincodes.map((item) => (
                        <div
                          key={`${item.pincode}-${item.count}`}
                          className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-zinc-800">
                            {item.pincode}
                          </span>
                          <span className="text-zinc-600">{item.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No pincode data</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="min-w-0 rounded-3xl border border-[#001a8e]/10 bg-white p-4 shadow-sm">
                <DataTableComponent
                  data={activeOrders}
                  summarized_query={`${activeSection} orders • ${startDate} to ${endDate}`}
                  title={`${sections.find((item) => item.key === activeSection)?.label || "RTO"} Orders`}
                  columnKeys={orderColumns}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center text-sm text-zinc-500">
              No RTO orders found for selected range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
