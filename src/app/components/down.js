export default function down() {
    return (
        <div className='animate-pulse bg-red-200 border-2 border-red-600 rounded-2xl h-fit flex flex-row justify-center items-center'>
            <span className='text-red-600 text-xs p-2'><span className='text-md mx-1'>✦</span> CURRENT STATUS: <span className='font-bold'>DOWNTIME</span></span>
        </div>
    )
}