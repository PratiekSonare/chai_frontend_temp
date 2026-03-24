"use client";

import { apiUrl } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { Kbd } from "@/components/ui/kbd"
import KpiChartDialog from "@/components/KpiChartDialog";

export default function MetricCard() {

    const ENUM_TYPES_BASE_URL = "https://chupps-data-portal.s3.amazonaws.com/enum_types";
    const normalizeEnumValues = (payload, expectedKey) => {

        if (payload && typeof payload === "object") {
            if (Array.isArray(payload[expectedKey])) {
                return payload[expectedKey].map((value) => String(value).trim()).filter(Boolean);
            }

            const firstArrayValue = Object.values(payload).find((value) => Array.isArray(value));
            if (Array.isArray(firstArrayValue)) {
                return firstArrayValue.map((value) => String(value).trim()).filter(Boolean);
            }
        }

        return [];
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const [startDate, setStartDate] = useState("2025-09-01");
    const [endDate, setEndDate] = useState("2026-02-28");
    const [kpiData, setKpiData] = useState({});
    const [loading, setLoading] = useState(false);
    const [namesLoading, setNamesLoading] = useState(false);
    const [warehouseNames, setWarehouseNames] = useState([]);
    const [marketplaceNames, setMarketplaceNames] = useState([]);
    const [courierNames, setCourierNames] = useState([]);
    const [billingStateNames, setBillingStateNames] = useState([]);
    const [billingStateKey, setBillingStateKey] = useState("billing_state");
    const [selectedMarketplaces, setSelectedMarketplaces] = useState([]);
    const [selectedCouriers, setSelectedCouriers] = useState([]);
    const [selectedWarehouses, setSelectedWarehouses] = useState([]);
    const [selectedBillingStates, setSelectedBillingStates] = useState([]);
    const [isFilter, setIsFilter] = useState(false);
    const [selectedDatePreset, setSelectedDatePreset] = useState("all");

    const setDatePreset = (preset) => {
        const today = new Date();
        const end = formatDate(today);

        if (preset === "7d") {
            const start = new Date(today);
            start.setDate(today.getDate() - 6);
            setStartDate(formatDate(start));
            setEndDate(end);
            setSelectedDatePreset("7d");
            return;
        }

        if (preset === "30d") {
            const start = new Date(today);
            start.setDate(today.getDate() - 29);
            setStartDate(formatDate(start));
            setEndDate(end);
            setSelectedDatePreset("30d");
            return;
        }

        setStartDate("2025-09-01");
        setEndDate(end);
        setSelectedDatePreset("all");
    };

    const buildFilters = () => {
        const filters = {};
        if (selectedMarketplaces.length > 0) {
            filters.marketplace = selectedMarketplaces;
        }
        if (selectedCouriers.length > 0) {
            filters.courier = selectedCouriers;
        }
        if (selectedWarehouses.length > 0) {
            filters.import_warehouse_name = selectedWarehouses;
        }
        if (selectedBillingStates.length > 0) {
            filters[billingStateKey || "billing_state"] = selectedBillingStates;
        }
        return filters;
    };

    const kpiConfig = {
        totalOrders: { title: "Total Orders", color: "blue-700" },
        unitsSold: { title: "Units Sold", color: "indigo-700" },
        grossRevenue: { title: "Gross Revenue", color: "green-700", currency: true },
        aov: { title: "AOV", color: "violet-700", currency: true },
        uniqueSkus: { title: "Unique SKUs", color: "cyan-700" },
        cancellationRate: { title: "Cancellation Rate", color: "rose-700", percent: true },
        returnRate: { title: "Return Rate", color: "orange-700", percent: true },
        codShare: { title: "COD Share", color: "emerald-700", percent: true },
        deliveredRate: { title: "Delivered Rate", color: "teal-700", percent: true }
    };

    const formatMetricValue = (value, options = {}) => {
        if (value === null || value === undefined || Number.isNaN(Number(value))) {
            return "0";
        }

        const numericValue = Number(value);
        if (options.currency) {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
            }).format(numericValue);
        }
        if (options.percent) {
            return `${numericValue.toFixed(2)}%`;
        }
        return new Intl.NumberFormat("en-IN").format(numericValue);
    };

    const toggleSelection = (value, setter) => {
        setter((previous) =>
            previous.includes(value)
                ? previous.filter((item) => item !== value)
                : [...previous, value]
        );
    };

    const resetSelections = (setter) => setter([]);

    const fetchKPI = useCallback(async (filters = {}, dateRange = {}) => {
        setLoading(true);
        try {
            const resolvedStartDate = "2025-09-01";
            const resolvedEndDate = "2026-02-28";

            const payload = {
                table_name: "history-orders-dev",
                start_date: `${resolvedStartDate} 00:00:00`,
                end_date: `${resolvedEndDate} 23:59:59`,
                filters,
            };

            const response = await fetch(apiUrl("/history/kpi/all"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`KPI fetch failed with status ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                const transformed = {};
                Object.keys(result.data).forEach((key) => {
                    transformed[key] = result.data[key];
                });
                setKpiData(transformed);
            } else {
                throw new Error("Invalid KPI response format");
            }
        } catch (error) {
            console.error("Error while fetching KPI data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleApplyFilters = () => {
        fetchKPI(buildFilters(), { startDate, endDate });
    };

    useEffect(() => {
        const currentDate = formatDate(new Date());
        fetchKPI({}, { startDate: "2025-09-01", endDate: currentDate });
    }, [fetchKPI]);

    useEffect(() => {
        setIsFilter(
            selectedMarketplaces.length > 0 ||
            selectedCouriers.length > 0 ||
            selectedWarehouses.length > 0 ||
            selectedBillingStates.length > 0
        );
    }, [selectedMarketplaces, selectedCouriers, selectedWarehouses, selectedBillingStates, billingStateKey]);

    useEffect(() => {
        const fetchNames = async () => {
            setNamesLoading(true);

            try {
                const [marketplaceRes, courierRes, warehouseRes, billingStateRes] = await Promise.all([
                    fetch(`${ENUM_TYPES_BASE_URL}/marketplace_names.json`),
                    fetch(`${ENUM_TYPES_BASE_URL}/courier_names.json`),
                    fetch(`${ENUM_TYPES_BASE_URL}/warehouse_names.json`),
                    fetch(`${ENUM_TYPES_BASE_URL}/billing_state_names.json`),
                ]);

                const responses = [marketplaceRes, courierRes, warehouseRes, billingStateRes];
                responses.forEach((response, index) => {
                    if (!response.ok) {
                        throw new Error(`Enum file fetch failed at index ${index} with status ${response.status}`);
                    }
                });

                const [marketplaceData, courierData, warehouseData, billingStateData] = await Promise.all([
                    marketplaceRes.json(),
                    courierRes.json(),
                    warehouseRes.json(),
                    billingStateRes.json(),
                ]);

                setMarketplaceNames(marketplaceData.map((val) => val.marketplace ?? "null"));
                setCourierNames(courierData.map((val) => val.courier ?? "null"));
                setWarehouseNames(warehouseData.map((val) => val.import_warehouse_name ?? "null"));
                setBillingStateNames(billingStateData.map((val) => val.billing_state ?? "null"));
                setBillingStateKey("billing_state");
            } catch (error) {
                console.error("Error while fetching filter names:", error);
                setWarehouseNames([]);
                setMarketplaceNames([]);
                setCourierNames([]);
                setBillingStateNames([]);
                setBillingStateKey("billing_state");
            } finally {
                setNamesLoading(false);
            }
        };

        fetchNames();
    }, []);

    const renderFilterGroup = (title, options, selectedValues, setter) => (
        <div className="flex flex-col gap-2 p-3 px-4 border-t border-white/20">
            <div className="flex flex-row items-center justify-between">
                <span className="poppins text-sm uppercase">{title}</span>
                <button
                    type="button"
                    onClick={() => resetSelections(setter)}
                    className="text-[11px] uppercase tracking-wide text-white/80 hover:text-white"
                >
                    Clear
                </button>
            </div>

            <div className="max-h-24 overflow-y-auto pr-1 space-y-1">
                {options.length === 0 ? (
                    <span className="text-xs text-white/70">No options</span>
                ) : (
                    options.map((option) => (
                        <label key={option} className="flex items-center gap-2 text-xs text-white cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(option)}
                                onChange={() => toggleSelection(option, setter)}
                                className="h-3.5 w-3.5 accent-white"
                            />
                            <span className="truncate">{option}</span>
                        </label>
                    ))
                )}
            </div>
        </div>
    );
    return (
        <div className="w-[90%] h-screen flex flex-col justify-center items-start gap-10">

            <div className="flex flex-col items-start text-left">
                <span className="poppins font-extrabold text-3xl">Chupps Order Metrics</span>
                <span className="poppins text-lg text-gray-500">Filter out order metrics and get instant insights! Click on the expand button to get advanced, deeper data analysis.</span>
            </div>

            <div className="poppins w-[96%] h-3/4">
                <div className="relative h-full bg-[#001a8e] rounded-l-xl!">
                    <div className="z-10 py-4 text-white h-full flex flex-col w-1/4 bg-[#001a8e] rounded-l-xl overflow-y-auto" dir="ltr">
                        <div className="flex flex-col" dir="ltr">
                            <span className="oswald text-xl px-4">METRICS</span>
                            <span className="oswald text-sm text-gray-400 border-b border-white px-4 pb-4">Instant metrics for performance comparison</span>
                            <div className="flex flex-col gap-0 p-4">
                                <div className="flex flex-row gap-2 items-center">
                                    <span className="poppins text-sm uppercase">Date Range</span>
                                </div>
                                <div className="flex flex-row justify-between items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDatePreset("7d")}
                                        className={`border border-[#001a8e] w-full rounded-sm poppins text-xl flex flex-row items-center justify-between ${selectedDatePreset === "7d" ? "bg-[#001a8e] text-white border border-white" : "text-white bg-white"}`}
                                    >
                                        {/* <div className="w-2 h-2 rounded-full bg-white"></div> */}
                                        <span className={`oswald text-sm px-2 py-1 mx-auto ${selectedDatePreset === "7d" ? "text-white" : "text-[#001a8e]"}`}>Last 7 Days</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDatePreset("30d")}
                                        className={`border border-[#001a8e] w-full rounded-sm poppins text-xl flex flex-row items-center justify-between ${selectedDatePreset === "30d" ? "bg-[#001a8e] text-white border border-white" : "text-white bg-white"}`}
                                    >
                                        {/* <div className="w-2 h-2 rounded-full bg-white"></div> */}
                                        <span className={`oswald text-sm px-2 py-1 mx-auto ${selectedDatePreset === "30d" ? "text-white" : "text-[#001a8e]"}`}>Last 30 Days</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDatePreset("all")}
                                        className={`border border-[#001a8e] w-full rounded-sm poppins text-xl flex flex-row items-center justify-between ${selectedDatePreset === "all" ? "bg-[#001a8e] text-white border border-white" : "text-white bg-white"}`}
                                    >
                                        {/* <div className="w-2 h-2 rounded-full bg-white"></div> */}
                                        <span className={`oswald text-sm px-2 py-1 mx-auto ${selectedDatePreset === "all" ? "text-white" : "text-[#001a8e]"}`}>All Time</span>
                                    </button>
                                </div>
                            </div>

                            {namesLoading ? (
                                <div className="px-4 py-4 flex items-center gap-2 text-xs text-white/80">
                                    <span className="h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                                    <span>Loading filter options...</span>
                                </div>
                            ) : (
                                <>
                                    {renderFilterGroup("Filter by Marketplace", marketplaceNames, selectedMarketplaces, setSelectedMarketplaces)}
                                    {renderFilterGroup("Filter by Courier", courierNames, selectedCouriers, setSelectedCouriers)}
                                    {renderFilterGroup("Filter by Warehouse", warehouseNames, selectedWarehouses, setSelectedWarehouses)}
                                    {renderFilterGroup("Filter by Billing State", billingStateNames, selectedBillingStates, setSelectedBillingStates)}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="absolute inset-y-0 -right-5 h-full w-3/4">
                        <div className="relative h-full w-full grid grid-cols-3 grid-rows-3 items-stretch">
                            {Object.entries(kpiConfig).map(([key, config], idx) => {
                                const metric = kpiData[key] || {};
                                const value = metric?.value;
                                return (
                                    <div
                                        key={key}
                                        className={`relative group overflow-hidden ${idx % 3 === 0 ? "rounded-l-2xl" : "border-l-0"} ${(idx+1)%3 === 0 ? "rounded-r-2xl" : ""} ${idx < 3 ? "border-t" : ""} ${idx === 3 ? "" : ""} h-full w-full bg-zinc-50 border-l border-b border-r border-[#001a8e] pt-2 pl-2 flex flex-col justify-between`}
                                    >
                                        <KpiChartDialog
                                            metricKey={key}
                                            title={config.title}
                                            unit={metric?.unit || (config.currency ? "INR" : config.percent ? "%" : "")}
                                            formatMetricValue={formatMetricValue}
                                            filters={buildFilters()}
                                            tableName="history-orders-dev"
                                        />

                                        <span className="oswald uppercase tracking-wider text-[#001a8e] text-xl self-start justify-self-start">{config.title}</span>
                                        <span className={`text-${config.color} p-2 text-3xl font-bold self-end justify-self-end`}>
                                            {formatMetricValue(value, config)}
                                        </span>
                                    </div>
                                )
                            })}

                            {loading ? (
                                <div className="absolute inset-0 bg-white/55 backdrop-blur-[1px] flex items-center justify-center">
                                    <div className="flex items-center gap-2 rounded-md border border-[#001a8e]/30 bg-white px-3 py-2 text-[#001a8e]">
                                        <span className="h-5 w-5 rounded-full border-2 border-[#001a8e] border-t-transparent animate-spin" />
                                        <span className="oswald text-sm uppercase tracking-wide">Loading metrics...</span>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <button
                        onClick={handleApplyFilters}
                        disabled={!isFilter || loading}
                        className={`w-1/12 h-1/6 flex flex-col items-center justify-center absolute text-white rounded-l-xl bottom-0 left-0 transition-transform duration-200 ease-in -z-10 ${isFilter ? "bg-blue-600 -translate-x-24" : "bg-blue-400 cursor-not-allowed translate-x-0"}`}
                    >
                        <span>Apply</span>
                        <span>Filter</span>
                        <Kbd data-icon="inline-end" className="translate-x-0.5 bg-blue-800 text-white my-2 p-1">Ctrl + ⏎</Kbd>
                    </button>
                </div>
            </div>
        </div>
    )
}