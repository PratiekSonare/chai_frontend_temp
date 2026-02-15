'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function LineGraph() {
  const pathRef = useRef(null);
  const pointsRef = useRef([]);
  const containerRef = useRef(null);
  const gradientRef = useRef(null);

  const data = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 62 },
    { label: 'Mar', value: 38 },
    { label: 'Apr', value: 75 },
    { label: 'May', value: 58 },
    { label: 'Jun', value: 88 },
    { label: 'Jul', value: 92 }
  ];

  const width = 600;
  const height = 300;
  const padding = 40;
  const max = Math.max(...data.map(d => d.value));

  // Calculate points for the line
  const points = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding)) / (data.length - 1);
    const y = height - padding - ((d.value / max) * (height - 2 * padding));
    return { x, y, value: d.value, label: d.label };
  });

  // Create path data
  const linePath = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  // Create gradient area path
  const areaPath = `M ${points[0].x} ${height - padding} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${height - padding} Z`;

  useEffect(() => {
    if (containerRef.current && pathRef.current && gradientRef.current) {
      // Animate container
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      });

      // Get the total length of the path
      const pathLength = pathRef.current.getTotalLength();

      // Set up the starting position
      gsap.set(pathRef.current, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength
      });

      // Animate the line drawing
      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut',
        delay: 0.3
      });

      // Animate gradient fill
      gsap.from(gradientRef.current, {
        opacity: 0,
        duration: 1,
        delay: 1.5,
        ease: 'power2.out'
      });

      // Animate points
      pointsRef.current.forEach((point, index) => {
        if (point) {
          gsap.from(point, {
            scale: 0,
            opacity: 0,
            duration: 0.6,
            delay: 0.5 + index * 0.1,
            ease: 'back.out(1.7)'
          });

          // Add hover animation
          point.addEventListener('mouseenter', () => {
            gsap.to(point, {
              scale: 1.5,
              duration: 0.3,
              ease: 'power2.out'
            });
          });

          point.addEventListener('mouseleave', () => {
            gsap.to(point, {
              scale: 1,
              duration: 0.3,
              ease: 'power2.out'
            });
          });
        }
      });
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-3xl p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Revenue Trend</h2>
      
      <svg width="100%" height="350" viewBox={`0 0 ${width} ${height + 50}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((val, i) => {
          const y = height - padding - ((val / 100) * (height - 2 * padding));
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Gradient fill */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0019B1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0019B1" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <path
          ref={gradientRef}
          d={areaPath}
          fill="url(#lineGradient)"
        />

        {/* Line path */}
        <path
          ref={pathRef}
          d={linePath}
          fill="none"
          stroke="#0019B1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              ref={(el) => (pointsRef.current[index] = el)}
              cx={point.x}
              cy={point.y}
              r="6"
              fill="#fff"
              stroke="#0019B1"
              strokeWidth="3"
              className="cursor-pointer"
              style={{ transformOrigin: `${point.x}px ${point.y}px` }}
            />
            
            {/* Labels below */}
            <text
              x={point.x}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
              fontWeight="500"
            >
              {point.label}
            </text>

            {/* Value labels above points */}
            <text
              x={point.x}
              y={point.y - 15}
              textAnchor="middle"
              fontSize="13"
              fill="#0019B1"
              fontWeight="600"
            >
              {point.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
