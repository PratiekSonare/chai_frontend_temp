"use client";

import { useEffect, useRef, useState } from "react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown } from "lucide-react";

export default function QueryDetails({ requestId, inputQuery, summarizedQuery, logs, isError, searchError }) {
    const SCROLL_CLOSE_THRESHOLD = 80;
    const safeLogs = Array.isArray(logs) ? logs : [];
    const [isOpen, setIsOpen] = useState(false);
    const lastScrollYRef = useRef(0);

    useEffect(() => {
        lastScrollYRef.current = window.scrollY;

        const onScroll = () => {
            const currentScrollY = window.scrollY;
            const scrolledUp = currentScrollY < lastScrollYRef.current;

            if (scrolledUp && currentScrollY < SCROLL_CLOSE_THRESHOLD) {
                setIsOpen(false);
            }

            lastScrollYRef.current = currentScrollY;
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className='my-2 flex flex-col justify-center w-full border-1 border-blue-700 bg-blue-100 rounded-2xl'
        >
            <CollapsibleTrigger className="w-full h-full flex items-center justify-between px-4 py-2">
                <span className="poppins font-bold text-md text-blue-700 align-bottom">Query Details</span>
                <ChevronsUpDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </CollapsibleTrigger>
            <CollapsibleContent className="w-full bg-blue-50 rounded-b-2xl! text-xs!">
                <div className="w-full! h-px bg-blue-600"></div>
                <div className="flex flex-row p-3 gap-2">
                    <div className="flex flex-col gap-2 text-left w-1/2">
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-2">
                                <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                                <span className="oswald text-bold text-blue-700">
                                    REQUEST ID
                                </span>
                            </div>
                            <span className="pl-3 text-gray-700 leading-relaxed break-all">
                                {requestId || 'No active request id'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-2">
                                <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                                <span className="oswald text-bold text-blue-700">
                                    INPUT QUERY
                                </span>
                            </div>
                            <span className="pl-3 text-gray-700 leading-relaxed">
                                {inputQuery || 'No input query available'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-2">
                                <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                                <span className="oswald text-bold text-blue-700">
                                    SUMMARIZED QUERY
                                </span>
                            </div>
                            <span className="pl-3 text-gray-700 leading-relaxed">
                                {summarizedQuery || 'No summarized query available'}
                            </span>
                        </div>
                        {isError && (
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-row items-center gap-2">
                                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                                    <span className="oswald text-bold text-red-700">
                                        ERROR
                                    </span>
                                </div>
                                <span className="pl-3 text-gray-700 leading-relaxed">
                                    {searchError || 'Please retry again, some error occurred.'}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 w-1/2">
                        <div className="flex flex-row items-center gap-2">
                            <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                            <span className="oswald text-bold text-blue-700">
                                LOGS
                            </span>
                        </div>
                        <div className={`${isError ? "max-h-42" : "max-h-32"} pl-3 border rounded-xl pt-3 text-xs text-blue-700 leading-relaxed overflow-y-auto pr-2`}>
                            {safeLogs.length > 0 ? (
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                    {safeLogs.map((log) => {
                                        const seq = log?.sequence ?? '-';
                                        const status = log?.status || 'INFO';
                                        const key = log?.step_key || 'STEP';
                                        const summary = log?.summary || '';
                                        return `[${seq}] ${status} ${key}: ${summary}`;
                                    }).join('\n\n')}
                                </pre>
                            ) : (
                                <span>No logs available for this request yet</span>
                            )}
                        </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}