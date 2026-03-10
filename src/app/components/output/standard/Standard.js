
import MetricCarouselOrder from './MetricCarouselOrder';
import DataTableComponent from '../../table/DataTableComponent';

export default function Standard({isSuccess, searchData, finalMetrics, metricsLoading, refreshKey}) {
    
    const summarized_query = useCallback(() => {
        if (isSuccess && searchData) {
          return searchData.summarized_query || '';
        }
        return '';
      }, [isSuccess, searchData]);

    return (
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
    )
}