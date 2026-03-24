// Compare SKUs
// Provide two options

export default function ComparisonCard() {
    return (
        <div className="poppins w-[90%] h-screen">
            <div className="flex flex-col gap-10 items-start justify-center w-full h-full">
                <div className="flex flex-col items-start text-left">
                    <span className="poppins font-extrabold text-3xl">Compare SKUs</span>
                    <span className="poppins text-lg text-gray-500">Select any two SKUs for order performance comparison and check which SKUs are trendy!</span>
                </div>
                <div className="flex flex-row w-full h-2/3 justify-center items-center gap-5">
                    <div className="w-full h-full flex flex-col gap-5 group items-center justify-center rounded-xl border border-dashed border-gray-600 text-gray-600 bg-gray-50 hover:bg-gray-300 opacity-50 hover:opacity-100 transition-opacity duration-100 ease-in-out">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 9.00195C19.175 9.01406 20.3529 9.11051 21.1213 9.8789C22 10.7576 22 12.1718 22 15.0002V16.0002C22 18.8286 22 20.2429 21.1213 21.1215C20.2426 22.0002 18.8284 22.0002 16 22.0002H8C5.17157 22.0002 3.75736 22.0002 2.87868 21.1215C2 20.2429 2 18.8286 2 16.0002L2 15.0002C2 12.1718 2 10.7576 2.87868 9.87889C3.64706 9.11051 4.82497 9.01406 7 9.00195" stroke="#757575" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M12 15L12 2M12 2L15 5.5M12 2L9 5.5" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                        <span className="text-xl">Add a SKU</span>
                    </div>
                    <div className="w-full h-full flex flex-col gap-5 group items-center justify-center rounded-xl border border-dashed border-gray-600 text-gray-600 bg-gray-50 hover:bg-gray-300 opacity-50 hover:opacity-100 transition-opacity duration-100 ease-in-out">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 9.00195C19.175 9.01406 20.3529 9.11051 21.1213 9.8789C22 10.7576 22 12.1718 22 15.0002V16.0002C22 18.8286 22 20.2429 21.1213 21.1215C20.2426 22.0002 18.8284 22.0002 16 22.0002H8C5.17157 22.0002 3.75736 22.0002 2.87868 21.1215C2 20.2429 2 18.8286 2 16.0002L2 15.0002C2 12.1718 2 10.7576 2.87868 9.87889C3.64706 9.11051 4.82497 9.01406 7 9.00195" stroke="#757575" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M12 15L12 2M12 2L15 5.5M12 2L9 5.5" stroke="#757575" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                        <span className="text-xl">Add a SKU</span>
                    </div>
                </div>
            </div>
        </div>
    )
} 