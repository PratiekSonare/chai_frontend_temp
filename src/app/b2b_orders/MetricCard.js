"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SvgTitle from "./components/SvgTitle";
import { METRICS_CONFIG } from "./utils/metricsConfig";
import {
  getInitialStartDate,
  getInitialEndDate,
  getDateRangeByPreset,
} from "./utils/dateHelper";
import { formatMetricValue } from "./utils/formatMetricValue";
import { renderChart } from "./components/ChartRenderer";
import { useFetchMetric } from "./hooks/useFetchMetric";

export default function MetricCard() {
  // Initialize state from utilities
  const [startDate, setStartDate] = useState(() => getInitialStartDate());
  const [endDate, setEndDate] = useState(() => getInitialEndDate());
  const [selectedDatePreset, setSelectedDatePreset] = useState("7d");

  // Metrics state and loading
  const {
    metricsData,
    setMetricsData,
    metricsLoading,
    setMetricsLoading,
    fetchAllMetricsAtOnce,
  } = useFetchMetric(startDate, endDate);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState("primaryKpis");
  const initialFetchRef = useRef(false);
  const pendingDatePresetRef = useRef(null);

  // Handle date preset changes
  const handleDatePreset = useCallback((preset) => {
    const { start, end } = getDateRangeByPreset(preset);
    pendingDatePresetRef.current = { preset, newStart: start, newEnd: end };
    setStartDate(start);
    setEndDate(end);
    setSelectedDatePreset(preset);
  }, []);

  // Use metrics config from utilities
  const metricsConfig = METRICS_CONFIG;

  // Handle date preset changes
  useEffect(() => {
    if (!pendingDatePresetRef.current) return;

    const { newStart, newEnd } = pendingDatePresetRef.current;
    pendingDatePresetRef.current = null;

    fetchAllMetricsAtOnce(metricsConfig, {
      startDate: newStart,
      endDate: newEnd,
    });
  }, [fetchAllMetricsAtOnce, metricsConfig]);

  // Initial fetch on load
  useEffect(() => {
    if (initialFetchRef.current) return;
    initialFetchRef.current = true;

    fetchAllMetricsAtOnce(metricsConfig, { startDate, endDate });
  }, [fetchAllMetricsAtOnce, metricsConfig, startDate, endDate]);

  return (
    <div className="w-[90%] h-screen flex flex-col justify-center items-start gap-10 overflow-y-auto">
      <div className="flex flex-col items-start text-left">
        <span className="poppins font-extrabold text-3xl">
          B2B Order Metrics
        </span>
        <span className="poppins text-lg text-gray-500">
          B2B-only metrics. Analyze and compare order data across all channels.
        </span>
      </div>

      <div className="poppins w-[96%] relative">
        <div className="relative bg-[#001a8e] rounded-xl flex h-[85vh] min-h-[600px]">
          {/* Left Sidebar - Date Range & Category */}
          <div className="z-10 pb-4 text-white h-full flex flex-col justify-start w-1/4 bg-[#001a8e] rounded-l-xl overflow-y-auto sticky top-0">
            {/* === CATEGORY NAVIGATION - Top === */}
            <div className="flex-shrink-0 px-4 pt-4 pb-3">
              <div className="w-full grid grid-cols-2 gap-3">
                {Object.entries(metricsConfig).map(
                  ([categoryKey, categoryData]) => (
                    <button
                      key={categoryKey}
                      onClick={() => setSelectedCategory(categoryKey)}
                      className={`group overflow-x-hidden px-4 py-3 rounded-lg poppins transition-all flex flex-col items-start gap-1.5 
                                            ${
                                              selectedCategory === categoryKey
                                                ? "bg-white text-[#001a8e] shadow-lg"
                                                : "bg-white/10 text-white hover:bg-white/20 border border-white"
                                            }`}
                    >
                      <span className="translate-y-3 group-hover:translate-y-0 ease-in duration-100 text-sm">
                        {categoryData.category}
                      </span>
                      <span className="-translate-x-40 group-hover:translate-x-0 ease-in duration-100 text-xs opacity-70">
                        {categoryData.subtitle || "View metrics"}
                      </span>
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Date Range Controls */}
            <div className="flex flex-col gap-4 px-4 py-3 border-t border-white/20">
              <span className="poppins text-sm uppercase">Date Range</span>
              <div className="flex flex-row justify-between items-center gap-2">
                {["7d", "30d", "all"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleDatePreset(preset)}
                    className={`border w-full rounded-sm poppins text-sm py-2 transition-all ${
                      selectedDatePreset === preset
                        ? "bg-[#001a8e] text-white border-white"
                        : "bg-white text-[#001a8e] border-[#001a8e]"
                    }`}
                  >
                    {preset === "7d"
                      ? "Last 7 Days"
                      : preset === "30d"
                        ? "Last 30 Days"
                        : "All Time"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Right Content Area - Metrics */}
          <div className="w-3/4 h-full bg-[#001a8e] border border-transparent flex flex-col rounded-xl">
            {/* === METRICS CAROUSEL - Takes 4/5 height === */}
            <div className="flex-1 flex flex-col py-4 min-h-0 overflow-y-hidden">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                orientation="vertical"
                className="w-full h-full relative overflow-y-scroll hide-scrollbar"
              >
                <CarouselContent className="h-full !rounded-xl">
                  {metricsConfig[selectedCategory] &&
                    Object.entries(metricsConfig[selectedCategory].metrics).map(
                      ([metricKey, metricConfig]) => {
                        const metricData = metricsData[metricKey];
                        const isLoading = metricsLoading[metricKey];
                        const data = metricData?.data;
                        const chartData = metricData?.chart;

                        return (
                          <CarouselItem
                            key={metricKey}
                            className={`${metricConfig.type === "scalar" ? "basis-1/4" : "basis-1/2"} rounded-xl`}
                          >
                            <div className="bg-zinc-50 border-l border-b border-r border-[#001a8e] h-full flex flex-col rounded-xl">
                              <div className="flex flex-col gap-2 pt-3 pl-3 pb-2">
                                <span className="oswald uppercase tracking-wider text-[#001a8e] text-xl">
                                  {metricConfig.title}
                                </span>
                                {metricConfig.formula && (
                                  <span className="poppins text-xs text-gray-600 italic">
                                    {metricConfig.formula}
                                  </span>
                                )}

                                {metricConfig.hasChart &&
                                  !isLoading &&
                                  data !== undefined && (
                                    <div className="flex flex-row items-center gap-4">
                                      <div className="text-3xl font-bold text-[#001a8e]">
                                        {formatMetricValue(data, metricConfig)}
                                      </div>
                                      {metricConfig.percent === true && (
                                        <svg
                                          width="60"
                                          height="35"
                                          viewBox="0 0 60 35"
                                          className="overflow-visible"
                                        >
                                          {/* Background semicircle */}
                                          <path
                                            d="M 5 30 A 25 25 0 0 1 55 30"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                          />
                                          {/* Progress semicircle */}
                                          <path
                                            d="M 5 30 A 25 25 0 0 1 55 30"
                                            fill="none"
                                            stroke="#001a8e"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(Math.min(Math.max(data, 0), 100) / 100) * 78.5} 78.5`}
                                            style={{
                                              transformOrigin: "30px 30px",
                                              transform: "scaleX(-1)",
                                            }}
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  )}
                              </div>

                              <div className="flex-1 p-4 overflow-hidden">
                                {isLoading ? (
                                  <div className="h-full flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2">
                                      <span className="h-5 w-5 rounded-full border-2 border-[#001a8e] border-t-transparent animate-spin" />
                                      <span className="text-sm text-gray-600">
                                        Loading...
                                      </span>
                                    </div>
                                  </div>
                                ) : metricConfig.hasChart &&
                                  (chartData || data) ? (
                                  renderChart(
                                    metricKey,
                                    metricConfig,
                                    chartData || data,
                                  )
                                ) : metricConfig.type === "scalar" ? (
                                  <div className="h-full flex items-center justify-center gap-8">
                                    {metricConfig.percent === true && (
                                      <svg
                                        width="100"
                                        height="60"
                                        viewBox="0 0 100 60"
                                        className="overflow-visible"
                                      >
                                        {/* Background semicircle */}
                                        <path
                                          d="M 10 50 A 40 40 0 0 1 90 50"
                                          fill="none"
                                          stroke="#e5e7eb"
                                          strokeWidth="5"
                                          strokeLinecap="round"
                                        />
                                        {/* Progress semicircle */}
                                        <path
                                          d="M 10 50 A 40 40 0 0 1 90 50"
                                          fill="none"
                                          stroke="#001a8e"
                                          strokeWidth="5"
                                          strokeLinecap="round"
                                          strokeDasharray={`${(Math.min(Math.max(data, 0), 100) / 100) * 125.6} 125.6`}
                                          style={{
                                            transformOrigin: "50px 50px",
                                            transform: "scaleX(-1)",
                                          }}
                                        />
                                      </svg>
                                    )}
                                    <div className="text-3xl font-bold text-[#001a8e]">
                                      {formatMetricValue(data, metricConfig)}
                                    </div>
                                  </div>
                                ) : data ? (
                                  renderChart(metricKey, metricConfig, data)
                                ) : (
                                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <span className="text-sm text-gray-500">
                                      No data available
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CarouselItem>
                        );
                      },
                    )}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
