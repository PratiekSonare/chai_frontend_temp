"use client";

import { useState, useEffect, useCallback } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { formatMetricValue } from "../orders/utils/formatMetricValue";

const S3_BASE = "https://chupps-data-portal.s3.amazonaws.com";
const SKU_PREFIX = "sku-metrics/";

const CHART_COLORS = ["#1e40af", "#4f46e5", "#059669", "#7c3aed", "#dc2626", "#ea580c", "#0891b2", "#065f46"];

const SECTIONS = [
    { key: "overview",     label: "Overview",          subtitle: "Cumulative KPIs" },
    { key: "marketplace",  label: "By Marketplace",    subtitle: "Channel metrics" },
    { key: "pricing",      label: "Pricing & Margins", subtitle: "Price history" },
    { key: "geographic",   label: "Geographic",        subtitle: "State breakdown" },
    { key: "size",         label: "Size Breakdown",    subtitle: "Size mix" },
    { key: "daily",        label: "Daily Trends",      subtitle: "Revenue & units" },
    { key: "fulfillment",  label: "Fulfillment",       subtitle: "Courier & warehouse" },
];

const OVERVIEW_FIELDS = [
    { key: "total_revenue",     label: "Total Revenue",     currency: true },
    { key: "total_units_sold",  label: "Units Sold" },
    { key: "total_orders",      label: "Total Orders" },
    { key: "avg_order_value",   label: "Avg Order Value",   currency: true },
    { key: "total_cogs",        label: "Total COGS",        currency: true },
    { key: "gross_margin_pct",  label: "Gross Margin",      percent: true },
    { key: "cancellation_rate", label: "Cancellation Rate", percent: true },
    { key: "return_rate",       label: "Return Rate",       percent: true },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4" style={{ minWidth: 200 }}>
            <p className="font-semibold text-gray-800 text-sm mb-2">{label}</p>
            {payload.map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-4 text-sm py-0.5">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-gray-500">{entry.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{typeof entry.value === "number" ? entry.value.toLocaleString("en-IN") : entry.value}</span>
                </div>
            ))}
        </div>
    );
};

function SemiCircle({ pct }) {
    const clamped = Math.min(Math.max(pct, 0), 100);
    const arc = (clamped / 100) * 125.6;
    return (
        <svg width="100" height="60" viewBox="0 0 100 60" className="overflow-visible">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e5e7eb" strokeWidth="5" strokeLinecap="round" />
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#001a8e" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${arc} 125.6`} style={{ transformOrigin: "50px 50px", transform: "scaleX(-1)" }} />
        </svg>
    );
}

function Spinner({ size = 5 }) {
    return <span className={`h-${size} w-${size} rounded-full border-2 border-[#001a8e] border-t-transparent animate-spin inline-block`} />;
}

function EmptyState({ message }) {
    return (
        <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <span className="text-sm text-gray-500">{message}</span>
        </div>
    );
}

// ── Section renderers ──────────────────────────────────────────────────────

