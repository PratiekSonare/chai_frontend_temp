"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import { apiUrl } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

const KPI_ENDPOINT_MAP = {
    totalOrders: "total-orders",
    unitsSold: "units-sold",
    grossRevenue: "gross-revenue",
    aov: "aov",
    uniqueSkus: "unique-skus",
    cancellationRate: "cancellation-rate",
    returnRate: "return-rate",
    codShare: "cod-share",
    deliveredRate: "delivered-rate",
};

const DEFAULT_FROM = new Date("2025-09-01T00:00:00");
const DEFAULT_TO = new Date("2026-02-28T00:00:00");

function formatDate(date) {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function computeSummary(values = []) {
    const safeValues = values.filter((v) => Number.isFinite(Number(v))).map(Number);
    if (!safeValues.length) {
        return {
            points: 0,
            latest: 0,
            min: 0,
            max: 0,
            mean: 0,
            std: 0,
        };
    }

    const points = safeValues.length;
    const latest = safeValues[points - 1];
    const min = Math.min(...safeValues);
    const max = Math.max(...safeValues);
    const mean = safeValues.reduce((acc, curr) => acc + curr, 0) / points;
    const variance = safeValues.reduce((acc, curr) => acc + (curr - mean) ** 2, 0) / points;
    const std = Math.sqrt(variance);

    return { points, latest, min, max, mean, std };
}

function buildYAxisTicks(maxValue) {
    if (maxValue <= 0) {
        return [0, 1];
    }
    return [0, maxValue];
}

export default function KpiChartDialog({
    metricKey,
    title,
    unit,
    formatMetricValue,
    filters,
    tableName = "history-orders-dev",
}) {
    const [open, setOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(true);
    const [isFiguresOpen, setIsFiguresOpen] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: DEFAULT_FROM,
        to: DEFAULT_TO,
    });
    const [chartPayload, setChartPayload] = useState({
        labels: [],
        values: [],
        chartType: "daily",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const chartContainerRef = useRef(null);
    const svgRef = useRef(null);

    const endpointSlug = KPI_ENDPOINT_MAP[metricKey];

    const fromDate = dateRange?.from || DEFAULT_FROM;
    const toDate = dateRange?.to || DEFAULT_TO;

    const fetchChartData = useCallback(async (rangeOverride) => {
        if (!endpointSlug) return;

        const selectedRange = rangeOverride || dateRange;
        const selectedFrom = selectedRange?.from || DEFAULT_FROM;
        const selectedTo = selectedRange?.to || DEFAULT_TO;

        if (!selectedFrom || !selectedTo) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const payload = {
                table_name: tableName,
                start_date: `${formatDate(selectedFrom)} 00:00:00`,
                end_date: `${formatDate(selectedTo)} 23:59:59`,
                filters: filters || {},
            };

            const response = await fetch(apiUrl(`/history/kpi/charts/${endpointSlug}`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Chart fetch failed with status ${response.status}`);
            }

            const result = await response.json();
            const dataset = result?.datasets || {};
            const values = Object.values(dataset)[0] || [];

            setChartPayload({
                labels: Array.isArray(result?.labels) ? result.labels : [],
                values: Array.isArray(values) ? values.map((v) => Number(v) || 0) : [],
                chartType: result?.chart_type || "daily",
            });
        } catch (err) {
            setError(err?.message || "Failed to fetch chart data");
            setChartPayload({ labels: [], values: [], chartType: "daily" });
        } finally {
            setLoading(false);
        }
    }, [dateRange, endpointSlug, filters, tableName]);


    useEffect(() => {
        if (!open || !chartContainerRef.current || !svgRef.current) {
            return;
        }

        const container = chartContainerRef.current;
        const svg = d3.select(svgRef.current);

        const width = container.clientWidth || 640;
        const height = container.clientHeight || 320;
        const margin = { top: 24, right: 18, bottom: 70, left: 68 };

        svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");
        svg.selectAll("*").remove();

        const labels = chartPayload.labels || [];
        const values = chartPayload.values || [];

        if (!labels.length || !values.length) {
            svg
                .append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .attr("fill", "#64748b")
                .style("font-size", "14px")
                .text(loading ? "Loading chart..." : "No chart data for selected range");
            return;
        }

        const x = d3
            .scaleBand()
            .domain(labels)
            .range([margin.left, width - margin.right])
            .padding(0.22);

        const maxValue = d3.max(values) || 0;
        const y = d3
            .scaleLinear()
            .domain([0, maxValue * 1.12 || 1])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const chartGroup = svg.append("g");

        chartGroup
            .append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .call((g) => g.selectAll("text").attr("transform", "rotate(-35)").style("text-anchor", "end").style("font-size", "10px").attr("fill", "#334155"))
            .call((g) => g.selectAll("line,path").attr("stroke", "#cbd5e1"));

        chartGroup
            .append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(6))
            .call((g) => g.selectAll("text").style("font-size", "10px").attr("fill", "#334155"))
            .call((g) => g.selectAll("line,path").attr("stroke", "#cbd5e1"));

        chartGroup
            .append("g")
            .attr("stroke", "#e2e8f0")
            .attr("stroke-opacity", 0.8)
            .call((g) =>
                g
                    .selectAll("line")
                    .data(buildYAxisTicks(maxValue))
                    .join("line")
                    .attr("x1", margin.left)
                    .attr("x2", width - margin.right)
                    .attr("y1", (d) => y(d))
                    .attr("y2", (d) => y(d))
            );

        chartGroup
            .append("g")
            .selectAll("rect")
            .data(labels.map((label, i) => ({ label, value: values[i] || 0 })))
            .join("rect")
            .attr("x", (d) => x(d.label) || 0)
            .attr("y", (d) => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", (d) => y(0) - y(d.value))
            .attr("rx", 4)
            .attr("fill", "#1d4ed8");
    }, [chartPayload, loading, open]);

    const summary = useMemo(() => computeSummary(chartPayload.values), [chartPayload.values]);

    const handleDateRangeSelect = (range) => {
        if (!range) return;
        setDateRange({
            from: range.from || DEFAULT_FROM,
            to: range.to || range.from || DEFAULT_TO,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="absolute top-5 right-5">
                <svg className="w-5 h-5 -translate-y-10 group-hover:translate-y-0 transition-transform duration-200 ease-in" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 12L17 7M17 7H13.25M17 7V10.75" stroke="#001a8e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M12 12L7 17M7 17H10.75M7 17V13.25" stroke="#001a8e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="#001a8e" strokeWidth="1.5"></path> </g></svg>
            </DialogTrigger>

            <DialogContent className="max-w-6xl p-0 overflow-hidden">
                <DialogHeader className="px-6 py-3 border-b border-slate-200">
                    <DialogTitle>{title} Trend</DialogTitle>
                </DialogHeader>

                <div className="w-full grid grid-cols-12" style={{ minHeight: "460px" }}>
                    <div className="col-span-12 md:col-span-4 border-r border-slate-200 bg-slate-50">
                        <Collapsible open={isDateOpen} onOpenChange={setIsDateOpen}>
                            <CollapsibleTrigger className="p-2 bg-[#001a8e] w-full">
                                <div className="w-full flex flex-row justify-between items-center">
                                    <span className="text-white">DATE RANGE</span>
                                    <svg className={`${isDateOpen ? "rotate-180" : "rotate-0"} h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-3">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={handleDateRangeSelect}
                                    numberOfMonths={1}
                                    className="rounded-lg border mx-auto bg-white"
                                    defaultMonth={DEFAULT_FROM}
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                />
                                <button
                                    type="button"
                                    onClick={() => fetchChartData(dateRange)}
                                    className="w-full mt-3 rounded-md bg-[#001a8e] text-white py-2 text-sm hover:bg-[#00157a] transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : "Apply Date Range"}
                                </button>
                                <div className="text-xs text-slate-600 mt-2">
                                    {`From ${formatDate(fromDate)} to ${formatDate(toDate)}`}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        <Collapsible open={isFiguresOpen} onOpenChange={setIsFiguresOpen}>
                            <CollapsibleTrigger className="p-2 bg-[#001a8e] w-full mt-px">
                                <div className="w-full flex flex-row justify-between items-center">
                                    <span className="text-white">FIGURES</span>
                                    <svg className={`${isFiguresOpen ? "rotate-180" : "rotate-0"} h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 w-full bg-white">
                                <div className="flex flex-col gap-2 text-sm">
                                    <div className="flex flex-row justify-between"><span>Granularity</span><span>{chartPayload.chartType}</span></div>
                                    <div className="flex flex-row justify-between"><span>Points</span><span>{summary.points}</span></div>
                                    <div className="flex flex-row justify-between"><span>Latest</span><span>{formatMetricValue(summary.latest, { currency: unit === "INR", percent: unit === "%" })}</span></div>
                                    <div className="flex flex-row justify-between"><span>Mean</span><span>{formatMetricValue(summary.mean, { currency: unit === "INR", percent: unit === "%" })}</span></div>
                                    <div className="flex flex-row justify-between"><span>Std Dev</span><span>{formatMetricValue(summary.std, { currency: unit === "INR", percent: unit === "%" })}</span></div>
                                    <div className="flex flex-row justify-between"><span>Min</span><span>{formatMetricValue(summary.min, { currency: unit === "INR", percent: unit === "%" })}</span></div>
                                    <div className="flex flex-row justify-between"><span>Max</span><span>{formatMetricValue(summary.max, { currency: unit === "INR", percent: unit === "%" })}</span></div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>

                    <div className="col-span-12 md:col-span-8 bg-white p-4">
                        <div className="h-full rounded-md border border-slate-200" style={{ minHeight: "380px" }} ref={chartContainerRef}>
                            {error ? (
                                <div className="h-full w-full flex items-center justify-center text-sm text-rose-600">{error}</div>
                            ) : (
                                <svg ref={svgRef} className="w-full h-full" />
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
