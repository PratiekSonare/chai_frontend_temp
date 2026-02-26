'use client';

import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const PaymentRadialChart = ({ searchData, isSuccess }) => {
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

        fetchChartData();
    }, [isSuccess, searchData]);

    // Create/update chart when chart data changes
    useEffect(() => {
        if (chartData && chartData.success && chartData.data && chartRef.current) {
            // Destroy existing chart if it exists
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            // Calculate total orders for percentage calculation
            const totalOrders = chartData.data.cod + chartData.data.prepaid;
            const codPercentage = totalOrders > 0 ? ((chartData.data.cod / totalOrders) * 100).toFixed(1) : 0;
            const prepaidPercentage = totalOrders > 0 ? ((chartData.data.prepaid / totalOrders) * 100).toFixed(1) : 0;

            // Register the datalabels plugin
            Chart.register(ChartDataLabels);

            // Create new chart
            chartInstanceRef.current = new Chart(chartRef.current, {
                type: 'pie',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        data: [chartData.data.cod, chartData.data.prepaid],
                        backgroundColor: [
                            'rgba(138, 43, 226, 0.7)',  // COD - Dark Purple
                            'rgba(186, 85, 211, 0.7)'   // Prepaid - Medium Orchid
                        ],
                        borderColor: [
                            'rgba(138, 43, 226, 1)',
                            'rgba(186, 85, 211, 1)'
                        ],
                        borderWidth: 2,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            top: 50,
                            bottom: 20,
                            left: 20,
                            right: 20
                        }
                    },
                    plugins: {
                        legend: {
                            display: false,
                            position: 'bottom',
                            labels: {
                                color: 'rgba(75, 85, 99, 1)',
                                font: {
                                    size: 12,
                                    weight: 'bold',
                                    family: 'Poppins'
                                },
                                generateLabels: function (chart) {
                                    const data = chart.data;
                                    return data.labels.map((label, index) => ({
                                        text: `${label}: ${data.datasets[0].data[index]} orders`,
                                        fillStyle: data.datasets[0].backgroundColor[index],
                                        strokeStyle: data.datasets[0].borderColor[index],
                                        lineWidth: data.datasets[0].borderWidth,
                                        hidden: false,
                                        index: index
                                    }));
                                }
                            }
                        },
                        title: {
                            display: false,
                            text: 'Payment Mode Distribution',
                            font: {
                                size: 16,
                                weight: 'bold',
                                family: 'Poppins'
                            },
                            color: 'rgba(75, 85, 99, 1)',
                            padding: {
                                top: 10,
                                bottom: 20
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
        <div className="relative group bg-transparent w-full h-42">
            <span className='absolute group-hover:translate-y-0 -translate-y-100 transition-all duration-200 ease-in-out top-2 left-2 font-bold poppins text-gray-400'>
                Payment Distribution
            </span>
            <canvas ref={chartRef} className='w-full h-full' style={{ backgroundColor: 'transparent' }}></canvas>
        </div>
    );
};

export default PaymentRadialChart;
