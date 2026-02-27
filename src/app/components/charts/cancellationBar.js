'use client';

import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const CancellationBarChart = ({ searchData, isSuccess }) => {
    const [chartData, setChartData] = useState(null);
    const [chartLoading, setChartLoading] = useState(false);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const debounceTimeoutRef = useRef(null);

    // Fetch chart data when search data is available (with debouncing)
    useEffect(() => {
        const fetchChartData = async () => {
            if (isSuccess && searchData && searchData.data && searchData.data.length > 0 && searchData.query_type === "standard") {
                setChartLoading(true);
                try {
                    const response = await fetch('http://localhost:5000/cancellation/chart/bar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            orders: searchData.data
                        })
                    });

                    if (response.ok) {
                        const chartResponse = await response.json();
                        setChartData(chartResponse);
                        console.log('Cancellation chart data fetched:', chartResponse);
                    } else {
                        console.error('Failed to fetch cancellation chart data:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching cancellation chart data:', error);
                } finally {
                    setChartLoading(false);
                }
            }
        };

        // Debounce API call to minimize load
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
            fetchChartData();
        }, 500); // 500ms delay

        // Cleanup timeout on unmount
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [isSuccess, searchData]);

    // Create/update chart when chart data changes
    useEffect(() => {
        if (chartData && chartData.success && chartRef.current) {
            // Destroy existing chart if it exists
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            // Register the datalabels plugin
            Chart.register(ChartDataLabels);

            // Create new bar chart
            chartInstanceRef.current = new Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels: chartData.labels || [],
                    datasets: [
                        {
                            label: 'Cancelled',
                            data: chartData.datasets?.cancelled || [],
                            borderWidth: 1,
                            borderRadius: 3,
                            backgroundColor: 'rgb(229, 57, 53, 0.7)',
                            borderColor: 'rgb(229, 57, 53, 1)',
                        },
                        {
                            label: 'Returned',
                            data: chartData.datasets?.returned || [],
                            borderWidth: 1,
                            borderRadius: 3,
                            backgroundColor: 'rgb(255, 82, 82, 0.7)',
                            borderColor: 'rgb(255, 82, 82, 1)',
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 40,
                            bottom: -20,
                            left: 20,
                            right: 20
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            grid: {
                                display: false
                            },
                            ticks: {
                                display: false,
                                color: 'rgba(75, 85, 99, 1)',
                                font: {
                                    size: 14,
                                    weight: 'bold',
                                    family: 'Poppins'
                                },
                                maxRotation: 45
                            }
                        },
                        y: {
                            display: false,
                            beginAtZero: true,
                            grid: {
                                display: false,
                            },
                            ticks: {
                                display: false,
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false,
                            position: 'top',
                            labels: {
                                color: 'rgba(75, 85, 99, 1)',
                                font: {
                                    size: 14,
                                    weight: 'bold',
                                    family: 'Poppins'
                                },
                                padding: 15
                            }
                        },
                        title: {
                            display: false
                        },
                        datalabels: {
                            display: function (context) {
                                return context.dataset.data[context.dataIndex] > 0;
                            },
                            formatter: function (value) {
                                return value > 0 ? value : '';
                            },
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: 'Poppins'
                            },
                            color: '#fff',
                            anchor: 'center',
                            align: 'center'
                        }
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                },
                plugins: [{
                    id: 'customDataPoints',
                    afterDraw: function (chart) {
                        const ctx = chart.ctx;
                        const firstMeta = chart.getDatasetMeta(0);

                        chart.data.labels.forEach(function (label, index) {
                            let topY = chart.chartArea.bottom;
                            let xPosition = firstMeta.data[index].x;

                            // Find the topmost point among all datasets for this index
                            chart.data.datasets.forEach(function (dataset, datasetIndex) {
                                const meta = chart.getDatasetMeta(datasetIndex);
                                if (meta.data[index] && meta.data[index].y < topY) {
                                    topY = meta.data[index].y;
                                }
                            });
                            ctx.fillStyle = 'rgb(229, 57, 53, 1)';
                            ctx.font = 'bold 12px Poppins';
                            ctx.textAlign = 'center';
                            ctx.fillText(label, xPosition, topY - 5);
                        });
                    }
                }]
            });
        }

        // Cleanup function
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [chartData]);

    if (chartLoading) {
        return (
            <div className="w-full mx-auto my-8 p-6 bg-transparent">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading chart...</p>
                </div>
            </div>
        );
    }

    if (!chartData || !chartData.success) {
        return null;
    }

    const totalCancellations = chartData.totals?.cancelled + chartData.totals?.returned;

    return (
        <div className="relative group bg-transparent w-full h-42 pt-1">
            {/* <span className='absolute group-hover:translate-y-0 -translate-y-100 transition-all duration-200 ease-in-out top-2 left-2 font-bold poppins text-gray-400'>Cancelled & RTO</span> */}
            <span className='absolute animate-pulse top-2 left-2 font-bold poppins text-gray-400'>Cancelled & RTO</span>
            {totalCancellations === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-400">
                    <div className="text-center">
                        <div className="text-2xl mb-2">📈</div>
                        <p>No cancellations or returns found</p>
                    </div>
                </div>
            ) : (
                <canvas ref={chartRef} className='w-full h-full' style={{ backgroundColor: 'transparent' }}></canvas>
            )}
        </div>
    );
};

export default CancellationBarChart;
