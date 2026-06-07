import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DatePickerDropdown({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onFetch,
  onRefresh,
  onYesterday,
  onLastWeek,
  onLastMonth,
  loading = false,
  isSuccess = false,
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const positionRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const frameIdRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }

      frameIdRef.current = requestAnimationFrame(() => {
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        positionRef.current = { x: newX, y: newY };
        setPosition({ x: newX, y: newY });
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [isDragging]);

  return (
    <div
      className="z-[100] flex flex-col gap-4 bg-white shadow-lg rounded-2xl p-4 w-[380px]"
      style={{
        // transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        cursor: isDragging ? "grabbing" : "default",
        transition: isDragging ? "none" : "transform 0.05s ease-out",
        willChange: "transform",
      }}
    >
      {/* Dropdown Header */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between w-full px-2 py-1 cursor-grab active:cursor-grabbing rounded-md hover:bg-gray-100 transition-colors"
      >
        <span className="poppins text-xs font-semibold tracking-widest uppercase text-gray-800">
          Date Picker
        </span>
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </div>

      {/* Dropdown Content */}
      <div className="flex flex-col gap-4 w-full border-t border-gray-200 pt-4">
        <div className="flex flex-row items-center w-full gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-medium text-gray-600 poppins">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-300 poppins rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-medium text-gray-600 poppins">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-300 poppins rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <span className="text-xs font-medium text-gray-600 poppins">
            Time Preset
          </span>
          <div className="poppins flex flex-row gap-2 w-full">
            <Button
              onClick={onYesterday}
              variant="outline"
              className="px-3 py-2 text-xs font-medium flex-1 border border-gray-300 hover:bg-gray-50"
              disabled={loading}
            >
              Yesterday
            </Button>
            <Button
              onClick={onLastWeek}
              variant="outline"
              className="px-3 py-2 text-xs font-medium flex-1 border border-gray-300 hover:bg-gray-50"
              disabled={loading}
            >
              Last Week
            </Button>
            <Button
              onClick={onLastMonth}
              variant="outline"
              className="px-3 py-2 text-xs font-medium flex-1 border border-gray-300 hover:bg-gray-50"
              disabled={loading}
            >
              Last Month
            </Button>
          </div>
        </div>

        <div className="flex flex-row gap-3 w-full">
          <Button
            onClick={onFetch}
            disabled={loading || !startDate || !endDate}
            className="flex-1 px-4 py-2 text-sm font-medium bg-[#001FB0] hover:bg-[#001FB0]/90 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Fetch Orders"}
          </Button>

          {isSuccess && (
            <Button
              onClick={onRefresh}
              variant="outline"
              className="px-3 py-2 border border-gray-300 hover:bg-gray-50"
              disabled={loading}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
