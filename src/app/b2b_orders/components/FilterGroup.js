"use client";

import { useState } from "react";
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const FilterGroup = ({
    title,
    options,
    selectedValues,
    onToggleSelection,
    onResetSelections,
    searchValue,
    onSearchChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const filteredOptions = options.filter((option) =>
        option.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex flex-col h-full border-t border-white/20">
            <CollapsibleTrigger className="flex flex-row items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                    <ChevronDown
                        className={`h-4 w-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                    <span className="poppins text-sm uppercase text-white">{title}</span>
                </div>
                <span
                    role="button"                    // Optional: improves accessibility
                    tabIndex={0}                     // Optional: makes it keyboard focusable
                    onClick={(e) => {
                        e.stopPropagation();
                        onResetSelections();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            onResetSelections();
                        }
                    }}
                    className="text-[11px] uppercase tracking-wide text-white/80 hover:text-white transition-colors cursor-pointer select-none"
                >
                    Clear
                </span>
            </CollapsibleTrigger>

            <CollapsibleContent className="flex flex-col gap-2 px-4 py-2 flex-1 overflow-hidden">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:border-white/50 transition-colors"
                />

                <div className="flex-1 overflow-y-auto pr-1 flex flex-wrap gap-2 content-start">
                    {filteredOptions.length === 0 ? (
                        <span className="text-xs text-white/70">No options</span>
                    ) : (
                        filteredOptions.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => onToggleSelection(option)}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${selectedValues.includes(option)
                                        ? "bg-white text-[#001a8e] border border-white"
                                        : "bg-white/10 text-white border border-white/30 hover:bg-white/20 hover:border-white/50"
                                    }`}
                            >
                                {option}
                            </button>
                        ))
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};

export default FilterGroup;
