'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMachine } from '@xstate/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Down from './components/down';
import Development from './components/development';
import Active from './components/active';
import Searchbar from './components/searchbar';
import QuickLinks from './components/quickLinks';
import Header from './components/header';
import { searchMachine } from '../lib/searchMachine';
import { LoadingComponent, ErrorComponent, EmptyStateComponent } from './components/StateComponents';
import { Button } from '@/components/ui/button';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import Standard from './components/output/standard/Standard';
import Comparison from './components/output/comparison/Comparison';
import MetricAnalysis from './components/output/metric_analysis/MetricAnalysis';
import SchemaDiscovery from './components/output/schema_discovery/SchemaDiscovery';

import standardState from './components/sample_results/metric_analysis_response.json';

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
  // const [searchState, sendSearch] = useMachine(searchMachine);
  const [searchState, setSearchState] = useState(standardState);
  const chartInstancesRef = useRef({});

  // Create a sendSearch function that mimics XState machine behavior for debugging
  const sendSearch = useCallback((action) => {
    console.log('Debug sendSearch action:', action);

    // Handle different action types for debugging
    switch (action.type) {
      case 'SEARCH':
        setSearchState(prev => ({ ...prev, state: 'loading', context: { ...prev.context, query: action.query } }));
        // For debugging, immediately set to success state
        setTimeout(() => {
          setSearchState(standardState);
        }, 1000);
        break;
      case 'SET_METRICS':
        setSearchState(prev => ({ ...prev, context: { ...prev.context, metrics: action.metrics } }));
        break;
      case 'CANCEL':
        setSearchState(prev => ({ ...prev, state: 'idle' }));
        break;
      case 'RETRY':
        setSearchState(prev => ({ ...prev, state: 'loading' }));
        setTimeout(() => setSearchState(standardState), 1000);
        break;
      case 'RESET':
        setSearchState({ state: 'idle', context: {}, isLoading: false, isSuccess: false, isError: false });
        break;
      default:
        console.log('Unknown action type:', action.type);
    }
  }, []);

  const [metricsLoading, setMetricsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const searchbarRef = useRef(null);
  const searchResultsRef = useRef(null);

  // SSE connection state
  const [logs, setLogs] = useState([]);
  const [isSSEConnected, setIsSSEConnected] = useState(false);
  const [viewLogs, setViewLogs] = useState(true); // Enable logs by default
  const eventSourceRef = useRef(null);

  // Extract search state data
  // const isLoading = searchState.matches('loading');
  // const isSuccess = searchState.matches('success');
  // const isError = searchState.matches('failure');

  const isLoading = searchState.state === 'loading' || searchState.isLoading;
  const isSuccess = searchState.state === 'success' || searchState.isSuccess;
  const isError = searchState.state === 'failure' || searchState.isError;

  const searchData = searchState.context?.data;
  const searchError = searchState.context?.error;
  const searchType = searchData?.query_type;
  const finalMetrics = searchState.context?.metrics || searchState.context?.data;
  const comparisonFilter = isSuccess && searchType === "comparison" && searchData?.comparison_data?.comparison_param;
  const comparisonType = isSuccess && searchType === "comparison" && searchData?.comparison_data?.comparison_type;
  const detailedMetrics = isSuccess && searchType === "comparison" && searchData?.detailed_metrics;
  const metric_analysis = isSuccess && searchType === "metric_analysis" && searchData?.analysis;
  const metric_calculated = isSuccess && searchType === "metric_analysis" && searchData?.metrics;
  const field_info = isSuccess && searchType === "schema_discovery" && searchData?.data?.field_info; //object with param details



  // Debug logging for state changes and scroll to results
  useEffect(() => {
    console.log('Search state changed:', {
      state: searchState.state,
      context: searchState.context,
      isLoading,
      isSuccess,
      isError
    });

    // Scroll to search results when state changes (indicates POST request)
    if ((isLoading || isSuccess || isError) && searchResultsRef.current && !metricsLoading) {
      searchResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchState.state, isLoading, isSuccess, isError]);

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

          // console.log("metric response: ", response);

          if (response.ok) {
            const metrics = await response.json();

            // Add metrics to searchState.context.metrics
            sendSearch({ type: 'SET_METRICS', metrics });
            console.log('Metrics calculated:', metrics);
          } else {
            console.error('Failed to calculate metrics:', response.statusText);
          }
        } catch (error) {
          console.error('Error calculating metrics:', error);
        } finally {
          setMetricsLoading(false);
        }
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

  // // Establish SSE connection on component mount
  // useEffect(() => {
  //   console.log('Establishing SSE connection...');
  //   const eventSource = new EventSource('http://localhost:5000/sse/logs');
  //   eventSourceRef.current = eventSource;

  //   eventSource.onopen = () => {
  //     setIsSSEConnected(true);
  //     console.log('SSE connected');
  //   };

  //   eventSource.onmessage = (event) => {
  //     try {
  //       const logData = JSON.parse(event.data);
  //       // Always collect logs when viewLogs is enabled
  //       if (viewLogs) {
  //         setLogs(prevLogs => {
  //           const newLogs = [...prevLogs, logData];
  //           return newLogs.slice(-20); // Keep last 20 logs
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Error parsing SSE log data:', error);
  //     }
  //   };

  //   eventSource.onerror = (error) => {
  //     console.error('SSE error:', error);
  //     setIsSSEConnected(false);
  //   };

  //   return () => {
  //     if (eventSource) {
  //       eventSource.close();
  //     }
  //   };
  // }, []); // Empty dependency array - establish connection once

  // Clear logs when viewLogs is turned off
  useEffect(() => {
    if (!viewLogs) {
      setLogs([]);
    }
  }, [viewLogs]);

  // Update logs display when viewLogs changes
  useEffect(() => {
    if (viewLogs && logs.length === 0) {
      // If turning on logs and we have no logs, we might want to fetch recent logs
      // For now, just ensure the connection is active
      console.log('View logs enabled, SSE should be receiving logs');
    }
  }, [viewLogs, logs.length]);

  const handleSearch = useCallback((inputValue) => {
    if (inputValue.trim()) {
      console.log('Search initiated with:', inputValue);
      sendSearch({ type: 'SEARCH', query: inputValue.trim() });
    }
  }, [sendSearch]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sendSearch]);

  const handleRefreshComponents = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Create payment doughnut chart
  const createPaymentChart = useCallback((canvasRef, metrics, stateName) => {
    if (!canvasRef || !metrics?.payment_mode_distribution) return;

    // Destroy existing chart for this state
    if (chartInstancesRef.current[stateName]) {
      chartInstancesRef.current[stateName].destroy();
    }

    Chart.register(ChartDataLabels);

    const paymentData = metrics.payment_mode_distribution;
    const totalPayments = Object.values(paymentData).reduce((a, b) => a + b, 0);

    chartInstancesRef.current[stateName] = new Chart(canvasRef, {
      type: 'doughnut',
      data: {
        labels: Object.keys(paymentData),
        datasets: [{
          data: Object.values(paymentData),
          backgroundColor: [
            '#0024af',  // COD - Blue-600
            '#2387e4',   // PrePaid - Blue-600 lighter
            'rgba(37, 99, 235, 0.4)', // Online - Blue-600 lighter
            'rgba(37, 99, 235, 0.2)', // Others - Blue-600 lightest
          ],
          borderColor: [
            'rgba(29, 78, 216, 1)',  // Blue-700
            'rgba(30, 64, 175, 1)',  // Blue-800
            'rgba(30, 58, 138, 1)',  // Blue-900
            'rgba(37, 99, 235, 1)',  // Blue-600
          ],
          borderWidth: 1,
          rotation: -90,
          circumference: 180,
          hoverOffset: 15,

        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const percentage = totalPayments > 0 ? ((context.parsed / totalPayments) * 100).toFixed(1) : 0;
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          },
          datalabels: {
            display: true,
            formatter: function (value, context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${percentage}%`;
            },
            font: {
              size: 10,
              weight: 'bold',
              family: 'Poppins'
            },
            color: '#fff',
            anchor: 'center',
            align: 'center'
          }
        },
        animation: {
          animateRotate: true,
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }, []);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      Object.values(chartInstancesRef.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, []);

  return (
    <div className="relative overflow-x-hidden min-h-screen bg-zinc-50 font-sans">

      <div className='flex flex-row gap-2 z-50! fixed bottom-5 right-5'>
        <Button
          variant='outline'
          className="rounded-full! active:scale-80 scale-100 transition-all duration-75 ease-in"
          onClick={handleRefreshComponents}
        >
          ↻
        </Button>
  
        <Button
          variant='outline'
          className="rounded-full! active:scale-80 scale-100 transition-all duration-75 ease-in"
          onClick={handleRefreshComponents}
        >
          ⎙
        </Button>
      </div>

      {/* sidebar */}
      <div className="fixed left-0 top-0 w-[5.56%] h-screen flex flex-col items-start bg-[#001fb0]">
        <img className="" src="./chupps_logo.png" alt="grid" />
      </div>

      {/* main content */}
      <div className="relative ml-[5.56%] flex flex-col items-center overflow-y-scroll">

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
            isError={isError}
          />

          <div className='my-2'></div>

          <QuickLinks />

          <div className='my-12'></div>

          <img src='./divider.png' className='w-1/6' />

        </div>


        {/* Search Results Section with State Management */}
        <div ref={searchResultsRef} className="w-full max-w-full h-screen flex justify-center items-center mx-auto px-4">
          {isLoading && (
            <LoadingComponent
              onCancel={handleCancel}
              requestId={searchState.context.query}
              logs={logs}
              isConnected={isSSEConnected}
              viewLogs={viewLogs}
              setViewLogs={setViewLogs}
            />
          )}

          {isError && (
            <ErrorComponent
              error={searchError}
              onRetry={handleRetry}
              onReset={handleReset}
            />
          )}

          {isSuccess && searchType === "standard" && (
            <Standard isSuccess={isSuccess} searchData={searchData} finalMetrics={finalMetrics} metricsLoading={metricsLoading} refreshKey={refreshKey} />
          )}

          {isSuccess && searchType === "comparison" && (
            <Comparison createPaymentChart={createPaymentChart} isSuccess={isSuccess} searchData={searchData} searchType={searchType} comparisonType={comparisonType} searchFilter={comparisonFilter} detailedMetrics={detailedMetrics} refreshKey={refreshKey} />
          )}

          {isSuccess && searchType === "metric_analysis" && (
            <MetricAnalysis metric_analysis={metric_analysis} metric_calculated={metric_calculated} />
          )}

          {isSuccess && searchType === "schema_discovery" && (
            <SchemaDiscovery metric_analysis={metric_analysis} metric_calculated={metric_calculated} />
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
            <>
              <EmptyStateComponent />
              {/* <LoadingComponent onCancel={handleCancel} />
              <ErrorComponent
                error={searchError}
                onRetry={handleRetry}
                onReset={handleReset}
              /> */}
            </>
          )}
        </div>

        {/* <OrderCountChart searchData={searchData} isSuccess={isSuccess} /> */}

        {/* GSAP Line Graph Example */}
        {/* <div className='flex justify-center items-center w-full my-20'>
          <LineGraph />
        </div> */}

        <div className=''></div>
      </div >
    </div >
  );
}
