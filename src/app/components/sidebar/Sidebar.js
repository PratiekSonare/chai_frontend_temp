"use client";
import { useState } from "react";

export default function Sidebar({ onHoverChange }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const ITEM_HEIGHT = 96;

    const buttonMap = [
        {
            "svg": <svg className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 4C18.175 4.01211 19.3529 4.10856 20.1213 4.87694C21 5.75562 21 7.16983 21 9.99826V15.9983C21 18.8267 21 20.2409 20.1213 21.1196C19.2426 21.9983 17.8284 21.9983 15 21.9983H9C6.17157 21.9983 4.75736 21.9983 3.87868 21.1196C3 20.2409 3 18.8267 3 15.9983V9.99826C3 7.16983 3 5.75562 3.87868 4.87694C4.64706 4.10856 5.82497 4.01211 8 4" stroke="#fff" strokeWidth="1.5"></path> <path d="M9 13.4L10.7143 15L15 11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M8 3.5C8 2.67157 8.67157 2 9.5 2H14.5C15.3284 2 16 2.67157 16 3.5V4.5C16 5.32843 15.3284 6 14.5 6H9.5C8.67157 6 8 5.32843 8 4.5V3.5Z" stroke="#fff" strokeWidth="1.5"></path> </g></svg>,
            "text": "ORDERS",
            "content_title": "Orders",
            "desc": "Find all order related metrics with real-time order updates from Shopify, Flipkart, Myntra, etc. here!",
            "subtitle": "Fetch and compare orders across all channels." 
        },
        {
            "svg": <svg className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> </g></svg>,
            "text": "INVENTORY",
            "content_title": "Inventory",
            "desc": "Fetch latest inventory and assortment, analyze and compare historical inventory to map trends!",
            "subtitle": "Real-time inventory across different channels." 
        },
        {
            "svg": <svg className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M7 14H16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M7 17.5H13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M22 2L17 6.99998M17 1.99998L22 6.99996" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> </g></svg>,
            "text": "RTO",
            "content_title": "Return / Cancellation",
            "desc": "Discover factors for return / cancellation; target audience and geography with highest RTO.",
            "subtitle": "Measure return & cancellation trends." 
        },
        {
            "svg": <svg className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <circle cx="9" cy="9" r="2" stroke="#fff" strokeWidth="1.5"></circle> <path d="M13 15C13 16.1046 13 17 9 17C5 17 5 16.1046 5 15C5 13.8954 6.79086 13 9 13C11.2091 13 13 13.8954 13 15Z" stroke="#fff" strokeWidth="1.5"></path> <path d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z" stroke="#fff" strokeWidth="1.5"></path> <path d="M19 12H15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M19 9H14" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M19 15H16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> </g></svg>,
            "text": "DISTRIBUTORS",
            "content_title": "Distributors",
            "desc": "(OFFLINE SALES) Analyze distributor-wise performance, trends and compare performance",
            "subtitle": "Keep your distributors happy." 
        },
        {
            "svg": <svg className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M4 6V19C4 20.6569 5.34315 22 7 22H17C18.6569 22 20 20.6569 20 19V9C20 7.34315 18.6569 6 17 6H4ZM4 6V5" stroke="#fff" strokeWidth="1.5"></path> <path d="M18 6.00002V6.75002H18.75V6.00002H18ZM15.7172 2.32614L15.6111 1.58368L15.7172 2.32614ZM4.91959 3.86865L4.81353 3.12619H4.81353L4.91959 3.86865ZM5.07107 6.75002H18V5.25002H5.07107V6.75002ZM18.75 6.00002V4.30604H17.25V6.00002H18.75ZM15.6111 1.58368L4.81353 3.12619L5.02566 4.61111L15.8232 3.0686L15.6111 1.58368ZM4.81353 3.12619C3.91638 3.25435 3.25 4.0227 3.25 4.92895H4.75C4.75 4.76917 4.86749 4.63371 5.02566 4.61111L4.81353 3.12619ZM18.75 4.30604C18.75 2.63253 17.2678 1.34701 15.6111 1.58368L15.8232 3.0686C16.5763 2.96103 17.25 3.54535 17.25 4.30604H18.75ZM5.07107 5.25002C4.89375 5.25002 4.75 5.10627 4.75 4.92895H3.25C3.25 5.9347 4.06532 6.75002 5.07107 6.75002V5.25002Z" fill="#fff"></path> <path d="M8 12H16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> <path d="M8 15.5H13.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> </g></svg>,
            "text": "CATALOGUE",
            "content_title": "Catalogue",
            "desc": "Explore all available SKUs, compare historical sales performance among different SKUs.",
            "subtitle": "Repository of all Chupps SKUs." 
        },
        {
            "svg": <svg className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.31171 10.7615C8.23007 5.58716 9.68925 3 12 3C14.3107 3 15.7699 5.58716 18.6883 10.7615L19.0519 11.4063C21.4771 15.7061 22.6897 17.856 21.5937 19.428C20.4978 21 17.7864 21 12.3637 21H11.6363C6.21356 21 3.50217 21 2.40626 19.428C1.31034 17.856 2.52291 15.7061 4.94805 11.4063L5.31171 10.7615Z" stroke="#fff" strokeWidth="1.5"></path> <path d="M12 8V13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"></path> <circle cx="12" cy="16" r="1" fill="#fff"></circle> </g></svg>,
            "text": "RISK",
            "content_title": "ORDER RISK ESTIMATION",
            "desc": "Fetch risk scores of real-time orders for address & order intention verification.",
            "subtitle": "How risky is this order?" 
        },
        {
            "svg": <svg className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M22 7L14.6203 14.3347C13.6227 15.3263 13.1238 15.822 12.5051 15.822C11.8864 15.8219 11.3876 15.326 10.3902 14.3342L10.1509 14.0962C9.15254 13.1035 8.65338 12.6071 8.03422 12.6074C7.41506 12.6076 6.91626 13.1043 5.91867 14.0977L2 18M22 7V12.5458M22 7H16.4179" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>,
            "text": "FORECAST",
            "content_title": "Forecast Analytics",
            "desc": "Fetch mid-range, short-range forecasts for orders and inventory / assortments.",
            "subtitle": "Forecast demand and supply, with ease." 
        }
    ]

    return (
        <div className='w-full h-full'>
            <div className="text-white fixed left-0 top-0 z-200  w-[4%] group hover:w-[6.56%] transition-all duration-100 ease-in h-screen flex flex-col gap-0 bg-[#001fb0]"
                onMouseEnter={() => onHoverChange?.(true)}
                onMouseLeave={() => onHoverChange?.(false)}
            >
                <div className='flex-1'><img className="" src="./chupps_logo.png" alt="grid" /></div>
                <div className="relative flex flex-col" onMouseLeave={() => setHoveredIndex(null)}>
                    <div
                        className="absolute inset-x-0 h-24 bg-[#001a8e] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
                        style={{
                            transform: `translateY(${(hoveredIndex ?? 0) * 100}%)`,
                            opacity: hoveredIndex === null ? 0 : 1,
                        }}
                    />
                    {buttonMap.map(({ svg, text }, idx) => (
                        <button
                            key={idx}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            className={`${idx === 0 ? "group-hover:border-y-2" : idx === buttonMap.length - 1 ? "group-hover:border-b-0" : "group-hover:border-b-2"} relative z-10 flex flex-col items-center justify-center gap-2 group-hover:border-[#001a8e]/80 h-24 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}
                        >
                            {svg}
                            <span className="-translate-x-100 group-hover:translate-x-0 transition-transform duration-200 ease-in text-xs tracking-wide oswald font-bold">{text}</span>
                        </button>
                    ))}
                    {hoveredIndex !== null && (
                        <div
                            className="w-96 h-96 absolute left-full bottom-0 z-300 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{
                                transform: `translateY(-${(buttonMap.length - hoveredIndex - 1) * ITEM_HEIGHT / 2}px)`,
                            }}
                        >
                            <div className="h-full w-full bg-[#001a8e] border-l-0 border-2 border-[#001a8e]/80 rounded-r-xl">
                                <div className="flex flex-col items-start justify-center h-full w-full poppins py-4">
                                    <span className="px-4 text-xl font-bold uppercase">{buttonMap[hoveredIndex]?.content_title}</span>
                                    <span className="px-4 text-sm italic text-gray-500 mb-auto">{buttonMap[hoveredIndex]?.subtitle}</span>
                                    <span className="px-4 text-sm border-t-2 border-gray-500  pt-2">{buttonMap[hoveredIndex]?.desc}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}