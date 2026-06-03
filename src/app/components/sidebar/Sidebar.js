/* eslint-disable @next/next/no-img-element */
"use client";
import { useRouter } from "next/navigation";
import { useState, Fragment } from "react";

export default function Sidebar({ onHoverChange }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const ITEM_HEIGHT = 96;
  const router = useRouter();

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
      text: "ORDERS",
      route: "/orders",
      content_title: "Orders",
      desc: "Find all order related metrics with real-time order updates from Shopify, Flipkart, Myntra, etc. here!",
      subtitle: "Fetch and compare orders across all channels.",
      subsections: [
        {
          title: "View Order Metrics",
          route: "/orders/metric-card",
          desc: "View order metrics and KPIs for latest orders!",
          icon: (
            <svg
              className="w-5 h-5"
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
        },
        {
          title: "Fetch Orders",
          route: "/orders/date-range-orders",
          desc: "Get orders by date range instantly!",
          icon: (
            <svg
              className="w-5 h-5"
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
        },
      ],
    },
    // {
    //   svg: (
    //     <svg
    //       className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in"
    //       viewBox="0 0 24 24"
    //       fill="none"
    //       xmlns="http://www.w3.org/2000/svg"
    //     >
    //       <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    //       <g
    //         id="SVGRepo_tracerCarrier"
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //       ></g>
    //       <g id="SVGRepo_iconCarrier">
    //         {" "}
    //         <path
    //           d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
    //           stroke="#fff"
    //           strokeWidth="1.5"
    //           strokeLinecap="round"
    //         ></path>{" "}
    //         <path
    //           d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
    //           stroke="#fff"
    //           strokeWidth="1.5"
    //           strokeLinecap="round"
    //         ></path>{" "}
    //       </g>
    //     </svg>
    //   ),
    //   text: "INVENTORY",
    //   route: "/",
    //   content_title: "Inventory",
    //   desc: "Fetch latest inventory and assortment, analyze and compare historical inventory to map trends!",
    //   subtitle: "Real-time inventory across different channels.",
    // },
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
              d="M17.4142 10.4142C18 9.82843 18 8.88562 18 7C18 5.11438 18 4.17157 17.4142 3.58579M17.4142 10.4142C16.8284 11 15.8856 11 14 11H10C8.11438 11 7.17157 11 6.58579 10.4142M17.4142 10.4142C17.4142 10.4142 17.4142 10.4142 17.4142 10.4142ZM17.4142 3.58579C16.8284 3 15.8856 3 14 3L10 3C8.11438 3 7.17157 3 6.58579 3.58579M17.4142 3.58579C17.4142 3.58579 17.4142 3.58579 17.4142 3.58579ZM6.58579 3.58579C6 4.17157 6 5.11438 6 7C6 8.88562 6 9.82843 6.58579 10.4142M6.58579 3.58579C6.58579 3.58579 6.58579 3.58579 6.58579 3.58579ZM6.58579 10.4142C6.58579 10.4142 6.58579 10.4142 6.58579 10.4142Z"
              stroke="#fff"
              strokeWidth="1.5"
            ></path>{" "}
            <path
              d="M13 7C13 7.55228 12.5523 8 12 8C11.4477 8 11 7.55228 11 7C11 6.44772 11.4477 6 12 6C12.5523 6 13 6.44772 13 7Z"
              stroke="#fff"
              strokeWidth="1.5"
            ></path>{" "}
            <path
              d="M18 6C16.3431 6 15 4.65685 15 3"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
            <path
              d="M18 8C16.3431 8 15 9.34315 15 11"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
            <path
              d="M6 6C7.65685 6 9 4.65685 9 3"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
            <path
              d="M6 8C7.65685 8 9 9.34315 9 11"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
            <path
              d="M5 20.3884H7.25993C8.27079 20.3884 9.29253 20.4937 10.2763 20.6964C12.0166 21.0549 13.8488 21.0983 15.6069 20.8138C16.4738 20.6734 17.326 20.4589 18.0975 20.0865C18.7939 19.7504 19.6469 19.2766 20.2199 18.7459C20.7921 18.216 21.388 17.3487 21.8109 16.6707C22.1736 16.0894 21.9982 15.3762 21.4245 14.943C20.7873 14.4619 19.8417 14.462 19.2046 14.9433L17.3974 16.3084C16.697 16.8375 15.932 17.3245 15.0206 17.4699C14.911 17.4874 14.7962 17.5033 14.6764 17.5172M14.6764 17.5172C14.6403 17.5214 14.6038 17.5254 14.5668 17.5292M14.6764 17.5172C14.8222 17.486 14.9669 17.396 15.1028 17.2775C15.746 16.7161 15.7866 15.77 15.2285 15.1431C15.0991 14.9977 14.9475 14.8764 14.7791 14.7759C11.9817 13.1074 7.62942 14.3782 5 16.2429M14.6764 17.5172C14.6399 17.525 14.6033 17.5292 14.5668 17.5292M14.5668 17.5292C14.0434 17.5829 13.4312 17.5968 12.7518 17.5326"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>{" "}
            <rect
              x="2"
              y="14"
              width="3"
              height="8"
              rx="1.5"
              stroke="#fff"
              strokeWidth="1.5"
            ></rect>{" "}
          </g>
        </svg>
      ),
      text: "PROFITABILITY",
      route: "/profit",
      content_title: "Cost Sheet & Margins",
      desc: "Edit, control and manage profitability and vendor cost sheets.",
      subtitle: "Manage profitability data for each SKU, by each distributor.",
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
    // {
    //   svg: (
    //     <svg
    //       className="w-8 h-8 translate-y-3 group-hover:translate-y-0 transition-transform duration-200 ease-in"
    //       viewBox="0 0 24 24"
    //       fill="none"
    //       xmlns="http://www.w3.org/2000/svg"
    //     >
    //       <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    //       <g
    //         id="SVGRepo_tracerCarrier"
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //       ></g>
    //       <g id="SVGRepo_iconCarrier">
    //         {" "}
    //         <circle
    //           cx="9"
    //           cy="9"
    //           r="2"
    //           stroke="#fff"
    //           strokeWidth="1.5"
    //         ></circle>{" "}
    //         <path
    //           d="M13 15C13 16.1046 13 17 9 17C5 17 5 16.1046 5 15C5 13.8954 6.79086 13 9 13C11.2091 13 13 13.8954 13 15Z"
    //           stroke="#fff"
    //           strokeWidth="1.5"
    //         ></path>{" "}
    //         <path
    //           d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z"
    //           stroke="#fff"
    //           strokeWidth="1.5"
    //         ></path>{" "}
    //         <path
    //           d="M19 12H15"
    //           stroke="#fff"
    //           strokeWidth="1.5"
    //           strokeLinecap="round"
    //         ></path>{" "}
    //         <path
    //           d="M19 9H14"
    //           stroke="#fff"
    //           strokeWidth="1.5"
    //           strokeLinecap="round"
    //         ></path>{" "}
    //         <path
    //           d="M19 15H16"
    //           stroke="#fff"
    //           strokeWidth="1.5"
    //           strokeLinecap="round"
    //         ></path>{" "}
    //       </g>
    //     </svg>
    //   ),
    //   text: "DISTRIBUTORS",
    //   route: "/",
    //   content_title: "Distributors",
    //   desc: "(OFFLINE SALES) Analyze distributor-wise performance, trends and compare performance",
    //   subtitle: "Keep your distributors happy.",
    // },
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

  return (
    <div className="">
      <div className="px-6 text-white top-0 left-0 right-0 z-200 h-24 bg-[#001fb0] w-full flex flex-row justify-between items-stretch">
        <button onClick={() => router.push("/")} className="flex items-center">
          <img
            className="h-10"
            src="./chupps_only_logo.svg"
            alt="Chupps Logo"
          />
        </button>

        <div className="flex" onMouseLeave={() => setHoveredIndex(null)}>
          <div className="flex justify-center items-stretch gap-0 h-[75%] my-auto">
            {buttonMap.map(({ svg, text, route }, idx) => (
              <Fragment key={idx}>
                <button
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onClick={() => router.push(`${route}`)}
                  className="relative px-10 flex flex-col justify-center rounded-2xl! items-center gap-5! w-full h-full transition-all duration-200 opacity-80 hover:opacity-100 hover:bg-[#001a8e]"
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {svg}
                  </div>
                  <span className="pb-2 text-xs tracking-wide poppins font-bold whitespace-nowrap">
                    {text}
                  </span>
                  {/* Dropdown on hover */}
                  {hoveredIndex === idx && buttonMap[idx]?.subsections && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-[#001a8e] border border-[#001a8e]/80 rounded-md shadow-lg p-3 z-300">
                      <span className="text-xs uppercase tracking-widest font-semibold text-gray-400 block mb-3">
                        Quick Access
                      </span>
                      <div className="flex flex-col gap-2">
                        {buttonMap[idx].subsections.map(
                          (subsection, subIdx) => (
                            <div
                              key={subIdx}
                              onClick={() => {
                                router.push(subsection.route);
                                setExpandedIndex(null);
                                setHoveredIndex(null);
                              }}
                              className="text-left px-3 py-2.5 bg-[#001fb0] hover:bg-[#0025d4] rounded-md transition-all duration-200 text-white border border-[#001a8e]/60 hover:border-[#001a8e]/100 group cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div className="opacity-80 group-hover:opacity-100 transition-opacity w-5 h-5">
                                  {subsection.icon}
                                </div>
                                <span className="text-sm font-semibold group-hover:translate-x-0.5 transition-transform flex-1">
                                  {subsection.title}
                                </span>
                              </div>
                              <p className="text-xs text-gray-300 opacity-70 group-hover:opacity-90 transition-opacity pl-7">
                                {subsection.desc}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
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
