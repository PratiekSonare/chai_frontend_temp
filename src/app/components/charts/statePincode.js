export default function StatePincode({ selectedState, pincodeData, pincodeLoading, searchData, isSuccess }) {
    if (!selectedState) {
        return (
            <div className="h-42 w-full poppins flex items-center justify-center text-gray-500 text-sm">
                Click on a state above to view pincodes
            </div>
        )
    }

    if (pincodeLoading) {
        return (
            <div className="h-42 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        )
    }

    if (!pincodeData || !pincodeData.success) {
        return (
            <div className="h-42 w-full flex items-center justify-center text-red-500 text-sm">
                Failed to load pincode data
            </div>
        )
    }

    return (
        <div className="h-42 w-full overflow-y-scroll px-4 py-2">
            <p className="text-lg poppins font-bold text-teal-600">{selectedState}</p>
            <span className="text-sm text-gray-600">
                {pincodeData.pincode_count} unique pincodes
            </span>

            <div className="h-42">
                <div className="space-y-2">
                    {pincodeData.pincodes.map((pincode) => {
                        const orderCount = pincodeData.pincode_details?.[pincode]?.order_count || 0;
                        return (
                            <div key={pincode} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded border">
                                <span className="text-sm font-medium">{pincode}</span>
                                <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                                    {orderCount} orders
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}