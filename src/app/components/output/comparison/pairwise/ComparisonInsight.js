import { useState } from "react";
import ReactMarkdown from 'react-markdown';

export default function ComparisonInsight({ groups, insights }) {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className='z-50 flex flex-col w-1/2 h-full gap-4'>
            <div className="pointer-events-auto select-none relative rounded-xl border-4 border-[#001FB0] w-full h-fit!" onClick={() => setIsOpen(false)}>
                <div className='flex flex-row items-center justify-between bg-[#001FB0] h-fit cursor-pointer'>
                    <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">GROUPS</span>
                    <svg className={`h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                </div>

                <div className={`flex flex-row overflow-y-hidden h-full oswald`}>
                    {groups.map((group, index) => {
                        const letters = ['A', 'B'];
                        const borderClasses = [
                            'border-r-2 border-gray-400',  // top item
                            ''               // bottom item
                        ];

                        return (
                            <div key={index} className="h-full w-full flex flex-col gap-0">
                                <button className={`p-2 py-3 ${borderClasses[index]} w-full text-center flex flex-col justify-center items-center gap-2`}>
                                    <div className="font-bold text-white rounded-full w-8 h-8 text-md bg-[#001FB0] flex items-center justify-center">
                                        <span>{letters[index]}</span>
                                    </div>
                                    {typeof group === 'string' ? group.toUpperCase() : group.name?.toUpperCase() || 'UNKNOWN'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* insights */}
            <div className="pointer-events-auto select-none relative rounded-xl  border border-blue-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                <div className='flex flex-row items-center justify-between bg-[#001FB0] rounded-t-xl h-fit cursor-pointer'>
                    <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">INSIGHTS</span>
                    <svg className={`h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                </div>

                <div className='rounded-b-xl p-1 h-96 overflow-y-scroll bg-gray-50 poppins'>
                    <ReactMarkdown
                        components={{
                            // Style bullet points
                            ul: ({ children }) => (
                                <ul className="space-y-3 list-none pl-0!">
                                    {children}
                                </ul>
                            ),
                            // Style individual list items
                            li: ({ children }) => (
                                <li className="relative border-b border-gray-200 py-4">
                                    <div className="flex items-start gap-3">
                                        <div className="ml-5! w-2 h-2 bg-blue-600 border-2 border-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                        <div className=" text-sm text-gray-700 leading-relaxed poppins">
                                            {children}
                                        </div>
                                    </div>
                                </li>
                            ),
                            // Style bold text
                            strong: ({ children }) => (
                                <strong className="text-blue-700 font-semibold">
                                    {children}
                                </strong>
                            ),
                            // Style paragraphs
                            p: ({ children }) => (
                                <span className="text-gray-600">
                                    {children}
                                </span>
                            ),
                            // Style numbered lists
                            ol: ({ children }) => (
                                <ol className="space-y-3 list-none pl-0!">
                                    {children}
                                </ol>
                            ),
                            // Style headers if present
                            h1: ({ children }) => (
                                <h1 className="text-lg font-bold text-blue-700 mb-3 oswald">
                                    {children}
                                </h1>
                            ),
                            h2: ({ children }) => (
                                <h2 className="text-md font-semibold text-blue-600 mb-2 oswald">
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3 className="text-sm font-medium text-blue-500 mb-1 oswald">
                                    {children}
                                </h3>
                            ),
                            // Style code blocks if present
                            code: ({ children }) => (
                                <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">
                                    {children}
                                </code>
                            ),
                            // Style blockquotes if present
                            blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 italic">
                                    {children}
                                </blockquote>
                            )
                        }}
                    >
                        {insights}
                    </ReactMarkdown>
                </div>

            </div>
        </div>
    )
}