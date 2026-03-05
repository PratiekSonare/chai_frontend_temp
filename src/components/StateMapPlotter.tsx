import React, { useEffect, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { geoMercator, geoPath } from 'd3-geo';

export interface StateData {
  name: string;
  value: number;
  color?: string;
}

export interface StateMapPlotterProps {
  width?: number;
  height?: number;
  data?: StateData[];
  geoJsonPath?: string;
  onStateClick?: (stateName: string, value: number) => void;
  onStateHover?: (stateName: string, value: number) => void;
  className?: string;
  strokeColor?: string;
  strokeWidth?: number;
  hoverStrokeColor?: string;
  hoverStrokeWidth?: number;
  defaultFillColor?: string;
  tooltipFormatter?: (stateName: string, value: number) => string;
  statesToShow?: string[]; // Filter to show only specific states
  autoFitToStates?: boolean; // Auto-zoom to fit selected states
  legend?: string; // Custom legend text for tooltips
}

interface GeoJSONFeature {
  type: string;
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

const StateMapPlotter: React.FC<StateMapPlotterProps> = ({
  width = 800,
  height = 600,
  data = [],
  geoJsonPath = '/in.json',
  onStateClick,
  onStateHover,
  className = '',
  strokeColor = '#fff',
  strokeWidth = 0.1,
  hoverStrokeColor = '#000',
  hoverStrokeWidth = 1.2,
  defaultFillColor = '#e5e7eb',
  tooltipFormatter,
  statesToShow,
  autoFitToStates = true,
  legend = 'Value'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a map for quick state data lookup
  const stateDataMap = new Map(data.map(item => [item.name, item]));

  // Load GeoJSON data
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(geoJsonPath);
        if (!response.ok) {
          throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
        }
        const geoJson: GeoJSONData = await response.json();
        setGeoData(geoJson);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map data');
        console.error('Error loading GeoJSON:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadGeoData();
  }, [geoJsonPath]);

  // Create and update the map
  useEffect(() => {
    if (!geoData || !svgRef.current || !tooltipRef.current) return;

    const svg = svgRef.current;
    const tooltip = tooltipRef.current;

    // Clear existing content
    select(svg).selectAll("*").remove();

    // Filter states if statesToShow is provided
    const filteredFeatures = statesToShow && statesToShow.length > 0
      ? geoData.features.filter(feature => statesToShow.includes(feature.properties.name))
      : geoData.features;

    // Create filtered GeoJSON for projection
    const filteredGeoData = {
      ...geoData,
      features: filteredFeatures
    };

    // Create projection and path - fit to filtered data if autoFitToStates is true
    const projection = geoMercator().fitSize(
      [width, height], 
      autoFitToStates && filteredFeatures.length < geoData.features.length 
        ? filteredGeoData 
        : geoData
    );
    const path = geoPath().projection(projection);

    // Set up the SVG
    const map = select(svg)
      .attr("width", width)
      .attr("height", height);

    // Create paths for each state (using filtered features)
    map
      .selectAll("path")
      .data(filteredFeatures)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", strokeColor)
      .attr("stroke-width", strokeWidth)
      .attr("fill", (d) => {
        const stateData = stateDataMap.get(d.properties.name);
        return stateData?.color || defaultFillColor;
      })
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        const stateName = d.properties.name;
        const stateData = stateDataMap.get(stateName);
        const value = stateData?.value || 0;
        

        // Call hover callback
        if (onStateHover) {
          onStateHover(stateName, value);
        }

        // Show tooltip
        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";
        
        const tooltipContent = tooltipFormatter 
          ? tooltipFormatter(stateName, value)
          : `
            <div style="padding: 8px 12px; background: white; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); white-space: nowrap;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #333;">
                ${stateName}
              </div>
              <div style="font-size: 12px; color: #666;">
                ${legend}: <strong style="color: #333;">${value}</strong>
              </div>
            </div>
          `;
        
        tooltip.innerHTML = tooltipContent;

        // Highlight the hovered path
        select(this)
          .attr("stroke", hoverStrokeColor)
          .attr("stroke-width", hoverStrokeWidth);
      })
      .on("mousemove", function (event) {
        if (tooltip && svg) {
          const svgRect = svg.getBoundingClientRect();
          const mouseX = event.clientX - svgRect.left;
          const mouseY = event.clientY - svgRect.top;
          
          // Get tooltip dimensions
          const tooltipRect = tooltip.getBoundingClientRect();
          const tooltipWidth = tooltipRect.width || 200;
          const tooltipHeight = tooltipRect.height || 80;
          
          // Calculate position with bounds checking
          let left = mouseX + 10;
          let top = mouseY - 10;
          
          // Keep tooltip within bounds
          if (left + tooltipWidth > width) {
            left = mouseX - tooltipWidth - 10;
          }
          if (top < 0) {
            top = mouseY + 20;
          }
          if (top + tooltipHeight > height) {
            top = height - tooltipHeight - 10;
          }
          
          tooltip.style.left = left + "px";
          tooltip.style.top = top + "px";
        }
      })
      .on("mouseout", function () {
        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "0";

        // Reset path styling
        select(this)
          .attr("stroke", strokeColor)
          .attr("stroke-width", strokeWidth);
      })
      .on("click", function (event, d) {
        const stateName = d.properties.name;
        const stateData = stateDataMap.get(stateName);
        const value = stateData?.value || 0;

        if (onStateClick) {
          onStateClick(stateName, value);
        }
      });

  }, [geoData, data, width, height, strokeColor, strokeWidth, hoverStrokeColor, hoverStrokeWidth, defaultFillColor, onStateClick, onStateHover, tooltipFormatter, statesToShow, autoFitToStates]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg ref={svgRef} className="w-full h-full" />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none z-10"
        style={{
          visibility: 'hidden',
          opacity: 0,
          position: 'absolute',
          zIndex: 1000,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
    </div>
  );
};

export default StateMapPlotter;