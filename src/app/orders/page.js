"use client";
import MetricCard from './MetricCard';
import ComparisonCard from './ComparisonCard';
import DayComparisonCard from './DayComparisonCard';
import ComparisonCarousel from './ComparisonCarousel';

import Sidebar from '../components/sidebar/Sidebar';
import { Button } from '@/components/ui/button';
import Header from '../components/header';
import { useState, useCallback, useEffect } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import QueryDetails from '../components/QueryDetails';

export default function Order() {

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

                {/* <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="!rounded-full active:scale-80 scale-100 transition-all duration-75 ease-in">
                            ⎙
                        </Button>
                    </DialogTrigger>

                    <DialogContent showCloseButton={false}>
                        <DialogTitle />
                        <DialogHeader>
                            <QueryDetails />
                        </DialogHeader>
                    </DialogContent>
                </Dialog> */}

            </div>

            {/* sidebar */}
            <Sidebar onHoverChange={setSidebarHovered} />

            {/* aboslute */}
            <Header />
            <div className={`relative ${sidebarHovered ? 'ml-[3.56%]' : 'ml-[3%]'} transition-[margin] duration-100 ease-in h-screen w-full shrink-0 flex items-center justify-center snap-start`}>
                <MetricCard />
            </div>

            <img src='./chupps_life.png' className='mx-auto w-1/12 animate-bounce my-12' />

            <div className={`relative ${sidebarHovered ? 'ml-[3.56%]' : 'ml-[3%]'} transition-[margin] duration-100 ease-in h-screen w-full shrink-0 flex items-center justify-center snap-start`}>
                <ComparisonCard />
            </div>

            <img src='./chupps_life.png' className='mx-auto w-1/12 animate-bounce my-12' />
            {/* 
            <div className={`relative ${sidebarHovered ? 'ml-[3.56%]' : 'ml-[3%]'} transition-[margin] duration-100 ease-in h-screen w-full shrink-0 flex items-center justify-center snap-start`}>
                <DayComparisonCard />
            </div> */}

        </div >
    );
}