'use client';

import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const RevenueLineChart = ({ searchData, isSuccess }) => {
    const [chartData, setChartData] = useState(null);
    const [chartLoading, setChartLoading] = useState(false);
    const [currentDataset, setCurrentDataset] = useState('revenue'); // 'revenue' or 'aov'
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const intervalRef = useRef(null);
    const debounceTimeoutRef = useRef(null);

    // Fetch chart data when search data is available (with debouncing)
    useEffect(() => {
        const fetchChartData = async () => {
            if (isSuccess && searchData && searchData.data && searchData.data.length > 0 && searchData.query_type === "standard") {
                setChartLoading(true);
                try {
                    const response = await fetch('http://localhost:5000/revenue/chart/line', {
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
                        console.log('Revenue chart data fetched:', chartResponse);
                    } else {
                        console.error('Failed to fetch revenue chart data:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching revenue chart data:', error);
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

    // Start dataset alternation timer when chart data is available
    useEffect(() => {
        if (chartData && chartData.success && chartData.datasets) {
            // Clear existing interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            // Start alternating between datasets every 2 seconds
            intervalRef.current = setInterval(() => {
                setCurrentDataset(prev =>
                    prev === 'revenue' ? 'aov' : 'revenue'
                );
            }, 4000);
        }

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [chartData]);

    // Create/update chart when chart data or current dataset changes
    useEffect(() => {
        if (chartData && chartData.success && chartData.datasets && chartRef.current) {
            // Destroy existing chart if it exists
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            // Get current dataset data
            const currentData = chartData.datasets[currentDataset];
            const isRevenue = currentDataset === 'revenue';

            // Register the datalabels plugin
            Chart.register(ChartDataLabels);

            // Create new chart
            chartInstanceRef.current = new Chart(chartRef.current, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        data: currentData,
                        borderColor: 'rgba(67, 160, 71, 1)',
                        backgroundColor: 'rgba(67, 160, 71, 0.1)',
                        borderWidth: 1,
                        fill: false,
                        tension: 0.5,
                        pointBackgroundColor: 'rgba(67, 160, 71, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 1,
                        pointRadius: 3,
                        pointHoverRadius: 8,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 50,
                            bottom: 20,
                            left:  50,
                            right: 50
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: false,
                            text: isRevenue ? 'Revenue by ' + (chartData.chart_type === 'daily' ? 'Day' : chartData.chart_type === 'weekly' ? 'Week' : 'Month') :
                                'AOV by ' + (chartData.chart_type === 'daily' ? 'Day' : chartData.chart_type === 'weekly' ? 'Week' : 'Month'),
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: 'Poppins'
                            },
                            color: 'rgba(67, 160, 71, 1)'
                        },
                        datalabels: {
                            display: true,
                            anchor: 'end',
                            align: 'top',
                            formatter: function (value) {
                                return isRevenue ? `₹${value.toLocaleString('en-IN')}` : `₹${value.toFixed(0)}`;
                            },
                            font: {
                                size: 10,
                                weight: 'bold',
                                family: 'Poppins'
                            },
                            color: 'rgba(67, 160, 71, 1)',
                            offset: 4
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: false,
                            },
                            ticks: {
                                display: false
                            },
                            grid: {
                                display: false
                            },
                            border: {
                                display: false
                            }
                        },
                        x: {
                            title: {
                                display: false,
                                text: chartData.chart_type === 'daily' ? 'Day of Week' :
                                    chartData.chart_type === 'weekly' ? 'Week Range' : 'Month'
                            },
                            ticks: {
                                display: false
                            },
                            grid: {
                                display: false
                            },
                            border: {
                                display: false
                            }
                        }
                    },
                    animation: {
                        duration: 500,
                        easing: 'easeOutQuart'
                    }
                },
                plugins: [{
                    id: 'customDataPoints',
                    afterDraw: function (chart) {
                        const ctx = chart.ctx;
                        chart.data.datasets.forEach(function (dataset, i) {
                            const meta = chart.getDatasetMeta(i);
                            meta.data.forEach(function (point, index) {
                                // Draw x-axis label below the point
                                const label = chart.data.labels[index];
                                ctx.fillStyle = 'rgba(67, 160, 71, 1)';
                                ctx.font = 'bold 10px Poppins';
                                ctx.textAlign = 'center';
                                ctx.fillText(label, point.x, point.y + 20);
                            });
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
    }, [chartData, currentDataset]);

    if (chartLoading) {
        return (
            <div className="w-full mx-auto my-8 p-6 bg-transparent">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading chart...</p>
                </div>
            </div>
        );
    }

    if (!chartData) {
        return null;
    }

    return (
        <div className="relative group bg-transparent w-full h-42">
            {currentDataset === "revenue" ? (
                <span className='absolute animate-pulse top-2 left-2 font-bold poppins text-gray-400'>Total Revenue</span>
            ) : (
                <span className='absolute animate-pulse top-2 left-2 font-bold poppins text-gray-400'>Average Order Value</span>
            )}
            <canvas ref={chartRef} className='w-full h-full' style={{ backgroundColor: 'transparent' }}></canvas>
        </div>
    );
};

export default RevenueLineChart;
