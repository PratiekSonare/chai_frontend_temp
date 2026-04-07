"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import SvgTitle from './components/SvgTitle';
import { ENUM_TYPES_BASE_URL, METRICS_CONFIG } from "./utils/metricsConfig";
import {
    getInitialStartDate,
    getInitialEndDate,
    getDateRangeByPreset,
} from "./utils/dateHelper";
import { formatMetricValue } from "./utils/formatMetricValue";
import { renderChart } from "./components/ChartRenderer";
import FilterGroup from "./components/FilterGroup";
import { useFilterState, useBuildFilters } from "./hooks/useFilterState";
import { useFetchMetric } from "./hooks/useFetchMetric";

export default function MetricCard() {
    // Initialize state from utilities
    const [startDate, setStartDate] = useState(() => getInitialStartDate());
    const [endDate, setEndDate] = useState(() => getInitialEndDate());
    const [selectedDatePreset, setSelectedDatePreset] = useState("7d");

    // Filter state
    const filterState = useFilterState();
    const {
        selectedMarketplaces,
        setSelectedMarketplaces,
        selectedCouriers,
        setSelectedCouriers,
        selectedWarehouses,
        setSelectedWarehouses,
        selectedBillingStates,
        setSelectedBillingStates,
        marketplaceSearch,
        setMarketplaceSearch,
        courierSearch,
        setCourierSearch,
        warehouseSearch,
        setWarehouseSearch,
        billingStateSearch,
        setBillingStateSearch,
        toggleSelection,
        resetSelections,
    } = filterState;

    // Enum names state
    const [warehouseNames, setWarehouseNames] = useState([]);
    const [marketplaceNames, setMarketplaceNames] = useState([]);
    const [courierNames, setCourierNames] = useState([]);
    const [billingStateNames, setBillingStateNames] = useState([]);
    const [billingStateKey, setBillingStateKey] = useState("state");
    const [namesLoading, setNamesLoading] = useState(false);

    // Build filters
    const buildFilters = useBuildFilters(
        selectedMarketplaces,
        selectedCouriers,
        selectedWarehouses,
        selectedBillingStates,
        billingStateKey
    );

    // Metrics state and loading
    const {
        metricsData,
        setMetricsData,
        metricsLoading,
        setMetricsLoading,
        fetchAllMetricsAtOnce,
    } = useFetchMetric(startDate, endDate, buildFilters);

    // UI state
    const [selectedCategory, setSelectedCategory] = useState("primaryKpis");
    const [isFilter, setIsFilter] = useState(false);
    const initialFetchRef = useRef(false);
    const pendingDatePresetRef = useRef(null);

    // Handle date preset changes
    const handleDatePreset = useCallback(
        (preset) => {
            const { start, end } = getDateRangeByPreset(preset);
            pendingDatePresetRef.current = { preset, newStart: start, newEnd: end };
            setStartDate(start);
            setEndDate(end);
            setSelectedDatePreset(preset);
        },
        []
    );

    // Use metrics config from utilities
    const metricsConfig = METRICS_CONFIG;

    // Handle apply filters
    // Note: Filters are passed via buildFilters() in useFetchMetric hook's payload
    const handleApplyFilters = useCallback(() => {
        const appliedFilters = {
            marketplaces: selectedMarketplaces,
            couriers: selectedCouriers,
            warehouses: selectedWarehouses,
            billingStates: selectedBillingStates,
        };
        console.log('🔍 Applying filters:', appliedFilters);
        fetchAllMetricsAtOnce(metricsConfig, { startDate, endDate });
    }, [fetchAllMetricsAtOnce, metricsConfig, startDate, endDate, selectedMarketplaces, selectedCouriers, selectedWarehouses, selectedBillingStates]);

    // Handle keyboard shortcut: Ctrl + Enter
    const handleKeyDown = useCallback(
        (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                if (isFilter) {
                    handleApplyFilters();
                }
            }
        },
        [isFilter, handleApplyFilters]
    );

    // Attach keyboard event listener
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    // Handle date preset changes
    useEffect(() => {
        if (!pendingDatePresetRef.current) return;

        const { newStart, newEnd } = pendingDatePresetRef.current;
        pendingDatePresetRef.current = null;

        fetchAllMetricsAtOnce(metricsConfig, { startDate: newStart, endDate: newEnd });
    }, [fetchAllMetricsAtOnce, metricsConfig]);

    // Initial fetch on load
    useEffect(() => {
        if (initialFetchRef.current) return;
        initialFetchRef.current = true;

        fetchAllMetricsAtOnce(metricsConfig, { startDate, endDate });
    }, [fetchAllMetricsAtOnce, metricsConfig, startDate, endDate]);

    // Update filter state
    useEffect(() => {
        setIsFilter(
            selectedMarketplaces.length > 0 ||
            selectedCouriers.length > 0 ||
            selectedWarehouses.length > 0 ||
            selectedBillingStates.length > 0
        );
    }, [selectedMarketplaces, selectedCouriers, selectedWarehouses, selectedBillingStates]);

    // Fetch enum names
    useEffect(() => {
        const fetchNames = async () => {
            setNamesLoading(true);

            try {
                const [marketplaceRes, courierRes, warehouseRes, billingStateRes] =
                    await Promise.all([
                        fetch(`${ENUM_TYPES_BASE_URL}/marketplace_names.json`),
                        fetch(`${ENUM_TYPES_BASE_URL}/courier_names.json`),
                        fetch(`${ENUM_TYPES_BASE_URL}/warehouse_names.json`),
                        fetch(`${ENUM_TYPES_BASE_URL}/billing_state_names.json`),
                    ]);

                const responses = [marketplaceRes, courierRes, warehouseRes, billingStateRes];
                responses.forEach((response, index) => {
                    if (!response.ok) {
                        throw new Error(
                            `Enum file fetch failed at index ${index} with status ${response.status}`
                        );
                    }
                });

                const [marketplaceData, courierData, warehouseData, billingStateData] =
                    await Promise.all([
                        marketplaceRes.json(),
                        courierRes.json(),
                        warehouseRes.json(),
                        billingStateRes.json(),
                    ]);

                setMarketplaceNames(
                    marketplaceData.map((val) => val.marketplace ?? "null")
                );
                setCourierNames(courierData.map((val) => val.courier ?? "null"));
                setWarehouseNames(
                    warehouseData.map((val) => val.import_warehouse_name ?? "null")
                );
                setBillingStateNames(
                    billingStateData.map((val) => val.billing_state ?? "null")
                );
                setBillingStateKey("state");
            } catch (error) {
                console.error("Error while fetching filter names:", error);
                setWarehouseNames([]);
                setMarketplaceNames([]);
                setCourierNames([]);
                setBillingStateNames([]);
                setBillingStateKey("state");
            } finally {
                setNamesLoading(false);
            }
        };

        fetchNames();
    }, []);

    return (
        <div className="w-[90%] h-screen flex flex-col justify-center items-start gap-10 overflow-y-auto">
            <div className="flex flex-col items-start text-left">
                <span className="poppins font-extrabold text-3xl">Chupps Order Metrics</span>
                <span className="poppins text-lg text-gray-500">
                    Filter out order metrics and get instant insights! Click on any metric card to expand for detailed analysis.
                </span>
            </div>

            <div className="poppins w-[96%] relative">
                <div className="relative bg-[#001a8e] rounded-xl flex h-[85vh] min-h-[600px]"> {/* Optional: give parent a fixed/min height */}

                    {/* Left Sidebar - Filters */}
                    <div className="z-10 pb-4 text-white h-full flex flex-col justify-between w-1/4 bg-[#001a8e] rounded-l-xl overflow-y-auto sticky top-0">

                        {/* === CATEGORY NAVIGATION - Top (1/5) === */}
                        <div className="flex-shrink-0 px-4 pt-4 pb-3">
                            <div className="w-full grid grid-cols-2 gap-3">
                                {Object.entries(metricsConfig).map(([categoryKey, categoryData]) => (
                                    <button
                                        key={categoryKey}
                                        onClick={() => setSelectedCategory(categoryKey)}
                                        className={`px-4 py-3 rounded-lg poppins font-semibold transition-all flex flex-col items-start gap-1.5 ${selectedCategory === categoryKey
                                            ? "bg-white text-[#001a8e] shadow-lg"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                            }`}
                                    >
                                        <span className="text-sm">{categoryData.category}</span>
                                        <span className="text-xs opacity-70">{categoryData.subtitle || 'View metrics'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {namesLoading ? (
                            <div className="px-4 py-4 flex items-center gap-2 text-xs text-white/80">
                                <span className="h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin" />
                                <span>Loading filter options...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-0 overflow-hidden">
                                <SvgTitle svg={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 3H5C3.58579 3 2.87868 3 2.43934 3.4122C2 3.8244 2 4.48782 2 5.81466V6.50448C2 7.54232 2 8.06124 2.2596 8.49142C2.5192 8.9216 2.99347 9.18858 3.94202 9.72255L6.85504 11.3624C7.49146 11.7206 7.80967 11.8998 8.03751 12.0976C8.51199 12.5095 8.80408 12.9935 8.93644 13.5872C9 13.8722 9 14.2058 9 14.8729L9 17.5424C9 18.452 9 18.9067 9.25192 19.2613C9.50385 19.6158 9.95128 19.7907 10.8462 20.1406C12.7248 20.875 13.6641 21.2422 14.3321 20.8244C15 20.4066 15 19.4519 15 17.5424V14.8729C15 14.2058 15 13.8722 15.0636 13.5872C15.1959 12.9935 15.488 12.5095 15.9625 12.0976C16.1903 11.8998 16.5085 11.7206 17.145 11.3624L20.058 9.72255C21.0065 9.18858 21.4808 8.9216 21.7404 8.49142C22 8.06124 22 7.54232 22 6.50448V5.81466C22 4.48782 22 3.8244 21.5607 3.4122C21.1213 3 20.4142 3 19 3Z" stroke="#fff" strokeWidth="1.5"></path> </g></svg>}
                                    margin="gap-0"
                                    title="FILTER BY" />
                                <div className="flex flex-col gap-4 px-4 py-3 border-t border-white/20">
                                    <span className="poppins text-sm uppercase">Date Range</span>
                                    <div className="flex flex-row justify-between items-center gap-2">
                                        {["7d", "30d", "all"].map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => handleDatePreset(preset)}
                                                className={`border w-full rounded-sm poppins text-sm py-2 transition-all ${selectedDatePreset === preset
                                                    ? "bg-[#001a8e] text-white border-white"
                                                    : "bg-white text-[#001a8e] border-[#001a8e]"
                                                    }`}
                                            >
                                                {preset === "7d" ? "Last 7 Days" : preset === "30d" ? "Last 30 Days" : "All Time"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <FilterGroup
                                    title="Marketplace"
                                    options={marketplaceNames}
                                    selectedValues={selectedMarketplaces}
                                    onToggleSelection={(value) =>
                                        toggleSelection(value, setSelectedMarketplaces)
                                    }
                                    onResetSelections={() => resetSelections(setSelectedMarketplaces)}
                                    searchValue={marketplaceSearch}
                                    onSearchChange={setMarketplaceSearch}
                                />
                                <FilterGroup
                                    title="Courier"
                                    options={courierNames}
                                    selectedValues={selectedCouriers}
                                    onToggleSelection={(value) =>
                                        toggleSelection(value, setSelectedCouriers)
                                    }
                                    onResetSelections={() => resetSelections(setSelectedCouriers)}
                                    searchValue={courierSearch}
                                    onSearchChange={setCourierSearch}
                                />
                                <FilterGroup
                                    title="Warehouse"
                                    options={warehouseNames}
                                    selectedValues={selectedWarehouses}
                                    onToggleSelection={(value) =>
                                        toggleSelection(value, setSelectedWarehouses)
                                    }
                                    onResetSelections={() => resetSelections(setSelectedWarehouses)}
                                    searchValue={warehouseSearch}
                                    onSearchChange={setWarehouseSearch}
                                />
                                <FilterGroup
                                    title="Billing State"
                                    options={billingStateNames}
                                    selectedValues={selectedBillingStates}
                                    onToggleSelection={(value) =>
                                        toggleSelection(value, setSelectedBillingStates)
                                    }
                                    onResetSelections={() => resetSelections(setSelectedBillingStates)}
                                    searchValue={billingStateSearch}
                                    onSearchChange={setBillingStateSearch}
                                />
                                
                                {/* Apply Filters Button */}
                                {isFilter && (
                                    <div className="px-4 py-3 border-t border-white/20">
                                        <button
                                            onClick={handleApplyFilters}
                                            disabled={Object.values(metricsLoading).some(v => v)}
                                            className={`w-full px-4 py-3 rounded-lg poppins font-semibold transition-all flex items-center justify-center gap-2 ${
                                                Object.values(metricsLoading).some(v => v)
                                                    ? "bg-white/30 text-white/60 cursor-not-allowed"
                                                    : "bg-white text-[#001a8e] hover:bg-white/90 active:scale-95 shadow-lg"
                                            }`}
                                        >
                                            {Object.values(metricsLoading).some(v => v) ? (
                                                <>
                                                    <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                                    <span>Applying...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                                                    </svg>
                                                    <span>Apply Filters</span>
                                                </>
                                            )}
                                        </button>
                                        <span className="text-xs text-white/60 mt-2 block text-center">
                                            {selectedMarketplaces.length + selectedCouriers.length + selectedWarehouses.length + selectedBillingStates.length} filter{(selectedMarketplaces.length + selectedCouriers.length + selectedWarehouses.length + selectedBillingStates.length) !== 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Content Area - Metrics */}
                    <div className="w-3/4 h-full bg-[#001a8e] border border-transparent flex flex-col rounded-xl">

                        {/* === METRICS CAROUSEL - Takes 4/5 height === */}
                        <div className="flex-1 flex flex-col py-4 min-h-0 overflow-y-hidden">
                            <Carousel
                                opts={{
                                    align: "start",
                                    loop: true,
                                }}
                                orientation="vertical"
                                className="w-full h-full relative overflow-y-scroll hide-scrollbar"
                            >
                                <CarouselContent className="h-full rounded-xl!">
                                    {metricsConfig[selectedCategory] &&
                                        Object.entries(metricsConfig[selectedCategory].metrics).map(
                                            ([metricKey, metricConfig]) => {
                                                const metricData = metricsData[metricKey];
                                                const isLoading = metricsLoading[metricKey];
                                                const data = metricData?.data;
                                                const chartData = metricData?.chart;

                                                return (
                                                    <CarouselItem key={metricKey} className="basis-1/2 rounded-xl">
                                                        <div className="bg-zinc-50 border-l border-b border-r border-[#001a8e] h-full flex flex-col rounded-xl">

                                                            <div className="flex flex-col gap-2 pt-3 pl-3 pb-2">
                                                                <span className="oswald uppercase tracking-wider text-[#001a8e] text-xl">
                                                                    {metricConfig.title}
                                                                </span>
                                                                {(metricConfig.type === "scalar" || metricConfig.hasChart) && !isLoading && data !== undefined && (
                                                                    <div className="text-3xl font-bold text-[#001a8e]">
                                                                        {formatMetricValue(data, metricConfig)}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex-1 p-4 overflow-hidden">
                                                                {isLoading ? (
                                                                    <div className="h-full flex items-center justify-center">
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <span className="h-5 w-5 rounded-full border-2 border-[#001a8e] border-t-transparent animate-spin" />
                                                                            <span className="text-sm text-gray-600">Loading...</span>
                                                                        </div>
                                                                    </div>
                                                                ) : metricConfig.hasChart && chartData ? (
                                                                    renderChart(metricKey, metricConfig, chartData)
                                                                ) : metricConfig.type === "scalar" ? (
                                                                    <div className="h-full flex items-center justify-center">
                                                                        <span className="text-gray-400">Value displayed above</span>
                                                                    </div>
                                                                ) : data ? (
                                                                    renderChart(metricKey, metricConfig, data)
                                                                ) : (
                                                                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                                        <span className="text-sm text-gray-500">No data available</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CarouselItem>
                                                );
                                            }
                                        )}
                                </CarouselContent>
                            </Carousel>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}