import { useState, useCallback, useRef, useEffect } from "react";
import { apiUrl } from "@/lib/api";
import { METRICS_CONFIG } from "../utils/metricsConfig";

export const useMetricsData = () => {
  const [metricsData, setMetricsData] = useState({});
  const [metricsLoading, setMetricsLoading] = useState({});
  const [metricsConfig, setMetricsConfig] = useState(METRICS_CONFIG);

  return {
    metricsData,
    setMetricsData,
    metricsLoading,
    setMetricsLoading,
  };
};

export const useFetchMetric = (
  startDate,
  endDate,
  buildFilters
) => {
  const { metricsData, setMetricsData, metricsLoading, setMetricsLoading } =
    useMetricsData();

  const fetchMetric = useCallback(
    async (metricKey, configData, dateRange = {}) => {
      const resolvedStartDate = dateRange.startDate || startDate;
      const resolvedEndDate = dateRange.endDate || endDate;

      if (!configData?.endpoint) return;

      setMetricsLoading((prev) => ({ ...prev, [metricKey]: true }));

      try {
        const payload = {
          start_date: `${resolvedStartDate} 00:00:00`,
          end_date: `${resolvedEndDate} 23:59:59`,
          filters: buildFilters(),
        };

        const response = await fetch(apiUrl(configData.endpoint), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Metric fetch failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          const normalizedResult = {
            ...result,
            data: result.data !== undefined ? result.data : result.value,
          };

          setMetricsData((prev) => ({
            ...prev,
            [metricKey]: normalizedResult,
          }));
        } else {
          console.warn(`Metric ${metricKey} returned success: false`, result);
        }
      } catch (error) {
        console.error(`Error fetching metric ${metricKey}:`, error);
      } finally {
        setMetricsLoading((prev) => ({ ...prev, [metricKey]: false }));
      }
    },
    [startDate, endDate, buildFilters, setMetricsData, setMetricsLoading]
  );

  const fetchAllMetricsAtOnce = useCallback(
    async (metricsConfig, dateRange = {}) => {
      const resolvedStartDate = dateRange.startDate || startDate;
      const resolvedEndDate = dateRange.endDate || endDate;

      if (!metricsConfig) {
        console.warn("metricsConfig is undefined or null in fetchAllMetricsAtOnce");
        return;
      }

      const allMetricKeys = Object.values(metricsConfig).flatMap((cat) =>
        Object.keys(cat?.metrics || {})
      );
      const loadingMap = {};
      allMetricKeys.forEach((key) => {
        loadingMap[key] = true;
      });
      setMetricsLoading(loadingMap);

      try {
        // Build filters from current filter state
        const builtFilters = buildFilters();
        
        const payload = {
          start_date: `${resolvedStartDate} 00:00:00`,
          end_date: `${resolvedEndDate} 23:59:59`,
          filters: builtFilters,
        };
        
        // Debug: Log filters being applied
        const hasFilters = Object.keys(builtFilters).length > 0;
        console.log(`📊 Fetching metrics (${resolvedStartDate} to ${resolvedEndDate})`, {
          hasFilters,
          filterCount: Object.keys(builtFilters).length,
          filters: builtFilters,
        });

        const response = await fetch(apiUrl("/history/batch/all-metrics"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Batch fetch failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          const newMetricsData = {};
          const newMetricsLoading = {};

          Object.entries(result.data).forEach(([categoryKey, categoryMetrics]) => {
            Object.entries(categoryMetrics).forEach(([metricKey, metricResult]) => {
              const normalizedResult = {
                success: metricResult.success,
                data:
                  metricResult.data !== undefined
                    ? metricResult.data
                    : metricResult.value,
              };
              // Include embedded chart data if present
              if (metricResult.chart) {
                normalizedResult.chart = metricResult.chart;
              }
              newMetricsData[metricKey] = normalizedResult;
              newMetricsLoading[metricKey] = false;
            });
          });

          setMetricsData(newMetricsData);
          setMetricsLoading(newMetricsLoading);
        } else {
          console.warn("Batch fetch returned success: false", result);
          const clearedLoading = {};
          allMetricKeys.forEach((key) => {
            clearedLoading[key] = false;
          });
          setMetricsLoading(clearedLoading);
        }
      } catch (error) {
        console.error("Error fetching batch metrics:", error);
        const clearedLoading = {};
        allMetricKeys.forEach((key) => {
          clearedLoading[key] = false;
        });
        setMetricsLoading(clearedLoading);
      }
    },
    [startDate, endDate, buildFilters, setMetricsData, setMetricsLoading]
  );

  return {
    metricsData,
    setMetricsData,
    metricsLoading,
    setMetricsLoading,
    fetchMetric,
    fetchAllMetricsAtOnce,
  };
};
