"use client";

import Sidebar from "../components/sidebar/Sidebar";
import DotField from "@/components/DotField";
import ForecastCard from "./ForecastCard";

export default function ForecastPage() {
  return (
    <div className="overflow-hidden h-screen">
      <Sidebar />
      <div className="h-screen bg-[#001fb0] p-5 pt-0">
        <div className="relative bg-zinc-50 landing-sdw overflow-x-hidden overflow-y-auto font-sans rounded-t-4xl snap-y snap-mandatory scroll-smooth">
          <div className="absolute inset-1 z-0 opacity-70">
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
            className={`relative h-screen w-full flex items-center justify-center snap-start`}
          >
            <ForecastCard />
          </div>
        </div>
      </div>
    </div>
  );
}
