"use client";

import { apiUrl } from "@/lib/api";
import * as d3 from "d3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const QUICK_LINKS = [
    {
        id: "week",
        label: "Current Week vs Previous Week",
        hint: "Mon-Sun snapshot",
        endpoint: "/history/kpi/comparison-7d",
        metricName: "7-Day Comparison",
    },
    {
        id: "month",
        label: "This Month vs Previous Month",
        hint: "Month-on-month pulse",
        endpoint: "/history/kpi/comparison-30d",
        metricName: "30-Day Comparison",
    },
    {
        id: "quarter",
        label: "This Quarter vs Previous Quarter",
        hint: "Quarter-on-quarter trend",
        endpoint: "/history/kpi/comparison-quarter",
        metricName: "Quarter Comparison",
    },
];

const METRICS = [
    { key: "orders", label: "Orders", formatter: (value) => new Intl.NumberFormat("en-IN").format(value) },
    { key: "revenue", label: "Revenue", formatter: (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value) },
    { key: "aov", label: "AOV", formatter: (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value) },
    { key: "units", label: "Units", formatter: (value) => new Intl.NumberFormat("en-IN").format(value) },
];

const formatDate = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function DayComparisonCard() {
    const [selectedQuickLink, setSelectedQuickLink] = useState("week");
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const groupedChartRef = useRef(null);
    const deltaChartRef = useRef(null);

    const selectedPreset = useMemo(
        () => QUICK_LINKS.find((link) => link.id === selectedQuickLink) || QUICK_LINKS[0],
        [selectedQuickLink]
    );

    const chartRows = useMemo(() => {
        if (!comparisonData) return [];
        return METRICS.map((metric) => ({
            key: metric.key,
            label: metric.label,
            current: Number(comparisonData.current_period?.[metric.key] || 0),
            previous: Number(comparisonData.previous_period?.[metric.key] || 0),
            deltaPct: Number(comparisonData.deltas?.[`${metric.key}_pct`] || 0),
            formatter: metric.formatter,
        }));
    }, [comparisonData]);

    const fetchComparison = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(apiUrl(selectedPreset.endpoint), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    table_name: "history-orders-2503",
                    end_date: new Date().toISOString().slice(0, 10),
                    filters: {},
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed with status ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error("Comparison API returned unsuccessful response");
            }

            setComparisonData(result);
        } catch (err) {
            setError(err?.message || "Unable to load comparison data");
            setComparisonData(null);
        } finally {
            setLoading(false);
        }
    }, [selectedPreset]);

    useEffect(() => {
        fetchComparison();
    }, [fetchComparison]);

    useEffect(() => {
        if (!groupedChartRef.current || chartRows.length === 0) {
            return;
        }

        const width = 560;
        const height = 290;
        const margin = { top: 24, right: 24, bottom: 48, left: 56 };

        const svg = d3.select(groupedChartRef.current);
        svg.selectAll("*").remove();
        svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");

        const g = svg.append("g");
        const x0 = d3
            .scaleBand()
            .domain(chartRows.map((d) => d.label))
            .range([margin.left, width - margin.right])
            .padding(0.25);

        const x1 = d3
            .scaleBand()
            .domain(["Current", "Previous"])
            .range([0, x0.bandwidth()])
            .padding(0.2);

        const maxValue = d3.max(chartRows.flatMap((d) => [d.current, d.previous])) || 0;
        const y = d3
            .scaleLinear()
            .domain([0, maxValue * 1.15 || 1])
            .nice()
            .range([height - margin.bottom, margin.top]);

        g.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x0).tickSizeOuter(0))
            .call((axis) => axis.selectAll("text").attr("fill", "#334155").style("font-size", "11px"))
            .call((axis) => axis.select(".domain").attr("stroke", "#94a3b8"));

        g.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5))
            .call((axis) => axis.selectAll("text").attr("fill", "#334155").style("font-size", "11px"))
            .call((axis) => axis.select(".domain").attr("stroke", "#94a3b8"));

        const groupedBars = g
            .selectAll(".group")
            .data(chartRows)
            .enter()
            .append("g")
            .attr("transform", (d) => `translate(${x0(d.label)},0)`);

        groupedBars
            .selectAll("rect")
            .data((d) => [
                { group: "Current", value: d.current },
                { group: "Previous", value: d.previous },
            ])
            .enter()
            .append("rect")
            .attr("x", (d) => x1(d.group))
            .attr("y", (d) => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", (d) => Math.max(0, y(0) - y(d.value)))
            .attr("rx", 4)
            .attr("fill", (d) => (d.group === "Current" ? "#1d4ed8" : "#93c5fd"));
    }, [chartRows]);

    useEffect(() => {
        if (!deltaChartRef.current || chartRows.length === 0) {
            return;
        }

        const width = 560;
        const height = 290;
        const margin = { top: 24, right: 20, bottom: 36, left: 96 };

        const svg = d3.select(deltaChartRef.current);
        svg.selectAll("*").remove();
        svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");

        const minDelta = d3.min(chartRows, (d) => d.deltaPct) || 0;
        const maxDelta = d3.max(chartRows, (d) => d.deltaPct) || 0;
        const bound = Math.max(Math.abs(minDelta), Math.abs(maxDelta), 10);

        const x = d3
            .scaleLinear()
            .domain([-bound, bound])
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleBand()
            .domain(chartRows.map((d) => d.label))
            .range([margin.top, height - margin.bottom])
            .padding(0.35);

        const g = svg.append("g");

        g.append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", margin.top)
            .attr("y2", height - margin.bottom)
            .attr("stroke", "#64748b")
            .attr("stroke-dasharray", "4,3");

        g.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(7).tickFormat((d) => `${d}%`))
            .call((axis) => axis.selectAll("text").attr("fill", "#334155").style("font-size", "11px"))
            .call((axis) => axis.select(".domain").attr("stroke", "#94a3b8"));

        g.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).tickSize(0))
            .call((axis) => axis.selectAll("text").attr("fill", "#334155").style("font-size", "11px"))
            .call((axis) => axis.select(".domain").attr("stroke", "transparent"));

        g.selectAll("rect")
            .data(chartRows)
            .enter()
            .append("rect")
            .attr("x", (d) => Math.min(x(0), x(d.deltaPct)))
            .attr("y", (d) => y(d.label))
            .attr("width", (d) => Math.abs(x(d.deltaPct) - x(0)))
            .attr("height", y.bandwidth())
            .attr("rx", 4)
            .attr("fill", (d) => (d.deltaPct >= 0 ? "#10b981" : "#ef4444"));

        g.selectAll("text.delta-label")
            .data(chartRows)
            .enter()
            .append("text")
            .attr("class", "delta-label")
            .attr("x", (d) => (d.deltaPct >= 0 ? x(d.deltaPct) + 6 : x(d.deltaPct) - 6))
            .attr("y", (d) => y(d.label) + y.bandwidth() / 2 + 4)
            .attr("text-anchor", (d) => (d.deltaPct >= 0 ? "start" : "end"))
            .attr("fill", "#0f172a")
            .style("font-size", "11px")
            .text((d) => `${d.deltaPct.toFixed(2)}%`);
    }, [chartRows]);

    return (
        <div className="w-[90%] h-screen flex flex-col justify-center items-start gap-10">

            <div className="flex flex-col items-start text-left">
                <span className="poppins font-extrabold text-3xl">Performance Over Time</span>
                <span className="poppins text-lg text-gray-500">Compare weekly & monthly order data and discover trends.</span>
            </div>


            <div className="poppins w-[96%] h-3/4">
                <div className="relative h-full bg-[#001a8e] rounded-xl flex flex-col gap-0 overflow-hidden">

                    <div className="text-white w-full border-b border-white/20 bg-[#001a8e] px-5 py-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-lg font-semibold tracking-wide">Select Date Range For Comparison</span>
                                <span className="text-sm text-white/80">Use presets for instant trend checks or switch to a custom range.</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 backdrop-blur-sm">
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Current Period</p>
                                    <p className="text-sm font-semibold">
                                        {comparisonData
                                            ? `${formatDate(comparisonData.current_period?.start_date)} to ${formatDate(comparisonData.current_period?.end_date)}`
                                            : "-"}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 backdrop-blur-sm">
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Previous Period</p>
                                    <p className="text-sm font-semibold">
                                        {comparisonData
                                            ? `${formatDate(comparisonData.previous_period?.start_date)} to ${formatDate(comparisonData.previous_period?.end_date)}`
                                            : "-"}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={fetchComparison}
                                    disabled={loading}
                                    className="h-auto rounded-lg border border-dashed border-white/40 bg-transparent px-3 py-2 text-left text-white transition-colors hover:bg-white/10"
                                >
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">Data</p>
                                    <p className="text-sm font-semibold">{loading ? "Loading..." : "Refresh Comparison"}</p>
                                </Button>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-xs uppercase tracking-[0.14em] text-white/80">Quick Links</span>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {QUICK_LINKS.map((link) => {
                                        const isActive = selectedQuickLink === link.id;

                                        return (
                                            <Button
                                                key={link.id}
                                                type="button"
                                                onClick={() => setSelectedQuickLink(link.id)}
                                                className={`h-auto min-h-16 w-full justify-start rounded-lg border px-3 py-2 text-left transition-all ${
                                                    isActive
                                                        ? "border-[#8dd3ff] bg-[#0d44cd] text-white shadow-[0_0_0_1px_rgba(141,211,255,0.5)]"
                                                        : "border-white/30 bg-white/10 text-white hover:bg-white/15"
                                                }`}
                                            >
                                                <span className="flex flex-col items-start leading-tight">
                                                    <span className="text-sm font-semibold">{link.label}</span>
                                                    <span className="text-[11px] text-white/75">{link.hint}</span>
                                                </span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-4/5 flex flex-col xl:flex-row gap-5 p-5">
                        <div className="h-full xl:w-1/2 bg-zinc-50 rounded-xl border border-black p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-slate-800">{selectedPreset.metricName}</span>
                                <span className="text-xs text-slate-500">Current vs Previous</span>
                            </div>
                            <svg ref={groupedChartRef} className="w-full h-[80%]" />
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {chartRows.map((item) => (
                                    <div key={item.key} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                                        <p className="text-[11px] uppercase text-slate-500">{item.label}</p>
                                        <p className="text-sm font-semibold text-slate-800">{item.formatter(item.current)}</p>
                                    </div>
                                ))}
                            </div>
                            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
                        </div>

                        <div className="xl:w-1/2 h-full bg-zinc-50 rounded-xl border border-black p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-slate-800">Growth Delta</span>
                                <span className="text-xs text-slate-500">Percentage change</span>
                            </div>
                            <svg ref={deltaChartRef} className="w-full h-[80%]" />
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {chartRows.map((item) => (
                                    <div key={`${item.key}-delta`} className="rounded-md border border-slate-200 bg-white px-2 py-1">
                                        <p className="text-[11px] uppercase text-slate-500">{item.label}</p>
                                        <p className={`text-sm font-semibold ${item.deltaPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                            {item.deltaPct.toFixed(2)}%
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}