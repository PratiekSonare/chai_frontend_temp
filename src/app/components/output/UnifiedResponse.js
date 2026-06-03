"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import DataTableComponent from "../table/DataTableComponent";
import MetricAnalysis from "./metric_analysis/MetricAnalysis";
import MetricCarouselOrder from "./standard/MetricCarouselOrder";
import Comparison from "./comparison/Comparison";
import SchemaDiscovery from "./schema_discovery/SchemaDiscovery";
import CustomMetricGeneration from "./custom_metric_generation/CustomMetricGeneration";

export default function UnifiedResponse({
  responseData,
  isSuccess,
  finalMetrics,
  metricsLoading,
  refreshKey,
  createPaymentChart,
}) {
  if (!isSuccess || !responseData) return null;

  const {
    answer,
    query_type,
    results,
    summarized_query
  } = responseData;

  const searchData = results?.data;
  const metrics_calculated = results?.metrics_calculated;
  const response_type = results?.response_type;

  // Comparison specific extractions (legacy support if needed)
  const comparisonData = results?.comparison_data || results;
  const comparisonType = comparisonData?.comparison_type;
  const comparisonFilter = comparisonData?.comparison_param;
  const detailedMetrics = results?.detailed_metrics;

  return (
    <div className="w-full flex flex-col gap-8 pb-20">
      {/* 1. Always display Answer */}
      {answer && (
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="bg-white border-l-4 border-[#001FB0] shadow-sm rounded-r-xl p-6 poppins text-gray-800">
            <div className="flex items-center gap-2 mb-3 text-[#001FB0] font-bold uppercase text-sm tracking-wider">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Agent Analysis
            </div>
            <div className="prose prose-blue max-w-none prose-p:leading-relaxed prose-li:my-1">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-4 last:mb-0 text-lg">{children}</p>,
                  strong: ({ children }) => <strong className="text-[#001FB0] font-bold">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc pl-5 mb-4">{children}</ul>,
                  li: ({ children }) => <li className="mb-1">{children}</li>
                }}
              >
                {answer}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* 2. Display Metrics if they exist */}
      {metrics_calculated && metrics_calculated.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4">
           <MetricAnalysis 
             metric_analysis={null} 
             metric_calculated={metrics_calculated} 
             showInsight={false}
           />
        </div>
      )}

      {/* 3. Specialized Views (Comparison, Schema Discovery etc) */}
      {(query_type === "comparison" || query_type === "COMPARISON") && (
        <div className="w-full max-w-7xl mx-auto px-4">
          <Comparison
            createPaymentChart={createPaymentChart}
            isSuccess={isSuccess}
            searchData={results}
            searchType={query_type?.toLowerCase()}
            comparisonType={comparisonType}
            searchFilter={comparisonFilter}
            detailedMetrics={detailedMetrics}
            refreshKey={refreshKey}
          />
        </div>
      )}
      {searchData && (Array.isArray(searchData) ? searchData.length > 0 : Object.keys(searchData).length > 0) && (
        <div className="w-full max-w-7xl mx-auto px-4">
          <DataTableComponent
            key={`datatable-${refreshKey}`}
            data={{
              data: searchData,
              query_type: query_type?.toLowerCase() || "standard",
              summarized_query: summarized_query || ""
            }}
            summarized_query={summarized_query || ""}
            title={query_type?.replace(/_/g, ' ') || "RESULT DATA"}
          />
        </div>
      )}

      {/* 4. Legacy/Specialized Views if needed (e.g. Schema Discovery) */}
      {(query_type === "schema_discovery" || query_type === "SCHEMA_DISCOVERY") && results?.data?.field_info && (
        <div className="w-full max-w-7xl mx-auto px-4">
          <SchemaDiscovery field={results?.data?.field} field_info={results?.data?.field_info} />
        </div>
      )}
      
      {/* 5. Fallback for Calculated Metrics from Standard Workflow */}
      {(query_type?.toLowerCase() === "standard" || query_type === "STANDARD") && !metrics_calculated && finalMetrics && !metricsLoading && (
        <div className="w-full max-w-7xl mx-auto px-4">
          <MetricCarouselOrder
            key={`metrics-${refreshKey}`}
            metrics={finalMetrics}
            searchData={searchData}
            isSuccess={isSuccess}
          />
        </div>
      )}
    </div>
  );
}
