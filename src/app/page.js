'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMachine } from '@xstate/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ReactMarkdown from 'react-markdown';

import Down from './components/down';
import Development from './components/development';
import Active from './components/active';
import Searchbar from './components/searchbar';
import DataTableComponent from './components/table/DataTableComponent';
import QuickLinks from './components/quickLinks';
import Header from './components/header';
import { searchMachine } from '../lib/searchMachine';
import { LoadingComponent, ErrorComponent, EmptyStateComponent } from './components/StateComponents';
import { Button } from '@/components/ui/button';
import MetricCarouselOrder from './components/metrics/MetricCarouselOrder';
import MetricCarouselComp from './components/metrics/MetricCarouselComp';

import standardState from './components/standard_state.json';
import StateMapPlotter from '@/components/StateMapPlotter';
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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

  // Extract groups data for comparison queries
  const groups = isSuccess && searchType === "comparison" && searchData?.comparison_data?.groups
    ? Object.values(searchData.comparison_data.groups)
    : [];

  const insights = isSuccess && searchType === "comparison" && searchData?.insights || "No insights generated.";
  const detailedMetrics = isSuccess && searchType === "comparison" && searchData?.detailedMetrics;

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

  // Establish SSE connection on component mount
  useEffect(() => {
    console.log('Establishing SSE connection...');
    const eventSource = new EventSource('http://localhost:5000/sse/logs');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsSSEConnected(true);
      console.log('SSE connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const logData = JSON.parse(event.data);
        // Always collect logs when viewLogs is enabled
        if (viewLogs) {
          setLogs(prevLogs => {
            const newLogs = [...prevLogs, logData];
            return newLogs.slice(-20); // Keep last 20 logs
          });
        }
      } catch (error) {
        console.error('Error parsing SSE log data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setIsSSEConnected(false);
    };

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []); // Empty dependency array - establish connection once

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

  // Generate data from comparison results or use fallback
  const data = useMemo(() => {
    if (isSuccess && searchType === "comparison" && searchData?.comparison_data) {
      const { groups, order_count } = searchData.comparison_data;
      const colors = ['#283593', '#1E88E5']; // Colors for groups A and B

      return Object.entries(groups).map(([key, groupName], index) => ({
        name: groupName.charAt(0).toUpperCase() + groupName.slice(1).toLowerCase(),
        value: order_count[key] || 0,
        color: colors[index] || '#45b7d1'
      }));
    }

    // Fallback data
    return [
      { name: 'Maharashtra', value: 3200, color: '#4ecdc4' },
      { name: 'Telangana', value: 1250, color: '#ff6b6b' },
    ];
  }, [isSuccess, searchType, searchData]);

  return (
    <div className="relative overflow-x-hidden min-h-screen bg-zinc-50 font-sans">

      <Button
        variant='outline'
        className="z-50! fixed bottom-5 right-5 rounded-full! active:scale-80 scale-100 transition-all duration-75 ease-in"
        onClick={handleRefreshComponents}
      >
        ↻
      </Button>


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
            <div className="w-full h-screen px-5 -my-20!">

              {isSuccess && !metricsLoading && (
                <MetricCarouselOrder key={`metrics-${refreshKey}`} metrics={finalMetrics} searchData={searchData} isSuccess={isSuccess} />
              )}

              <DataTableComponent
                key={`datatable-${refreshKey}`}
                data={searchData}
                summarized_query={summarized_query()}
              />
            </div>
          )}

          {isSuccess && searchType === "comparison" && (
            <div className="w-full h-screen px-5 space-y-2">

              {/* winner by volume, revenue and aov */}
              {isSuccess && !metricsLoading && (
                <MetricCarouselComp key={`metrics-${refreshKey}`} searchData={searchData} isSuccess={isSuccess} />
              )}

              <div className='flex flex-row w-full gap-4 -mt-10!'>
                {searchData.comparison_results.comparison_param === 'state' && (
                  <Carousel
                    opts={{
                      align: "start",
                      loop: "true",
                    }}
                    plugins={[
                      Autoplay({
                        delay: 3000,
                      }),
                    ]}
                    className="relative w-1/2 h-full overflow-hidden"
                  >

                    <CarouselContent className="h-fit!">

                      <CarouselItem className="basis-full">
                        <div className='relative flex items-center justify-center w-full h-full rounded-xl border-4 border-[#0024af]'>
                          <span className='absolute top-0 right-0 rounded-bl-xl px-5 py-2 bg-[#0024af] oswald text-white'>MAP</span>
                          <StateMapPlotter
                            data={data}
                            onStateClick={(name, value) => console.log(`${name}: ${value}`)}
                            width={550}
                            height={550}
                          />
                        </div>
                      </CarouselItem>

                      {searchData?.detailed_metrics && Object.entries(searchData.detailed_metrics).map(([stateName, metrics], index) => (
                        <CarouselItem key={stateName} className="basis-1/2">

                          <div className="pointer-events-auto select-none relative rounded-xl bg-gray-100 border border-green-200 w-full h-fit!">
                            <div className='flex flex-row items-center justify-between bg-[#001FB0] rounded-t-xl h-fit cursor-pointer'>
                              <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">{stateName.toUpperCase()} METRICS</span>
                              <svg className={`h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                            </div>

                            <div className="space-y-2 poppins">
                              {/* Key Metrics */}
                              <div className="grid grid-cols-3">
                                <div className="p-2 flex flex-col items-center justify-center text-center border-r-2 border-b-2 border-gray-400">
                                  <div className="text-xl font-bold text-blue-600">{metrics.count}</div>
                                  <div className="text-sm text-gray-600 poppins">ORDERS</div>
                                </div>
                                <div className="p-2 flex flex-col items-center justify-center text-center border-r-2 border-b-2 border-gray-400">
                                  <div className="text-xl font-bold text-green-600">₹{metrics.total_revenue?.toFixed(2)}</div>
                                  <div className="text-sm text-gray-600 poppins">REVENUE</div>
                                </div>
                                <div className="p-2 flex flex-col items-center justify-center text-center border-b-2 border-gray-400">
                                  <div className="text-xl font-bold text-purple-600">₹{metrics.avg_order_value?.toFixed(2)}</div>
                                  <div className="text-sm text-gray-600 poppins">AOV</div>
                                </div>
                              </div>

                              {/* Payment Distribution */}
                              <div className="px-2 border-b-2 border-gray-400">
                                <p className="oswald text-lg -mb-2">PAYMENT</p>
                                <div className="w-full h-30 flex justify-center items-center relative">
                                  <canvas
                                    ref={(el) => {
                                      if (el) {
                                        setTimeout(() => createPaymentChart(el, metrics, stateName), 100);
                                      }
                                    }}
                                    className="w-full h-full -my-3"
                                  />
                                  {/* Center label */}
                                  <div className="absolute bottom-2 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                      <div className="text-md font-bold poppins">
                                        {Object.values(metrics.payment_mode_distribution || {}).reduce((a, b) => a + b, 0)}
                                      </div>
                                      <div className="text-sm text-gray-500 poppins">TOTAL</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Order Status Distribution */}
                              <div className="p-2 border-b-2 border-gray-400">
                                <p className="oswald text-lg mb-2">ORDER STATUS</p>
                                <div className="grid grid-cols-3 text-xs">
                                  {Object.entries(metrics.order_status_distribution || {}).map(([status, count]) => (
                                    <div key={status} className="p-2 text-center">
                                      <div className="font-bold text-md">{count}</div>
                                      <div className="text-gray-600 text-sm uppercase">{status}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Top Cities */}
                              <div className="p-2 rounded-lg max-h-32 overflow-y-auto">
                                <p className="oswald text-lg mb-2">TOP CITIES</p>
                                <div className="space-y-1">
                                  {Object.entries(metrics.top_cities || {})
                                    .sort(([, a], [, b]) => b - a)
                                    .slice(0, 5)
                                    .map(([city, count]) => (
                                      <div key={city} className="flex justify-between text-sm">
                                        <span className="text-gray-700">{city}</span>
                                        <span className="font-medium">{count}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}

                    </CarouselContent>
                  </Carousel>
                )}

                <div className='z-50 flex flex-col w-1/2 h-full gap-4'>

                  <div className="pointer-events-auto select-none relative rounded-xl  border border-blue-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                    <div className='flex flex-row items-center justify-between bg-[#001FB0] rounded-t-xl h-fit cursor-pointer'>
                      <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">GROUPS</span>
                      <svg className={`h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                    </div>

                    <div className={`flex flex-row overflow-y-hidden h-full oswald`}>
                      {groups.map((group, index) => {
                        const letters = ['A', 'B'];
                        const borderClasses = [
                          'border-r-2 border-gray-400',  // top item
                          ''               // bottom item
                        ];

                        return (
                          <div key={index} className="h-full w-full flex flex-col gap-0">
                            <button className={`p-2 py-3 ${borderClasses[index]} w-full text-center flex flex-col justify-center items-center gap-2`}>
                              <div className="font-bold text-white rounded-full w-8 h-8 text-md bg-[#001FB0] flex items-center justify-center">
                                <span>{letters[index]}</span>
                              </div>
                              {typeof group === 'string' ? group.toUpperCase() : group.name?.toUpperCase() || 'UNKNOWN'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* insights */}
                  <div className="pointer-events-auto select-none relative rounded-xl  border border-blue-200 w-full h-fit!" onClick={() => setIsOpen(false)}>
                    <div className='flex flex-row items-center justify-between bg-[#001FB0] rounded-t-xl h-fit cursor-pointer'>
                      <span className="block text-md py-2 px-4 text-white rounded-t-xl oswald">INSIGHTS</span>
                      <svg className={`h-4 px-4 transition-transform duration-200 ease-in`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M19 5L12.7071 11.2929C12.3166 11.6834 11.6834 11.6834 11.2929 11.2929L5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M19 13L12.7071 19.2929C12.3166 19.6834 11.6834 19.6834 11.2929 19.2929L5 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                    </div>

                    <div className='rounded-b-xl p-1 h-96 overflow-y-scroll bg-gray-50 poppins'>
                      <ReactMarkdown
                        components={{
                          // Style bullet points
                          ul: ({ children }) => (
                            <ul className="space-y-3 list-none pl-0!">
                              {children}
                            </ul>
                          ),
                          // Style individual list items
                          li: ({ children }) => (
                            <li className="relative border-b border-gray-200 py-4">
                              <div className="flex items-start gap-3">
                                <div className="ml-5! w-2 h-2 bg-blue-600 border-2 border-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <div className=" text-sm text-gray-700 leading-relaxed poppins">
                                  {children}
                                </div>
                              </div>
                            </li>
                          ),
                          // Style bold text
                          strong: ({ children }) => (
                            <strong className="text-blue-700 font-semibold">
                              {children}
                            </strong>
                          ),
                          // Style paragraphs
                          p: ({ children }) => (
                            <span className="text-gray-600">
                              {children}
                            </span>
                          )
                        }}
                      >
                        {insights}
                      </ReactMarkdown>
                    </div>

                  </div>
                </div>
              </div>


              {/* insights + comparison card */}

              {/* in this time range */}
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
