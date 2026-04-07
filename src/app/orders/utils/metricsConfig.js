export const ENUM_TYPES_BASE_URL = "https://chupps-data-portal.s3.amazonaws.com/enum_types";

export const METRICS_CONFIG = {
  primaryKpis: {
    category: "Primary KPIs",
    color: "bg-linear-to-br from-blue-50 to-blue-100",
    metrics: {
      totalOrders: { title: "Total Orders", color: "text-blue-700", endpoint: "/history/batch/all-metrics", type: "table", chartType: "line", dataKey: "date", hasChart: true },
      grossRevenue: { title: "Gross Revenue", color: "text-green-700", endpoint: "/history/batch/all-metrics", type: "table", chartType: "line", dataKey: "date", currency: true, hasChart: true },
      unitsSold: { title: "Units Sold", color: "text-indigo-700", endpoint: "/history/batch/all-metrics", type: "scalar" },
      aov: { title: "AOV", color: "text-violet-700", endpoint: "/history/batch/all-metrics", type: "scalar", currency: true },
      uniqueSkus: { title: "Unique SKUs", color: "text-cyan-700", endpoint: "/history/batch/all-metrics", type: "scalar" },
      cancellationRate: { title: "Cancellation Rate", color: "text-rose-700", endpoint: "/history/batch/all-metrics", type: "scalar", percent: true },
      rtoRate: { title: "RTO Rate", color: "text-orange-700", endpoint: "/history/batch/all-metrics", type: "scalar", percent: true },
      codShare: { title: "COD Share", color: "text-emerald-700", endpoint: "/history/batch/all-metrics", type: "scalar", percent: true },
      deliveredRate: { title: "Delivered Rate", color: "text-teal-700", endpoint: "/history/batch/all-metrics", type: "scalar", percent: true }
    }
  },
  productMetrics: {
    category: "Product & Inventory",
    color: "bg-linear-to-br from-purple-50 to-purple-100",
    metrics: {
      skuDiversityIndex: { title: "SKU Diversity Index", endpoint: "/history/metrics/sku-diversity-index", type: "scalar" },
      topSkusByRevenue: { title: "Top SKUs by Revenue", endpoint: "/history/metrics/top-skus-by-revenue", type: "table", chartType: "bar", dataKey: "sku" },
      topSkusByUnits: { title: "Top SKUs by Units", endpoint: "/history/metrics/top-skus-by-units", type: "table", chartType: "bar", dataKey: "sku" },
      avgUnitsPerOrder: { title: "Avg Units per Order", endpoint: "/history/metrics/average-units-per-order", type: "scalar" },
      sizeMixDistribution: { title: "Size Mix Distribution", endpoint: "/history/metrics/size-mix-distribution", type: "table" },
      skuPerformanceMatrix: { title: "SKU Performance Matrix", endpoint: "/history/metrics/sku-performance-matrix", type: "table", chartType: "scatter", xKey: "units", yKey: "revenue" }
    }
  },
  performanceMetrics: {
    category: "Performance",
    color: "bg-linear-to-br from-green-50 to-green-100",
    metrics: {
      fulfillmentRate: { title: "Fulfillment Rate", endpoint: "/history/metrics/fulfillment-rate", type: "scalar", percent: true },
      orderValueDist: { title: "Order Value Distribution", endpoint: "/history/metrics/order-value-distribution", type: "stats", chartType: "stats" },
      orderVelocity: { title: "Order Velocity", endpoint: "/history/metrics/order-velocity", type: "stats", chartType: "stats" },
      unitsVelocity: { title: "Units Velocity", endpoint: "/history/metrics/units-velocity", type: "scalar" }
    }
  },
  geographicMetrics: {
    category: "Geographic",
    color: "bg-linear-to-br from-yellow-50 to-yellow-100",
    metrics: {
      topStatesByRevenue: { title: "Top States by Revenue", endpoint: "/history/metrics/top-states-by-revenue", type: "table", chartType: "bar", dataKey: "state" },
      topStatesByOrders: { title: "Top States by Orders", endpoint: "/history/metrics/top-states-by-orders", type: "table", chartType: "bar", dataKey: "state" },
      geoConcentration: { title: "Geographic Concentration", endpoint: "/history/metrics/geographic-revenue-concentration", type: "scalar", percent: true },
      stateCancellationRates: { title: "State Cancellation Rates", endpoint: "/history/metrics/state-cancellation-rates", type: "table", chartType: "bar", dataKey: "state" }
    }
  },
  channelPaymentMetrics: {
    category: "Channel & Payment",
    color: "bg-linear-to-br from-pink-50 to-pink-100",
    metrics: {
      marketplacePerf: { title: "Marketplace Performance", endpoint: "/history/metrics/marketplace-performance", type: "table", chartType: "bar", dataKey: "marketplace" },
      courierPerf: { title: "Courier Performance", endpoint: "/history/metrics/courier-performance", type: "table", chartType: "bar", dataKey: "courier" },
      warehouseEff: { title: "Warehouse Efficiency", endpoint: "/history/metrics/warehouse-efficiency", type: "table", chartType: "bar", dataKey: "warehouse" },
      paymentModeBreakdown: { title: "Payment Mode Breakdown", endpoint: "/history/metrics/payment-mode-breakdown", type: "object", chartType: "pie" }
    }
  },
  orderTypeMetrics: {
    category: "Order Type",
    color: "bg-linear-to-br from-red-50 to-red-100",
    metrics: {
      b2bVsB2c: { title: "B2B vs B2C", endpoint: "/history/metrics/b2b-vs-b2c", type: "object", chartType: "pie" }
    }
  },
  qualityRiskMetrics: {
    category: "Quality & Risk",
    color: "bg-linear-to-br from-orange-50 to-orange-100",
    metrics: {
      overallFulfillment: { title: "Overall Fulfillment Rate", endpoint: "/history/metrics/overall-fulfillment-rate", type: "scalar", percent: true },
      overallIssueRate: { title: "Overall Issue Rate", endpoint: "/history/metrics/overall-issue-rate", type: "scalar", percent: true },
      paymentRiskAnalysis: { title: "Payment Risk Analysis", endpoint: "/history/metrics/payment-risk-analysis", type: "object", chartType: "pie" },
      marketplaceRiskScore: { title: "Marketplace Risk Score", endpoint: "/history/metrics/marketplace-risk-score", type: "table", chartType: "bar", dataKey: "marketplace" }
    }
  },
  advancedMetrics: {
    category: "Advanced Analytics",
    color: "bg-linear-to-br from-cyan-50 to-cyan-100",
    metrics: {
      revenuePerChannel: { title: "Revenue per Channel", endpoint: "/history/metrics/revenue-per-channel", type: "object", chartType: "pie" },
      seasonalTrends: { title: "Seasonal Trends", endpoint: "/history/metrics/seasonal-trends", type: "object", chartType: "stats" },
      productPaymentCorr: { title: "Product-Payment Correlation", endpoint: "/history/metrics/product-payment-correlation", type: "object", chartType: "stats" }
    }
  }
};
