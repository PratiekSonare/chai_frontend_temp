'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMachine } from '@xstate/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Down from './components/down';
import Development from './components/development';
import Active from './components/active';
import Card from './components/card';
import Searchbar from './components/searchbar';
import Graph from './components/graph';
import LineGraph from './components/linegraph';
import DataTableComponent from './components/table/DataTableComponent';
import tempResultData from './components/tempResult.json';
import QuickLinks from './components/quickLinks';
import Header from './components/header';
import { searchMachine } from '../lib/searchMachine';
import { LoadingComponent, ErrorComponent, EmptyStateComponent } from './components/StateComponents';
import { Button } from '@/components/ui/button';
import MetricCard from './components/metricCard';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {

  const placeholder_list = [
    "Compare orders between Maharashtra and Telangana from the past 3 days.",
    "Fetch orders from 1st Jan to 8th Feb of SKU 11400-255-8.",
    "What are the different payment methods available?"
  ]

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [status, setStatus] = useState("development");
  const [inputValue, setInputValue] = useState('');
  const [searchState, sendSearch] = useMachine(searchMachine);
  const [metricsData, setMetricsData] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const searchbarRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Extract search state data
  const isLoading = searchState.matches('loading');
  const isSuccess = searchState.matches('success');
  const isError = searchState.matches('failure');
  const searchData = searchState.context.data;
  const searchError = searchState.context.error;
  const searchType = searchState.context.data.query_type;

  // Debug logging for state changes and scroll to results
  useEffect(() => {
    console.log('Search state changed:', {
      state: searchState.value,
      context: searchState.context,
      isLoading,
      isSuccess,
      isError
    });

    // Scroll to search results when state changes (indicates POST request)
    if ((isLoading || isSuccess || isError) && searchResultsRef.current) {
      searchResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchState.value, isLoading, isSuccess, isError]);

  // Calculate metrics when search data is available for standard queries
  useEffect(() => {
    const calculateMetrics = async () => {
      if (isSuccess && searchData && searchData.data && searchData.data.length > 0 && searchData.query_type === "standard") {
        setMetricsLoading(true);
        try {
          const response = await fetch('http://localhost:5000/orders/metrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orders: searchData.data
            })
          });
          
          console.log("metric response: ", response);

          if (response.ok) {
            const metrics = await response.json();
            setMetricsData(metrics);
            console.log('Metrics calculated:', metrics);
          } else {
            console.error('Failed to calculate metrics:', response.statusText);
          }
        } catch (error) {
          console.error('Error calculating metrics:', error);
        } finally {
          setMetricsLoading(false);
        }
      } else {
        // Clear metrics if conditions not met
        setMetricsData(null);
      }
    };

    calculateMetrics();
  }, [isSuccess, searchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholder_list.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate searchbar on mount
    if (searchbarRef.current) {
      gsap.from(searchbarRef.current, {
        y: 125,
        opacity: 0,
        duration: 1,
        ease: "bounce"
      });

      // Scroll animation
      ScrollTrigger.create({
        trigger: searchbarRef.current,
        start: "top 20%",
        end: "top 10%",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.to(searchbarRef.current, {
            width: progress > 0 ? "93%" : "75%",
            position: progress > 0 ? "fixed" : "relative",
            top: progress > 0 ? "30px" : "auto",
            left: progress > 0 ? "7%" : "auto",
            zIndex: progress > 0 ? 1000 : "auto",
            duration: 0.05,
            ease: "circ.in",
          });
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleSearch = useCallback((inputValue) => {
    if (inputValue.trim()) {
      console.log('Search initiated with:', inputValue);
      sendSearch({ type: 'SEARCH', query: inputValue.trim() });
    }
  }, [sendSearch]);



  const summarized_query = useCallback(() => {
    if (isSuccess && searchData) {
      return searchData.summarized_query || '';
    }
    return '';
  }, [isSuccess, searchData]);

  const handleCancel = useCallback(() => {
    console.log('Search cancelled');
    sendSearch({ type: 'CANCEL' });
  }, [sendSearch]);

  const handleRetry = useCallback(() => {
    sendSearch({ type: 'RETRY' });
  }, [sendSearch]);

  const handleReset = useCallback(() => {
    sendSearch({ type: 'RESET' });
    setInputValue('');
    setMetricsData(null); // Clear metrics on reset
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sendSearch]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">

      {/* sidebar */}
      <div className="fixed left-0 top-0 w-[5.56%] h-screen flex flex-col items-start bg-[#001fb0]">
        <img className="" src="./chupps_logo.png" alt="grid" />
      </div>

      {/* main content */}
      <div className="relative ml-[5.56%] flex flex-col items-center overflow-y-auto">

        <Header />

        <div className='flex flex-col justify-center items-center h-screen w-full'>

          {status === "active" ? <Active /> : status === "development" ? <Development /> : <Down />}

          <div className='flex flex-col justify-center items-center w-full'>
            <img className="w-2/5" src="./data_portal.png" alt="grid" />
            <img className='absolute top-0 w-1/2 opacity-8' src='./grid.png'></img>
          </div>

          <div className='my-4'></div>

          {/* searchbar */}
          <Searchbar
            searchbarRef={searchbarRef}
            placeholder={placeholder_list[placeholderIndex]}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSearch={handleSearch}
          />

          <div className='my-2'></div>

          <QuickLinks />

          <div className='my-12'></div>

          <img src='./divider.png' className='w-1/6' />

        </div>


        {/* Search Results Section with State Management */}
        <div ref={searchResultsRef} className="w-full max-w-full h-screen flex justify-center items-center mx-auto px-4">
          {isLoading && <LoadingComponent onCancel={handleCancel} />}

          {isError && (
            <ErrorComponent
              error={searchError}
              onRetry={handleRetry}
              onReset={handleReset}
            />
          )}

          {isSuccess && searchType === "standard" && (
            <div className="w-full h-screen p-5">
              <div className='w-full h-1/4 flex flex-row gap-5'>
                <div className='flex flex-col justify-center items-center rounded-lg w-full h-full bg-blue-200 border-2 border-blue-300 shadow-xl'>

                </div>
                <div className='flex flex-col justify-center items-center rounded-lg w-full h-full bg-blue-200 border-2 border-blue-300 shadow-xl'>

                </div>
                <div className='flex flex-col justify-center items-center rounded-lg w-full h-full bg-blue-200 border-2 border-blue-300 shadow-xl'>

                </div>
              </div>
              <DataTableComponent data={searchData} summarized_query={summarized_query()} />
            </div>
          )}

          {isSuccess && searchData && searchData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No results found for your search.</p>
              <button
                onClick={handleReset}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Try a different search
              </button>
            </div>
          )}

          {!isLoading && !isSuccess && !isError && (
            // <EmptyStateComponent />
            // <LoadingComponent onCancel={handleCancel} />
            <ErrorComponent
              error={searchError}
              onRetry={handleRetry}
              onReset={handleReset}
            />
          )}
        </div>

        {/* GSAP Graph Example */}
        {/* <div className='flex justify-center items-center w-full my-20'>
          <Graph />
        </div> */}

        {/* GSAP Line Graph Example */}
        {/* <div className='flex justify-center items-center w-full my-20'>
          <LineGraph />
        </div> */}

        <div className='my-80'></div>
      </div>
    </div>
  );
}
