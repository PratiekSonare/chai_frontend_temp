'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import axios from 'axios';
import Down from './components/down';
import Development from './components/development';
import Active from './components/active';
import Card from './components/card';
import Searchbar from './components/searchbar';
import Graph from './components/graph';
import LineGraph from './components/linegraph';
import DataTableComponent from './components/table/DataTableComponent';
import tempResultData from './components/tempResult.json';
import QuickLinks from './components/quickLinks';
import Header from './components/header';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {

  const placeholder_list = [
    "Compare orders between Maharashtra and Telangana from the past 3 days.",
    "Fetch orders from 1st Jan to 8th Feb of SKU 11400-255-8.",
    "What are the different payment methods available?"
  ]

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [status, setStatus] = useState("development");
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState("");
  const searchbarRef = useRef(null);

  // Load tempResult.json data for testing
  useEffect(() => {
    setResult(tempResultData.data);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholder_list.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate searchbar on mount
    if (searchbarRef.current) {
      gsap.from(searchbarRef.current, {
        y: 125,
        opacity: 0,
        duration: 1,
        ease: "bounce"
      });

      // Scroll animation
      ScrollTrigger.create({
        trigger: searchbarRef.current,
        start: "top 20%",
        end: "top 10%",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.to(searchbarRef.current, {
            width: progress > 0 ? "93%" : "75%",
            position: progress > 0 ? "fixed" : "relative",
            top: progress > 0 ? "30px" : "auto",
            left: progress > 0 ? "7%" : "auto",
            zIndex: progress > 0 ? 1000 : "auto",
            duration: 0.05,
            ease: "circ.in"
          });
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleSearch = useCallback(async (inputValue) => {
    try {
      console.log('Search initiated with:', inputValue);
      const response = await axios.post('http://localhost:5000/query', { query: inputValue });
      console.log('Response:', response);
      console.log('Response data:', response.data);
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">

      {/* sidebar */}
      <div className="fixed left-0 top-0 w-[5.56%] h-screen flex flex-col items-start bg-[#0019B1] z-10">
        <img className="" src="./chupps_logo.png" alt="grid" />
      </div>

      {/* main content */}
      <div className="relative ml-[5.56%] flex flex-col items-center overflow-y-auto">

        <Header />

        <div className='flex flex-col justify-center items-center h-screen w-full'>

          {status === "active" ? <Active /> : status === "development" ? <Development /> : <Down />}

          <div className='flex flex-col justify-center items-center w-full'>
            <img className="w-2/5" src="./data_portal.png" alt="grid" />
            <img className='absolute top-0 w-3/4 opacity-10' src='./grid.png'></img>
          </div>

          <div className='my-3'></div>

          {/* searchbar */}
          <Searchbar
            searchbarRef={searchbarRef}
            placeholder={placeholder_list[placeholderIndex]}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSearch={handleSearch}
          />

          <div className='my-2'></div>

          <QuickLinks />
        </div>


        {/* DataTable Results Section */}
        <DataTableComponent data={result} />

        {/* GSAP Graph Example */}
        {/* <div className='flex justify-center items-center w-full my-20'>
          <Graph />
        </div> */}

        {/* GSAP Line Graph Example */}
        {/* <div className='flex justify-center items-center w-full my-20'>
          <LineGraph />
        </div> */}

        <div className='my-80'></div>
      </div>
    </div>
  );
}
