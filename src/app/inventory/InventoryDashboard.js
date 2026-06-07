"use client";

import { useMemo, useState } from "react";

const SECTIONS = [
  {
    key: "overview",
    label: "Overview",
    subtitle: "Key metrics at a glance",
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#001a8e" : "white"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: "stockHealth",
    label: "Stock Health",
    subtitle: "Detailed stock breakdown",
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#001a8e" : "white"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        <path d="M16 8l-4 4-2-2" />
      </svg>
    ),
  },
  {
    key: "charts",
    label: "Distribution",
    subtitle: "Stock & QC Distribution",
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#001a8e" : "white"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    key: "alerts",
    label: "Alerts",
    subtitle: "Issues requiring attention",
    icon: (active) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#001a8e" : "white"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

function MetricCard({ title, value, subtitle, color = "#001FB0", formula }) {
  const valueIsPercentage = typeof value === "string" && value.includes("%");
  const subtitleContainsPercentage =
    typeof subtitle === "string" && subtitle.includes("%");

  const highlightColor = "#e11d48"; // Tailwind's red-600 or similar

  return (
    <div className="metric-sdw rounded-xl bg-zinc-50 border-l border-b border-r border-[#001a8e] p-5 flex flex-col h-full">
      <span
        className="poppins uppercase tracking-wider text-md"
        style={{ color }}
      >
        {title}
      </span>
      <p
        className={`mt-2 text-3xl font-bold poppins ${valueIsPercentage ? "text-red-600" : ""}`}
        style={{ color: valueIsPercentage ? highlightColor : color }}
      >
        {value}
      </p>
      {subtitle && (
        <p
          className={`text-sm font-medium text-zinc-600 mt-2 leading-relaxed ${subtitleContainsPercentage ? "font-semibold" : ""}`}
          style={{
            color: subtitleContainsPercentage ? highlightColor : "#6b7280",
          }}
        >
          {subtitle}
        </p>
      )}
      {formula && (
        <p className="text-[10px] text-zinc-400 mt-1.5 italic leading-snug border-t border-zinc-200 pt-1.5">
          {formula}
        </p>
      )}
    </div>
  );
}

function AlertCard({ title, items, severity = "warning" }) {
  const colors = {
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      dot: "bg-amber-400",
    },
    danger: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      dot: "bg-red-400",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      dot: "bg-blue-400",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      dot: "bg-green-400",
    },
  };
  const c = colors[severity] || colors.warning;

  return (
    <div
      className={`${c.bg} ${c.border} border rounded-xl p-3 h-full flex flex-col`}
    >
      <h4
        className={`font-bold text-xs ${c.text} mb-2 poppins uppercase tracking-wider shrink-0`}
      >
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="text-[11px] text-zinc-400">No items to display</p>
      ) : (
        <div className="space-y-1 overflow-hidden flex-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px]">
              <div className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
              <span className="text-zinc-600 whitespace-normal wrap-break-word leading-snug">
                {item}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ label, value, total, color = "#001FB0" }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[11px] mb-0.5">
        <span className="text-zinc-600 font-medium">{label}</span>
        <span className="text-zinc-400">
          {value.toLocaleString()} ({pct.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function InventoryDashboard({ data, dateRange }) {
  const { summary } = data;
  const totalSkus = data.total_skus || 0;
  const startDate = dateRange?.start_date?.split(" ")[0] || "";
  const endDate = dateRange?.end_date?.split(" ")[0] || "";
  const [activeSection, setActiveSection] = useState("overview");

  const cards = useMemo(() => {
    if (!summary) return [];
    const h = summary.stock_health || {};
    const d = summary.damage_analysis || {};
    const dead = summary.dead_stock || {};
    const qc = summary.qc_performance || {};
    const exp = summary.expiry_risk || {};

    return [
      {
        title: "Total SKUs",
        value: (h.total_skus || 0).toLocaleString(),
        subtitle: `Health Score: ${h.health_score_pct || 0}%`,
        color: "#001FB0",
        formula: "Health Score = (Available + Bin Locked) / Received × 100",
      },
      {
        title: "Total Available",
        value: (h.total_usable || 0).toLocaleString(),
        subtitle: `of ${h.total_received?.toLocaleString() || 0} received`,
        color: "#16a34a",
        formula: "Usable = Available Qty + Bin Locked",
      },
      {
        title: "Problem Stock",
        value: (h.total_problem_stock || 0).toLocaleString(),
        subtitle: `${h.problem_stock_pct || 0}% of received`,
        color: "#dc2626",
        formula:
          "Problem = Damaged + Discard/Fraud + Lost + Quarantine + Questionable",
      },
      {
        title: "Damage Rate",
        value: `${d.damage_rate_pct || 0}%`,
        subtitle: `Loss: ${d.loss_rate_pct || 0}% | Fraud: ${d.fraud_rate_pct || 0}%`,
        color: "#f59e0b",
        formula:
          "Rate = (Damaged / Received) × 100 — Loss = (Lost / Received) × 100",
      },
      {
        title: "Dead Stock",
        value: (dead.total_dead_skus || 0).toLocaleString(),
        subtitle: `${dead.dead_stock_pct || 0}% of available inventory`,
        color: "#7c3aed",
        formula:
          "Dead Stock: Available > 0 but Marketplace + Website + E-Com = 0",
      },
      {
        title: "QC Pass Rate",
        value: `${qc.pass_rate_pct || 0}%`,
        subtitle: `Failed: ${qc.fail_rate_pct || 0}% | Pending: ${qc.pending_rate_pct || 0}%`,
        color: "#0891b2",
        formula:
          "Rate = (QC Passed / Total QC) × 100 — Total = Passed + Failed + Pending",
      },
      {
        title: "Expiry Risk",
        value: (exp.total_near_expiry || 0).toLocaleString(),
        subtitle: `Expired: ${exp.total_expired || 0} units`,
        color: "#e11d48",
        formula: "Risk % = (Near Expiry + Expired) / Available Qty × 100",
      },
      {
        title: "Reserved Stock",
        value: (h.total_reserved || 0).toLocaleString(),
        subtitle: `Amazon: ${h.amazon_reserved || 0} | Picked: ${h.reserved_picked || 0}`,
        color: "#2563eb",
        formula:
          "Reserved = Reserved (Picked) + Reserved (Not Picked) + Amazon Reserved",
      },
    ];
  }, [summary]);

  const healthBars = useMemo(() => {
    if (!summary?.stock_health) return [];
    const h = summary.stock_health;
    return [
      { label: "Available", value: h.total_available || 0, color: "#16a34a" },
      { label: "Bin Locked", value: h.total_bin_locked || 0, color: "#6366f1" },
      {
        label: "Reserved (Picked)",
        value: h.reserved_picked || 0,
        color: "#2563eb",
      },
      {
        label: "Reserved (Not Picked)",
        value: h.reserved_not_picked || 0,
        color: "#3b82f6",
      },
      {
        label: "Amazon Reserved",
        value: h.amazon_reserved || 0,
        color: "#f97316",
      },
      { label: "Damaged", value: h.total_damaged || 0, color: "#dc2626" },
      {
        label: "Discard/Fraud",
        value: h.total_discard_fraud || 0,
        color: "#991b1b",
      },
      { label: "Lost", value: h.total_lost || 0, color: "#7f1d1d" },
      { label: "Quarantine", value: h.total_quarantine || 0, color: "#a16207" },
      { label: "Repair", value: h.total_repair || 0, color: "#7c3aed" },
    ];
  }, [summary]);

  const channelBars = useMemo(() => {
    if (!summary?.channel_distribution?.channels) return [];
    const ch = summary.channel_distribution.channels;
    const colors = {
      Marketplace: "#001FB0",
      Website: "#16a34a",
      "E-Commerce": "#f59e0b",
      Retail: "#7c3aed",
      IIA: "#0891b2",
      "Amazon Reserved": "#f97316",
    };
    return Object.entries(ch).map(([name, val]) => ({
      label: name,
      value: val,
      color: colors[name] || "#6b7280",
    }));
  }, [summary]);

  const pieData = useMemo(() => {
    if (!summary?.stock_health) return [];
    const h = summary.stock_health;
    return [
      { label: "Available", value: h.total_available || 0, color: "#16a34a" },
      { label: "Reserved", value: h.total_reserved || 0, color: "#2563eb" },
      { label: "Damaged", value: h.total_damaged || 0, color: "#dc2626" },
      { label: "Lost", value: h.total_lost || 0, color: "#7f1d1d" },
      { label: "Quarantine", value: h.total_quarantine || 0, color: "#a16207" },
      { label: "Repair", value: h.total_repair || 0, color: "#7c3aed" },
    ].filter((d) => d.value > 0);
  }, [summary]);

  const channelData = useMemo(() => {
    if (!summary?.channel_distribution?.channels) return [];
    return Object.entries(summary.channel_distribution.channels)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);
  }, [summary]);

  const categoryData = useMemo(() => {
    if (!summary?.category_breakdown?.categories) return [];
    return summary.category_breakdown.categories.slice(0, 10);
  }, [summary]);

  const qcData = useMemo(() => {
    if (!summary?.qc_performance) return [];
    const qc = summary.qc_performance;
    return [
      { label: "Passed", value: qc.qc_passed || 0, color: "#16a34a" },
      { label: "Failed", value: qc.qc_failed || 0, color: "#dc2626" },
      { label: "Pending", value: qc.qc_pending || 0, color: "#f59e0b" },
    ].filter((d) => d.value > 0);
  }, [summary]);

  function renderBarChart(
    items,
    valueKey = "value",
    labelKey = "label",
    colorKey = "color",
    title,
  ) {
    const maxVal = Math.max(...items.map((d) => d[valueKey]), 1);
    return (
      <div className="metric-sdw bg-white rounded-xl border border-[#001a8e]/20 p-3 h-full flex flex-col">
        <h3 className="font-bold text-zinc-700 mb-2 poppins uppercase tracking-wider text-sm shrink-0">
          {title}
        </h3>
        <div className="space-y-2 flex-1 overflow-hidden">
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-zinc-600 font-medium truncate mr-2">
                  {item[labelKey]}
                </span>
                <span className="text-zinc-400 shrink-0">
                  {item[valueKey]?.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(item[valueKey] / maxVal) * 100}%`,
                    backgroundColor: item[colorKey] || "#001FB0",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderDonut(items, title) {
    const total = items.reduce((s, d) => s + d.value, 0);
    if (total === 0) return null;

    let cumulative = 0;
    const segments = items.map((item) => {
      const pct = (item.value / total) * 100;
      const start = cumulative;
      cumulative += pct;
      return { ...item, start, pct };
    });

    return (
      <div className="metric-sdw bg-white rounded-xl border border-[#001a8e]/20 p-3 h-full flex flex-col">
        <h3 className="font-bold text-zinc-700 mb-2 poppins uppercase tracking-wider text-sm shrink-0">
          {title}
        </h3>
        <div className="flex items-center gap-4 flex-1 min-h-0">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {segments.map((seg, i) => (
                <circle
                  key={i}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="3.5"
                  strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                  strokeDashoffset={`${-seg.start}`}
                  className="transition-all duration-700"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-bold text-zinc-700">
                  {total.toLocaleString()}
                </div>
                <div className="text-[9px] text-zinc-400">Total</div>
              </div>
            </div>
          </div>
          <div className="space-y-1 flex-1 overflow-hidden">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px]">
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-zinc-600 flex-1 truncate">
                  {item.label || item.name}
                </span>
                <span className="text-zinc-400 font-medium">
                  {item.value?.toLocaleString()}
                </span>
                <span className="text-zinc-300 w-10 text-right">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const overviewItems = [...cards.map((c) => ({ type: "card", ...c }))];

  const stockHealthItems = [{ type: "healthBars" }, { type: "channelBars" }];

  const chartItems = [
    ...(pieData.length > 0
      ? [{ type: "donut", data: pieData, title: "Stock Status Distribution" }]
      : []),
    ...(qcData.length > 0
      ? [{ type: "donut", data: qcData, title: "QC Status Distribution" }]
      : []),
    ...(channelData.length > 0
      ? [
          {
            type: "bar",
            data: channelData.map((d) => ({
              label: d.name,
              value: d.value,
              color:
                {
                  Marketplace: "#001FB0",
                  Website: "#16a34a",
                  "E-Commerce": "#f59e0b",
                  Retail: "#7c3aed",
                  IIA: "#0891b2",
                  "Amazon Reserved": "#f97316",
                }[d.name] || "#6b7280",
            })),
            title: "Channel Distribution",
          },
        ]
      : []),
    ...(categoryData.length > 0
      ? [
          {
            type: "bar",
            data: categoryData.map((d) => ({
              label: d.category || "Unknown",
              value: d.available_qty || 0,
              color: "#001FB0",
            })),
            title: "Inventory by Category (Top 10)",
          },
        ]
      : []),
    ...(summary?.brand_breakdown?.brands
      ? [
          {
            type: "bar",
            data: summary.brand_breakdown.brands.slice(0, 8).map((d) => ({
              label: d.brand || "Unknown",
              value: d.available_qty || 0,
              color: "#7c3aed",
            })),
            title: "Inventory by Brand (Top 8)",
          },
        ]
      : []),
    ...(summary?.location_breakdown?.locations
      ? [
          {
            type: "bar",
            data: summary.location_breakdown.locations.map((d) => ({
              label: d.location || "Unknown",
              value: d.available_qty || 0,
              color: "#0891b2",
            })),
            title: "Inventory by Location",
          },
        ]
      : []),
  ];

  const alertItems = [
    {
      type: "alert",
      title: "Top Damaged SKUs",
      severity: "danger",
      items: (summary?.damage_analysis?.top_damaged_skus || []).map(
        (s) => `${s.sku} - ${s.product_name || "N/A"} (${s.damaged} units)`,
      ),
    },
    {
      type: "alert",
      title: "Dead Stock Alert",
      severity: "warning",
      items: (summary?.dead_stock?.top_dead_stock || []).map(
        (s) =>
          `${s.sku} - ${s.product_name || "N/A"} (${s.available_qty} units idle)`,
      ),
    },
    {
      type: "alert",
      title: "Expiry Risk",
      severity: "danger",
      items: (summary?.expiry_risk?.top_expiry_risk_skus || []).map(
        (s) => `${s.sku} - Near: ${s.near_expiry} | Expired: ${s.expiry}`,
      ),
    },
    {
      type: "alert",
      title: "QC Failures",
      severity: "info",
      items: (summary?.qc_performance?.worst_performing_skus || []).map(
        (s) =>
          `${s.sku} - Fail Rate: ${s.fail_rate}% (${s.qc_failed}/${s.qc_passed + s.qc_failed + s.qc_pending})`,
      ),
    },
    {
      type: "alert",
      title: "Understock Warning",
      severity: "warning",
      items: (summary?.understock_risk?.top_understock || []).map(
        (s) =>
          `${s.sku} - ${s.available_qty} units (threshold: ${summary?.understock_risk?.safety_stock_threshold || 5})`,
      ),
    },
  ];

  const sectionItems = {
    overview: overviewItems,
    stockHealth: stockHealthItems,
    charts: chartItems,
    alerts: alertItems,
  };

  const currentItems = sectionItems[activeSection] || [];

  const renderSectionContent = (item, idx) => {
    if (item.type === "card") {
      return (
        <div key={idx}>
          <MetricCard
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            color={item.color}
            formula={item.formula}
          />
        </div>
      );
    }

    if (item.type === "healthBars") {
      return (
        <div key={idx}>
          <div className="metric-sdw bg-white rounded-xl border border-[#001a8e]/20 p-5 h-full flex flex-col">
            <h3 className="font-bold text-zinc-700 mb-3 poppins uppercase tracking-wider text-md shrink-0">
              Stock Health Breakdown
            </h3>
            <div className="flex-1 overflow-hidden">
              {healthBars.map((bar) => (
                <ProgressBar
                  key={bar.label}
                  label={bar.label}
                  value={bar.value}
                  total={summary?.stock_health?.total_received || 1}
                  color={bar.color}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (item.type === "channelBars") {
      return (
        <div key={idx}>
          <div className="metric-sdw bg-white rounded-xl border border-[#001a8e]/20 p-5 h-full flex flex-col">
            <h3 className="font-bold text-zinc-700 mb-3 poppins uppercase tracking-wider text-md shrink-0">
              Channel Distribution
            </h3>
            <div className="flex-1 overflow-hidden">
              {channelBars.map((bar) => (
                <ProgressBar
                  key={bar.label}
                  label={bar.label}
                  value={bar.value}
                  total={
                    summary?.channel_distribution?.total_channel_units || 1
                  }
                  color={bar.color}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (item.type === "donut") {
      return <div key={idx}>{renderDonut(item.data, item.title)}</div>;
    }

    if (item.type === "bar") {
      return (
        <div key={idx}>
          {renderBarChart(item.data, "value", "label", "color", item.title)}
        </div>
      );
    }

    if (item.type === "alert") {
      return (
        <div key={idx}>
          <AlertCard
            title={item.title}
            severity={item.severity}
            items={item.items}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="poppins w-full relative">
      <div className="relative bg-[#001a8e] rounded-xl flex h-[78vh] min-h-100">
        {/* Left Sidebar */}
        <div className="z-10 text-white h-full flex flex-col w-1/4 bg-[#001a8e] rounded-l-xl border-r border-white/20">
          <div className="p-5 flex flex-col gap-4 h-full">
            <div className="w-full grid grid-cols-2 gap-3">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.key;
                return (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`group relative flex flex-col items-center justify-center gap-2 py-5 px-2 rounded-xl poppins transition-all duration-200
                      ${
                        isActive
                          ? "bg-white text-[#001a8e] shadow-lg scale-[1.03]"
                          : "bg-white/10 text-white"
                      }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
                        ${isActive ? "bg-[#001a8e]/10" : "bg-white/10 group-hover:bg-white/20"}`}
                    >
                      {section.icon(isActive)}
                    </div>
                    <span className="text-xs font-semibold leading-tight text-center">
                      {section.label}
                    </span>
                    <span
                      className={`text-[10px] leading-tight text-center transition-all duration-200
                      ${isActive ? "text-[#001a8e]/60" : "text-white/50 group-hover:text-white/70"}`}
                    >
                      {section.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Inventory Snapshot */}
            {activeSection === "overview" && (
              <div className="bg-white rounded-xl p-5 flex flex-col gap-1 shrink-0">
                <span className="poppins uppercase tracking-wider text-[#001a8e] text-xs opacity-70">
                  Inventory Snapshot
                </span>
                <p className="text-xl font-bold text-zinc-900 poppins">
                  {totalSkus.toLocaleString()}{" "}
                  <span className="text-xs font-semibold text-zinc-600">
                    SKUs Loaded
                  </span>
                </p>
                <div className="mt-1 pt-2 border-t border-zinc-100">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wide">
                    Date Range
                  </p>
                  <p className="text-xs font-semibold text-zinc-700 poppins">
                    {startDate} — {endDate}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-3/4 h-full bg-[#001a8e] flex flex-col rounded-xl overflow-hidden">
          <div className="flex-1 p-5 min-h-0">
            {activeSection === "overview" && (
              <div className="grid grid-cols-2 grid-rows-4 gap-3 h-full">
                {currentItems.map((item, idx) =>
                  renderSectionContent(item, idx),
                )}
              </div>
            )}
            {activeSection === "stockHealth" && (
              <div className="grid grid-cols-2 gap-3 h-full">
                {currentItems.map((item, idx) =>
                  renderSectionContent(item, idx),
                )}
              </div>
            )}
            {activeSection === "charts" && (
              <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full">
                {currentItems
                  .slice(0, 4)
                  .map((item, idx) => renderSectionContent(item, idx))}
              </div>
            )}
            {activeSection === "alerts" && (
              <div className="flex flex-col gap-3 h-full">
                {/* Dead Score Table - full width */}
                {summary?.dead_score?.top_10_dead_score?.length > 0 && (
                  <div className="metric-sdw bg-white rounded-xl border border-[#001a8e]/20 p-3 flex flex-col shrink-0">
                    <h3 className="font-bold text-zinc-700 mb-2 poppins uppercase tracking-wider text-sm shrink-0 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      Dead Score — Top 10 SKUs
                      <span className="text-[10px] font-normal text-zinc-400 ml-auto normal-case tracking-normal">
                        (0.4×log(Qty) + 0.6×log(Age)) × Channel × Expiry
                      </span>
                    </h3>
                    <div className="overflow-auto flex-1 min-h-0">
                      <table className="w-full text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-200">
                            <th className="text-left py-1.5 px-2 font-semibold text-zinc-500 oswald uppercase tracking-wider">#</th>
                            <th className="text-left py-1.5 px-2 font-semibold text-zinc-500 oswald uppercase tracking-wider">SKU</th>
                            <th className="text-left py-1.5 px-2 font-semibold text-zinc-500 oswald uppercase tracking-wider">Product</th>
                            <th className="text-right py-1.5 px-2 font-semibold text-zinc-500 oswald uppercase tracking-wider">Qty</th>
                            <th className="text-right py-1.5 px-2 font-semibold text-zinc-500 oswald uppercase tracking-wider">Channel</th>
                            <th className="text-right py-1.5 px-2 font-semibold text-zinc-500 oswald uppercase tracking-wider">Age (days)</th>
                            <th className="text-right py-1.5 px-2 font-semibold text-zinc-500 oswald uppercase tracking-wider">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summary.dead_score.top_10_dead_score.map((s, i) => (
                            <tr
                              key={i}
                              className={`border-b border-zinc-100 transition-colors hover:bg-red-50/60 ${i === 0 ? "bg-red-50/40" : ""}`}
                            >
                              <td className="py-1.5 px-2 text-zinc-400 font-medium">{i + 1}</td>
                              <td className="py-1.5 px-2 font-semibold text-zinc-800">{s.sku}</td>
                              <td className="py-1.5 px-2 text-zinc-600 truncate max-w-[140px]">{s.product_name || "—"}</td>
                              <td className="py-1.5 px-2 text-right font-medium text-zinc-700">{s.available_qty?.toLocaleString()}</td>
                              <td className="py-1.5 px-2 text-right">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.total_channel === 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                  {s.total_channel === 0 ? "None" : s.total_channel?.toLocaleString()}
                                </span>
                              </td>
                              <td className="py-1.5 px-2 text-right">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.age_days > 365 ? "bg-red-100 text-red-700" : s.age_days > 180 ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-600"}`}>
                                  {Math.round(s.age_days)}
                                </span>
                              </td>
                              <td className="py-1.5 px-2 text-right">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${s.dead_score > 7 ? "bg-red-100 text-red-700" : s.dead_score > 5 ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-600"}`}>
                                  {s.dead_score}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {/* Remaining alerts grid */}
                <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                  {currentItems.map((item, idx) =>
                    renderSectionContent(item, idx),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
