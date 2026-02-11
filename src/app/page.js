'use client';

import { useState, useEffect } from 'react';
import Down from './components/down';
import Development from './components/development';
import Active from './components/active';

export default function Home() {

  const placeholder_list = [
    "Compare orders between Maharashtra and Telangana from the past 3 days.",
    "Fetch orders from 1st Jan to 8th Feb of SKU 11400-255-8.",
    "What are the different payment methods available?"
  ]

  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholder_list.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-18 min-h-screen justify-center bg-zinc-50 font-sans">

      {/* sidebar */}
      <div className="col-span-1 flex flex-col items-start h-full bg-[#0019B1]">
        <img className="" src="./chupps_logo.png" alt="grid" />
      </div>

      {/* main content */}
      <div className="relative col-span-17 border border-black flex flex-col items-center overflow-y-auto">

        <img className="z-100 w-1/12 absolute top-5 right-2 opacity-60 hover:opacity-100 transition-all duration-100 ease-in" src="./chai_logo_sub.png" alt="grid" />

        <div className='flex flex-col justify-center items-center h-full w-full'>

          <Active />
          <Development />
          <Down />

          <div className='flex flex-col justify-center items-center w-full'>
            <img className="w-2/5" src="./data_portal.png" alt="grid" />
            <img className='absolute top-0 w-3/4 opacity-10' src='./grid.png'></img>
          </div>
  
          {/* searchbar  */}
          <div className="z-10 flex flex-row w-1/2 border border-gray-400 h-20 rounded-2xl my-10 bg-white shadow-md">
            <input className="flex-10/12 focus:outline-none ml-5 poppins text-lg transition-all duration-300 " placeholder={placeholder_list[placeholderIndex]}>
            </input>
            <button className="flex items-center justify-center text-white bg-[#0019B1] flex-auto rounded-xl scale-100 active:scale-95 transition-all duration-100">
              <svg className="p-8" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="none" fill-rule="evenodd" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" transform="translate(3 3)"> <path d="m6.5 10.5 3-3-3-3"></path> <path d="m5 3v9" transform="matrix(0 1 -1 0 12.5 2.5)"></path> <path d="m1.5 5.5v-3.0079176c0-1.10147263.89060277-1.99561512 1.99206673-1.99998427l7.95228497-.03160773c1.1045608-.00432011 2.0035361.8875515 2.0079175 1.99211231l.0398162 10.02918369c.0043323 1.1045608-.8875404 2.003535-1.9921012 2.0079309-.0026436 0-.0052873 0-.0079309 0h-7.9920533c-1.1045695 0-2-.8954305-2-2v-2.9897173"></path> </g> </g></svg>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
