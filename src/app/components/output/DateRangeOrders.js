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
    <div className="w-full h-screen flex flex-col gap-2 p-3">
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-2 px-10">
        <div className="flex flex-col items-center">
          <span className="poppins font-extrabold text-2xl">
            Extract Orders
          </span>
          <span className="poppins text-sm text-gray-500">
            Fetch orders and analyze performance in seconds.
          </span>

          {error && (
            <p className="bg-red-50 text-red-600 text-sm mt-2">({error})</p>
          )}

          {isSuccess && (
            <p className="bg-green-50 text-green-600 text-sm mt-2">
              (Loaded {searchData.length} orders from {startDate} to {endDate})
            </p>
          )}
        </div>

        <div className="z-100 absolute top-0 right-0">
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
          <div className="w-full h-full">
            {finalMetrics && (
              <MetricCarouselOrder
                key={`metrics-${refreshKey}`}
                metrics={finalMetrics}
                searchData={searchData}
                isSuccess={isSuccess}
              />
            )}

            <DataTableComponent
              key={`datatable-${refreshKey}`}
              data={tableData}
              summarized_query={tableData.summarized_query}
            />
          </div>
        )}

        {!isSuccess && !loading && (
          <div className="bg-gray-50 my-auto h-[70%] w-full flex items-center justify-center rounded-lg border-4 border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600 text-xl">
              Click &ldquo;Fetch Orders&rdquo; to load data for the selected
              date range
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-gray-50 my-auto h-[70%] w-full flex items-center justify-center rounded-lg border-4 border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600">Loading orders data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
