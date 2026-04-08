export const ENUM_TYPES_BASE_URL = "https://chupps-data-portal.s3.amazonaws.com/enum_types";

export const METRICS_CONFIG = {
  primaryKpis: {
    category: "Primary KPIs",
    color: "bg-linear-to-br from-blue-50 to-blue-100",
    metrics: {
      totalOrders: { title: "Total Orders", formula: "Count of all orders placed", color: "text-blue-700", endpoint: "/history/batch/all-metrics", type: "table", chartType: "line", dataKey: "date", hasChart: true },
      grossRevenue: { title: "Gross Revenue", formula: "Sum of all order values", color: "text-green-700", endpoint: "/history/batch/all-metrics", type: "table", chartType: "line", dataKey: "date", currency: true, hasChart: true },
      unitsSold: { title: "Units Sold", formula: "Total quantity of items sold", color: "text-indigo-700", endpoint: "/history/batch/all-metrics", type: "scalar" },
      aov: { title: "AOV", formula: "Gross Revenue ÷ Total Orders", color: "text-violet-700", endpoint: "/history/batch/all-metrics", type: "scalar", currency: true },
      uniqueSkus: { title: "Unique SKUs", formula: "Count of distinct products sold", color: "text-cyan-700", endpoint: "/history/batch/all-metrics", type: "scalar" },
      cancellationRate: { title: "Cancellation Rate", formula: "(Cancelled Orders ÷ Total Orders) × 100", color: "text-rose-700", endpoint: "/history/batch/all-metrics", type: "scalar", percent: true },
      rtoRate: { title: "RTO Rate", formula: "(Returned Orders ÷ Total Orders) × 100", color: "text-orange-700", endpoint: "/history/batch/all-metrics", type: "scalar", percent: true },
      codShare: { title: "COD Share", formula: "(COD Orders ÷ Total Orders) × 100", color: "text-emerald-700", endpoint: "/history/batch/all-metrics", type: "scalar", percent: true },
      deliveredRate: { title: "Delivered Rate", formula: "(Delivered Orders ÷ Total Orders) × 100", color: "text-teal-700", endpoint: "/history/batch/all-metrics", type: "scalar", percent: true }
    }
  },
  productMetrics: {
    category: "Product & Inventory",
    color: "bg-linear-to-br from-purple-50 to-purple-100",
    metrics: {
      skuDiversityIndex: { title: "SKU Diversity Index", formula: "Measure of product variety (0-100)", endpoint: "/history/metrics/sku-diversity-index", type: "scalar" },
      topSkusByRevenue: { title: "Top SKUs by Revenue", formula: "SKUs ranked by total revenue generated", endpoint: "/history/metrics/top-skus-by-revenue", type: "table", chartType: "bar", dataKey: "sku" },
      topSkusByUnits: { title: "Top SKUs by Units", formula: "SKUs ranked by units sold", endpoint: "/history/metrics/top-skus-by-units", type: "table", chartType: "bar", dataKey: "sku" },
      avgUnitsPerOrder: { title: "Avg Units per Order", formula: "Total Units ÷ Total Orders", endpoint: "/history/metrics/average-units-per-order", type: "scalar" },
      sizeMixDistribution: { title: "Size Mix Distribution", formula: "Breakdown of orders by product size", endpoint: "/history/metrics/size-mix-distribution", type: "table" },
      skuPerformanceMatrix: { title: "SKU Performance Matrix", formula: "Product performance on units vs revenue", endpoint: "/history/metrics/sku-performance-matrix", type: "table", chartType: "scatter", xKey: "units", yKey: "revenue" }
    }
  },
  performanceMetrics: {
    category: "Performance",
    color: "bg-linear-to-br from-green-50 to-green-100",
    metrics: {
      fulfillmentRate: { title: "Fulfillment Rate", formula: "(Successfully Fulfilled (DELIVERED or RETURNED) ÷ Total Orders) × 100", endpoint: "/history/metrics/fulfillment-rate", type: "scalar", percent: true },
      orderValueDist: { title: "Order Value Distribution", formula: "Statistical breakdown of order values", endpoint: "/history/metrics/order-value-distribution", type: "stats", chartType: "stats" },
      orderVelocity: { title: "Order Velocity", formula: "Rate of orders over time", endpoint: "/history/metrics/order-velocity", type: "stats", chartType: "stats" },
      unitsVelocity: { title: "Units Velocity", formula: "Rate of units sold over time", endpoint: "/history/metrics/units-velocity", type: "scalar" }
    }
  },
  geographicMetrics: {
    category: "Geographic",
    color: "bg-linear-to-br from-yellow-50 to-yellow-100",
    metrics: {
      topStatesByRevenue: { title: "Top States by Revenue", formula: "States ranked by total revenue", endpoint: "/history/metrics/top-states-by-revenue", type: "table", chartType: "bar", dataKey: "state" },
      topStatesByOrders: { title: "Top States by Orders", formula: "States ranked by order count", endpoint: "/history/metrics/top-states-by-orders", type: "table", chartType: "bar", dataKey: "state" },
      geoConcentration: { title: "Geographic Concentration", formula: "Revenue concentration in top regions", endpoint: "/history/metrics/geographic-revenue-concentration", type: "scalar", percent: true },
      stateCancellationRates: { title: "State Cancellation Rates", formula: "Cancellation % by state", endpoint: "/history/metrics/state-cancellation-rates", type: "table", chartType: "bar", dataKey: "state" }
    }
  },
  channelPaymentMetrics: {
    category: "Channel & Payment",
    color: "bg-linear-to-br from-pink-50 to-pink-100",
    metrics: {
      marketplacePerf: { title: "Marketplace Performance", formula: "Orders and revenue by marketplace", endpoint: "/history/metrics/marketplace-performance", type: "table", chartType: "bar", dataKey: "marketplace" },
      courierPerf: { title: "Courier Performance", formula: "Delivery metrics by courier", endpoint: "/history/metrics/courier-performance", type: "table", chartType: "bar", dataKey: "courier" },
      warehouseEff: { title: "Warehouse Efficiency", formula: "Order fulfillment by warehouse", endpoint: "/history/metrics/warehouse-efficiency", type: "table", chartType: "bar", dataKey: "warehouse" },
      paymentModeBreakdown: { title: "Payment Mode Breakdown", formula: "Orders distribution by payment method", endpoint: "/history/metrics/payment-mode-breakdown", type: "object", chartType: "pie" }
    }
  },
  orderTypeMetrics: {
    category: "Order Type",
    color: "bg-linear-to-br from-red-50 to-red-100",
    metrics: {
      b2bVsB2c: { title: "B2B vs B2C", formula: "Orders split between B2B and B2C channels", endpoint: "/history/metrics/b2b-vs-b2c", type: "object", chartType: "pie" }
    }
  },
  qualityRiskMetrics: {
    category: "Quality & Risk",
    color: "bg-linear-to-br from-orange-50 to-orange-100",
    metrics: {
      overallFulfillment: { title: "Overall Fulfillment Rate", formula: "(Fulfilled Orders ÷ Total Orders) × 100", endpoint: "/history/metrics/overall-fulfillment-rate", type: "scalar", percent: true },
      overallIssueRate: { title: "Overall Issue Rate", formula: "(Orders with Issues ÷ Total Orders) × 100", endpoint: "/history/metrics/overall-issue-rate", type: "scalar", percent: true },
      // paymentRiskAnalysis: { title: "Payment Risk Analysis", formula: "Risk categorization of payment methods", endpoint: "/history/metrics/payment-risk-analysis", type: "object", chartType: "pie" },
      marketplaceRiskScore: { title: "Marketplace Risk Score", formula: "Risk metric by marketplace", endpoint: "/history/metrics/marketplace-risk-score", type: "table", chartType: "bar", dataKey: "marketplace" }
    }
  },
  // advancedMetrics: {
  //   category: "Advanced Analytics",
  //   color: "bg-linear-to-br from-cyan-50 to-cyan-100",
  //   metrics: {
  //     revenuePerChannel: { title: "Revenue per Channel", endpoint: "/history/metrics/revenue-per-channel", type: "object", chartType: "pie" },
  //     seasonalTrends: { title: "Seasonal Trends", endpoint: "/history/metrics/seasonal-trends", type: "object", chartType: "stats" },
  //     productPaymentCorr: { title: "Product-Payment Correlation", endpoint: "/history/metrics/product-payment-correlation", type: "object", chartType: "stats" }
  //   }
  // }
};
