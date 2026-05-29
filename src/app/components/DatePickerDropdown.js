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
      className="z-100 fixed left-1/2 flex flex-col gap-5 bg-white shadow-md rounded-md p-5 w-96"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? "grabbing" : "grab",
        transition: isDragging ? "none" : "transform 0.05s ease-out",
        willChange: "transform",
        backfaceVisibility: "hidden",
        perspective: "1000px",
        pointerEvents: isDragging ? "none" : "auto",
      }}
    >
      {/* Dropdown Header */}
      <button
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between w-full focus:outline-none cursor-grab active:cursor-grabbing"
      >
        <span className="poppins text-xs font-semibold tracking-widest uppercase">
          Date Picker
        </span>
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
            d="M12 5v14M5 12h14"
          />
        </svg>
      </button>

      {/* Dropdown Content */}
      <div className="flex flex-col gap-4 items-end w-full border-t pt-4">
        <div className="flex flex-row items-center w-full gap-5">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-medium text-gray-700 poppins uppercase">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 text-xs  border border-[#001fb0] poppins rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-medium text-gray-700 poppins uppercase">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 text-xs  border border-[#001fb0] poppins rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1 w-full">
          <span className="mx-auto text-xs font-medium text-gray-700 poppins uppercase">
            time preset
          </span>
          <div className="poppins flex flex-row gap-2 w-full">
            <Button
              onClick={onYesterday}
              variant="outline"
              className="px-4 py-2 text-xs font-medium flex-1 border border-[#001fb0]"
              disabled={loading}
            >
              Yesterday
            </Button>
            <Button
              onClick={onLastWeek}
              variant="outline"
              className="px-4 py-2 text-xs font-medium flex-1 border border-[#001fb0]"
              disabled={loading}
            >
              Last Week
            </Button>
            <Button
              onClick={onLastMonth}
              variant="outline"
              className="px-4 py-2 text-xs font-medium flex-1 border border-[#001fb0]"
              disabled={loading}
            >
              Last Month
            </Button>
          </div>
        </div>

        <div className="flex flex-row gap-4 flex-1 w-full">
          <Button
            onClick={onFetch}
            disabled={loading || !startDate || !endDate}
            className="flex-1 w-fit px-6 py-2 bg-[#001FB0]/80 hover:bg-[#001FB0] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Fetch Orders"}
          </Button>

          {isSuccess && (
            <Button onClick={onRefresh} variant="outline" className="px-4 py-2">
              ↻
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
