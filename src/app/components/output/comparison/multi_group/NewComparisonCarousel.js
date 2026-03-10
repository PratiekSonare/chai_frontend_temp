import { useRef, useCallback, useEffect } from 'react';
import StateMapPlotter from '@/components/StateMapPlotter';
import Autoplay from "embla-carousel-autoplay"
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

export default function NewComparisonCarousel({ mapData, searchData, createPaymentChart, groups }) {
    const chartInstancesRef = useRef({});

    // Clean up charts on unmount
    useEffect(() => {
        return () => {
            Object.values(chartInstancesRef.current).forEach(chart => {
                if (chart) chart.destroy();
            });
        };
    }, []);

    // Get detailed metrics from searchData
    const detailedMetrics = searchData?.detailed_metrics || searchData?.comparison_data?.group_summaries || {};

    return (
        <Carousel
            opts={{
                align: "start",
                loop: "true",
            }}
            plugins={[
                Autoplay({
                    delay: 3000,
                }),
            ]}
            className="relative w-1/2 h-full overflow-hidden"
        >
            <CarouselContent className="h-fit!">
                {/* Map View */}
                <CarouselItem className="basis-full">
                    <div className='relative flex items-center justify-center w-full h-full rounded-xl border-4 border-[#0024af]'>
                        <span className='absolute top-0 right-0 rounded-bl-xl px-3 py-2 bg-[#0024af] oswald text-white'>MAP</span>
                        <div className='absolute top-0 left-0 p-2'>
                            {groups.map((group, index) => {
                                const colors = ['#283593', '#1E88E5', '#42A5F5', '#64B5F6', '#90CAF9'];
                                return (
                                    <div key={index} className='flex items-center gap-3 mb-1'>
                                        <div
                                            className='w-4 h-4 rounded-full'
                                            style={{ backgroundColor: colors[index] || '#45b7d1' }}
                                        ></div>
                                        <div className='flex items-center justify-center gap-0'>
                                            <span className='text-sm font-medium text-gray-700 oswald'>
                                                {typeof group === 'string' ? group.toUpperCase() : group.name?.toUpperCase() || 'UNKNOWN'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <StateMapPlotter
                            data={mapData}
                            onStateClick={(name, value) => console.log(`${name}: ${value}`)}
                            width={550}
                            height={550}
                        />
                    </div>
                </CarouselItem>

                {/* Individual Group Metrics */}
                {Object.entries(detailedMetrics).map(([groupName, metrics], index) => (
                    <CarouselItem key={groupName} className="basis-1/2">
                        <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-green-200 w-full h-fit!">
                            <div className='flex flex-row items-center justify-between bg-[#001FB0] rounded-t-xl h-fit cursor-pointer'>
                                <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">{groupName.toUpperCase()} METRICS</span>
                                <svg className={`h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier"> 
                                        <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> 
                                        <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> 
                                    </g>
                                </svg>
                            </div>

                            <div className="space-y-2 poppins">
                                {/* Key Metrics */}
                                <div className="grid grid-cols-3">
                                    <div className="p-2 flex flex-col items-center justify-center text-center border-r-2 border-b-2 border-gray-400">
                                        <div className="text-xl font-bold text-blue-600">
                                            {metrics.count || metrics.order_count || 0}
                                        </div>
                                        <div className="text-sm text-gray-600 poppins">ORDERS</div>
                                    </div>
                                    <div className="p-2 flex flex-col items-center justify-center text-center border-r-2 border-b-2 border-gray-400">
                                        <div className="text-xl font-bold text-green-600">
                                            ₹{(metrics.total_revenue || 0).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-600 poppins">REVENUE</div>
                                    </div>
                                    <div className="p-2 flex flex-col items-center justify-center text-center border-b-2 border-gray-400">
                                        <div className="text-xl font-bold text-purple-600">
                                            ₹{(metrics.avg_order_value || 0).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-600 poppins">AOV</div>
                                    </div>
                                </div>

                                {/* Payment Distribution */}
                                {metrics.payment_mode_distribution && (
                                    <div className="px-2 border-b-2 border-gray-400">
                                        <p className="oswald text-lg -mb-2">PAYMENT</p>
                                        <div className="w-full h-30 flex justify-center items-center relative">
                                            <canvas
                                                ref={(el) => {
                                                    if (el) {
                                                        setTimeout(() => createPaymentChart(el, metrics, groupName), 100);
                                                    }
                                                }}
                                                className="w-full h-full -my-3"
                                            />
                                            {/* Center label */}
                                            <div className="absolute bottom-2 flex items-center justify-center pointer-events-none">
                                                <div className="text-center">
                                                    <div className="text-md font-bold poppins">
                                                        {Object.values(metrics.payment_mode_distribution || {}).reduce((a, b) => a + b, 0)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 poppins">TOTAL</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Order Status Distribution */}
                                {metrics.order_status_distribution && (
                                    <div className="p-2 border-b-2 border-gray-400">
                                        <p className="oswald text-lg mb-2">ORDER STATUS</p>
                                        <div className="grid grid-cols-3 text-xs">
                                            {Object.entries(metrics.order_status_distribution || {}).map(([status, count]) => (
                                                <div key={status} className="p-2 text-center">
                                                    <div className="font-bold text-md">{count}</div>
                                                    <div className="text-gray-600 text-sm uppercase">{status}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Top Cities */}
                                {metrics.top_cities && (
                                    <div className="p-2 rounded-lg max-h-32 overflow-y-auto">
                                        <p className="oswald text-lg mb-2">TOP CITIES</p>
                                        <div className="space-y-1">
                                            {Object.entries(metrics.top_cities || {})
                                                .sort(([, a], [, b]) => b - a)
                                                .slice(0, 5)
                                                .map(([city, count]) => (
                                                    <div key={city} className="flex justify-between text-sm">
                                                        <span className="text-gray-700">{city}</span>
                                                        <span className="font-medium">{count}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CarouselItem>
                ))}

                {/* Comparison Summary */}
                <CarouselItem className="poppins! basis-full">
                    <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-indigo-200 w-full h-fit!">
                        <div className='flex flex-row items-center justify-between bg-[#0024af] rounded-t-xl h-fit cursor-pointer'>
                            <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">COMPARISON SUMMARY</span>
                        </div>

                        <div className="space-y-4">
                            {searchData?.comparison_data?.overall_winners && (
                                <div className="p-4 poppins grid grid-cols-3 gap-4">
                                    <div className="border-2 border-blue-500 text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-lg font-bold text-blue-600 capitalize">
                                            {searchData.comparison_data.overall_winners.by_volume}
                                        </div>
                                        <div className="text-sm text-gray-600 oswald">HIGHEST VOLUME</div>
                                    </div>
                                    <div className="border-2 border-green-500 text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-lg font-bold text-green-600 capitalize">
                                            {searchData.comparison_data.overall_winners.by_revenue}
                                        </div>
                                        <div className="text-sm text-gray-600 oswald">HIGHEST REVENUE</div>
                                    </div>
                                    <div className="border-2 border-purple-500 text-center p-3 bg-purple-50 rounded-lg">
                                        <div className="text-lg font-bold text-purple-600 capitalize">
                                            {searchData.comparison_data.overall_winners.by_avg_value}
                                        </div>
                                        <div className="text-sm text-gray-600 oswald">HIGHEST AOV</div>
                                    </div>
                                </div>
                            )}

                            <div className='border-b-2 border-gray-300 w-full'></div>

                            {/* Baseline Comparisons */}
                            {searchData?.comparison_data?.comparisons_to_baseline && (
                                <div className="p-4 poppins">
                                    <div className='flex flex-row w-full justify-between items-end'>
                                        <p className="oswald text-lg mb-2">BASELINE COMPARISONS</p>
                                        <p className="text-sm text-gray-400 mb-3 align-bottom underline-offset-2 underline">
                                            Baseline: <span className="font-bold text-gray-500 capitalize">{searchData.comparison_data.baseline}</span>
                                        </p>
                                    </div>
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 p-2 text-left"></th>
                                                <th className="border border-gray-300 p-2 text-center">Orders</th>
                                                <th className="border border-gray-300 p-2 text-center">Revenue</th>
                                                <th className="border border-gray-300 p-2 text-center">AOV</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(searchData.comparison_data.comparisons_to_baseline).map(([groupName, comparison]) => (
                                                <tr key={groupName}>
                                                    <td className="border border-gray-300 p-2 font-medium capitalize">{groupName}</td>
                                                    <td className="hover:bg-white! bg-transparent! border border-gray-300 p-2 text-center">
                                                        <div className={`font-bold ${comparison.order_count_diff_pct < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                            {comparison.order_count_diff_pct.toFixed(1)}%
                                                        </div>
                                                    </td>
                                                    <td className="hover:bg-white! bg-transparent! border border-gray-300 p-2 text-center">
                                                        <div className={`font-bold ${comparison.revenue_diff_pct < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                            {comparison.revenue_diff_pct.toFixed(1)}%
                                                        </div>
                                                    </td>
                                                    <td className="hover:bg-white! bg-transparent! border border-gray-300 p-2 text-center">
                                                        <div className={`font-bold ${comparison.avg_order_value_diff_pct < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                            {comparison.avg_order_value_diff_pct.toFixed(1)}%
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </CarouselItem>

            </CarouselContent>
        </Carousel>
    )
}