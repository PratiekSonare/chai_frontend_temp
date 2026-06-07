"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import DataTableComponent from "../components/table/DataTableComponent";
import DatePickerDropdown from "../components/DatePickerDropdown";
import { SemiCircle } from "../components/SemiCircle";
import DotField from "@/components/DotField";
import { apiUrl } from "@/lib/api";

// ============ DATE UTILITY FUNCTIONS ============
function getYesterdayRange() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0];
  return { start_date: dateStr, end_date: dateStr };
}

function getLastWeekRange() {
  const end = new Date();
  end.setDate(end.getDate() - 1); // Yesterday
  const start = new Date(end);
  start.setDate(start.getDate() - 6); // 7 days back
  return {
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
  };
}

function getLastMonthRange() {
  const end = new Date();
  end.setDate(end.getDate() - 1); // Yesterday
  const start = new Date(end);
  start.setDate(start.getDate() - 29); // 30 days back
  return {
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
  };
}

// ============ RISK SUMMARY CARD COMPONENT ============
function RiskSummaryCard({
  selectedOrder,
  prediction,
  isLoadingPrediction,
  predictionError,
}) {
  const getRiskLevel = (probability) => {
    if (probability < 0.3)
      return {
        level: "Low Risk",
        color: "bg-green-100",
        textColor: "text-green-700",
        badge: "🟢",
      };
    if (probability < 0.7)
      return {
        level: "Medium Risk",
        color: "bg-yellow-100",
        textColor: "text-yellow-700",
        badge: "🟡",
      };
    return {
      level: "High Risk",
      color: "bg-red-100",
      textColor: "text-red-700",
      badge: "🔴",
    };
  };

  const isEmpty = !selectedOrder || !prediction;
  const riskData = prediction ? getRiskLevel(prediction.class_1_prob) : null;
  const riskPercentage = prediction
    ? Math.round(prediction.class_1_prob * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 h-full flex flex-col shadow-lg">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 flex-1">
          <div className="text-center">
            <span className="poppins font-bold text-2xl text-gray-400">--</span>
            <p className="text-gray-500 mt-1 text-xs">
              Select an order from the table to analyze risk
            </p>
          </div>
        </div>
      ) : isLoadingPrediction ? (
        <div className="flex flex-col items-center justify-center gap-3 flex-1">
          <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-600 text-xs">Running risk prediction...</p>
        </div>
      ) : predictionError ? (
        <div className="flex flex-col items-center justify-center gap-2 flex-1">
          <div className="text-red-600 text-xs text-center">
            <p className="font-medium">Error analyzing order</p>
            <p className="text-xs mt-1">{predictionError}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-row flex-1 w-full gap-4 min-h-0">
          {/* Order Details - Left */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto min-h-0 pr-2">
            <div>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2.5">
                <div className="flex justify-between items-center group hover:bg-white transition-colors p-2 rounded">
                  <span className="text-xs font-medium text-gray-600">
                    Order ID
                  </span>
                  <span className="text-xs font-semibold text-gray-900 text-right">
                    {selectedOrder.order_id || "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center group hover:bg-white transition-colors p-2 rounded">
                  <span className="text-xs font-medium text-gray-600">
                    Date
                  </span>
                  <span className="text-xs font-semibold text-gray-900">
                    {selectedOrder.order_date
                      ? new Date(selectedOrder.order_date).toLocaleDateString()
                      : "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center group hover:bg-white transition-colors p-2 rounded">
                  <span className="text-xs font-medium text-gray-600">
                    Marketplace
                  </span>
                  <span className="text-xs font-semibold text-gray-900 text-right max-w-[150px] truncate">
                    {selectedOrder.marketplace || "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center group hover:bg-white transition-colors p-2 rounded">
                  <span className="text-xs font-medium text-gray-600">SKU</span>
                  <span className="text-xs font-mono text-gray-900 text-right max-w-[120px] truncate">
                    {selectedOrder.suborders[0].sku || "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center group hover:bg-white transition-colors p-2 rounded bg-amber-50">
                  <span className="text-xs font-medium text-gray-600">
                    Price
                  </span>
                  <span className="text-xs font-bold text-amber-700">
                    ₹{selectedOrder.suborders[0].selling_price || "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center group hover:bg-white transition-colors p-2 rounded">
                  <span className="text-xs font-medium text-gray-600">
                    State
                  </span>
                  <span className="text-xs font-semibold text-gray-900">
                    {selectedOrder.state || "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center group hover:bg-white transition-colors p-2 rounded">
                  <span className="text-xs font-medium text-gray-600">
                    Payment
                  </span>
                  <span className="text-xs font-semibold text-gray-900">
                    {selectedOrder.payment_mode || "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Score - Right */}
          <div className="flex-1 flex flex-col items-center justify-between gap-4 min-h-0">
            {/* Risk Score Visualization */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Risk Score
              </p>
              <div className="flex items-center justify-center">
                <SemiCircle pct={riskPercentage} size="large" />
              </div>
              <p className="text-center poppins font-bold text-2xl text-gray-900">
                {riskPercentage}%
              </p>
            </div>

            {/* Risk Level Badge */}
            <div
              className={`${riskData.color} ${riskData.textColor} px-4 py-3 rounded-lg text-center font-medium w-full shadow-sm`}
            >
              <div className="text-xl mb-1">{riskData.badge}</div>
              <div className="text-sm font-bold">{riskData.level}</div>
            </div>

            {/* Prediction Details */}
            <div className="flex flex-col gap-2 w-full">
              <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                <p className="text-xs font-medium text-blue-900">
                  Return
                  {prediction.prediction === 1 ? " Expected" : " Unlikely"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN RISK PAGE COMPONENT ============
export default function Risk() {
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch orders by date range
  const fetchOrdersByDateRange = useCallback(async (dateRange) => {
    setLoading(true);
    setError(null);
    setSelectedOrder(null);
    setPrediction(null);

    try {
      const response = await fetch(apiUrl("/orders/by-date-range"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dateRange),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data = await response.json();
      const ordersList = Array.isArray(data) ? data : data.orders || [];
      setOrders(ordersList);

      if (ordersList.length === 0) {
        setError("No orders found for this date range");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run prediction on selected order
  const runPrediction = useCallback(async (order) => {
    setIsLoadingPrediction(true);
    setPredictionError(null);

    try {
      const response = await fetch(apiUrl("/predict"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_data: order }),
      });

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setPrediction(data);
      } else {
        setPredictionError(data.message || "Prediction failed");
      }
    } catch (err) {
      console.error("Error running prediction:", err);
      setPredictionError(err.message || "Failed to run prediction");
    } finally {
      setIsLoadingPrediction(false);
    }
  }, []);

  // Handle order selection from table
  const handleSelectOrder = useCallback(
    (order) => {
      setSelectedOrder(order);

      console.log("selected order: ", order);

      runPrediction(order);
    },
    [runPrediction],
  );

  // Handle date preset callbacks
  const handleYesterday = useCallback(() => {
    const range = getYesterdayRange();
    setStartDate(range.start_date);
    setEndDate(range.end_date);
    void fetchOrdersByDateRange(range);
    setIsSuccess(false);
  }, [fetchOrdersByDateRange]);

  const handleLastWeek = useCallback(() => {
    const range = getLastWeekRange();
    setStartDate(range.start_date);
    setEndDate(range.end_date);
    void fetchOrdersByDateRange(range);
    setIsSuccess(false);
  }, [fetchOrdersByDateRange]);

  const handleLastMonth = useCallback(() => {
    const range = getLastMonthRange();
    setStartDate(range.start_date);
    setEndDate(range.end_date);
    void fetchOrdersByDateRange(range);
    setIsSuccess(false);
  }, [fetchOrdersByDateRange]);

  // Handle custom date fetch
  const handleFetchOrders = useCallback(() => {
    if (!startDate || !endDate) {
      setPredictionError("Please select both start and end dates");
      return;
    }
    void fetchOrdersByDateRange({
      start_date: startDate,
      end_date: endDate,
    });
    setIsSuccess(true);
  }, [startDate, endDate, fetchOrdersByDateRange]);

  const handleRefresh = useCallback(() => {
    if (startDate && endDate) {
      void fetchOrdersByDateRange({
        start_date: startDate,
        end_date: endDate,
      });
    }
  }, [startDate, endDate, fetchOrdersByDateRange]);

  // Load yesterday's data on mount
  useEffect(() => {
    const yesterdayRange = getYesterdayRange();
    void fetchOrdersByDateRange(yesterdayRange);
  }, [fetchOrdersByDateRange]);

  return (
    <div className="overflow-hidden h-screen">
      {/* Sidebar */}
      <Sidebar onHoverChange={setSidebarHovered} />
      <div className="h-screen bg-[#001fb0] p-5 pt-0">
        <div className="relative landing-sdw overflow-hidden h-[calc(100vh-1.25rem)] bg-zinc-50 font-sans rounded-t-4xl !pointer-events-auto flex flex-col">
          {/* background dotfield */}
          <div className="absolute inset-0.5 z-0 opacity-70">
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

          {/* Main Content */}
          <div
            className={`relative ${
              sidebarHovered ? "pl-[6.5%]" : "pl-[4%]"
            } transition-[margin] duration-100 ease-in flex-1 w-full flex flex-col overflow-hidden`}
          >
            {/* Main Container - Flex Column */}
            <div className="flex-1 flex flex-col overflow-hidden px-6 py-4 gap-4">
              {/* Top Section: Risk Analysis & Date Selection (Left) + Risk Summary (Right) */}
              <div className="flex flex-row justify-between gap-4 h-80">
                {/* Left Side: Risk Analysis & Date Selection */}
                <div className="flex flex-col gap-3 flex-1">
                  {/* Header */}
                  <div className="flex flex-col items-start text-left gap-2">
                    <span className="poppins font-extrabold text-3xl">
                      Risk Analysis
                    </span>
                    <span className="poppins text-lg text-gray-500">
                      Analyze order return risk scores using ML predictions
                    </span>
                  </div>

                  <DatePickerDropdown
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    onFetch={handleFetchOrders}
                    onRefresh={handleRefresh}
                    onYesterday={handleYesterday}
                    onLastWeek={handleLastWeek}
                    onLastMonth={handleLastMonth}
                    loading={loading}
                    isSuccess={isSuccess}
                  />

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded flex-shrink-0">
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  )}
                </div>

                {/* Right Side: Risk Summary Card */}
                <div className="flex-1/3 flex flex-col shrink-0 h-full min-h-0">
                  <h2 className="poppins font-bold text-lg mb-2">
                    Risk Summary
                  </h2>
                  <div className="flex-1 overflow-y-auto rounded-lg shadow-lg min-h-0">
                    <RiskSummaryCard
                      selectedOrder={selectedOrder}
                      prediction={prediction}
                      isLoadingPrediction={isLoadingPrediction}
                      predictionError={predictionError}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Section: Data Table */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {loading ? (
                  <div className="w-full flex-1 min-h-0 flex items-center justify-center">
                    <div className="w-full max-w-3xl bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <svg
                          className="w-8 h-8 text-blue-600 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>

                        <div className="flex-1">
                          <p className="text-gray-800 font-semibold">
                            Loading inventory...
                          </p>
                          <p className="text-sm text-gray-500">
                            Fetching orders for cancellation risk estimation —
                            this may take a few seconds.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden flex flex-col flex-1 min-h-0">
                    {/* <h2 className="mx-auto poppins font-bold text-lg mb-2 shrink-0">
                      {orders.length} orders found • Click on any row to analyze
                      risk
                    </h2> */}
                    <div className="flex-1 overflow-y-hidden">
                      <DataTableComponent
                        data={orders}
                        title="ORDERS"
                        summarized_query={`${orders.length} orders`}
                        columnKeys={[
                          "order_id",
                          "order_date",
                          "marketplace",
                          "sku",
                          "suborder_selling_price",
                          "state",
                          "payment_mode",
                        ]}
                        onRowSelect={handleSelectOrder}
                        showOrderModal={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
