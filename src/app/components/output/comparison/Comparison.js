import { useCallback, useMemo } from "react";
import MetricCarouselComp from "./pairwise/MetricCarouselComp";
import ComparisonCarousel from "./pairwise/ComparisonCarousel";
import ComparisonInsight from "./pairwise/ComparisonInsight";
import NewMetricCarouselComp from "./multi_group/NewMetricCarouselComp";
import NewComparisonCarousel from "./multi_group/NewComparisonCarousel";
import NewComparisonInsight from "./multi_group/NewComparisonInsight";

export default function Comparison({
  isSuccess,
  searchData,
  searchType,
  searchFilter,
  comparisonType,
  detailedMetrics,
  metricsLoading,
  createPaymentChart,
  refreshKey,
}) {
  // Helper function to properly capitalize state names
  const capitalizeStateName = useCallback((stateName) => {
    if (!stateName || typeof stateName !== "string") return stateName;
    return stateName
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, []);

  // Generate data from comparison results or use fallback
  const mapData = useMemo(() => {
    if (
      isSuccess &&
      searchType === "comparison" &&
      searchData?.comparison_data
    ) {
      if (comparisonType === "multi_group") {
        // For multi-group comparisons, use group_summaries
        if (searchData.comparison_data.group_summaries) {
          const colors = [
            "#283593",
            "#1E88E5",
            "#42A5F5",
            "#64B5F6",
            "#90CAF9",
          ];
          return Object.entries(searchData.comparison_data.group_summaries).map(
            ([groupName, groupData], index) => ({
              name: capitalizeStateName(groupName),
              value: groupData.order_count || 0,
              color: colors[index] || "#45b7d1",
            }),
          );
        }
      } else if (comparisonType === "pairwise") {
        // For pairwise comparisons, use existing logic
        if (searchFilter === "state") {
          const { groups, order_count } = searchData.comparison_data;
          const colors = ["#283593", "#1E88E5"];

          return Object.entries(groups).map(([key, groupName], index) => ({
            name: capitalizeStateName(groupName),
            value: order_count[key] || 0,
            color: colors[index] || "#45b7d1",
          }));
        } else {
          // For other comparisons (e.g., prepaid vs cod), plot top_states from detailed metrics
          if (detailedMetrics) {
            const groupKeys = Object.keys(detailedMetrics);
            const colors = ["#283593", "#1E88E5"];
            const stateDataMap = new Map();

            // Combine top_states from both groups
            groupKeys.forEach((groupKey, index) => {
              const groupMetrics = detailedMetrics[groupKey];

              if (
                groupMetrics?.top_states &&
                Object.keys(groupMetrics.top_states).length > 0
              ) {
                Object.entries(groupMetrics.top_states).forEach(
                  ([state, count]) => {
                    if (!stateDataMap.has(state)) {
                      stateDataMap.set(state, []);
                    }
                    stateDataMap.get(state).push({
                      groupKey,
                      count,
                      color: colors[index] || "#45b7d1",
                    });
                  },
                );
              }
            });

            // Convert to array format, taking the group with higher count for each state
            const result = Array.from(stateDataMap.entries())
              .map(([stateName, groupData]) => {
                const dominantGroup = groupData.reduce((max, current) =>
                  current.count > max.count ? current : max,
                );

                return {
                  name: capitalizeStateName(stateName),
                  value: dominantGroup.count,
                  color: dominantGroup.color,
                  groupKey: dominantGroup.groupKey,
                };
              })
              .sort((a, b) => b.value - a.value);

            // If no meaningful state data was found, create visualization based on group comparison
            if (
              result.length === 0 ||
              result.every((item) => item.value === 0)
            ) {
              const groupComparison = groupKeys.map((groupKey, index) => {
                const groupMetrics = detailedMetrics[groupKey];
                const totalCount =
                  groupMetrics?.total_orders ||
                  groupMetrics?.order_count ||
                  groupMetrics?.count ||
                  groupMetrics?.orders ||
                  0;

                return {
                  name: capitalizeStateName(groupKey),
                  value: totalCount,
                  color: colors[index] || "#45b7d1",
                  groupKey: groupKey,
                };
              });

              return groupComparison;
            }

            return result;
          } else {
            // Try to extract data from comparison_data directly if detailed metrics are not available
            if (searchData?.comparison_data?.groups) {
              const { groups, order_count } = searchData.comparison_data;
              const colors = ["#283593", "#1E88E5"];

              return Object.entries(groups).map(([key, groupName], index) => ({
                name:
                  typeof groupName === "string"
                    ? capitalizeStateName(groupName)
                    : `Group ${index + 1}`,
                value: order_count[key] || 0,
                color: colors[index] || "#45b7d1",
              }));
            }
          }
        }
      }
    }

    // Enhanced fallback: try to use any available data before defaulting
    if (isSuccess && searchData) {
      // Check if there's any state-related data we can use
      if (
        searchData.data &&
        Array.isArray(searchData.data) &&
        searchData.data.length > 0
      ) {
        const stateCount = {};
        searchData.data.forEach((item) => {
          if (item.state) {
            const stateName = capitalizeStateName(item.state);
            stateCount[stateName] = (stateCount[stateName] || 0) + 1;
          }
        });

        if (Object.keys(stateCount).length > 0) {
          return Object.entries(stateCount)
            .map(([state, count]) => ({
              name: state,
              value: count,
              color: "#4ecdc4",
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
        }
      }
    }

    // Ultimate fallback data
    return [
      { name: "Maharashtra", value: 3200, color: "#4ecdc4" },
      { name: "Telangana", value: 1250, color: "#ff6b6b" },
    ];
  }, [
    isSuccess,
    searchType,
    searchData,
    searchFilter,
    detailedMetrics,
    comparisonType,
  ]);

  // Extract groups data for comparison queries
  const groups = useMemo(() => {
    if (
      isSuccess &&
      (searchType === "comparison" || searchType === "COMPARISON") &&
      searchData?.comparison_data
    ) {
      const compData = searchData.comparison_data;
      if (comparisonType === "multi_group") {
        // For multi-group, extract from groups array or group_summaries keys
        if (compData.groups && Array.isArray(compData.groups)) {
          return compData.groups;
        }
        if (compData.group_summaries) {
          return Object.keys(compData.group_summaries);
        }
      } else if (comparisonType === "pairwise") {
        // For pairwise, extract from groups object with 'a' and 'b' keys
        if (compData.groups) {
          return Object.values(compData.groups);
        }
      }
    }
    return [];
  }, [isSuccess, searchType, searchData, comparisonType]);

  const insights =
    (isSuccess &&
      (searchType === "comparison" || searchType === "COMPARISON") &&
      searchData?.insights) ||
    "No insights generated.";

  return (
    <div className="w-full h-screen p-5 space-y-2">
      {isSuccess && comparisonType === "pairwise" && (
        <>
          {/* winner by volume, revenue and aov */}
          {isSuccess && !metricsLoading && (
            <MetricCarouselComp
              key={`metrics-${refreshKey}`}
              searchData={searchData}
              isSuccess={isSuccess}
            />
          )}

          <div className="flex flex-row w-full gap-4 !-mt-10">
            {
              <ComparisonCarousel
                createPaymentChart={createPaymentChart}
                mapData={mapData}
                searchData={searchData}
                groups={groups}
              />
            }

            <ComparisonInsight
              groups={groups}
              insights={insights}
              searchData={searchData}
            />
          </div>
        </>
      )}

      {isSuccess && comparisonType === "multi_group" && (
        <>
          {/* winner by volume, revenue and aov */}
          {isSuccess && !metricsLoading && (
            <NewMetricCarouselComp
              key={`metrics-${refreshKey}`}
              searchData={searchData}
              isSuccess={isSuccess}
            />
          )}

          <div className="flex flex-row w-full gap-4 !-mt-10">
            {
              <NewComparisonCarousel
                createPaymentChart={createPaymentChart}
                mapData={mapData}
                searchData={searchData}
                groups={groups}
              />
            }

            <NewComparisonInsight groups={groups} insights={insights} />
          </div>
        </>
      )}
    </div>
  );
}
