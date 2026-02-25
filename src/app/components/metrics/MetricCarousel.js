import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import MetricGrid from "./MetricGrid";

export default function MetricCarousel({ metrics }) {

    const volume = metrics?.metrics.volume_metrics;
    const time_based = metrics?.metrics.time_based_metrics;
    const revenue = metrics?.metrics.revenue_metrics;
    const product = metrics?.metrics.product_metrics;
    const payment = metrics?.metrics.payment_metrics;
    const geographic = metrics?.metrics.geographic_metrics;
    const cancellation = metrics?.metrics.cancellation_metrics;

    return (
        <Carousel
            opts={{
                align: "start",
                loop: "true",
            }}
            plugins={[
                Autoplay({
                    delay: 2000,
                    stopOnMouseEnter: true,
                }),
            ]}
            className="w-full max-x-6xl h-1/4"
        >
            <CarouselContent className="h-full!">
                {/* Volume Metrics */}
                <CarouselItem className="basis-1/2">
                    <MetricGrid
                        cN="bg-[#001FB0]"
                        textCn="text-[#001FB0]"
                        header="VOLUME"
                        data={[volume?.total_orders, volume?.total_skus_sold, volume?.net_skus_sold, volume?.unique_skus_ordered]}
                        titles={
                            [
                                { title: "Total Orders", desc: "The count of total orders given in this time period." },
                                { title: "Total SKUs Ordered", desc: "Number of pairs ordered within this time period." },
                                { title: "Net SKUs Ordered", desc: "Total SKUs Ordered, post or due cancellation." },
                                { title: "Unique SKUs", desc: "Count of unique SKUs ordered within this time frame." }
                            ]
                        }
                    />
                </CarouselItem>

                {/* Revenue Metrics */}
                <CarouselItem className="basis-1/2">
                    <MetricGrid
                        cN="bg-green-600"
                        textCn="text-green-600"
                        header="REVENUE"
                        data={[revenue?.gross_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 }), revenue?.gross_margin?.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 }), revenue?.aov?.toFixed(2), revenue?.asp?.toFixed(2)]}
                        titles={[
                            { title: "Gross Revenue", desc: "Total revenue generated from all orders." },
                            { title: "Gross Margin", desc: "Profit margin as a percentage of revenue." },
                            { title: "AOV", desc: "Average Order Value across all orders." },
                            { title: "ASP", desc: "Average Selling Price per unit." }
                        ]} />
                </CarouselItem>

                {/* Payment Metrics */}
                <CarouselItem className="basis-1/2">
                    <MetricGrid
                        cN="bg-purple-600"
                        textCn="text-purple-600"
                        header="PAYMENT"
                        data={[payment?.cod_vs_prepaid?.cod_orders, payment?.cod_vs_prepaid?.prepaid_orders, `${payment?.cod_vs_prepaid?.cod_percentage?.toFixed(1)}%`, `${payment?.cod_vs_prepaid?.prepaid_percentage?.toFixed(1)}%`]}
                        titles={[
                            { title: "COD Orders", desc: "Number of orders paid Cash on Delivery." },
                            { title: "Prepaid Orders", desc: "Number of orders paid in advance." },
                            { title: "COD %", desc: "Percentage of total orders that are COD." },
                            { title: "Prepaid %", desc: "Percentage of total orders that are prepaid." }
                        ]} />
                </CarouselItem>

                {/* Cancellation Metrics */}
                <CarouselItem className="basis-1/2">
                    <MetricGrid
                        cN="bg-red-600"
                        textCn="text-red-600"
                        header="CANCELLATION"
                        data={[`${cancellation?.rto_rate?.toFixed(2)}%`, `${cancellation?.cancellation_rate?.toFixed(2)}%`, cancellation?.cancelled_orders, cancellation?.rto_orders]}
                        titles={[
                            { title: "RTO Rate", desc: "Percentage of orders returned to origin." },
                            { title: "Cancel Rate", desc: "Percentage of orders that were cancelled." },
                            { title: "Cancelled", desc: "Total number of cancelled orders." },
                            { title: "RTO Orders", desc: "Total number of return to origin orders." }
                        ]} />
                </CarouselItem>

                {/* Time-based Metrics */}
                <CarouselItem className="basis-1/2">
                    <MetricGrid
                        cN="bg-orange-600"
                        textCn="text-orange-600"
                        header="TIME BASED"
                        data={[`${time_based?.avg_inventory_assignment_time_hours?.toFixed(2)}h`, `${time_based?.avg_qc_time_hours?.toFixed(2)}h`, `${time_based?.avg_order_processing_time_hours?.toFixed(2)}h`, Object.keys(time_based?.day_wise_frequency || {}).length]}
                        titles={[
                            { title: "Avg Inventory", desc: "Average time to assign inventory in hours." },
                            { title: "Avg QC Time", desc: "Average quality control time in hours." },
                            { title: "Avg Processing", desc: "Average order processing time in hours." },
                            { title: "Active Days", desc: "Number of days with order activity." }
                        ]} />
                </CarouselItem>

                {/* Geographic Metrics */}
                <CarouselItem className="basis-1/2">
                    <MetricGrid
                        cN="bg-teal-600"
                        textCn="text-teal-600"
                        header="GEOGRAPHIC"
                        data={[
                            geographic?.state_wise_order_count && Object.entries(geographic.state_wise_order_count).sort(([, a], [, b]) => b - a)[0]?.[1] || 0,
                            geographic?.state_wise_order_count && Object.entries(geographic.state_wise_order_count).sort(([, a], [, b]) => b - a)[1]?.[1] || 0,
                            geographic?.state_wise_order_count && Object.entries(geographic.state_wise_order_count).sort(([, a], [, b]) => b - a)[2]?.[1] || 0,
                            geographic?.state_wise_order_count && Object.entries(geographic.state_wise_order_count).sort(([, a], [, b]) => b - a)[3]?.[1] || 0
                        ]}
                        titles={[
                            { title: geographic?.state_wise_order_count && Object.entries(geographic.state_wise_order_count).sort(([, a], [, b]) => b - a)[0]?.[0] || "State 1", desc: "Orders from the top state by volume." },
                            { title: geographic?.state_wise_order_count && Object.entries(geographic.state_wise_order_count).sort(([, a], [, b]) => b - a)[1]?.[0] || "State 2", desc: "Orders from the second top state." },
                            { title: geographic?.state_wise_order_count && Object.entries(geographic.state_wise_order_count).sort(([, a], [, b]) => b - a)[2]?.[0] || "State 3", desc: "Orders from the third top state." },
                            { title: geographic?.state_wise_order_count && Object.entries(geographic.state_wise_order_count).sort(([, a], [, b]) => b - a)[3]?.[0] || "State 4", desc: "Orders from the fourth top state." }
                        ]} />
                </CarouselItem>

                {/* Product Metrics */}
                <CarouselItem className="basis-1/2">
                    <MetricGrid
                        cN="bg-indigo-600"
                        textCn="text-indigo-600"
                        header="PRODUCT"
                        data={[
                            product?.top_skus_by_quantity && Object.entries(product.top_skus_by_quantity)[0]?.[1] || 0,
                            product?.top_skus_by_quantity && Object.entries(product.top_skus_by_quantity)[1]?.[1] || 0,
                            product?.top_skus_by_revenue && Object.entries(product.top_skus_by_revenue)[0]?.[1]?.toFixed(0) || 0,
                            product?.top_skus_by_revenue && Object.entries(product.top_skus_by_revenue)[1]?.[1]?.toFixed(0) || 0
                        ]}
                        titles={[
                            { title: `Top Qty: ${product?.top_skus_by_quantity && Object.entries(product.top_skus_by_quantity)[0]?.[0]?.substring(0, 8) || 'SKU'}`, desc: "SKU with highest quantity sold." },
                            { title: `2nd Qty: ${product?.top_skus_by_quantity && Object.entries(product.top_skus_by_quantity)[1]?.[0]?.substring(0, 8) || 'SKU'}`, desc: "SKU with second highest quantity sold." },
                            { title: `Top Rev: ${product?.top_skus_by_revenue && Object.entries(product.top_skus_by_revenue)[0]?.[0]?.substring(0, 8) || 'SKU'}`, desc: "SKU generating highest revenue." },
                            { title: `2nd Rev: ${product?.top_skus_by_revenue && Object.entries(product.top_skus_by_revenue)[1]?.[0]?.substring(0, 8) || 'SKU'}`, desc: "SKU generating second highest revenue." }
                        ]} />
                </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}