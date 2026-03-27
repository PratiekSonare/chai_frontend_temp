"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { apiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const COMPARISON_ROUTES = [
    {
        id: "cod-prepaid",
        title: "COD vs Prepaid",
        subtitle: "Payment mode performance split",
        endpoint: "/history/comparison/cod-vs-prepaid",
        accent: "from-blue-600 to-indigo-700",
    },
    {
        id: "b2b-b2c",
        title: "B2B vs B2C",
        subtitle: "Order type comparison",
        endpoint: "/history/comparison/b2b-vs-b2c",
        accent: "from-emerald-600 to-teal-700",
    },
    {
        id: "top-states",
        title: "Top States vs Rest",
        subtitle: "Revenue concentration and growth",
        endpoint: "/history/comparison/top-states-vs-rest",
        accent: "from-fuchsia-600 to-pink-700",
    },
    {
        id: "top-skus",
        title: "Top SKU Rank Growth",
        subtitle: "Rank movement across periods",
        endpoint: "/history/comparison/top-skus-rank-growth",
        accent: "from-amber-600 to-orange-700",
    },
    {
        id: "size-mix",
        title: "Size Mix Change",
        subtitle: "Distribution shift by size",
        endpoint: "/history/comparison/size-mix-change",
        accent: "from-cyan-600 to-sky-700",
    },
];

const numberFmt = new Intl.NumberFormat("en-IN");
const currencyFmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

function summarizeCard(routeId, data) {
    if (!data || !data.success) {
        return [
            { label: "Status", value: "No data" },
            { label: "Hint", value: "Try refresh" },
        ];
    }

    if (routeId === "cod-prepaid") {
        const cod = data.segments?.cod || {};
        const prepaid = data.segments?.prepaid || {};
        return [
            { label: "COD Orders", value: numberFmt.format(cod.order_count || 0) },
            { label: "Prepaid Orders", value: numberFmt.format(prepaid.order_count || 0) },
            { label: "COD Revenue", value: currencyFmt.format(cod.revenue || 0) },
            { label: "Prepaid Revenue", value: currencyFmt.format(prepaid.revenue || 0) },
        ];
    }

    if (routeId === "b2b-b2c") {
        const b2b = data.segments?.b2b || {};
        const b2c = data.segments?.b2c || {};
        return [
            { label: "B2B Orders", value: numberFmt.format(b2b.order_count || 0) },
            { label: "B2C Orders", value: numberFmt.format(b2c.order_count || 0) },
            { label: "B2B AOV", value: currencyFmt.format(b2b.aov || 0) },
            { label: "B2C AOV", value: currencyFmt.format(b2c.aov || 0) },
        ];
    }

    if (routeId === "top-states") {
        const top = data.states?.[0] || {};
        const rest = data.rest || {};
        return [
            { label: "Top State", value: top.state || "N/A" },
            { label: "Top Growth", value: `${Number(top.growth_pct || 0).toFixed(2)}%` },
            { label: "Rest Revenue", value: currencyFmt.format(rest.current_revenue || 0) },
            { label: "Rest Share", value: `${Number(rest.revenue_share || 0).toFixed(2)}%` },
        ];
    }

    if (routeId === "top-skus") {
        const top = data.skus?.[0] || {};
        return [
            { label: "Top SKU", value: top.canonical_sku || "N/A" },
            { label: "Current Rank", value: top.current_rank || "-" },
            { label: "Prev Rank", value: top.previous_rank ?? "New" },
            { label: "Growth", value: `${Number(top.growth_pct || 0).toFixed(2)}%` },
        ];
    }

    if (routeId === "size-mix") {
        const size = data.sizes?.[0] || {};
        return [
            { label: "Leading Size", value: size.size || "N/A" },
            { label: "Current Units", value: numberFmt.format(size.current_units || 0) },
            { label: "Share Change", value: `${Number(size.share_change_pp || 0).toFixed(2)} pp` },
            { label: "Growth", value: `${Number(size.growth_pct || 0).toFixed(2)}%` },
        ];
    }

    return [{ label: "Status", value: "Unsupported route" }];
}

export default function ComparisonCarousel() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchComparisons = useCallback(async () => {
        setLoading(true);
        try {
            const endDate = new Date().toISOString().slice(0, 10);
            const responses = await Promise.all(
                COMPARISON_ROUTES.map(async (route) => {
                    try {
                        const response = await fetch(apiUrl(route.endpoint), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                table_name: "history-orders",
                                end_date: endDate,
                                filters: {},
                            }),
                        });

                        if (!response.ok) {
                            throw new Error(`Status ${response.status}`);
                        }

                        const data = await response.json();
                        return {
                            ...route,
                            ok: true,
                            data,
                        };
                    } catch (error) {
                        return {
                            ...route,
                            ok: false,
                            error: error?.message || "Failed to fetch",
                            data: null,
                        };
                    }
                })
            );

            setResults(responses);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComparisons();
    }, [fetchComparisons]);

    const totalSuccess = useMemo(() => results.filter((r) => r.ok).length, [results]);

    return (
        <div className="w-[90%] h-screen flex flex-col justify-center items-start gap-10">
            <div className="flex flex-col items-start text-left gap-1">
                <span className="poppins font-extrabold text-3xl">Comparison Cards</span>
                <span className="poppins text-lg text-gray-500">Live comparisons from history routes with auto-rotating summary cards.</span>
            </div>

            <div className="poppins w-[96%] h-3/4">
                <div className="relative h-full bg-[#001a8e] rounded-xl flex flex-col p-5 gap-5 overflow-hidden">

                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        plugins={[
                            Autoplay({
                                delay: 2800,
                                stopOnMouseEnter: true,
                            }),
                        ]}
                        className="w-full h-full"
                    >
                        <CarouselContent className="h-full">
                            {(results.length > 0 ? results : COMPARISON_ROUTES).map((route) => {
                                const rows = summarizeCard(route.id, route.data);
                                const hasError = route.ok === false;

                                return (
                                    <CarouselItem key={route.id} className="basis-full lg:basis-1/2 2xl:basis-1/3">
                                        <article className="h-full rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-4">
                                            <header className={`rounded-lg bg-linear-to-r ${route.accent} px-3 py-2 text-white`}>
                                                <h3 className="oswald text-lg tracking-wide">{route.title}</h3>
                                                <p className="text-xs text-white/80">{route.subtitle}</p>
                                            </header>

                                            <div className="grid grid-cols-2 gap-2">
                                                {rows.map((row) => (
                                                    <div key={`${route.id}-${row.label}`} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                                                        <p className="text-[11px] uppercase tracking-wide text-slate-500">{row.label}</p>
                                                        <p className="text-sm font-semibold text-slate-800 wrap-break-word">{row.value}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-auto flex items-center justify-between text-xs">
                                                <span className={`font-semibold ${hasError ? "text-rose-600" : "text-emerald-600"}`}>
                                                    {hasError ? "Route error" : "Live route"}
                                                </span>
                                                <span className="text-slate-500">{route.endpoint}</span>
                                            </div>

                                            {hasError && (
                                                <p className="text-xs text-rose-600">{route.error}</p>
                                            )}
                                        </article>
                                    </CarouselItem>
                                );
                            })}
                        </CarouselContent>

                        <CarouselPrevious className="left-1" />
                        <CarouselNext className="right-1" />
                    </Carousel>
                </div>
            </div>
        </div>
    );
}