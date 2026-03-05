'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with D3
const StateMapExample = dynamic(() => import('@/components/StateMapExample'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64">Loading map...</div>
});

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <StateMapExample />
    </div>
  );
}