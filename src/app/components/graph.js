'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Graph() {
  const barsRef = useRef([]);
  const containerRef = useRef(null);

  const data = [
    { label: 'Jan', value: 65, color: '#0019B1' },
    { label: 'Feb', value: 82, color: '#0019B1' },
    { label: 'Mar', value: 45, color: '#0019B1' },
    { label: 'Apr', value: 91, color: '#0019B1' },
    { label: 'May', value: 73, color: '#0019B1' },
    { label: 'Jun', value: 88, color: '#0019B1' }
  ];

  useEffect(() => {
    if (containerRef.current && barsRef.current.length > 0) {
      // Animate container fade in
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      });

      // Animate bars growing from bottom
      barsRef.current.forEach((bar, index) => {
        if (bar) {
          gsap.from(bar, {
            height: 0,
            duration: 1.2,
            delay: index * 0.1,
            ease: 'elastic.out(1, 0.5)',
            onUpdate: function() {
              const progress = this.progress();
              const value = Math.round(data[index].value * progress);
              const valueLabel = bar.querySelector('.value-label');
              if (valueLabel) {
                valueLabel.textContent = value;
              }
            }
          });

          // Hover animation
          bar.addEventListener('mouseenter', () => {
            gsap.to(bar, {
              scale: 1.05,
              duration: 0.3,
              ease: 'power2.out'
            });
          });

          bar.addEventListener('mouseleave', () => {
            gsap.to(bar, {
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Sales Data</h2>
      
      <div className="flex items-end justify-between h-64 gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="relative w-full flex flex-col items-center justify-end h-full">
              {/* Value label */}
              <div className="mb-2 text-sm font-semibold text-gray-700">
                <span className="value-label">0</span>
              </div>
              
              {/* Bar */}
              <div
                ref={(el) => (barsRef.current[index] = el)}
                className="w-full rounded-t-lg cursor-pointer transition-all"
                style={{
                  height: `${item.value}%`,
                  backgroundColor: item.color,
                  transformOrigin: 'bottom'
                }}
              />
            </div>
            
            {/* Label */}
            <div className="mt-3 text-sm font-medium text-gray-600">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
