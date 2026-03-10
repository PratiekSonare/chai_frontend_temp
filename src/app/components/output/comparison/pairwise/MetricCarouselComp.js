import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import MetricGrid from "../../standard/MetricGrid";
import OrderCountChart from '../../../charts/orderCount';
import StateMapPlotter from '@/components/StateMapPlotter';
import { cn } from '@/lib/utils';

export default function MetricCarousel({ searchData, isSuccess, cN = 'bg-[#001FB0]' }) {

    const winner_by_volume = searchData.comparison_data.winner_by_volume
    const winner_by_revenue = searchData.comparison_data.winner_by_revenue
    const winner_by_aov = searchData.comparison_data.winner_by_avg_value

    const order_count_a = searchData.comparison_data.order_count.a
    const order_count_b = searchData.comparison_data.order_count.b

    const total_revenue_a = searchData.comparison_data.total_revenue.a
    const total_revenue_b = searchData.comparison_data.total_revenue.b

    const avg_order_value_a = searchData.comparison_data.avg_order_value.a
    const avg_order_value_b = searchData.comparison_data.avg_order_value.b

    // Determine which A or B has higher values for each metric
    const orderCountHigher = order_count_a > order_count_b ? 'A' : 'B';
    const totalRevenueHigher = total_revenue_a > total_revenue_b ? 'A' : 'B';
    const avgOrderValueHigher = avg_order_value_a > avg_order_value_b ? 'A' : 'B';

    const [isOpen, setIsOpen] = useState(false);
    const [defaultWinner, setDefaultWinner] = useState('one');

    // Get current winner state and create map data
    const currentWinnerState = useMemo(() => {
        switch (defaultWinner) {
            case 'one': return winner_by_volume;
            case 'two': return winner_by_revenue; 
            case 'three': return winner_by_aov;
            default: return winner_by_volume;
        }
    }, [defaultWinner, winner_by_volume, winner_by_revenue, winner_by_aov]);

    const mapData = useMemo(() => {
        if (!currentWinnerState) return [];
        
        return [{
            name: currentWinnerState.charAt(0).toUpperCase() + currentWinnerState.slice(1).toLowerCase(),
            value: 1, // Winner state gets value 1
            color: '#001FB0',
        }];
    }, [currentWinnerState, defaultWinner]);

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
                    delay: 2000,
                    stopOnMouseEnter: true,
                }),
            ]}
            className="w-full h-1/4"
        >
            <CarouselContent className="h-full!">
                {/* Winner By */}
                <CarouselItem className="basis-1/2">
                    <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-blue-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                        <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className={cn('flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer', cN)}>
                            <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">WINNER BY</span>
                            <svg className={`${isOpen ? "rotate-180" : "rotate-0"} h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                        </div>

                        <div className="flex flex-row justify-between w-full oswald">
                            <div className="w-1/3 h-fit flex flex-col gap-0">
                                <button
                                    id="one"
                                    onClick={() => setDefaultWinner('one')}
                                    className={`p-2 border-r-2 border-b-2 border-gray-400 w-full text-center flex items-center gap-2 ${defaultWinner === 'one' ? 'bg-[#001FB0] text-white' : ''
                                        }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${defaultWinner === 'one'
                                        ? 'text-[#001FB0] bg-white'
                                        : 'text-white bg-[#001FB0]'
                                        }`}>
                                        <span>1</span>
                                    </div>
                                    VOLUME
                                </button>
                                <button
                                    id="two"
                                    onClick={() => setDefaultWinner('two')}
                                    className={`p-2 border-r-2 border-b-2 border-gray-400 w-full text-center flex items-center gap-2 ${defaultWinner === 'two' ? 'bg-[#001FB0] text-white' : ''
                                        }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${defaultWinner === 'two'
                                        ? 'text-[#001FB0] bg-white'
                                        : 'text-white bg-[#001FB0]'
                                        }`}>
                                        <span>2</span>
                                    </div>
                                    REVENUE
                                </button>
                                <button
                                    id="three"
                                    onClick={() => setDefaultWinner('three')}
                                    className={`p-2 border-r-2 border-gray-400 w-full text-center flex items-center gap-2 ${defaultWinner === 'three' ? 'bg-[#001FB0] text-white' : ''
                                        }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${defaultWinner === 'three'
                                        ? 'text-[#001FB0] bg-white'
                                        : 'text-white bg-[#001FB0]'
                                        }`}>
                                        <span>3</span>
                                    </div>
                                    AOV
                                </button>
                            </div>
                            <div className="w-2/3 p-2 flex flex-col items-center justify-center gap-0">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-[#001FB0] capitalize poppins -mb-1!">
                                        {defaultWinner === 'one' && winner_by_volume}
                                        {defaultWinner === 'two' && winner_by_revenue}
                                        {defaultWinner === 'three' && winner_by_aov}
                                    </p>
                                </div>
                                
                                <div className="w-fit h-fit">
                                    <StateMapPlotter
                                        data={mapData}
                                        statesToShow={[currentWinnerState.charAt(0).toUpperCase() + currentWinnerState.slice(1).toLowerCase()]}
                                        width={80}
                                        height={80}
                                        strokeColor="#e5e7eb"
                                        strokeWidth={1}
                                        defaultFillColor="#f3f4f6"
                                        autoFitToStates={true}
                                        className="winner-map"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CarouselItem>

                <CarouselItem className="basis-1/2">
                    <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-orange-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                        <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className={cn('flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer', 'bg-orange-600')}>
                            <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">ORDER COUNT</span>
                            <svg className={`${isOpen ? "rotate-180" : "rotate-0"} h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                        </div>

                        <div className="flex flex-row justify-between w-full oswald">

                            <div className="w-2/3 flex flex-row">
                                <button
                                    className={`p-2 w-full rounded-bl-xl! border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        orderCountHigher === 'A' ? 'text-white bg-orange-600' : 'text-orange-600 bg-transparent'
                                    }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${
                                        orderCountHigher === 'A' ? 'text-orange-600 bg-white' : 'text-white bg-orange-600'
                                    }`}>
                                        <span>A</span>
                                    </div>
                                    <span className="text-3xl mt-3">{order_count_a}</span>
                                    <span className="text-sm capitalize">{searchData.comparison_data.groups.a}</span>
                                </button>

                                <button
                                    className={`p-2 w-full border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        orderCountHigher === 'B' ? 'text-white bg-orange-600' : 'text-orange-600 bg-transparent'
                                    }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${
                                        orderCountHigher === 'B' ? 'text-orange-600 bg-white' : 'text-white bg-orange-600'
                                    }`}>
                                        <span>B</span>
                                    </div>
                                    <span className="text-3xl mt-3">{order_count_b}</span>
                                    <span className="text-sm capitalize">{searchData.comparison_data.groups.b}</span>
                                </button>
                            </div>

                            <div className="w-1/3 flex flex-col">
                                <button
                                    className={`p-2 w-full text-center border-b-2 border-gray-400 flex flex-col items-start gap-0 text-orange-600 bg-transparent`}
                                >
                                    <div className="text-orange-600 flex items-center justify-center">
                                        <span>DIFF</span>
                                    </div>
                                    <span className="text-2xl mx-auto ">{searchData.comparison_data.order_count.diff.toFixed(2)}</span>
                                </button>
                                <button
                                    className={`p-2 w-full text-center flex flex-col items-start gap-0 text-orange-600 bg-transparent`}
                                >
                                    <div className="text-orange-600 flex items-center justify-center">
                                        <span>DIFF PERCENT</span>
                                    </div>
                                    <span className="text-2xl mx-auto">{searchData.comparison_data.order_count.diff_pct.toFixed(2)}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </CarouselItem>

                {/* Total Revenue */}
                <CarouselItem className="basis-1/2">
                    <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-green-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                        <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className={cn('flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer', 'bg-green-600')}>
                            <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">TOTAL REVENUE</span>
                            <svg className={`${isOpen ? "rotate-180" : "rotate-0"} h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                        </div>

                        <div className="flex flex-row justify-between w-full oswald">

                            <div className="w-2/3 flex flex-row">
                                <button
                                    className={`p-2 w-full rounded-bl-xl! border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        totalRevenueHigher === 'A' ? 'text-white bg-green-600' : 'text-green-600 bg-transparent'
                                    }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${
                                        totalRevenueHigher === 'A' ? 'text-green-600 bg-white' : 'text-white bg-green-600'
                                    }`}>
                                        <span>A</span>
                                    </div>
                                    <span className="text-3xl mt-3">₹{total_revenue_a.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                                    <span className="text-sm capitalize">{searchData.comparison_data.groups.a}</span>
                                </button>

                                <button
                                    className={`p-2 w-full border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        totalRevenueHigher === 'B' ? 'text-white bg-green-600' : 'text-green-600 bg-transparent'
                                    }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${
                                        totalRevenueHigher === 'B' ? 'text-green-600 bg-white' : 'text-white bg-green-600'
                                    }`}>
                                        <span>B</span>
                                    </div>
                                    <span className="text-3xl mt-3">₹{total_revenue_b.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                                    <span className="text-sm capitalize">{searchData.comparison_data.groups.b}</span>
                                </button>
                            </div>

                            <div className="w-1/3 flex flex-col">
                                <button
                                    className={`p-2 w-full text-center border-b-2 border-gray-400 flex flex-col items-start gap-0 text-green-600 bg-transparent`}
                                >
                                    <div className="text-green-600 flex items-center justify-center">
                                        <span>DIFF</span>
                                    </div>
                                    <span className="text-2xl mx-auto">₹{Math.abs(searchData.comparison_data.total_revenue.diff).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                                </button>
                                <button
                                    className={`p-2 w-full text-center flex flex-col items-start gap-0 text-green-600 bg-transparent`}
                                >
                                    <div className="text-green-600 flex items-center justify-center">
                                        <span>DIFF %</span>
                                    </div>
                                    <span className="text-2xl mx-auto">{Math.abs(searchData.comparison_data.total_revenue.diff_pct).toFixed(1)}%</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </CarouselItem>

                {/* Average Order Value */}
                <CarouselItem className="basis-1/2">
                    <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-purple-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                        <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className={cn('flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer', 'bg-purple-600')}>
                            <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">AVERAGE ORDER VALUE</span>
                            <svg className={`${isOpen ? "rotate-180" : "rotate-0"} h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                        </div>

                        <div className="flex flex-row justify-between w-full oswald">

                            <div className="w-2/3 flex flex-row">
                                <button
                                    className={`p-2 w-full rounded-bl-xl! border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        avgOrderValueHigher === 'A' ? 'text-white bg-purple-600' : 'text-purple-600 bg-transparent'
                                    }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${
                                        avgOrderValueHigher === 'A' ? 'text-purple-600 bg-white' : 'text-white bg-purple-600'
                                    }`}>
                                        <span>A</span>
                                    </div>
                                    <span className="text-3xl mt-3">₹{avg_order_value_a.toFixed(0)}</span>
                                    <span className="text-sm capitalize">{searchData.comparison_data.groups.a}</span>
                                </button>

                                <button
                                    className={`p-2 w-full border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        avgOrderValueHigher === 'B' ? 'text-white bg-purple-600' : 'text-purple-600 bg-transparent'
                                    }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${
                                        avgOrderValueHigher === 'B' ? 'text-purple-600 bg-white' : 'text-white bg-purple-600'
                                    }`}>
                                        <span>B</span>
                                    </div>
                                    <span className="text-3xl mt-3">₹{avg_order_value_b.toFixed(0)}</span>
                                    <span className="text-sm capitalize">{searchData.comparison_data.groups.b}</span>
                                </button>
                            </div>

                            <div className="w-1/3 flex flex-col">
                                <button
                                    className={`p-2 w-full text-center border-b-2 border-gray-400 flex flex-col items-start gap-0 text-purple-600 bg-transparent`}
                                >
                                    <div className="text-purple-600 flex items-center justify-center">
                                        <span>DIFF</span>
                                    </div>
                                    <span className="text-2xl mx-auto">₹{Math.abs(searchData.comparison_data.avg_order_value.diff).toFixed(0)}</span>
                                </button>
                                <button
                                    className={`p-2 w-full text-center flex flex-col items-start gap-0 text-purple-600 bg-transparent`}
                                >
                                    <div className="text-purple-600 flex items-center justify-center">
                                        <span>DIFF %</span>
                                    </div>
                                    <span className="text-2xl mx-auto">{Math.abs(searchData.comparison_data.avg_order_value.diff_pct).toFixed(1)}%</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </CarouselItem>

            </CarouselContent>
            
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}