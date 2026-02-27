'use client';

import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const PaymentRadialChart = ({ searchData, isSuccess }) => {
    const [chartData, setChartData] = useState(null);
    const [chartLoading, setChartLoading] = useState(false);
    const [currentChartType, setCurrentChartType] = useState('radial'); // 'radial' or 'stacked'
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
                    const response = await fetch('http://localhost:5000/payment/chart/radial', {
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
                        console.log('Payment chart data fetched:', chartResponse);
                    } else {
                        console.error('Failed to fetch payment chart data:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching payment chart data:', error);
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

    // Chart switching effect - switch every 5 seconds
    useEffect(() => {
        if (chartData && chartData.success) {
            intervalRef.current = setInterval(() => {
                setCurrentChartType(prev => prev === 'radial' ? 'stacked' : 'radial');
            }, 4000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [chartData]);

    // Create radial chart
    const createRadialChart = () => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        // Use totals for radial chart
        const totalOrders = chartData.totals.cod + chartData.totals.prepaid;
        const codPercentage = totalOrders > 0 ? ((chartData.totals.cod / totalOrders) * 100).toFixed(1) : 0;
        const prepaidPercentage = totalOrders > 0 ? ((chartData.totals.prepaid / totalOrders) * 100).toFixed(1) : 0;

        Chart.register(ChartDataLabels);

        chartInstanceRef.current = new Chart(chartRef.current, {
            type: 'pie',
            data: {
                labels: ['COD', 'PrePaid'],
                datasets: [{
                    data: [chartData.totals.cod, chartData.totals.prepaid],
                    backgroundColor: [
                        'rgba(138, 43, 226, 0.7)',  // COD - Dark Purple
                        'rgba(186, 85, 211, 0.7)'   // Prepaid - Medium Orchid
                    ],
                    borderColor: [
                        'rgba(138, 43, 226, 1)',
                        'rgba(186, 85, 211, 1)'
                    ],
                    borderWidth: 1,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20,
                        left: 20,
                        right: 20
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    },
                    datalabels: {
                        display: true,
                        formatter: function (value, context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${percentage}%`;
                        },
                        font: {
                            size: 14,
                            weight: 'bold',
                            family: 'Poppins'
                        },
                        color: '#fff',
                        anchor: 'center',
                        align: 'center',
                        padding: 20
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    };

    // Create stacked bar chart
    const createStackedChart = () => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        Chart.register(ChartDataLabels);

        chartInstanceRef.current = new Chart(chartRef.current, {
            type: 'bar',
            data: {
                labels: chartData.labels || [],
                datasets: [
                    {
                        label: 'COD',
                        data: chartData.datasets?.cod || [],
                        backgroundColor: 'rgba(138, 43, 226, 0.7)',
                        borderColor: 'rgba(138, 43, 226, 1)',
                        borderWidth: 1,
                        borderRadius: 3,
                        stack: 'payment-stack'
                    },
                    {
                        label: 'PrePaid',
                        data: chartData.datasets?.prepaid || [],
                        backgroundColor: 'rgba(186, 85, 211, 0.7)',
                        borderColor: 'rgba(186, 85, 211, 1)',
                        borderWidth: 1,
                        borderRadius: 3,
                        stack: 'payment-stack'
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
                        stacked: true,
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
                    },
                    title: {
                        display: false
                    },
                    datalabels: {
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
                    
                    // Only process the first dataset to avoid duplicate labels
                    const firstMeta = chart.getDatasetMeta(0);
                    
                    // For each x-axis position, find the topmost bar and draw label above it
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
                        
                        // Draw x-axis label above the topmost bar
                        ctx.fillStyle = '#0019b1';
                        ctx.font = 'bold 12px Poppins';
                        ctx.textAlign = 'center';
                        ctx.fillText(label, xPosition, topY - 5);
                    });
                }
            }],
        });
    };

    // Create/update chart when chart data or chart type changes
    useEffect(() => {
        if (chartData && chartData.success && chartRef.current) {
            if (currentChartType === 'radial') {
                createRadialChart();
            } else {
                createStackedChart();
            }
        }

        // Cleanup function
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [chartData, currentChartType]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

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
        <div className="relative group bg-transparent w-full h-42 pt-2">
            <span className='absolute animate-pulse top-2 left-2 font-bold poppins text-gray-400'>
                {currentChartType === 'radial' ? 'Payment Distribution' : `Payment Trends (${chartData.chart_type || 'time-based'})`}
            </span>
            <canvas ref={chartRef} className='w-full h-full' style={{ backgroundColor: 'transparent' }}></canvas>
        </div>
    );
};

export default PaymentRadialChart;
