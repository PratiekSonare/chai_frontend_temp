/* eslint-disable @next/next/no-img-element */
"use client";

import DotField from "../components/DotField";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useMachine } from "@xstate/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Sidebar from "./components/sidebar/Sidebar";
import Down from "./components/down";
import Development from "./components/development";
import Active from "./components/active";
import Searchbar from "./components/searchbar";
import QuickLinks from "./components/quickLinks";
import Header from "./components/header";
import { searchMachine } from "../lib/searchMachine";
import {
  LoadingComponent,
  ErrorComponent,
  EmptyStateComponent,
} from "./components/StateComponents";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

import Standard from "./components/output/standard/Standard";
import Comparison from "./components/output/comparison/Comparison";
import MetricAnalysis from "./components/output/metric_analysis/MetricAnalysis";
import SchemaDiscovery from "./components/output/schema_discovery/SchemaDiscovery";
import CustomMetricGeneration from "./components/output/custom_metric_generation/CustomMetricGeneration";
import QueryDetails from "./components/QueryDetails";
import { apiUrl } from "@/lib/api";

import OrdersPage from "./orders/page";
import SkuInsightsCards from "./components/SkuInsightsCards";

import gsap from "gsap";
gsap.registerPlugin(ScrollTrigger);

// const [searchState, setSearchState] = useState(standardState);

import { DataGrid } from "react-data-grid";

const columns = [
  { key: "id", name: "ID" },
  { key: "title", name: "Title" },
];

const rows = [
  { id: 0, title: "Example" },
  { id: 1, title: "Demo" },
];

