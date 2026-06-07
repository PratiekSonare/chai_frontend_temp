
import StateMapPlotter from '@/components/StateMapPlotter';
import Autoplay from "embla-carousel-autoplay"
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

export default function ComparisonCarousel({ mapData, searchData, groups, createPaymentChart }) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Detect data source (order vs profit)
    const dataSource = searchData?.comparison_data?.data_source || 'order';
    const isProfit = dataSource === 'profit';
    
    const toggleCard = () => {
        setIsOpen(!isOpen);
    }

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

            <CarouselContent className="!h-fit">

                {/* Show map only for order data, not for profit */}
                {!isProfit && (
                    <CarouselItem className="basis-full">
                        <div className='relative flex items-center justify-center w-full h-full rounded-xl border-4 border-[#0024af]' onClick={() => setIsOpen(false)}>
                            <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className='absolute top-0 right-0 rounded-bl-xl px-3 py-2 bg-[#0024af] oswald text-white cursor-pointer z-10'>MAP
                                {isOpen && (
                                    <div className={cn(`bg-[#0024af] absolute top-10 right-0 left-[-200px] bottom-[-200px] z-50 grid grid-cols-1 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                        <div className='flex flex-col !gap-0'>
                                            <span className='poppins text-sm font-extrabold text-white'>Geographic Map</span>
                                            <span className='poppins text-xs italic text-gray-300'>Visual representation of data comparison across different geographic regions</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className='absolute top-0 left-0 p-2'>
                                {groups.map((group, index) => {
                                    const colors = ['#283593', '#1E88E5'];
                                    const letters = ['A', 'B'];
                                    return (
                                        <div key={index} className='flex items-center gap-3'>
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
                )}

                {/* For profit data, show detailed item metrics instead of state-based metrics */}
                {isProfit && searchData?.detailed_metrics && (
                    Object.entries(searchData.detailed_metrics).map(([groupName, groupMetrics], index) => (
                        <CarouselItem key={groupName} className="basis-full">
                            <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-blue-200 w-full !h-fit" onClick={() => setIsOpen(false)}>
                                <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className='flex flex-row items-center justify-between bg-[#001FB0] rounded-t-xl h-fit cursor-pointer'>
                                    <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">{groupName.toUpperCase()}</span>
                                    {isOpen && (
                                        <div className={cn(`bg-[#001FB0] absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-1 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                            <div className='flex flex-col !gap-0'>
                                                <span className='poppins text-sm font-extrabold text-white'>Profit Metrics</span>
                                                <span className='poppins text-xs italic text-gray-300'>Detailed profit metrics for {groupName} style including margin, profit, and other indicators</span>
                                            </div>
                                        </div>
                                    )}
                                    <svg className={`h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                                </div>

                                <div className="space-y-2 poppins">
                                    {/* Key Metrics Grid */}
                                    <div className="grid grid-cols-3">
                                        <div className="p-2 flex flex-col items-center justify-center text-center border-r-2 border-b-2 border-gray-400">
                                            <div className="text-xl font-bold text-blue-600">{groupMetrics.count || 0}</div>
                                            <div className="text-sm text-gray-600 poppins">ITEMS</div>
                                        </div>
                                        <div className="p-2 flex flex-col items-center justify-center text-center border-r-2 border-b-2 border-gray-400">
                                            <div className="text-xl font-bold text-green-600">₹{groupMetrics.summary?.total_gross_profit?.toFixed(0) || 0}</div>
                                            <div className="text-sm text-gray-600 poppins">PROFIT</div>
                                        </div>
                                        <div className="p-2 flex flex-col items-center justify-center text-center border-b-2 border-gray-400">
                                            <div className="text-xl font-bold text-purple-600">{groupMetrics.summary?.avg_gross_margin?.toFixed(2) || 0}%</div>
                                            <div className="text-sm text-gray-600 poppins">MARGIN</div>
                                        </div>
                                    </div>

                                    {/* Additional Metrics */}
                                    <div className="px-2 border-b-2 border-gray-400 pb-2">
                                        <p className="oswald text-lg mb-2">KEY INDICATORS</p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Avg Markup %:</span>
                                                <span className="font-bold text-indigo-600">{groupMetrics.summary?.avg_markup_percent?.toFixed(2) || 0}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-700">Cost to Price:</span>
                                                <span className="font-bold text-orange-600">{((groupMetrics.items?.[0]?.cost_to_price_ratio) || 0).toFixed(2)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Item Details */}
                                    {groupMetrics.items && groupMetrics.items.length > 0 && (
                                        <div className="p-2 rounded-lg max-h-32 overflow-y-auto">
                                            <p className="oswald text-lg mb-2">ITEM DETAILS</p>
                                            {groupMetrics.items.map((item, idx) => (
                                                <div key={idx} className="border-b border-gray-200 py-2 text-sm">
                                                    <div className="font-semibold text-gray-800">{item.style_name}</div>
                                                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                                                        <span>Margin: {item.gross_margin?.toFixed(2)}%</span>
                                                        <span>Profit: ₹{item.gross_profit?.toFixed(0)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CarouselItem>
                    ))
                )}

                {/* Original order-based state metrics carousel */}
                {!isProfit && searchData?.detailed_metrics && Object.entries(searchData.detailed_metrics).map(([stateName, metrics], index) => (
                    <CarouselItem key={stateName} className="basis-1/2">

                        <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-green-200 w-full !h-fit" onClick={() => setIsOpen(false)}>
                            <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className='flex flex-row items-center justify-between bg-[#001FB0] rounded-t-xl h-fit cursor-pointer'>
                                <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">{stateName.toUpperCase()} METRICS</span>
                                {isOpen && (
                                    <div className={cn(`bg-[#001FB0] absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-2 grid-rows-2 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                        <div className='flex flex-col !gap-0'>
                                            <span className='poppins text-sm font-extrabold text-white'>State Metrics</span>
                                            <span className='poppins text-xs italic text-gray-300'>Detailed metrics breakdown showing orders, revenue, AOV, payment modes, and geographic distribution for {stateName}</span>
                                        </div>
                                    </div>
                                )}
                                <svg className={`h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                            </div>

                            <div className="space-y-2 poppins">
                                {/* Key Metrics */}
                                <div className="grid grid-cols-3">
                                    <div className="p-2 flex flex-col items-center justify-center text-center border-r-2 border-b-2 border-gray-400">
                                        <div className="text-xl font-bold text-blue-600">{metrics.count}</div>
                                        <div className="text-sm text-gray-600 poppins">ORDERS</div>
                                    </div>
                                    <div className="p-2 flex flex-col items-center justify-center text-center border-r-2 border-b-2 border-gray-400">
                                        <div className="text-xl font-bold text-green-600">₹{metrics.total_revenue?.toFixed(2)}</div>
                                        <div className="text-sm text-gray-600 poppins">REVENUE</div>
                                    </div>
                                    <div className="p-2 flex flex-col items-center justify-center text-center border-b-2 border-gray-400">
                                        <div className="text-xl font-bold text-purple-600">₹{metrics.avg_order_value?.toFixed(2)}</div>
                                        <div className="text-sm text-gray-600 poppins">AOV</div>
                                    </div>
                                </div>

                                {/* Payment Distribution */}
                                <div className="px-2 border-b-2 border-gray-400">
                                    <p className="oswald text-lg -mb-2">PAYMENT</p>
                                    <div className="w-full h-30 flex justify-center items-center relative">
                                        <canvas
                                            ref={(el) => {
                                                if (el) {
                                                    setTimeout(() => createPaymentChart(el, metrics, stateName), 100);
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

                                {/* Order Status Distribution */}
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

                                {/* Top Cities */}
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
                            </div>
                        </div>
                    </CarouselItem>
                ))}

            </CarouselContent>
        </Carousel>
    )
}