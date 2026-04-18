"use client";
import SkuMetricsCard from './SkuMetricsCard';
import Sidebar from '../components/sidebar/Sidebar';
import { Button } from '@/components/ui/button';
import Header from '../components/header';
import { useState, useCallback } from 'react';

export default function Catalogue() {
    const [sidebarHovered, setSidebarHovered] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefreshComponents = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <div className="relative overflow-x-hidden h-screen bg-zinc-50 overflow-y-auto font-sans snap-y snap-mandatory scroll-smooth">

            <div className='flex flex-row gap-2 !z-50 fixed bottom-5 right-5'>
                <Button
                    variant='outline'
                    className="!rounded-full active:scale-80 scale-100 transition-all duration-75 ease-in"
                    onClick={handleRefreshComponents}
                >
                    ↻
                </Button>
            </div>

            <Sidebar onHoverChange={setSidebarHovered} />

            <img src='./chupps_life.png' alt='' className='mx-auto w-1/12 animate-bounce my-12' />

            <Header />
            <div className={`relative ${sidebarHovered ? 'ml-[3.56%]' : 'ml-[3%]'} transition-[margin] duration-100 ease-in h-screen w-full shrink-0 flex items-center justify-center snap-start`}>
                <SkuMetricsCard refreshKey={refreshKey} />
            </div>
        </div>
    );
}
