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
import StateMapPlotter from '@/components/StateMapPlotter';
import { cn } from '@/lib/utils';

export default function NewMetricCarouselComp({ searchData, isSuccess, cN = 'bg-[#001FB0]' }) {
    const [defaultWinner, setDefaultWinner] = useState('one');
    const [isOpen, setIsOpen] = useState(false);
    
    const toggleCard = () => {
        setIsOpen(!isOpen);
    }

    // Get winners from the data
    const winnerByVolume = searchData?.comparison_data?.overall_winners?.by_volume || '';
    const winnerByRevenue = searchData?.comparison_data?.overall_winners?.by_revenue || '';
    const winnerByAov = searchData?.comparison_data?.overall_winners?.by_avg_value || '';

    // Get current winner state and create map data
    const currentWinnerState = useMemo(() => {
        switch (defaultWinner) {
            case 'one': return winnerByVolume;
            case 'two': return winnerByRevenue;
            case 'three': return winnerByAov;
            default: return winnerByVolume;
        }
    }, [defaultWinner, winnerByVolume, winnerByRevenue, winnerByAov]);

    const mapData = useMemo(() => {
        if (!currentWinnerState) return [];

        return [{
            name: currentWinnerState.charAt(0).toUpperCase() + currentWinnerState.slice(1).toLowerCase(),
            value: 1, // Winner state gets value 1
            color: '#001FB0',
        }];
    }, [currentWinnerState]);

    // Get group summaries for metrics display
    const groupSummaries = searchData?.comparison_data?.group_summaries || {};
    const groups = Object.keys(groupSummaries);

    // Get metrics for each group
    const getMetricHighest = (metricKey) => {
        let highest = '';
        let highestValue = -1;

        Object.entries(groupSummaries).forEach(([groupName, data]) => {
            const value = data[metricKey];
            if (value > highestValue) {
                highestValue = value;
                highest = groupName;
            }
        });

        return highest;
    };

    const orderCountHighest = getMetricHighest('order_count');
    const totalRevenueHighest = getMetricHighest('total_revenue');
    const avgOrderValueHighest = getMetricHighest('avg_order_value');

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
                            {isOpen && (
                                <div className={cn(`${cN} absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-2 grid-rows-2 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                    <div className='flex flex-col gap-0!'>
                                        <span className='poppins text-sm font-extrabold text-white'>Comparison Winners</span>
                                        <span className='poppins text-xs italic text-gray-300'>Compare different groups by volume, revenue, and average order value to identify top performers</span>
                                    </div>
                                </div>
                            )}
                            <svg className="h-4 px-4 transition-transform duration-200 ease-in" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                    <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                </g>
                            </svg>
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
                                        {defaultWinner === 'one' && winnerByVolume}
                                        {defaultWinner === 'two' && winnerByRevenue}
                                        {defaultWinner === 'three' && winnerByAov}
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

                {/* Order Count Comparison */}
                <CarouselItem className="basis-1/2">
                    <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-orange-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                        <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className={cn('flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer', 'bg-orange-600')}>
                            <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">ORDER COUNT</span>
                            {isOpen && (
                                <div className={cn(`bg-orange-600 absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-2 grid-rows-2 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                    <div className='flex flex-col gap-0!'>
                                        <span className='poppins text-sm font-extrabold text-white'>Order Volume Comparison</span>
                                        <span className='poppins text-xs italic text-gray-300'>Compare total number of orders across different groups to identify volume leaders</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-row justify-between w-full oswald">
                            <div className="w-full flex flex-row">
                                {Object.entries(groupSummaries).map(([groupName, data], index) => {
                                    const isHighest = orderCountHighest === groupName;
                                    const colors = ['#ea580c', '#f97316', '#fb923c']; // Different shades of orange
                                    const bgColor = colors[index] || '#f97316';
                                    const borderClass = index < Object.keys(groupSummaries).length - 1 ? 'border-r-2 border-gray-400' : '';
                                    const radiusClass = index === 0 ? 'rounded-bl-xl!' : index === 2 ? 'rounded-br-xl!' : '';

                                    return (
                                        <button
                                            key={groupName}
                                            className={`p-4 w-full ${borderClass} ${radiusClass} text-center flex flex-col items-center justify-center ${isHighest ? 'text-white bg-orange-600 ' : 'text-orange-600 bg-transparent'
                                                }`}
                                        >
                                            <div
                                                className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${isHighest ? 'text-orange-600 bg-white' : 'text-white'
                                                    }`}
                                                style={!isHighest ? { backgroundColor: bgColor } : {}}
                                            >
                                                <span>{index + 1}</span>
                                            </div>
                                            <span className="text-3xl mt-3">{data.order_count}</span>
                                            <span className="text-sm capitalize">{groupName}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CarouselItem>

                {/* Revenue Comparison */}
                <CarouselItem className="basis-1/2">
                    <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-green-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                        <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className={cn('flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer', 'bg-green-600')}>
                            <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">TOTAL REVENUE</span>
                            {isOpen && (
                                <div className={cn(`bg-green-600 absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-2 grid-rows-2 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                    <div className='flex flex-col gap-0!'>
                                        <span className='poppins text-sm font-extrabold text-white'>Revenue Comparison</span>
                                        <span className='poppins text-xs italic text-gray-300'>Compare total revenue generated across different groups to identify top revenue drivers</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-row justify-between w-full oswald">
                            <div className="w-full flex flex-row">
                                {Object.entries(groupSummaries).map(([groupName, data], index) => {
                                    const isHighest = totalRevenueHighest === groupName;
                                    const colors = ['#059669', '#10b981', '#34d399']; // Different shades of green
                                    const bgColor = colors[index] || '#10b981';
                                    const borderClass = index < Object.keys(groupSummaries).length - 1 ? 'border-r-2 border-gray-400' : '';
                                    const radiusClass = index === 0 ? 'rounded-bl-xl!' : index === 2 ? 'rounded-br-xl!' : '';

                                    return (
                                        <button
                                            key={groupName}
                                            className={`p-4 w-full ${borderClass} ${radiusClass} text-center flex flex-col items-center justify-center ${isHighest ? 'text-white bg-green-600 ' : 'text-green-600 bg-transparent'
                                                }`}
                                        >
                                            <div
                                                className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${isHighest ? 'text-green-600 bg-white' : 'text-white'
                                                    }`}
                                                style={!isHighest ? { backgroundColor: bgColor } : {}}
                                            >
                                                <span>{index + 1}</span>
                                            </div>
                                            <span className="text-3xl mt-3">₹{data.total_revenue ? data.total_revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}</span>
                                            <span className="text-sm capitalize">{groupName}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </CarouselItem>

                {/* AOV Comparison */}
                <CarouselItem className="basis-1/2">
                    <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-purple-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                        <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className={cn('flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer', 'bg-purple-600')}>
                            <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">AVERAGE ORDER VALUE</span>
                            {isOpen && (
                                <div className={cn(`bg-purple-600 absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-2 grid-rows-2 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                    <div className='flex flex-col gap-0!'>
                                        <span className='poppins text-sm font-extrabold text-white'>AOV Comparison</span>
                                        <span className='poppins text-xs italic text-gray-300'>Compare average order values across groups to identify higher-value customer segments</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-row justify-between w-full oswald">
                            <div className="w-full flex flex-row">
                                {Object.entries(groupSummaries).map(([groupName, data], index) => {
                                    const isHighest = avgOrderValueHighest === groupName;
                                    const colors = ['#7c3aed', '#8b5cf6', '#a78bfa']; // Different shades of purple
                                    const bgColor = colors[index] || '#8b5cf6';
                                    const borderClass = index < Object.keys(groupSummaries).length - 1 ? 'border-r-2 border-gray-400' : '';
                                    const radiusClass = index === 0 ? 'rounded-bl-xl!' : index === 2 ? 'rounded-br-xl!' : '';

                                    return (
                                        <button
                                            key={groupName}
                                            className={`p-4 w-full ${borderClass} ${radiusClass} text-center flex flex-col items-center justify-center ${isHighest ? 'text-white bg-purple-600 ' : 'text-purple-600 bg-transparent'
                                                }`}
                                        >
                                            <div
                                                className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${isHighest ? 'text-purple-600 bg-white' : 'text-white'
                                                    }`}
                                                style={!isHighest ? { backgroundColor: bgColor } : {}}
                                            >
                                                <span>{index + 1}</span>
                                            </div>
                                            <span className="text-3xl mt-3">₹{data.avg_order_value ? data.avg_order_value.toFixed(0) : '0'}</span>
                                            <span className="text-sm capitalize">{groupName}</span>
                                        </button>
                                    );
                                })}
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