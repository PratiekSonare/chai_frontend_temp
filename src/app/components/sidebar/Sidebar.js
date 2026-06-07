/* eslint-disable @next/next/no-img-element */
"use client";
import { useRouter } from "next/navigation";
import { useState, Fragment, useEffect, useRef } from "react";

export default function Sidebar({ onHoverChange }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const ITEM_HEIGHT = 96;
  const router = useRouter();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setExpandedIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buttonMap = [
    {
      svg: (
        <svg
          className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <circle
              cx="11.5"
              cy="11.5"
              r="9.5"
              stroke="#fff"
              strokeWidth="1.5"
            ></circle>{" "}
            <path
              d="M20 20L22 22"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
          </g>
        </svg>
      ),
      text: "DATA SEARCH",
      route: "/",
      content_title: "Data Search",
      desc: "Get data, insights, comparisons, calculations and data information in seconds!",
      subtitle: "AI-specialized data search using all Chupps data sources.",
    },
    {
      svg: (
        <svg
          className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              d="M16 4C18.175 4.01211 19.3529 4.10856 20.1213 4.87694C21 5.75562 21 7.16983 21 9.99826V15.9983C21 18.8267 21 20.2409 20.1213 21.1196C19.2426 21.9983 17.8284 21.9983 15 21.9983H9C6.17157 21.9983 4.75736 21.9983 3.87868 21.1196C3 20.2409 3 18.8267 3 15.9983V9.99826C3 7.16983 3 5.75562 3.87868 4.87694C4.64706 4.10856 5.82497 4.01211 8 4"
              stroke="#fff"
              strokeWidth="1.5"
            ></path>{" "}
            <path
              d="M9 13.4L10.7143 15L15 11"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>{" "}
            <path
              d="M8 3.5C8 2.67157 8.67157 2 9.5 2H14.5C15.3284 2 16 2.67157 16 3.5V4.5C16 5.32843 15.3284 6 14.5 6H9.5C8.67157 6 8 5.32843 8 4.5V3.5Z"
              stroke="#fff"
              strokeWidth="1.5"
            ></path>{" "}
          </g>
        </svg>
      ),
      isParent: true,
      text: "ORDERS",
      route: "/orders",
      content_title: "Orders",
      desc: "Find all order related metrics with real-time order updates from Shopify, Flipkart, Myntra, etc. here!",
      subtitle: "Fetch and compare orders across all channels.",
    },
    {
      svg: (
        <svg
          className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M3 13H5V3H3V13Z" fill="#fff"></path>
            <path d="M10 21H12V3H10V21Z" fill="#fff"></path>
            <path d="M17 18H19V3H17V18Z" fill="#fff"></path>
          </g>
        </svg>
      ),
      isChild: true,
      text: "ORDER METRICS",
      route: "/orders/order-metrics",
      content_title: "View Order Metrics",
      desc: "Find all order related metrics with real-time order updates from Shopify, Flipkart, Myntra, etc. here!",
      subtitle: "View order metrics and KPIs for latest orders!",
    },
    {
      svg: (
        <svg
          className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6Z"
              stroke="#fff"
              strokeWidth="1.5"
            ></path>
            <path
              d="M7 2V6"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M17 2V6"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M3 10H21"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <circle cx="8" cy="15" r="1.5" fill="#fff"></circle>
            <circle cx="12" cy="15" r="1.5" fill="#fff"></circle>
            <circle cx="16" cy="15" r="1.5" fill="#fff"></circle>
          </g>
        </svg>
      ),
      isChild: true,
      text: "FETCH ORDERS",
      route: "/orders/date-range-orders",
      content_title: "Fetch Orders",
      desc: "Get orders by date range instantly!",
      subtitle: "Query orders instantly!",
    },
    {
      svg: (
        <svg
          className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
            <path
              d="M7 14H16"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
            <path
              d="M7 17.5H13"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
            <path
              d="M22 2L17 6.99998M17 1.99998L22 6.99996"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
          </g>
        </svg>
      ),
      text: "RTO",
      route: "/rto",
      content_title: "Return / Cancellation",
      desc: "Discover factors for return / cancellation; target audience and geography with highest RTO.",
      subtitle: "Measure return & cancellation trends.",
    },
    {
      svg: (
        <svg
          className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              d="M4 6V19C4 20.6569 5.34315 22 7 22H17C18.6569 22 20 20.6569 20 19V9C20 7.34315 18.6569 6 17 6H4ZM4 6V5"
              stroke="#fff"
              strokeWidth="1.5"
            ></path>{" "}
            <path
              d="M18 6.00002V6.75002H18.75V6.00002H18ZM15.7172 2.32614L15.6111 1.58368L15.7172 2.32614ZM4.91959 3.86865L4.81353 3.12619H4.81353L4.91959 3.86865ZM5.07107 6.75002H18V5.25002H5.07107V6.75002ZM18.75 6.00002V4.30604H17.25V6.00002H18.75ZM15.6111 1.58368L4.81353 3.12619L5.02566 4.61111L15.8232 3.0686L15.6111 1.58368ZM4.81353 3.12619C3.91638 3.25435 3.25 4.0227 3.25 4.92895H4.75C4.75 4.76917 4.86749 4.63371 5.02566 4.61111L4.81353 3.12619ZM18.75 4.30604C18.75 2.63253 17.2678 1.34701 15.6111 1.58368L15.8232 3.0686C16.5763 2.96103 17.25 3.54535 17.25 4.30604H18.75ZM5.07107 5.25002C4.89375 5.25002 4.75 5.10627 4.75 4.92895H3.25C3.25 5.9347 4.06532 6.75002 5.07107 6.75002V5.25002Z"
              fill="#fff"
            ></path>{" "}
            <path
              d="M8 12H16"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
            <path
              d="M8 15.5H13.5"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
          </g>
        </svg>
      ),
      text: "CATALOGUE",
      route: "/catalogue",
      content_title: "Catalogue",
      desc: "Explore all available SKUs, compare historical sales performance among different SKUs.",
      subtitle: "Repository of all Chupps SKUs.",
    },
    {
      svg: (
        <svg
          className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              d="M5.31171 10.7615C8.23007 5.58716 9.68925 3 12 3C14.3107 3 15.7699 5.58716 18.6883 10.7615L19.0519 11.4063C21.4771 15.7061 22.6897 17.856 21.5937 19.428C20.4978 21 17.7864 21 12.3637 21H11.6363C6.21356 21 3.50217 21 2.40626 19.428C1.31034 17.856 2.52291 15.7061 4.94805 11.4063L5.31171 10.7615Z"
              stroke="#fff"
              strokeWidth="1.5"
            ></path>{" "}
            <path
              d="M12 8V13"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
            <circle cx="12" cy="16" r="1" fill="#fff"></circle>{" "}
          </g>
        </svg>
      ),
      text: "RISK",
      route: "/risk",
      content_title: "ORDER RISK ESTIMATION",
      desc: "Fetch risk scores of real-time orders for address & order intention verification.",
      subtitle: "How risky is this order?",
    },
    {
      svg: (
        <svg
          className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              d="M22 7L14.6203 14.3347C13.6227 15.3263 13.1238 15.822 12.5051 15.822C11.8864 15.8219 11.3876 15.326 10.3902 14.3342L10.1509 14.0962C9.15254 13.1035 8.65338 12.6071 8.03422 12.6074C7.41506 12.6076 6.91626 13.1043 5.91867 14.0977L2 18M22 7V12.5458M22 7H16.4179"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>{" "}
          </g>
        </svg>
      ),
      text: "FORECAST",
      route: "/forecast",
      content_title: "Forecast Analytics",
      desc: "Fetch mid-range, short-range forecasts for orders and inventory / assortments.",
      subtitle: "Forecast demand and supply, with ease.",
    },
  ];

  const [childVisible, setChildVisible] = useState(false);

  return (
    <div className="" ref={sidebarRef}>
      <div className="px-6 text-white top-0 left-0 right-0 z-[999] h-24 bg-[#001fb0] w-full flex flex-row justify-between">
        <button onClick={() => router.push("/")} className="flex items-center">
          <img
            className="h-10"
            src="https://raw.githubusercontent.com/PratiekSonare/chai_frontend_temp/main/public/chupps_only_logo.svg"
            alt="Chupps Logo"
          />
        </button>

        <div className="flex overflow-visible">
          <div className="flex justify-center items-center gap-0 h-[75%] my-auto overflow-visible">
            {buttonMap.map(({ svg, text, route, isParent, isChild }, idx) => (
              <Fragment key={idx}>
                <button
                  onClick={() => {
                    if (isParent) {
                      setChildVisible(!childVisible);
                    } else {
                      router.push(route);
                      setExpandedIndex(null);
                    }
                  }}
                  className={`${!isChild ? "visible" : childVisible ? "visible" : "hidden"} relative px-10 flex flex-col justify-center !rounded-2xl items-center !gap-5 w-full h-full ease-in-out opacity-80 hover:opacity-100 hover:bg-[#001a8e] overflow-visible`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {svg}
                  </div>
                  <span className="pb-2 text-xs tracking-wide poppins font-bold whitespace-nowrap">
                    {text}
                  </span>
                </button>
                {idx !== buttonMap.length - 1 && (
                  <div className="flex items-center">
                    <div className="w-px h-10 border-l border-white/20"></div>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
