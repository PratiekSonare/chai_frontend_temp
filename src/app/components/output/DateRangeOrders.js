import { useState, useCallback, useEffect } from "react";
import MetricCarouselOrder from "./standard/MetricCarouselOrder";
import DataTableComponent from "../table/DataTableComponent";
import DatePickerDropdown from "../DatePickerDropdown";
import { apiUrl } from "@/lib/api";

export default function DateRangeOrders({ orderType }) {
  // Helper functions for date calculations
  const getDateNDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
  };

  const getYesterdayDate = () => getDateNDaysAgo(1);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [finalMetrics, setFinalMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Preset date range handlers
  const handleYesterday = useCallback(() => {
    const yesterday = getYesterdayDate();
    setStartDate(yesterday);
    setEndDate(yesterday);
  }, []);

  const handleLastWeek = useCallback(() => {
    const endDate = getYesterdayDate();
    const startDate = getDateNDaysAgo(7);
    setStartDate(startDate);
    setEndDate(endDate);
  }, []);

  const handleLastMonth = useCallback(() => {
    const endDate = getYesterdayDate();
    const startDate = getDateNDaysAgo(30);
    setStartDate(startDate);
    setEndDate(endDate);
  }, []);

  const fetchOrdersData = useCallback(async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    setLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const payload = {
        start_date: startDate,
        end_date: endDate,
      };
      if (orderType) {
        payload.order_type = orderType;
      }

      const response = await fetch(apiUrl("/orders/by-date-range"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      setSearchData(data.orders || []);
      setFinalMetrics(data.metrics || null);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to fetch orders data");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, orderType]);

  // Auto-fetch when preset dates are selected
  useEffect(() => {
    if (startDate && endDate) {
      fetchOrdersData();
    }
  }, [startDate, endDate, fetchOrdersData]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    fetchOrdersData();
  }, [fetchOrdersData]);

  const tableData = {
    query_type: "date_range",
    data: searchData || [],
    summarized_query: `Orders from ${startDate} to ${endDate}`,
  };

  return (
    <div className="w-full h-screen overflow-y-scroll flex flex-col gap-2">
      <div className="w-full flex-1 flex flex-col justify-center items-center gap-2 px-10 min-h-0">
        <div className="absolute top-2 right-2">
          <DatePickerDropdown
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onFetch={fetchOrdersData}
            onRefresh={handleRefresh}
            onYesterday={handleYesterday}
            onLastWeek={handleLastWeek}
            onLastMonth={handleLastMonth}
            loading={loading}
            isSuccess={isSuccess}
          />
        </div>

        {/* Results Section */}
        {isSuccess && !loading && (
          <div className="w-full h-full flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
            {finalMetrics && (
              <div className="">
                <MetricCarouselOrder
                  key={`metrics-${refreshKey}`}
                  metrics={finalMetrics}
                  searchData={searchData}
                  isSuccess={isSuccess}
                />
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-auto">
              <DataTableComponent
                key={`datatable-${refreshKey}`}
                data={tableData}
                summarized_query={tableData.summarized_query}
              />
            </div>
          </div>
        )}

        {!isSuccess && !loading && (
          <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 w-fit h-fit min-h-0 flex items-center justify-center rounded-2xl border-2 drop-shadow-xl border-blue-200 p-10 text-center max-w-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h3 className="poppins font-bold text-xl text-gray-800">
                Get Started with Date Range Orders
              </h3>

              <div className="flex flex-col gap-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <p className="text-left">
                    Open the{" "}
                    <span className="font-semibold text-blue-600">
                      Date Picker
                    </span>{" "}
                    and select a start and end date, or use a{" "}
                    <span className="font-semibold text-blue-600">
                      time preset
                    </span>{" "}
                    like Yesterday, Last Week, or Last Month.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <p className="text-left">
                    Click{" "}
                    <span className="font-semibold text-blue-600">
                      Fetch Orders
                    </span>{" "}
                    to instantly retrieve all orders within your selected date
                    range.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <p className="text-left">
                    Browse the{" "}
                    <span className="font-semibold text-blue-600">
                      metrics carousel
                    </span>{" "}
                    for a quick overview, then click on any order row to view
                    full details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-gray-50 flex-1 min-h-0 w-full flex items-center justify-center rounded-lg border-4 border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600">Loading orders data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
