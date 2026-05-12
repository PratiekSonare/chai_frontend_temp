import { useState, useCallback, useEffect } from "react";
import MetricCarouselOrder from "./standard/MetricCarouselOrder";
import DataTableComponent from "../table/DataTableComponent";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";

export default function DateRangeOrders({ orderType }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [finalMetrics, setFinalMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
    <div className="w-full h-screen flex flex-col gap-4 p-5">
      {/* Date Filter Section */}
      <div className="flex flex-col justify-start gap-10">
        <div className="flex flex-col items-start text-left">
          <span className="poppins font-extrabold text-3xl">
            Extract Orders
          </span>
          <span className="poppins text-lg text-gray-500">
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

        <div className="flex flex-col gap-4 items-end w-fit">
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-row gap-4 flex-1 w-full">
            <Button
              onClick={fetchOrdersData}
              disabled={loading || !startDate || !endDate}
              className="flex-1 w-fit px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Fetch Orders"}
            </Button>

            {isSuccess && (
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="px-4 py-2"
              >
                ↻
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="my-5"></div>

      {/* Results Section */}
      {isSuccess && !loading && (
        <>
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
        </>
      )}

      {!isSuccess && !loading && (
        <div className="bg-gray-50 h-full flex items-center justify-center rounded-lg border-4 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600 text-xl">
            Click "Fetch Orders" to load data for the selected date range
          </p>
        </div>
      )}

      {loading && (
        <div className="bg-gray-50 h-full flex items-center justify-center rounded-lg border-4 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">Loading orders data...</p>
        </div>
      )}
    </div>
  );
}
