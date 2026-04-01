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

    // Detect data source type (order vs profit)
    const dataSource = searchData?.comparison_data?.data_source || 'order';
    const isProfit = dataSource === 'profit';

    // Extract common comparison data
    const winner_by_volume = searchData.comparison_data.winner_by_volume || searchData.comparison_data.winner_by_margin;
    const winner_by_revenue = searchData.comparison_data.winner_by_revenue || searchData.comparison_data.winner_by_total_profit;
    const winner_by_aov = searchData.comparison_data.winner_by_avg_value || searchData.comparison_data.winner_by_markup;

    // For orders: order_count, total_revenue, avg_order_value
    // For profit: item_count, total_gross_profit, avg_gross_margin
    const metric_a = isProfit 
        ? searchData.comparison_data.item_count?.a 
        : searchData.comparison_data.order_count?.a;
    const metric_b = isProfit 
        ? searchData.comparison_data.item_count?.b 
        : searchData.comparison_data.order_count?.b;

    const revenue_a = isProfit 
        ? searchData.comparison_data.total_gross_profit?.a 
        : searchData.comparison_data.total_revenue?.a;
    const revenue_b = isProfit 
        ? searchData.comparison_data.total_gross_profit?.b 
        : searchData.comparison_data.total_revenue?.b;

    const avg_metric_a = isProfit 
        ? searchData.comparison_data.avg_gross_margin?.a 
        : searchData.comparison_data.avg_order_value?.a;
    const avg_metric_b = isProfit 
        ? searchData.comparison_data.avg_gross_margin?.b 
        : searchData.comparison_data.avg_order_value?.b;

    // Determine which A or B has higher values for each metric
    const metric_higher = metric_a > metric_b ? 'A' : 'B';
    const revenue_higher = revenue_a > revenue_b ? 'A' : 'B';
    const avg_metric_higher = avg_metric_a > avg_metric_b ? 'A' : 'B';

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
            value: 1,
            color: '#001FB0',
        }];
    }, [currentWinnerState, defaultWinner]);

    const toggleCard = () => {
        setIsOpen(!isOpen);
    }

    // Metric labels based on data source
    const getMetricLabel = () => isProfit ? 'ITEM COUNT' : 'ORDER COUNT';
    const getRevenueLabel = () => isProfit ? 'TOTAL PROFIT' : 'TOTAL REVENUE';
    const getAvgLabel = () => isProfit ? 'AVG MARGIN %' : 'AVERAGE ORDER VALUE';
    const getRevenueColor = () => isProfit ? 'bg-amber-600' : 'bg-green-600';
    const getAvgColor = () => isProfit ? 'bg-indigo-600' : 'bg-purple-600';
    const formatRevenue = (val) => isProfit ? val.toFixed(2) : val.toLocaleString('en-IN', {maximumFractionDigits: 0});
    const getRevenuePrefix = () => isProfit ? '' : '₹';

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
                                        <span className='poppins text-sm font-extrabold text-white'>Pairwise Comparison</span>
                                        <span className='poppins text-xs italic text-gray-300'>Compare two groups head-to-head by {isProfit ? 'margin, profit, and markup' : 'volume, revenue, and average order value'}</span>
                                    </div>
                                </div>
                            )}
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
                                    {isProfit ? 'MARGIN' : 'VOLUME'}
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
                                    {isProfit ? 'PROFIT' : 'REVENUE'}
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
                                    {isProfit ? 'MARKUP' : 'AOV'}
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

                {/* Metric 1: Count/Items */}
                <CarouselItem className="basis-1/2">
                    <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-orange-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                        <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className={cn('flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer', 'bg-orange-600')}>
                            <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">{getMetricLabel()}</span>
                            {isOpen && (
                                <div className={cn(`bg-orange-600 absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-2 grid-rows-2 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                    <div className='flex flex-col gap-0!'>
                                        <span className='poppins text-sm font-extrabold text-white'>{getMetricLabel()} Comparison</span>
                                        <span className='poppins text-xs italic text-gray-300'>Head-to-head comparison of {isProfit ? 'items in each group' : 'order volumes'} with percentage difference analysis</span>
                                    </div>
                                </div>
                            )}
                            <svg className={`${isOpen ? "rotate-180" : "rotate-0"} h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                        </div>

                        <div className="flex flex-row justify-between w-full oswald">

                            <div className="w-2/3 flex flex-row">
                                <button
                                    className={`p-2 w-full rounded-bl-xl! border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        metric_higher === 'A' ? 'text-white bg-orange-600' : 'text-orange-600 bg-transparent'
                                    }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${
                                        metric_higher === 'A' ? 'text-orange-600 bg-white' : 'text-white bg-orange-600'
                                    }`}>
                                        <span>A</span>
                                    </div>
                                    <span className="text-3xl mt-3">{metric_a}</span>
                                    <span className="text-sm capitalize">{searchData.comparison_data.groups.a}</span>
                                </button>

                                <button
                                    className={`p-2 w-full border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        metric_higher === 'B' ? 'text-white bg-orange-600' : 'text-orange-600 bg-transparent'
                                    }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${
                                        metric_higher === 'B' ? 'text-orange-600 bg-white' : 'text-white bg-orange-600'
                                    }`}>
                                        <span>B</span>
                                    </div>
                                    <span className="text-3xl mt-3">{metric_b}</span>
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
                                    <span className="text-2xl mx-auto ">{isProfit ? (searchData.comparison_data.item_count?.diff || 0) : searchData.comparison_data.order_count.diff.toFixed(2)}</span>
                                </button>
                                <button
                                    className={`p-2 w-full text-center flex flex-col items-start gap-0 text-orange-600 bg-transparent`}
                                >
                                    <div className="text-orange-600 flex items-center justify-center">
                                        <span>DIFF %</span>
                                    </div>
                                    <span className="text-2xl mx-auto">{isProfit ? (searchData.comparison_data.item_count?.diff_pct || 0).toFixed(1) : searchData.comparison_data.order_count.diff_pct.toFixed(2)}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </CarouselItem>

                {/* Metric 2: Revenue/Profit */}
                <CarouselItem className="basis-1/2">
                    <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-green-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                        <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className={cn('flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer', getRevenueColor())}>
                            <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">{getRevenueLabel()}</span>
                            {isOpen && (
                                <div className={cn(`${getRevenueColor()} absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-2 grid-rows-2 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                    <div className='flex flex-col gap-0!'>
                                        <span className='poppins text-sm font-extrabold text-white'>{getRevenueLabel()} Comparison</span>
                                        <span className='poppins text-xs italic text-gray-300'>Head-to-head {isProfit ? 'profit' : 'revenue'} comparison between two groups showing totals and percentage differences</span>
                                    </div>
                                </div>
                            )}
                            <svg className={`${isOpen ? "rotate-180" : "rotate-0"} h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                        </div>

                        <div className="flex flex-row justify-between w-full oswald">

                            <div className="w-2/3 flex flex-row">
                                <button
                                    className={`p-2 w-full rounded-bl-xl! border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        revenue_higher === 'A' ? 'text-white ' : 'text-orange-600 bg-transparent'
                                    }`}
                                    style={{backgroundColor: revenue_higher === 'A' ? (isProfit ? '#b45309' : '#16a34a') : 'transparent'}}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${
                                        revenue_higher === 'A' ? ' bg-white' : `text-white`
                                    }`}
                                    style={{color: revenue_higher === 'A' ? (isProfit ? '#b45309' : '#16a34a') : 'white', backgroundColor: revenue_higher === 'A' ? 'white' : (isProfit ? '#b45309' : '#16a34a')}}
                                    >
                                        <span>A</span>
                                    </div>
                                    <span className="text-3xl mt-3">{getRevenuePrefix()}{formatRevenue(revenue_a)}</span>
                                    <span className="text-sm capitalize">{searchData.comparison_data.groups.a}</span>
                                </button>

                                <button
                                    className={`p-2 w-full border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        revenue_higher === 'B' ? 'text-white' : 'text-orange-600 bg-transparent'
                                    }`}
                                    style={{backgroundColor: revenue_higher === 'B' ? (isProfit ? '#b45309' : '#16a34a') : 'transparent'}}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center`}
                                    style={{color: revenue_higher === 'B' ? (isProfit ? '#b45309' : '#16a34a') : 'white', backgroundColor: revenue_higher === 'B' ? 'white' : (isProfit ? '#b45309' : '#16a34a')}}
                                    >
                                        <span>B</span>
                                    </div>
                                    <span className="text-3xl mt-3">{getRevenuePrefix()}{formatRevenue(revenue_b)}</span>
                                    <span className="text-sm capitalize">{searchData.comparison_data.groups.b}</span>
                                </button>
                            </div>

                            <div className="w-1/3 flex flex-col">
                                <button
                                    className={`p-2 w-full text-center border-b-2 border-gray-400 flex flex-col items-start gap-0 bg-transparent`}
                                    style={{color: isProfit ? '#b45309' : '#16a34a'}}
                                >
                                    <div className="flex items-center justify-center">
                                        <span>DIFF</span>
                                    </div>
                                    <span className="text-2xl mx-auto">{getRevenuePrefix()}{formatRevenue(Math.abs(isProfit ? searchData.comparison_data.total_gross_profit?.diff : searchData.comparison_data.total_revenue.diff))}</span>
                                </button>
                                <button
                                    className={`p-2 w-full text-center flex flex-col items-start gap-0 bg-transparent`}
                                    style={{color: isProfit ? '#b45309' : '#16a34a'}}
                                >
                                    <div className="flex items-center justify-center">
                                        <span>DIFF %</span>
                                    </div>
                                    <span className="text-2xl mx-auto">{Math.abs(isProfit ? searchData.comparison_data.total_gross_profit?.diff_pct : searchData.comparison_data.total_revenue.diff_pct).toFixed(1)}%</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </CarouselItem>

                {/* Metric 3: Avg Margin/AOV */}
                <CarouselItem className="basis-1/2">
                    <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-purple-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                        <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className={cn('flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer', getAvgColor())}>
                            <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">{getAvgLabel()}</span>
                            {isOpen && (
                                <div className={cn(`${getAvgColor()} absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-2 grid-rows-2 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                    <div className='flex flex-col gap-0!'>
                                        <span className='poppins text-sm font-extrabold text-white'>{getAvgLabel()} Comparison</span>
                                        <span className='poppins text-xs italic text-gray-300'>Compare {isProfit ? 'average profit margins' : 'average order values'} between groups</span>
                                    </div>
                                </div>
                            )}
                            <svg className={`${isOpen ? "rotate-180" : "rotate-0"} h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                        </div>

                        <div className="flex flex-row justify-between w-full oswald">

                            <div className="w-2/3 flex flex-row">
                                <button
                                    className={`p-2 w-full rounded-bl-xl! border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        avg_metric_higher === 'A' ? 'text-white bg-indigo-600' : 'text-indigo-600 bg-transparent'
                                    }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${
                                        avg_metric_higher === 'A' ? 'text-indigo-600 bg-white' : 'text-white bg-indigo-600'
                                    }`}>
                                        <span>A</span>
                                    </div>
                                    <span className="text-3xl mt-3">{avg_metric_a.toFixed(isProfit ? 2 : 0)}{isProfit ? '%' : ''}</span>
                                    <span className="text-sm capitalize">{searchData.comparison_data.groups.a}</span>
                                </button>

                                <button
                                    className={`p-2 w-full border-r-2 border-gray-400 text-center flex flex-col items-center justify-center ${
                                        avg_metric_higher === 'B' ? 'text-white bg-indigo-600' : 'text-indigo-600 bg-transparent'
                                    }`}
                                >
                                    <div className={`font-bold rounded-full w-8 h-8 text-md flex items-center justify-center ${
                                        avg_metric_higher === 'B' ? 'text-indigo-600 bg-white' : 'text-white bg-indigo-600'
                                    }`}>
                                        <span>B</span>
                                    </div>
                                    <span className="text-3xl mt-3">{avg_metric_b.toFixed(isProfit ? 2 : 0)}{isProfit ? '%' : ''}</span>
                                    <span className="text-sm capitalize">{searchData.comparison_data.groups.b}</span>
                                </button>
                            </div>

                            <div className="w-1/3 flex flex-col">
                                <button
                                    className={`p-2 w-full text-center border-b-2 border-gray-400 flex flex-col items-start gap-0 text-indigo-600 bg-transparent`}
                                >
                                    <div className="text-indigo-600 flex items-center justify-center">
                                        <span>DIFF</span>
                                    </div>
                                    <span className="text-2xl mx-auto">{Math.abs(isProfit ? searchData.comparison_data.avg_gross_margin?.diff : searchData.comparison_data.avg_order_value.diff).toFixed(isProfit ? 2 : 0)}{isProfit ? '%' : ''}</span>
                                </button>
                                <button
                                    className={`p-2 w-full text-center flex flex-col items-start gap-0 text-indigo-600 bg-transparent`}
                                >
                                    <div className="text-indigo-600 flex items-center justify-center">
                                        <span>DIFF %</span>
                                    </div>
                                    <span className="text-2xl mx-auto">{Math.abs(isProfit ? searchData.comparison_data.avg_gross_margin?.diff_pct : searchData.comparison_data.avg_order_value.diff_pct).toFixed(1)}%</span>
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

 