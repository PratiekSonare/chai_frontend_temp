export default function quickLinks() {
    return (
        <div className='z-11 oswald flex flex-row items-center justify-center gap-10 w-full'>
            <div className='text-gray-500'>QUICK LINKS</div>
            <div className='flex flex-row gap-3 w-2/3'>
                <button className='p-2 w-full rounded-lg! bg-blue-100 border border-blue-600 text-blue-600 text-center'>
                    ORDERS
                </button>
                <button className='p-2 w-full rounded-lg! bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 text-center'>
                    INVENTORY
                </button>
                <button className='p-2 w-full rounded-lg! bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 text-center'>
                    RTO
                </button>
                <button className='p-2 w-full rounded-lg! bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 text-center'>
                    DISTRIBUTORS
                </button>
                <button className='p-2 w-full rounded-lg! bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 text-center'>
                    CATALOGUE
                </button>
                <button className='p-2 w-full rounded-lg! bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 text-center'>
                    COMING SOON...
                </button>
            </div>
        </div>
    )
}