import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown } from "lucide-react";

export default function QueryDetails({ inputQuery, summarizedQuery, logs }) {

    return (

        <Collapsible className='my-2 flex flex-col items-start justify-center w-full border-2 border-green-700 bg-green-100 rounded-2xl'>
            <CollapsibleTrigger className="w-full h-full flex items-center justify-between px-4 mt-2">
                <p className="poppins font-bold text-lg text-green-700">Query Details</p>
                <ChevronsUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </CollapsibleTrigger>
            <CollapsibleContent className="w-full bg-green-50 rounded-b-xl">
                <div className="w-full! h-px bg-green-600"></div>
                <div className="flex flex-row p-4 gap-4">
                    <div className="flex flex-col gap-4 text-left w-1/2">
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-2">
                                <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                                <span className="oswald text-bold text-green-700">
                                    INPUT QUERY
                                </span>
                            </div>
                            <span className="pl-3 text-gray-700 leading-relaxed">
                                {inputQuery || 'No input query available'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-2">
                                <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                                <span className="oswald text-bold text-green-700">
                                    SUMMARIZED QUERY
                                </span>
                            </div>
                            <span className="pl-3 text-gray-700 leading-relaxed">
                                {summarizedQuery || 'No summarized query available'}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 w-1/2">
                        <div className="flex flex-row items-center gap-2">
                            <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                            <span className="oswald text-bold text-green-700">
                                LOGS
                            </span>
                        </div>
                        <div className="pl-3 text-gray-700 leading-relaxed max-h-64 overflow-y-auto">
                            {logs && logs.length > 0 ? (
                                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                    {logs.map((log, index) => (
                                        `${index + 1}. ${typeof log === 'string' ? log : JSON.stringify(log, null, 2)}\n`
                                    )).join('')}
                                </pre>
                            ) : (
                                <span>No logs available</span>
                            )}
                        </div>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}