"use client";
import MetricCard from "../MetricCard";
import Sidebar from "../../components/sidebar/Sidebar";
import DotField from "@/components/DotField";
import { useState, useCallback } from "react";

export default function MetricCardPage() {
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshComponents = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="overflow-hidden h-screen">
      <Sidebar onHoverChange={setSidebarHovered} />
      <div className="h-screen bg-[#001fb0] p-5 pt-0">
        <div className="relative landing-sdw overflow-x-hidden bg-zinc-50 overflow-y-auto font-sans rounded-t-4xl snap-y snap-mandatory scroll-smooth">
          <div className="absolute inset-0.5 z-0 opacity-70">
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

          <div
            className={`relative h-screen w-full shrink-0 flex items-center justify-center`}
          >
            <MetricCard key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
