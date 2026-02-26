'use client';

import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const OrderCountChart = ({ searchData, isSuccess }) => {
    const [chartData, setChartData] = useState(null);
    const [chartLoading, setChartLoading] = useState(false);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // Fetch chart data when search data is available
    useEffect(() => {
        const fetchChartData = async () => {
            if (isSuccess && searchData && searchData.data && searchData.data.length > 0 && searchData.query_type === "standard") {
                setChartLoading(true);
                try {
                    const response = await fetch('http://localhost:5000/orders/chart/count', {
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
                        console.log('Chart data fetched:', chartResponse);
                    } else {
                        console.error('Failed to fetch chart data:', response.statusText);
                    }
                } catch (error) {
                    console.error('Error fetching chart data:', error);
                } finally {
                    setChartLoading(false);
                }
            }
        };

        fetchChartData();
    }, [isSuccess, searchData]);

    // Create/update chart when chart data is available
    useEffect(() => {
        if (chartData && chartData.success && chartRef.current) {
            // Destroy existing chart if it exists
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            // Register the datalabels plugin
            Chart.register(ChartDataLabels);

            // Create new chart
            chartInstanceRef.current = new Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        data: chartData.data,
                        backgroundColor: 'rgba(0, 25, 177, 1)',
                        borderWidth: 1,
                        borderRadius: 8,
                        borderSkipped: false,

                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 30,
                            bottom: -20,
                            left: 10,
                            right: 10
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
                            anchor: 'center',
                            align: 'center',
                            formatter: function (value) {
                                return value;
                            },
                            font: {
                                size: 18,
                                weight: 'bold',
                                family: 'Poppins'
                            },
                            color: '#ffffff',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
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
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                },
                plugins: [{
                    id: 'customDataPoints',
                    afterDraw: function (chart) {
                        const ctx = chart.ctx;
                        chart.data.datasets.forEach(function (dataset, i) {
                            const meta = chart.getDatasetMeta(i);
                            meta.data.forEach(function (bar, index) {
                                // Draw x-axis label on top of bar
                                const label = chart.data.labels[index];
                                ctx.fillStyle = '#0019b1';
                                ctx.font = 'bold 12px Poppins';
                                ctx.textAlign = 'center';
                                ctx.fillText(label, bar.x, bar.y - 10);
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
    }, [chartData]);

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
        <div className="bg-transparent w-full h-42 min-h-32">
            <canvas ref={chartRef} style={{ backgroundColor: 'transparent' }}></canvas>
        </div>
    );
};

export default OrderCountChart;