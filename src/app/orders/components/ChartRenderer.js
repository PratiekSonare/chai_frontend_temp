"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  Label,
  LineChart,
  Line,
} from "recharts";

const CHART_COLORS = [
  "#1e40af",
  "#4f46e5",
  "#059669",
  "#7c3aed",
  "#dc2626",
  "#ea580c",
  "#0891b2",
  "#065f46",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Check if any payload item has growth data or style_name
    const growthData = payload.find(p => p.payload && p.payload.growth !== undefined);
    const styleNameData = payload[0]?.payload?.style_name;
    
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-5 backdrop-blur-xl" style={{ minWidth: "280px" }}>
        <div className="mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            {label}
          </p>
          {styleNameData && (
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
              Style: <span className="font-semibold">{styleNameData}</span>
            </p>
          )}
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between py-1 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-300">
                {entry.name}
              </span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
        {growthData && growthData.payload && growthData.payload.growth !== null && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Growth</span>
              <span className={`font-medium ${
                growthData.payload.growth >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {growthData.payload.growth >= 0 ? '+' : ''}{growthData.payload.growth}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const BarChartComponent = ({ data, dataKey }) => (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
        <XAxis
          dataKey={dataKey}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          angle={-45}
          textAnchor="end"
          height={80}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
        <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }} iconType="circle" />
        {Object.keys(data[0])
          .filter(
            (k) =>
              k !== dataKey && k !== "percentage" && k !== "growth" && k !== "count" && k !== "revenue" && k !== "style_name" && k !== "sku" && typeof data[0][k] === "number"
          )
          .map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              fill={CHART_COLORS[idx % CHART_COLORS.length]}
              radius={[12, 12, 0, 0]}
              animationDuration={800}
            />
          ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const LineChartComponent = ({ data, dataKey }) => {
  // Extract all numeric keys except the dataKey, percentage, growth, count, and revenue
  const numericKeys = Object.keys(data[0]).filter(
    (k) => k !== dataKey && k !== "percentage" && k !== "growth" && k !== "count" && k !== "revenue" && typeof data[0][k] === "number"
  );

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} />
          <XAxis
            dataKey={dataKey}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            angle={-45}
            textAnchor="end"
            height={80}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
          <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }} />
          {numericKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
              dot={{ fill: CHART_COLORS[idx % CHART_COLORS.length], r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={800}
              strokeWidth={2}
              isAnimationActive={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ScatterChartComponent = ({ data, xKey, yKey }) => (
  <div className="h-64 !overflow-visible">
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey={xKey} />
        <YAxis type="number" dataKey={yKey} />
        <Tooltip />
        <Scatter name="SKUs" data={data} fill={CHART_COLORS[0]} label={{ dataKey: 'sku', fill: '#000', fontSize: 12, dy: -20 }} />
      </ScatterChart>
    </ResponsiveContainer>
  </div>
);

const PieChartComponent = ({ data, dataKey }) => {
  const chartData = Array.isArray(data)
    ? data
    : Object.entries(data).map(([name, value]) => ({
        name,
        value: typeof value === "number" ? value : 0,
      }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderLabel = (entry) => {
    const percentage = ((entry.value / total) * 100).toFixed(1);
    return `${percentage}%`;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey={dataKey || "value"}
            nameKey="name"
            cx="50%"
            cy="40%"           // ← Moved up to give more breathing room
            outerRadius="50%"  // ← This is the main change (was 80)
            label={renderLabel}
            labelLine={false}
          >
            {chartData.map((entry, idx) => (
              <Cell 
                key={`cell-${idx}`} 
                fill={CHART_COLORS[idx % CHART_COLORS.length]} 
              />
            ))}
          </Pie>
          
          <Tooltip />
          <Legend 
            wrapperStyle={{ 
              paddingTop: "20px", 
              fontSize: "13px" 
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const TableComponent = ({ data }) => {
  const keys = Object.keys(data[0]);
  const styleNameIdx = keys.indexOf('style_name');
  
  return (
    <div className="overflow-auto h-full rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
      <table className="w-full text-sm ">
        <thead className=" uppercase sticky top-0 bg-zinc-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <tr className="">
            {keys.map((k, idx) => (
              <th
                key={k}
                className={`px-6 py-4 text-left font-semibold ${
                  k === 'style_name'
                    ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20'
                    : 'text-gray-700 dark:text-gray-300'
                } ${
                  idx === 0 ? "rounded-tl-2xl" : ""
                } ${idx === keys.length - 1 ? "rounded-tr-2xl" : ""}`}
              >
                {k.replace(/([A-Z])/g, " $1").trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.slice(0, 10).map((row, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150"
            >
              {keys.map((key, vidx) => {
                const val = row[key];
                const isStyleName = key === 'style_name';
                return (
                  <td
                    key={vidx}
                    className={`px-6 py-4 whitespace-nowrap ${
                      isStyleName
                        ? 'font-semibold text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-900/10'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {isStyleName && val ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        {val}
                      </span>
                    ) : typeof val === "number" ? (
                      val.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    ) : (
                      val
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 10 && (
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-3 text-xs text-gray-500 dark:text-gray-400">
          Showing 1–10 of {data.length} entries
        </div>
      )}
    </div>
  );
};

const StatsComponent = ({ data }) => {
  const formatStatValue = (key, value) => {
    const formattedKey = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    let displayValue = value;
    if (typeof value === 'number') {
      displayValue = value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    
    return { key: formattedKey, value: displayValue };
  };

  return (
    <div className="h-64 flex items-center justify-center p-6grid grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]) => {
          const { key: displayKey, value: displayValue } = formatStatValue(key, value);
          return (
            <div
              key={key}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-transparent border border-blue-500 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800"
            >
              <span className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                {displayKey}
              </span>
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
  );
};

export const renderChart = (metricKey, config, data) => {
  if (!data) return null;

  if (Array.isArray(data) && data.length > 0) {
    const chartType = config.chartType || "table";
    const dataKey = config.dataKey;

    if (chartType === "pie") {
      return <PieChartComponent data={data} dataKey={dataKey} />;
    }

    if (chartType === "line" && dataKey) {
      return <LineChartComponent data={data} dataKey={dataKey} />;
    }

    if (chartType === "bar" && dataKey && data[0][dataKey]) {
      return <BarChartComponent data={data} dataKey={dataKey} />;
    }

    if (chartType === "scatter") {
      return <ScatterChartComponent data={data} xKey={config.xKey} yKey={config.yKey} />;
    }

    return <TableComponent data={data} />;
  }

  // Handle stats chartType (for object data)
  if (typeof data === "object" && !Array.isArray(data) && config.chartType === "stats") {
    return <StatsComponent data={data} />;
  }

  if (typeof data === "object" && !Array.isArray(data) && config.chartType === "pie") {
    return <PieChartComponent data={data} />;
  }

  return null;
};