export default function Home() {
  const placeholder_list = [
    "Compare orders between Maharashtra and Telangana from the past 3 days.",
    "Fetch orders from 1st Jan to 8th Feb of SKU 11400-255-8.",
    "What are the different payment methods available?",
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [status, setStatus] = useState("development");
  const [inputValue, setInputValue] = useState("");
  const [searchState, sendSearch] = useMachine(searchMachine);
  const chartInstancesRef = useRef({});

  const [metricsLoading, setMetricsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchbarRef = useRef(null);
  const searchResultsRef = useRef(null);
  const logSinceRef = useRef(0);

  const isLoading = searchState.matches("loading");
  const isSuccess = searchState.matches("success");
  const isError = searchState.matches("failure");
  const searchError = searchState.context?.error;
  const requestId = searchState.context?.requestId;
  const workflowLogs = searchState.context?.logs || [];

  // Get the actual data based on the new nested structure
  const searchData = searchState?.context.data?.data?.data;
  const finalMetrics = searchState?.context.metrics;
  const searchType = searchState?.context.data?.query_type;
  const summarizedQuery = searchState?.context.data?.summarized_query;

  // Comparison query specific data
  const comparisonFilter =
    isSuccess &&
    searchType === "comparison" &&
    searchState?.context.data?.comparison_data?.comparison_param;
  const comparisonType =
    isSuccess &&
    searchType === "comparison" &&
    searchState?.context.data?.comparison_data?.comparison_type;
  const detailedMetrics =
    isSuccess &&
    searchType === "comparison" &&
    searchState?.context.data?.detailed_metrics;

  // Metric analysis query specific data
  const metric_analysis =
    isSuccess &&
    (searchType === "metric_analysis" ||
      searchType === "custom_metric_generation") &&
    searchState?.context.data?.analysis;
  const metric_calculated =
    isSuccess &&
    (searchType === "metric_analysis" ||
      searchType === "custom_metric_generation") &&
    searchState?.context.data?.metrics;

  // Schema discovery query specific data
  const field_info =
    isSuccess &&
    searchType === "schema_discovery" &&
    searchState?.context.data?.data?.field_info;
  const field =
    isSuccess &&
    searchType === "schema_discovery" &&
    searchState?.context.data?.data?.field;

  const latestLog = workflowLogs.length
    ? workflowLogs[workflowLogs.length - 1]
    : null;

  const currentStep = latestLog?.summary || "Planning execution...";
  const nextStep = latestLog?.status === "PENDING" ? latestLog?.summary : null;

  const notifyCancel = useCallback(
    (activeRequestId, reason = "client_cancelled", preferBeacon = false) => {
      if (!activeRequestId) {
        return;
      }

      const cancelUrl = apiUrl(`/query/${activeRequestId}/cancel`);
      const payload = JSON.stringify({ reason });

      if (
        preferBeacon &&
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function"
      ) {
        const sent = navigator.sendBeacon(
          cancelUrl,
          new Blob([payload], { type: "application/json" }),
        );
        if (sent) {
          return;
        }
      }

      fetch(cancelUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
        keepalive: true,
      }).catch((error) => {
        console.error("Failed to send cancellation request:", error);
      });
    },
    [],
  );

  // Debug logging for state changes and scroll to results
  useEffect(() => {
    console.log("Search state changed:", {
      context: searchState.context,
      isLoading,
      isSuccess,
      isError,
    });

    // Scroll to search results when state changes (indicates POST request)
    if (
      (isLoading || isSuccess || isError) &&
      searchResultsRef.current &&
      !metricsLoading
    ) {
      searchResultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [searchState.state, isLoading, isSuccess, isError]);

  useEffect(() => {
    logSinceRef.current = 0;
  }, [requestId]);

  useEffect(() => {
    if (!isLoading || !requestId) {
      return;
    }

    let active = true;
    const pollController = new AbortController();
    let since = Number(logSinceRef.current || 0);

    const pollLogs = async () => {
      try {
        const response = await fetch(
          apiUrl(`/query/logs/${requestId}?since=${since}`),
          {
            signal: pollController.signal,
          },
        );
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const logs = Array.isArray(payload?.logs) ? payload.logs : [];

        if (logs.length) {
          sendSearch({ type: "APPEND_LOGS", logs });
        }

        const nextSequence = Number(payload?.next_sequence || since);
        since = Math.max(since, nextSequence);
        logSinceRef.current = since;
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
        console.error("Log polling failed:", error);
      }
    };

    pollLogs();
    const timer = setInterval(() => {
      if (!active) {
        return;
      }
      pollLogs();
    }, 1000);

    return () => {
      active = false;
      pollController.abort();
      clearInterval(timer);
    };
  }, [isLoading, requestId, sendSearch]);

  useEffect(() => {
    if (!isLoading || !requestId) {
      return;
    }

    const onPageExit = () => {
      notifyCancel(requestId, "page_unload", true);
    };

    window.addEventListener("pagehide", onPageExit);
    window.addEventListener("beforeunload", onPageExit);

    return () => {
      window.removeEventListener("pagehide", onPageExit);
      window.removeEventListener("beforeunload", onPageExit);
    };
  }, [isLoading, requestId, notifyCancel]);

  // Calculate metrics when search data is available for standard queries
  useEffect(() => {
    const metricsController = new AbortController();
    let disposed = false;

    const calculateMetrics = async () => {
      if (
        isSuccess &&
        searchData &&
        searchData.length > 0 &&
        searchType === "standard"
      ) {
        setMetricsLoading(true);
        try {
          const response = await fetch(apiUrl("/orders/metrics"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            signal: metricsController.signal,
            body: JSON.stringify({
              orders: searchData,
            }),
          });

          if (response.ok) {
            const metrics = await response.json();
            sendSearch({ type: "SET_METRICS", metrics });
          } else {
            console.error("Failed to calculate metrics:", response.statusText);
          }
        } catch (error) {
          if (error?.name === "AbortError") {
            return;
          }
          console.error("Error calculating metrics:", error);
        } finally {
          if (!disposed) {
            setMetricsLoading(false);
            console.log("succ state: ", searchState.context);
          }
        }
      } else {
        console.log("❌ CONDITIONS NOT MET - API call skipped");
        console.log("failed state: ", searchState.context);
      }
    };

    calculateMetrics();

    return () => {
      disposed = true;
      metricsController.abort();
    };
  }, [isSuccess, searchData, searchType, sendSearch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(
        (prevIndex) => (prevIndex + 1) % placeholder_list.length,
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = useCallback(
    (inputValue) => {
      if (isLoading) {
        return;
      }

      if (inputValue.trim()) {
        console.log("Search initiated with:", inputValue);
        sendSearch({ type: "SEARCH", query: inputValue.trim() });
      }
    },
    [isLoading, sendSearch],
  );

  const handleCancel = useCallback(() => {
    console.log("Search cancelled");
    notifyCancel(requestId, "manual_cancel");
    sendSearch({ type: "CANCEL" });
  }, [notifyCancel, requestId, sendSearch]);

  const handleRetry = useCallback(() => {
    sendSearch({ type: "RETRY" });
  }, [sendSearch]);

  const handleReset = useCallback(() => {
    sendSearch({ type: "RESET" });
    setInputValue("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sendSearch]);

  const handleRefreshComponents = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Create payment doughnut chart
  const createPaymentChart = useCallback((canvasRef, metrics, stateName) => {
    if (!canvasRef || !metrics?.payment_mode_distribution) return;

    // Destroy existing chart for this state
    if (chartInstancesRef.current[stateName]) {
      chartInstancesRef.current[stateName].destroy();
    }

    Chart.register(ChartDataLabels);

    const paymentData = metrics.payment_mode_distribution;
    const totalPayments = Object.values(paymentData).reduce((a, b) => a + b, 0);

    chartInstancesRef.current[stateName] = new Chart(canvasRef, {
      type: "doughnut",
      data: {
        labels: Object.keys(paymentData),
        datasets: [
          {
            data: Object.values(paymentData),
            backgroundColor: [
              "#0024af", // COD - Blue-600
              "#2387e4", // PrePaid - Blue-600 lighter
              "rgba(37, 99, 235, 0.4)", // Online - Blue-600 lighter
              "rgba(37, 99, 235, 0.2)", // Others - Blue-600 lightest
            ],
            borderColor: [
              "rgba(29, 78, 216, 1)", // Blue-700
              "rgba(30, 64, 175, 1)", // Blue-800
              "rgba(30, 58, 138, 1)", // Blue-900
              "rgba(37, 99, 235, 1)", // Blue-600
            ],
            borderWidth: 1,
            rotation: -90,
            circumference: 180,
            hoverOffset: 15,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const percentage =
                  totalPayments > 0
                    ? ((context.parsed / totalPayments) * 100).toFixed(1)
                    : 0;
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              },
            },
          },
          datalabels: {
            display: true,
            formatter: function (value, context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${percentage}%`;
            },
            font: {
              size: 10,
              weight: "bold",
              family: "Poppins",
            },
            color: "#fff",
            anchor: "center",
            align: "center",
          },
        },
        animation: {
          animateRotate: true,
          duration: 1000,
          easing: "easeOutQuart",
        },
      },
    });
  }, []);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      Object.values(chartInstancesRef.current).forEach((chart) => {
        if (chart) chart.destroy();
      });
    };
  }, []);

  return (
    <div className="overflow-hidden h-screen">
      <Sidebar onHoverChange={setSidebarHovered} />
      <div className="h-screen bg-[#001fb0] p-5 pt-0">
        <div className="relative landing-sdw overflow-hidden bg-zinc-50 font-sans rounded-t-4xl">
          <div className="flex flex-row gap-2 z-50! fixed bottom-5 right-5">
            <Button
              variant="outline"
              className="!rounded-full active:scale-80 scale-100 transition-all duration-75 ease-in"
              onClick={handleRefreshComponents}
            >
              ↻
            </Button>
          </div>

          {/* background dotfield */}
          <div className="absolute inset-0.5 z-0 opacity-70">
            <DotField
              dotRadius={3}
              dotSpacing={20}
              bulgeStrength={500}
              glowRadius={0}
              sparkle={true}
              waveAmplitude={0}
              cursorRadius={50}
              cursorForce={0.1}
              bulgeOnly={true}
              gradientFrom="#A855F7"
              gradientTo="#001FB0"
              glowColor="#000000"
            />
          </div>

          {/* main content */}
          <div
            className={`relative no-scrollbar z-10 h-screen flex flex-col items-center overflow-y-auto scroll-smooth pointer-events-none`}
          >
            {/* Re-enabling pointer events for child elements so they stay interactive */}
            <div className="w-full flex-col flex items-center pointer-events-auto">
              <Header />

              <div className="flex flex-col justify-center items-center min-h-screen w-full">
                {status === "active" ? (
                  <Active />
                ) : status === "development" ? (
                  <Development />
                ) : (
                  <Down />
                )}

                <div className="flex flex-col justify-center items-center w-full">
                  <img
                    className="w-1/2"
                    src="./data_portal_new.png"
                    alt="grid"
                  />
                </div>

                <div className="my-2"></div>

                {/* searchbar */}
                <Searchbar
                  searchbarRef={searchbarRef}
                  placeholder={placeholder_list[placeholderIndex]}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  onSearch={handleSearch}
                  isError={isError}
                  isLoading={isLoading}
                  isSuccess={isSuccess}
                />

                <div className="my-2"></div>

                <QuickLinks />

                {/* <SkuInsightsCards /> */}
              </div>

              <img
                src="./chupps_life.png"
                className="w-1/12 animate-bounce mt-12 mb-24 pointer-events-auto"
                alt="Chupps Life"
              />

              <div
                ref={searchResultsRef}
                className="bg-zinc-50 border-t-2 border-[#001FB0] w-full max-w-full min-h-screen flex flex-col justify-center items-center mx-auto px-4 shrink-0 pointer-events-auto"
              >
                {isLoading && (
                  <LoadingComponent
                    onCancel={handleCancel}
                    requestId={requestId}
                    logs={workflowLogs}
                    currentStep={currentStep}
                    nextStep={nextStep}
                  />
                )}

                {isError && (
                  <ErrorComponent
                    error={searchError}
                    onRetry={handleRetry}
                    onReset={handleReset}
                  />
                )}

                {isSuccess && searchType === "standard" && (
                  <Standard
                    isSuccess={isSuccess}
                    searchData={searchData}
                    finalMetrics={finalMetrics}
                    metricsLoading={metricsLoading}
                    refreshKey={refreshKey}
                    summarizedQuery={summarizedQuery}
                  />
                )}

                {isSuccess && searchType === "comparison" && (
                  <Comparison
                    createPaymentChart={createPaymentChart}
                    isSuccess={isSuccess}
                    searchData={searchState?.context.data}
                    searchType={searchType}
                    comparisonType={comparisonType}
                    searchFilter={comparisonFilter}
                    detailedMetrics={detailedMetrics}
                    refreshKey={refreshKey}
                  />
                )}

                {isSuccess && searchType === "metric_analysis" && (
                  <MetricAnalysis
                    metric_analysis={metric_analysis}
                    metric_calculated={metric_calculated}
                  />
                )}

                {isSuccess && searchType === "schema_discovery" && (
                  <SchemaDiscovery field={field} field_info={field_info} />
                )}

                {isSuccess && searchType === "custom_metric_generation" && (
                  <CustomMetricGeneration
                    metric_analysis={metric_analysis}
                    metric_calculated={metric_calculated}
                  />
                )}

                {isSuccess &&
                  searchType === "standard" &&
                  Array.isArray(searchData) &&
                  searchData.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        No results found for your search.
                      </p>
                      <button
                        onClick={handleReset}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Try a different search
                      </button>
                    </div>
                  )}

                {!isLoading && !isSuccess && !isError && (
                  <>
                    <EmptyStateComponent />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
