import { useState, useCallback, useRef, useEffect } from "react";
import { apiUrl, fetchMetricsFromS3 } from "@/lib/api";
import { METRICS_CONFIG } from "../utils/metricsConfig";

/**
 * Detect if date range matches a preset (7d, 30d, all-time)
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {boolean} hasFilters - Whether filters are applied
 * @returns {string|null} - Preset name ("7d", "30d", "all") or null
 */
const detectPreset = (startDate, endDate, hasFilters) => {
  // No preset detection if filters are applied
  if (hasFilters) {
    return null;
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));

    // 7-day preset: exactly 7 days
    if (daysDiff === 6) {
      // 6 days apart = 7 days inclusive
      const now = new Date();
      const expected7dStart = new Date(now);
      expected7dStart.setDate(expected7dStart.getDate() - 6);
      expected7dStart.setHours(0, 0, 0, 0);

      const actualStart = new Date(startDate);
      actualStart.setHours(0, 0, 0, 0);

      if (Math.abs(expected7dStart - actualStart) < 86400000) {
        // Within 1 day tolerance
        return "7d";
      }
    }

    // 30-day preset: exactly 30 days
    if (daysDiff === 29) {
      // 29 days apart = 30 days inclusive
      const now = new Date();
      const expected30dStart = new Date(now);
      expected30dStart.setDate(expected30dStart.getDate() - 29);
      expected30dStart.setHours(0, 0, 0, 0);

      const actualStart = new Date(startDate);
      actualStart.setHours(0, 0, 0, 0);

      if (Math.abs(expected30dStart - actualStart) < 86400000) {
        // Within 1 day tolerance
        return "30d";
      }
    }

    // All-time preset: start date is very old (before 2025-10-01)
    const actualStart = new Date(startDate);
    if (actualStart < new Date("2025-10-01")) {
      const now = new Date();
      const endDate_ = new Date(endDate);
      const daysDiff_ = Math.abs(now - endDate_) / (1000 * 60 * 60 * 24);
      if (daysDiff_ <= 2) {
        // End date is recent (within 2 days)
        return "all";
      }
    }
  } catch (error) {
    console.warn("Error detecting preset:", error);
  }

  return null;
};

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

export const useFetchMetric = (startDate, endDate, buildFilters) => {
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
    [startDate, endDate, buildFilters, setMetricsData, setMetricsLoading],
  );

  const fetchAllMetricsAtOnce = useCallback(
    async (metricsConfig, dateRange = {}) => {
      const resolvedStartDate = dateRange.startDate || startDate;
      const resolvedEndDate = dateRange.endDate || endDate;

      if (!metricsConfig) {
        console.warn(
          "metricsConfig is undefined or null in fetchAllMetricsAtOnce",
        );
        return;
      }

      const allMetricKeys = Object.values(metricsConfig).flatMap((cat) =>
        Object.keys(cat?.metrics || {}),
      );
      const loadingMap = {};
      allMetricKeys.forEach((key) => {
        loadingMap[key] = true;
      });
      setMetricsLoading(loadingMap);

      try {
        // Build filters from current filter state
        const builtFilters = buildFilters();
        const hasFilters = Object.keys(builtFilters).length > 0;

        // Detect if query matches a preset (7d/30d/all-time) with no filters
        const preset = detectPreset(
          resolvedStartDate,
          resolvedEndDate,
          hasFilters,
        );

        console.log(
          `📊 Fetching metrics (${resolvedStartDate} to ${resolvedEndDate})`,
          {
            preset,
            hasFilters,
            filterCount: Object.keys(builtFilters).length,
          },
        );

        // Try S3 fetch first if preset detected and no filters
        if (preset && !hasFilters) {
          console.log(`🔄 Attempting to fetch ${preset} metrics from S3...`);
          const s3Metrics = await fetchMetricsFromS3();

          if (s3Metrics && s3Metrics[preset]) {
            // Successfully fetched from S3
            const presetMetrics = s3Metrics[preset];
            const newMetricsData = {};
            const newMetricsLoading = {};

            if (presetMetrics.success && presetMetrics.data) {
              Object.entries(presetMetrics.data).forEach(
                ([categoryKey, categoryMetrics]) => {
                  Object.entries(categoryMetrics).forEach(
                    ([metricKey, metricResult]) => {
                      const normalizedResult = {
                        success: metricResult.success,
                        data:
                          metricResult.data !== undefined
                            ? metricResult.data
                            : metricResult.value,
                      };
                      if (metricResult.chart) {
                        normalizedResult.chart = metricResult.chart;
                      }
                      newMetricsData[metricKey] = normalizedResult;
                      newMetricsLoading[metricKey] = false;
                    },
                  );
                },
              );

              setMetricsData(newMetricsData);
              setMetricsLoading(newMetricsLoading);
              console.log("✅ Metrics loaded from S3");
              return;
            }
          }
          console.log(
            "⚠️  S3 fetch failed or data incomplete, falling back to API",
          );
        }

        // Fallback to API (for filtered queries or S3 failure)
        const payload = {
          start_date: `${resolvedStartDate} 00:00:00`,
          end_date: `${resolvedEndDate} 23:59:59`,
          filters: builtFilters,
        };

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

          Object.entries(result.data).forEach(
            ([categoryKey, categoryMetrics]) => {
              Object.entries(categoryMetrics).forEach(
                ([metricKey, metricResult]) => {
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
                },
              );
            },
          );

          setMetricsData(newMetricsData);
          setMetricsLoading(newMetricsLoading);
          console.log("🔴 Metrics loaded from API (live)");
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
    [startDate, endDate, buildFilters, setMetricsData, setMetricsLoading],
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
