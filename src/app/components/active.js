export default function active() {
  return (
    <div className='absolute top-10 animate-[pulse_4s_ease-in-out_infinite] bg-blue-200 border-2 border-blue-600 rounded-2xl h-fit flex flex-row justify-center items-center'>
      <span className='text-blue-600 text-xs p-2'><span className='text-md mx-1'>✦</span> CURRENT STATUS: <span className='font-bold'>ACTIVE</span></span>
    </div>
  )
}