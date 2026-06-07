import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function CustomMetricGeneration({ metric_analysis, metric_calculated }) {
    const [isOpen, setIsOpen] = useState(false);
    
    const toggleCard = () => {
        setIsOpen(!isOpen);
    }
    const CURRENCY_METRICS = [
        'get_total_revenue',
        'get_aov',
        'get_average_discount',
        'get_average_shipping_charge',
        'get_average_tax'
    ];

    // Helper function to render metric content dynamically
    const renderMetricContent = (value, metricKey) => {
        const isCurrency = CURRENCY_METRICS.includes(metricKey);

        if (value === null || value === undefined) {
            return <span className='text-4xl mx-auto oswald font-bold'>N/A</span>;
        }

        // If it's a simple value (number, string)
        if (typeof value !== 'object') {
            return (
                <span className='text-4xl mx-auto oswald font-bold'>
                    {isCurrency ? '₹' : ''}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
                </span>
            );
        }

        // If it's a complex object, render nested structure
        const renderNestedObject = (obj, level = 0) => {
            return Object.entries(obj).map(([key, val]) => (
                <div key={key} className={`${level === 0 ? 'mb-2' : 'mb-0'} ${level > 0 ? 'px-3 flex flex-row justify-between' : ''}`}>
                    <div className={`!w-full uppercase font-semibold !text-[#001FB0] ${level === 0 ? 'border-b border-blue-200 pb-1 text-lg' : 'md'}`}>
                        {key.replace(/_/g, ' ')}
                    </div>
                    {val !== null && typeof val === 'object' ? (
                        <div className="mt-1">
                            {renderNestedObject(val, level + 1)}
                        </div>
                    ) : (
                        <div className="text-lg oswald font-bold text-gray-800">
                            {isCurrency && typeof val === 'number' ? '₹' : ''}{typeof val === 'number' ? val.toLocaleString('en-IN') : val}
                        </div>
                    )}
                </div>
            ));
        };

        return (
            <div className="w-full text-left text-sm px-3">
                {renderNestedObject(value)}
            </div>
        );
    };

    // Extract metrics and show only the actual custom metric (exclude metadata fields).
    const metrics = metric_calculated?.metrics ? metric_calculated.metrics : (metric_calculated || {});
    const customMetricLabel = metrics?.metric_name || 'Custom Metric';
    const customMetricValue = metrics?.custom_metric ?? null;

    return (
        <div className="max-w-7xl grid grid-cols-3 grid-rows-3 gap-4">
            <div className="col-start-1 col-span-2 row-span-full">
                <div className="pointer-events-auto select-none relative border rounded-xl w-full !h-fit" onClick={() => setIsOpen(false)}>
                    <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className='flex flex-row items-center justify-between bg-[#001FB0] rounded-t-xl h-fit cursor-pointer'>
                        <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">METRIC INSIGHTS</span>
                        {isOpen && (
                            <div className={cn(`bg-[#001FB0] absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-2 grid-rows-2 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                <div className='flex flex-col !gap-0'>
                                    <span className='poppins text-sm font-extrabold text-white'>Metric Analysis</span>
                                    <span className='poppins text-xs italic text-gray-300'>Comprehensive analysis of calculated metrics with detailed insights and calculations</span>
                                </div>
                            </div>
                        )}
                        <svg className={`h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                    </div>

                    <div className='rounded-b-xl p-0 h-96 overflow-y-scroll bg-gray-50 poppins'>
                        <ReactMarkdown
                            components={{
                                // Style bullet points
                                ul: ({ children }) => (
                                    <ul className="space-y-2 !pl-0">
                                        {children}
                                    </ul>
                                ),
                                // Style individual list items
                                li: ({ children }) => (
                                    <li className="relative border-b border-gray-200 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="!ml-5 w-2 h-2 bg-blue-600 border-2 border-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                            <div className="text-lg text-gray-700 leading-relaxed poppins">
                                                <p>{children}</p>
                                            </div>
                                        </div>
                                    </li>
                                ),
                                // Style bold text
                                strong: ({ children }) => (
                                    <strong className="text-blue-700 font-semibold">
                                        {children}
                                    </strong>
                                )
                            }}
                        >
                            {metric_analysis}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>

            <div className="col-start-3 row-span-3">
                <div className="pointer-events-auto select-none relative w-full rounded-xl !text-[#001FB0] border-4 border-[#001FB0] h-full" onClick={() => setIsOpen(false)}>
                    <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className='!border-b-4 !border-[#001FB0] flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer'>
                        <span className="block text-lg py-2 px-4 rounded-t-xl oswald uppercase">{customMetricLabel}</span>
                        {isOpen && (
                            <div className={cn(`bg-[#001FB0] absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-1 rounded-b-xl gap-3 justify-center items-center p-4`)}>
                                <div className='flex flex-col !gap-0'>
                                    <span className='poppins text-sm font-extrabold text-white'>Custom Metric</span>
                                    <span className='poppins text-xs italic text-gray-300'>Single calculated metric result for the current query</span>
                                </div>
                            </div>
                        )}
                        <svg className={`h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 11.6834 11.6834 11.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                    </div>

                    <div className='w-full text-center p-4 overflow-y-auto'>
                        {renderMetricContent(customMetricValue, "custom_metric")}
                    </div>
                </div>
            </div>

            {/* <div className="col-start-3 row-span-2">
                <div className="pointer-events-auto select-none relative border rounded-xl w-full h-full" onClick={() => setIsOpen(false)}>
                    <div className='flex flex-row items-center justify-between bg-[#001FB0] rounded-t-xl h-fit cursor-pointer'>
                        <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">CHART</span>
                        <svg className={`h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                    </div>
                </div>
            </div> */}

        </div>
    )
}