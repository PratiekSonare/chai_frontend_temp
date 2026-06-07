"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Zap,
  DollarSign,
  AlertCircle,
  Truck,
  Award,
  Target,
} from "lucide-react";

const S3_BASE = "https://chupps-data-portal.s3.amazonaws.com";
const INSIGHTS_KEY = "sku-metrics/insights-master.json";

const CARD_CONFIGS = {
  best_selling: {
    title: "Best Selling SKUs",
    icon: Award,
    color: "from-blue-600 to-blue-400",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Top SKUs by total units sold (all-time)",
    dataFields: [
      { key: "units_sold", label: "Units", format: "number" },
      { key: "revenue", label: "Revenue", format: "currency" },
      { key: "order_count", label: "Orders", format: "number" },
    ],
  },
  trending: {
    title: "Trending SKUs",
    icon: TrendingUp,
    color: "from-green-600 to-green-400",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "7d momentum vs 30d average (>100 = outperforming)",
    dataFields: [
      { key: "trending_score", label: "Score", format: "number" },
      { key: "revenue_7d", label: "7d Revenue", format: "currency" },
      { key: "momentum_pct", label: "Momentum", format: "percent" },
    ],
  },
  margin_leaders: {
    title: "Margin Leaders",
    icon: DollarSign,
    color: "from-purple-600 to-purple-400",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Most profitable SKUs",
    dataFields: [
      { key: "gross_margin_pct", label: "Margin %", format: "percent" },
      { key: "gross_profit", label: "Profit", format: "currency" },
      { key: "order_count", label: "Orders", format: "number" },
    ],
  },
  growth_accelerators: {
    title: "Growth Accelerators",
    icon: Zap,
    color: "from-orange-600 to-orange-400",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "Fastest growing SKUs (30d vs 7d)",
    dataFields: [
      { key: "growth_pct", label: "Growth %", format: "percent" },
      { key: "revenue_30d", label: "30d Revenue", format: "currency" },
      { key: "order_velocity_7d", label: "7d Orders", format: "number" },
    ],
  },
  price_volatility: {
    title: "Price Volatility",
    icon: AlertCircle,
    color: "from-red-600 to-red-400",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "Price variance across marketplaces",
    dataFields: [
      { key: "volatility_score", label: "Volatility", format: "number" },
      { key: "marketplace_count", label: "Channels", format: "number" },
      { key: "price_variance_pct", label: "Variance %", format: "percent" },
    ],
  },
  quality_issues: {
    title: "Quality Issues",
    icon: AlertCircle,
    color: "from-yellow-600 to-yellow-400",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    description: "SKUs with high cancellation & return rates",
    dataFields: [
      { key: "quality_score", label: "Issue Score", format: "number" },
      { key: "cancellation_rate", label: "Cancel %", format: "percent" },
      { key: "return_rate", label: "Return %", format: "percent" },
    ],
  },
  fulfillment_performance: {
    title: "Fulfillment Performance",
    icon: Truck,
    color: "from-indigo-600 to-indigo-400",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    description: "Best courier & marketplace efficiency",
    dataFields: [
      { key: "fulfillment_score", label: "Score", format: "percent" },
      { key: "total_orders", label: "Orders", format: "number" },
      { key: "marketplace_count", label: "Channels", format: "number" },
    ],
  },
};

function formatValue(value, format) {
  if (value === null || value === undefined) return "-";

  switch (format) {
    case "currency":
      return `₹${parseFloat(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
    case "percent":
      return `${parseFloat(value).toFixed(1)}%`;
    case "number":
      return parseFloat(value).toLocaleString("en-IN", {
        maximumFractionDigits: 1,
      });
    default:
      return value;
  }
}

function SkuInsightRow({ sku, data, fields }) {
  const displayName = data.product_name || data.model_no || sku;

  return (
    <div className="flex items-center justify-between py-2.5 px-3 hover:bg-[#001FB0]/5 rounded-lg transition-colors group">
      <div className="flex flex-col min-w-max pr-3">
        <div className="font-semibold text-[#001FB0] text-sm">
          {displayName}
        </div>
        <div className="text-xs text-gray-500">{data.model_no}</div>
      </div>
      <div className="flex gap-3 flex-1 justify-end text-sm">
        {fields.map((field) => (
          <div key={field.key} className="text-right min-w-[100px]">
            <div className="text-xs text-gray-500 mb-0.5">{field.label}</div>
            <div className="font-semibold text-[#001FB0]">
              {formatValue(data[field.key], field.format)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkuInsightCard({ cardKey, cardData }) {
  const config = CARD_CONFIGS[cardKey];
  if (!config) return null;

  const Icon = config.icon;
  const topItems = cardData.data?.slice(0, 5) || [];

  return (
    <div className="bg-white border-2 border-[#001FB0]/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col w-full h-full min-h-[400px]">
      {/* Header */}
      <div className="bg-[#001FB0] p-5 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-6 h-6" />
            <h3 className="font-bold text-lg">{config.title}</h3>
          </div>
        </div>
        <p className="text-sm opacity-90">{config.description}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-5 bg-white">
        {topItems.length > 0 ? (
          <div className="overflow-y-auto space-y-1">
            {topItems.map((item, idx) => (
              <SkuInsightRow
                key={idx}
                sku={item.sku}
                data={item}
                fields={config.dataFields}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24 text-gray-500">
            <span className="text-sm">No data available</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#001FB0]/10 px-4 py-2 bg-white text-xs text-gray-500">
        {cardData.metadata && (
          <>
            <span className="font-semibold text-[#001FB0]">
              {cardData.metadata.shown}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#001FB0]">
              {cardData.metadata.total_skus}
            </span>{" "}
            SKUs
          </>
        )}
      </div>
    </div>
  );
}

export default function SkuInsightsCards() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `${S3_BASE}/${INSIGHTS_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch insights: ${response.statusText}`);
        }

        const data = await response.json();
        setInsights(data);
      } catch (err) {
        console.error("Error fetching SKU insights:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  useEffect(() => {
    if (!insights?.cards) return;
    const keys = Object.keys(insights.cards);
    if (keys.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % keys.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [insights]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl px-4 py-8 h-[450px]">
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
        <div className="bg-gray-200 animate-pulse rounded-2xl h-full" />
      </div>
    );
  }

  if (error || !insights?.cards) {
    return (
      <div className="w-full max-w-7xl px-4 py-8 h-[450px]">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center h-full flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-800 font-medium">
            {error || "Unable to load SKU insights"}
          </p>
        </div>
      </div>
    );
  }

  const cardKeys = Object.keys(insights.cards);
  const activeCardKey = cardKeys[currentIndex];
  if (!activeCardKey) return null;

  return (
    <div className="w-full h-full px-4 py-8 flex flex-col items-center justify-center min-h-[500px]">
      <div className="w-full h-full flex-grow flex transition-opacity duration-500 ease-in-out">
        <SkuInsightCard
          cardKey={activeCardKey}
          cardData={insights.cards[activeCardKey]}
        />
      </div>

      {/* progress indicators */}
      <div className="flex gap-2 mt-4">
        {cardKeys.map((key, idx) => (
          <div
            key={key}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-6 bg-[#001FB0]" : "w-2 bg-[#001FB0]/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
