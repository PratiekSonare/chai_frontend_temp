"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import DotField from "@/components/DotField";
import { apiUrl } from "@/lib/api";

export default function InventoryLayout({ title, subtitle, children }) {
  const [snapshotData, setSnapshotData] = useState(null);
  const [dateRange, setDateRange] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().slice(0, 10);
    return {
      start_date: `${dateStr} 00:00:00`,
      end_date: `${dateStr} 23:59:59`,
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSnapshot = async (startParam, endParam) => {
    setLoading(true);
    setError(null);
    const start = startParam ?? dateRange.start_date;
    const end = endParam ?? dateRange.end_date;
    try {
      const res = await fetch(
        apiUrl(
          `/inventory/snapshot?start_date=${encodeURIComponent(
            start,
          )}&end_date=${encodeURIComponent(end)}`,
        ),
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setSnapshotData(data);
      } else {
        throw new Error(data.detail || "Failed to fetch inventory");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshot();
  }, []);

  return (
    <div className="overflow-hidden h-screen">
      <Sidebar />
      <div className="h-screen bg-[#001fb0] p-5 pt-0">
        <div className="relative bg-zinc-50 h-full landing-sdw overflow-x-hidden overflow-y-auto font-sans rounded-t-4xl snap-y snap-mandatory scroll-smooth">
          <div className="absolute inset-0.5 z-0 opacity-70 h-full">
            <DotField
              dotRadius={2}
              dotSpacing={15}
              bulgeStrength={500}
              glowRadius={2}
              sparkle={true}
              waveAmplitude={0}
              cursorRadius={25}
              cursorForce={0.1}
              bulgeOnly
              gradientFrom="#A855F7"
              gradientTo="#001FB0"
              glowColor="#000000"
            />
          </div>

          <div className="relative z-10 p-6 pt-4 max-w-[1400px] mx-auto">
            <div className="mb-6 flex flex-col gap-2 items-center justify-center">
              <h1 className="text-3xl font-bold text-[#001FB0] poppins">
                {title}
              </h1>
              <p className="text-zinc-500 text-sm">{subtitle}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 mb-6 text-sm">
                {error}
              </div>
            )}

            {loading && (
              <div className="w-full flex-1 min-h-0 flex items-center justify-center">
                <div className="w-full max-w-3xl bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <svg
                      className="w-8 h-8 text-blue-600 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>

                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold">
                        Loading inventory...
                      </p>
                      <p className="text-sm text-gray-500">
                        Fetching latest inventory snapshots and calculating
                        metrics — this may take a few seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && children({ snapshotData, loading, error, dateRange })}
          </div>
        </div>
      </div>
    </div>
  );
}
