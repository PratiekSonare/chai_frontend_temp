import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function MetricGrid({ cN, textCn, opacityCn, data, titles, header = "METRICS", ChartingComponent, onMetricClick }) {

    const [isOpen, setIsOpen] = useState(false);

    const toggleCard = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-blue-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
            <div onClick={(e) => { e.stopPropagation(); toggleCard(); }} className={cn('flex flex-row items-center justify-between rounded-t-xl h-fit cursor-pointer', cN)}>
                <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">{header}</span>
                <svg className={`${isOpen ? "rotate-180" : "rotate-0"} h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                {isOpen && (
                    <div className={cn(`absolute top-10 left-0 right-0 bottom-0 z-50 grid grid-cols-2 grid-rows-2 rounded-b-xl gap-3 justify-center items-center p-4`, cN)}>
                        <div className='flex flex-col gap-0!'>
                            <span className='poppins text-sm font-extrabold text-white'>{titles[0].title}</span>
                            <span className='poppins text-xs italic text-gray-300'>{titles[0].desc}</span>
                        </div>
                        <div className='flex flex-col gap-0!'>
                            <span className='poppins text-sm font-extrabold text-white'>{titles[1].title}</span>
                            <span className='poppins text-xs italic text-gray-300'>{titles[1].desc}</span>
                        </div>
                        <div className={`flex flex-col gap-0!`}>
                            <span className='poppins text-sm font-extrabold text-white'>{titles[2].title}</span>
                            <span className='poppins text-xs italic text-gray-300'>{titles[2].desc}</span>
                        </div>
                        <div className='flex flex-col gap-0!'>
                            <span className='poppins text-sm font-extrabold text-white'>{titles[3].title}</span>
                            <span className='poppins text-xs italic text-gray-300'>{titles[3].desc}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className='flex flex-row justify-between w-full'>
                <div className="grid grid-cols-2 grid-rows-2 w-1/2 h-full gap-0">
                    <button 
                        className="p-2 border-r-2 border-b-2 border-gray-400 w-full flex flex-col justify-center items-center gap-1! bg-transparent hover:bg-white! transition-colors duration-100 ease-in"
                        onClick={() => onMetricClick && onMetricClick(titles[0].title)}
                    >
                        <span className="text-md poppins font-bold">{titles[0].title}</span>
                        <span className={cn("text-3xl poppins font-bold", textCn)}>{data[0]}</span>
                    </button >
                    <button 
                        className="p-2 border-r-2 border-b-2 border-gray-400 w-full flex flex-col justify-center items-center gap-1! bg-transparent hover:bg-white! transition-colors duration-100 ease-in"
                        onClick={() => onMetricClick && onMetricClick(titles[1].title)}
                    >
                        <span className={cn(`text-md poppins font-bold`, opacityCn)}>{titles[1].title}</span>
                        <span className={cn("text-3xl poppins font-bold", textCn, opacityCn)}>{data[1]}</span>
                    </button>
                    <button 
                        className="p-2 border-r-2 border-gray-400 w-full flex flex-col justify-center items-center gap-1! bg-transparent hover:bg-white! transition-colors duration-100 ease-in"
                        onClick={() => onMetricClick && onMetricClick(titles[2].title)}
                    >
                        <span className="text-md poppins font-bold">{titles[2].title}</span>
                        <span className={cn("text-3xl poppins font-bold", textCn)}>{data[2]}</span>
                    </button>
                    <button 
                        className="p-2 border-r-2 border-gray-400 w-full flex flex-col justify-center items-center gap-1! bg-transparent hover:bg-white! transition-colors duration-100 ease-in"
                        onClick={() => onMetricClick && onMetricClick(titles[3].title)}
                    >
                        <span className="text-md poppins font-bold">{titles[3].title}</span>
                        <span className={cn("text-3xl poppins font-bold", textCn)}>{data[3]}</span>
                    </button>
                </div>
                
                <div className='w-1/2 relative flex flex-col justify-end items-end'>
                    {ChartingComponent}
                </div>
            </div>
        </div >
    )
}