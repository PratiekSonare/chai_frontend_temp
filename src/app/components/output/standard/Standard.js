import MetricCarouselOrder from './MetricCarouselOrder';
import DataTableComponent from '../../table/DataTableComponent';
import { useCallback } from 'react';

export default function Standard({isSuccess, searchData, finalMetrics, metricsLoading, refreshKey, summarizedQuery}) {
    
    const summarized_query = useCallback(() => {
        return summarizedQuery || '';
    }, [summarizedQuery]);

    const tableData = {
        query_type: "standard",
        data: searchData || [],
        summarized_query: summarizedQuery
    };

    return (
        <div className="w-full h-screen p-5 -my-20!">

            {isSuccess && !metricsLoading && (
                <MetricCarouselOrder key={`metrics-${refreshKey}`} metrics={finalMetrics} searchData={searchData} isSuccess={isSuccess} />
            )}

            <DataTableComponent
                key={`datatable-${refreshKey}`}
                data={tableData}
                summarized_query={summarized_query()}
            />
        </div>
    )
}