function OverviewSection({ cumulative }) {
    if (!cumulative) return <EmptyState message="No cumulative data" />;
    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 p-4 overflow-y-auto h-full">
            {OVERVIEW_FIELDS.map(({ key, label, currency, percent }) => {
                const val = cumulative[key];
                return (
                    <div key={key} className="bg-zinc-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                        <span className="oswald uppercase tracking-wider text-[#001a8e] text-sm">{label}</span>
                        {percent ? (
                            <div className="flex flex-col items-start">
                                <SemiCircle pct={val ?? 0} />
                                <span className="text-2xl font-bold text-[#001a8e] -mt-2">{formatMetricValue(val, { percent: true })}</span>
                            </div>
                        ) : (
                            <span className="text-2xl font-bold text-[#001a8e]">
                                {formatMetricValue(val, { currency })}
                            </span>
                        )}
                    </div>
                );
            })}

            {/* Order status breakdown */}
            {cumulative.order_status_breakdown && (
                <div className="col-span-2 bg-zinc-50 border border-gray-200 rounded-xl p-4">
                    <span className="oswald uppercase tracking-wider text-[#001a8e] text-sm block mb-3">Order Status Breakdown</span>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(cumulative.order_status_breakdown).map(([status, count]) => (
                            <span key={status} className="px-3 py-1 rounded-full bg-[#001a8e]/10 text-[#001a8e] text-sm poppins capitalize">
                                {status}: <strong>{count}</strong>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment split */}
            {cumulative.payment_split && (
                <div className="col-span-2 bg-zinc-50 border border-gray-200 rounded-xl p-4">
                    <span className="oswald uppercase tracking-wider text-[#001a8e] text-sm block mb-3">Payment Split</span>
                    <div className="flex flex-col gap-2">
                        {Object.entries(cumulative.payment_split).map(([mode, data]) => (
                            <div key={mode} className="flex justify-between text-sm poppins">
                                <span className="capitalize text-gray-600">{mode}</span>
                                <span className="font-medium text-gray-900">
                                    {data.orders} orders · {formatMetricValue(data.revenue, { currency: true })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function MarketplaceSection({ byMarketplace }) {
    if (!byMarketplace || !Object.keys(byMarketplace).length) return <EmptyState message="No marketplace data" />;

    const chartData = Object.entries(byMarketplace).map(([mp, d]) => ({
        marketplace: mp,
        revenue: d.revenue,
        units_sold: d.units_sold,
        orders: d.order_count,
        gross_margin_pct: d.gross_margin_pct,
    }));

    return (
        <div className="p-4 h-full overflow-y-auto flex flex-col gap-4">
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="marketplace" tick={{ fontSize: 11, fontFamily: "poppins" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="units_sold" name="Units Sold" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {Object.entries(byMarketplace).map(([mp, d]) => (
                    <div key={mp} className="bg-zinc-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="oswald uppercase tracking-wider text-[#001a8e]">{mp}</span>
                            <span className="text-xs poppins text-gray-500">{d.revenue_share_pct}% revenue share</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm poppins">
                            <div><p className="text-gray-500 text-xs">Revenue</p><p className="font-semibold text-gray-900">{formatMetricValue(d.revenue, { currency: true })}</p></div>
                            <div><p className="text-gray-500 text-xs">Units</p><p className="font-semibold text-gray-900">{d.units_sold}</p></div>
                            <div><p className="text-gray-500 text-xs">Orders</p><p className="font-semibold text-gray-900">{d.order_count}</p></div>
                            <div><p className="text-gray-500 text-xs">Avg SP</p><p className="font-semibold text-gray-900">{formatMetricValue(d.avg_selling_price, { currency: true })}</p></div>
                            <div><p className="text-gray-500 text-xs">Avg MRP</p><p className="font-semibold text-gray-900">{formatMetricValue(d.avg_mrp, { currency: true })}</p></div>
                            <div><p className="text-gray-500 text-xs">Margin</p><p className="font-semibold text-[#059669]">{d.gross_margin_pct}%</p></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PricingSection({ priceHistory }) {
    const [activeMp, setActiveMp] = useState(null);

    const marketplaces = [...new Set((priceHistory || []).map(d => d.marketplace))];

    useEffect(() => {
        if (marketplaces.length && !activeMp) setActiveMp(marketplaces[0]);
    }, [marketplaces.join(",")]);

    if (!priceHistory?.length) return <EmptyState message="No price history data" />;

    const filtered = priceHistory.filter(d => d.marketplace === activeMp);

    return (
        <div className="p-4 h-full overflow-y-auto flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
                {marketplaces.map(mp => (
                    <button
                        key={mp}
                        onClick={() => setActiveMp(mp)}
                        className={`px-3 py-1 rounded-full text-sm poppins transition-all ${activeMp === mp ? "bg-[#001a8e] text-white" : "bg-[#001a8e]/10 text-[#001a8e] hover:bg-[#001a8e]/20"}`}
                    >
                        {mp}
                    </button>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={filtered} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "poppins" }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="avg_sp" name="Avg SP (₹)" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="avg_cp" name="Avg CP (₹)" stroke={CHART_COLORS[4]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="avg_mrp" name="Avg MRP (₹)" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </LineChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={180}>
                <LineChart data={filtered} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "poppins" }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="gross_margin_pct" name="Gross Margin %" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="mrp_discount_pct" name="MRP Discount %" stroke={CHART_COLORS[3]} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function GeographicSection({ byState, topStates }) {
    if (!byState || !Object.keys(byState).length) return <EmptyState message="No geographic data" />;

    const sorted = Object.entries(byState)
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 10)
        .map(([state, d]) => ({ state, ...d }));

    return (
        <div className="p-4 h-full overflow-y-auto flex flex-col gap-4">
            {topStates?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs poppins text-gray-500 self-center">Top states:</span>
                    {topStates.map((s, i) => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-xs poppins font-medium" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + "22", color: CHART_COLORS[i % CHART_COLORS.length] }}>
                            {s}
                        </span>
                    ))}
                </div>
            )}

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="state" tick={{ fontSize: 11, fontFamily: "poppins" }} width={75} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue (₹)" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="units_sold" name="Units Sold" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function SizeSection({ bySize, totalRevenue }) {
    if (!bySize || !Object.keys(bySize).length) return <EmptyState message="No size data" />;

    const data = Object.entries(bySize)
        .sort(([, a], [, b]) => b.units_sold - a.units_sold)
        .map(([size, d]) => ({ size, ...d }));

    return (
        <div className="p-4 h-full overflow-y-auto flex flex-col gap-4">
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="size" tick={{ fontSize: 11, fontFamily: "poppins" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="units_sold" name="Units Sold" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="revenue_share_pct" name="Revenue Share %" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 xl:grid-cols-5 gap-2">
                {data.map(({ size, units_sold, revenue, revenue_share_pct }) => (
                    <div key={size} className="bg-zinc-50 border border-gray-200 rounded-xl p-3 text-center">
                        <div className="oswald text-[#001a8e] text-lg font-bold">Size {size}</div>
                        <div className="poppins text-gray-500 text-xs mt-1">{units_sold} units</div>
                        <div className="poppins text-gray-500 text-xs">{revenue_share_pct}% share</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DailySection({ dailySeries }) {
    if (!dailySeries?.length) return <EmptyState message="No daily data" />;

    const data = dailySeries.map(d => ({
        ...d,
        date_short: d.order_date?.slice(5),
    }));

    return (
        <div className="p-4 h-full overflow-y-auto flex flex-col gap-4">
            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date_short" tick={{ fontSize: 10, fontFamily: "poppins" }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="units_sold" name="Units Sold" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date_short" tick={{ fontSize: 10, fontFamily: "poppins" }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="gross_margin_pct" name="Gross Margin %" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="mrp_discount_pct" name="MRP Discount %" stroke={CHART_COLORS[3]} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function FulfillmentSection({ courierDist, warehouseDist }) {
    const courierData = Object.entries(courierDist || {}).map(([name, orders]) => ({ name, orders }));
    const warehouseData = Object.entries(warehouseDist || {}).map(([name, units]) => ({ name, units }));

    if (!courierData.length && !warehouseData.length) return <EmptyState message="No fulfillment data" />;

    return (
        <div className="p-4 h-full overflow-y-auto flex flex-col gap-6">
            {courierData.length > 0 && (
                <div>
                    <span className="oswald uppercase tracking-wider text-[#001a8e] text-base block mb-3">Courier Distribution</span>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={courierData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "poppins" }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="orders" name="Orders" radius={[4, 4, 0, 0]}>
                                {courierData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {warehouseData.length > 0 && (
                <div>
                    <span className="oswald uppercase tracking-wider text-[#001a8e] text-base block mb-3">Warehouse Distribution</span>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={warehouseData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "poppins" }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="units" name="Units" radius={[4, 4, 0, 0]}>
                                {warehouseData.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function SkuMetricsCard({ refreshKey }) {
    const [skuList, setSkuList] = useState([]);
    const [skuSearch, setSkuSearch] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedSku, setSelectedSku] = useState(null);
    const [skuData, setSkuData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState(null);
    const [selectedSection, setSelectedSection] = useState("overview");

    const fetchSkuList = useCallback(async () => {
        setListLoading(true);
        setListError(null);
        try {
            const res = await fetch(
                `${S3_BASE}/?list-type=2&prefix=${SKU_PREFIX}&max-keys=1000`
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const xml = await res.text();
            const doc = new DOMParser().parseFromString(xml, "text/xml");
            const keys = [...doc.querySelectorAll("Contents Key")]
                .map(el => el.textContent)
                .filter(k => !k.includes("_meta/") && k.endsWith(".json"))
                .map(k => k.replace(SKU_PREFIX, "").replace(".json", ""))
                .sort();
            setSkuList(keys);
        } catch (e) {
            setListError("Could not load SKU list. Ensure public listing is enabled on s3://chupps-data-portal/sku-metrics/.");
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSkuList();
    }, [fetchSkuList, refreshKey]);

    const fetchSkuData = useCallback(async (sku) => {
        setLoading(true);
        setSkuData(null);
        try {
            const res = await fetch(`${S3_BASE}/${SKU_PREFIX}${sku}.json`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setSkuData(data);
            setSelectedSection("overview");
        } catch (e) {
            console.error("Failed to fetch SKU data:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSelectSku = useCallback((sku) => {
        setSelectedSku(sku);
        setSkuSearch(sku);
        setDropdownOpen(false);
        fetchSkuData(sku);
    }, [fetchSkuData]);

    const filteredSkus = skuList.filter(s =>
        s.toLowerCase().includes(skuSearch.toLowerCase())
    );

    const rolling = skuData?.rolling;

    const renderSection = () => {
        if (!skuData) return null;
        switch (selectedSection) {
            case "overview":    return <OverviewSection cumulative={skuData.cumulative} />;
            case "marketplace": return <MarketplaceSection byMarketplace={skuData.by_marketplace} />;
            case "pricing":     return <PricingSection priceHistory={skuData.price_history_by_marketplace} />;
            case "geographic":  return <GeographicSection byState={skuData.by_state} topStates={skuData.top_states} />;
            case "size":        return <SizeSection bySize={skuData.by_size} totalRevenue={skuData.cumulative?.total_revenue} />;
            case "daily":       return <DailySection dailySeries={skuData.daily_series} />;
            case "fulfillment": return <FulfillmentSection courierDist={skuData.courier_distribution} warehouseDist={skuData.warehouse_distribution} />;
            default:            return null;
        }
    };

    return (
        <div className="w-[90%] h-screen flex flex-col justify-center items-start gap-10 overflow-y-auto">
            <div className="flex flex-col items-start text-left">
                <span className="poppins font-extrabold text-3xl">Chupps SKU Catalogue</span>
                <span className="poppins text-lg text-gray-500">
                    Select a SKU from the dropdown to explore its full metrics profile.
                </span>
            </div>

            <div className="poppins w-[96%] relative">
                <div className="relative bg-[#001a8e] rounded-xl flex h-[85vh] min-h-[600px]">

                    {/* ── Left Sidebar ── */}
                    <div className="z-10 pb-4 text-white h-full flex flex-col justify-between gap-4 w-1/4 bg-[#001a8e] rounded-l-xl overflow-y-auto sticky top-0">

                        {/* SKU Selector */}
                        <div className="px-4 pt-4 shrink-0">
                            <span className="text-xs uppercase tracking-widest text-white/60 mb-2 block">Select SKU</span>
                            <div className="relative">
                                <input
                                    className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm poppins focus:outline-none focus:border-white/60 transition-colors"
                                    placeholder={listLoading ? "Loading SKUs..." : "Search SKU..."}
                                    value={skuSearch}
                                    onChange={e => { setSkuSearch(e.target.value); setDropdownOpen(true); }}
                                    onFocus={() => setDropdownOpen(true)}
                                    disabled={listLoading}
                                />
                                {dropdownOpen && filteredSkus.length > 0 && (
                                    <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-52 overflow-y-auto">
                                        {filteredSkus.map(sku => (
                                            <button
                                                key={sku}
                                                onMouseDown={() => handleSelectSku(sku)}
                                                className={`w-full text-left px-3 py-2 text-sm poppins hover:bg-[#001a8e]/10 transition-colors ${selectedSku === sku ? "bg-[#001a8e]/10 font-semibold text-[#001a8e]" : "text-gray-800"}`}
                                            >
                                                {sku}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {listLoading && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-white/60">
                                    <Spinner size={3} />
                                    <span>Loading SKU list...</span>
                                </div>
                            )}
                            {listError && (
                                <p className="text-xs text-red-300 mt-2 leading-relaxed">{listError}</p>
                            )}
                            {!listLoading && !listError && (
                                <p className="text-xs text-white/40 mt-1">{skuList.length} SKUs available</p>
                            )}
                        </div>

                        {/* Section Navigation */}
                        <div className="px-4 shrink-0">
                            <span className="text-xs uppercase tracking-widest text-white/60 mb-2 block">Sections</span>
                            <div className="grid grid-cols-2 gap-2">
                                {SECTIONS.map(({ key, label, subtitle }) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedSection(key)}
                                        disabled={!skuData}
                                        className={`group overflow-hidden px-3 py-2.5 rounded-lg poppins transition-all flex flex-col items-start gap-1 disabled:opacity-40 disabled:cursor-not-allowed
                                            ${selectedSection === key
                                                ? "bg-white text-[#001a8e] shadow-lg"
                                                : "bg-white/10 text-white hover:bg-white/20 border border-white/30"}`}
                                    >
                                        <span className="translate-y-2.5 group-hover:translate-y-0 ease-in duration-100 text-xs font-semibold leading-tight">{label}</span>
                                        <span className="-translate-x-44 group-hover:translate-x-0 ease-in duration-100 text-xs opacity-60">{subtitle}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rolling Window Quick Stats */}
                        {rolling && (
                            <div className="px-4 flex-1 overflow-y-auto">
                                <span className="text-xs uppercase tracking-widest text-white/60 mb-2 block">Rolling Windows</span>
                                {[7, 30].map(days => {
                                    const w = rolling[`${days}d`];
                                    if (!w) return null;
                                    return (
                                        <div key={days} className="bg-white/10 border border-white/20 rounded-lg p-3 mb-2">
                                            <div className="text-white/70 text-xs uppercase tracking-wider mb-2">Last {days} days</div>
                                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                                                <div><div className="text-white/50">Revenue</div><div className="text-white font-semibold">{formatMetricValue(w.revenue, { currency: true })}</div></div>
                                                <div><div className="text-white/50">Units</div><div className="text-white font-semibold">{w.units_sold}</div></div>
                                                <div><div className="text-white/50">Orders</div><div className="text-white font-semibold">{w.orders}</div></div>
                                                <div><div className="text-white/50">Margin</div><div className="text-white font-semibold">{w.gross_margin_pct}%</div></div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {skuData?.last_updated && (
                                    <p className="text-xs text-white/30 mt-2">
                                        Updated: {new Date(skuData.last_updated).toLocaleDateString("en-IN")}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Right Content Area ── */}
                    <div className="w-3/4 h-full bg-[#001a8e] border border-transparent flex flex-col rounded-r-xl">
                        <div className="flex-1 m-3 bg-zinc-50 rounded-xl overflow-hidden flex flex-col">

                            {/* Section header */}
                            {skuData && (
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
                                    <div>
                                        <span className="oswald uppercase tracking-wider text-[#001a8e] text-lg">
                                            {SECTIONS.find(s => s.key === selectedSection)?.label}
                                        </span>
                                        <span className="ml-2 poppins text-sm text-gray-500">
                                            — {skuData.sku}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 overflow-hidden">
                                {loading ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-3">
                                        <Spinner size={8} />
                                        <span className="poppins text-sm text-gray-500">Loading SKU data...</span>
                                    </div>
                                ) : !selectedSku ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-8">
                                        <svg className="w-16 h-16 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        <p className="poppins text-gray-400 text-sm">Select a SKU from the sidebar to view its metrics</p>
                                    </div>
                                ) : !skuData ? (
                                    <EmptyState message="No data found for this SKU" />
                                ) : (
                                    renderSection()
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
