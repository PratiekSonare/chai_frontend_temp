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

  const sidebarItems = [
    // DATA SEARCH
    {
      svg: (
        <svg
          className="w-8 h-8"
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
            <circle
              cx="11.5"
              cy="11.5"
              r="9.5"
              stroke="#fff"
              strokeWidth="1.5"
            ></circle>
            <path
              d="M20 20L22 22"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
          </g>
        </svg>
      ),
      text: "DATA SEARCH",
      route: "/",
      content_title: "Data Search",
      desc: "Get data, insights, comparisons, calculations and data information in seconds!",
      subtitle: "AI-specialized data search using all Chupps data sources.",
    },
    // ORDERS (Parent)
    {
      text: "ORDERS",
      route: "/orders",
      svg: (
        <svg
          className="w-8 h-8"
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
              d="M16 4C18.175 4.01211 19.3529 4.10856 20.1213 4.87694C21 5.75562 21 7.16983 21 9.99826V15.9983C21 18.8267 21 20.2409 20.1213 21.1196C19.2426 21.9983 17.8284 21.9983 15 21.9983H9C6.17157 21.9983 4.75736 21.9983 3.87868 21.1196C3 20.2409 3 18.8267 3 15.9983V9.99826C3 7.16983 3 5.75562 3.87868 4.87694C4.64706 4.10856 5.82497 4.10856 8 4"
              stroke="currentColor"
              strokeWidth="1.5"
            ></path>
            <path
              d="M9 13.4L10.7143 15L15 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M8 3.5C8 2.67157 8.67157 2 9.5 2H14.5C15.3284 2 16 2.67157 16 3.5V4.5C16 5.32843 15.3284 6 14.5 6H9.5C8.67157 6 8 5.32843 8 4.5V3.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
            ></path>
          </g>
        </svg>
      ),
      content_title: "Orders",
      desc: "Find all order related metrics with real-time order updates from Shopify, Flipkart, Myntra, etc. here!",
      subtitle: "Fetch and compare orders across all channels.",
      subItems: [
        // ORDER METRICS
        {
          svg: (
            <svg
              className="w-8 h-8"
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
                <path d="M3 13H5V3H3V13Z" fill="currentColor"></path>
                <path d="M10 21H12V3H10V21Z" fill="currentColor"></path>
                <path d="M17 18H19V3H17V18Z" fill="currentColor"></path>
              </g>
            </svg>
          ),
          text: "ORDER METRICS",
          route: "/orders/metric-card",
          content_title: "View Order Metrics",
          desc: "Find all order related metrics with real-time order updates from Shopify, Flipkart, Myntra, etc. here!",
          subtitle: "View order metrics and KPIs for latest orders!",
        },
        // FETCH ORDERS
        {
          svg: (
            <svg
              className="w-8 h-8"
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
                  stroke="currentColor"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M7 2V6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>
                <path
                  d="M17 2V6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>
                <path
                  d="M3 10H21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                ></path>
                <circle cx="8" cy="15" r="1.5" fill="currentColor"></circle>
                <circle cx="12" cy="15" r="1.5" fill="currentColor"></circle>
                <circle cx="16" cy="15" r="1.5" fill="currentColor"></circle>
              </g>
            </svg>
          ),
          text: "FETCH ORDERS",
          route: "/orders/date-range-orders",
          content_title: "Fetch Orders",
          desc: "Get orders by date range instantly!",
          subtitle: "Query orders instantly!",
        },
        // FORECAST
        {
          svg: (
            <svg
              className="w-8 h-8"
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
                  d="M22 7L14.6203 14.3347C13.6227 15.3263 13.1238 15.822 12.5051 15.822C11.8864 15.8219 11.3876 15.326 10.3902 14.3342L10.1509 14.0962C9.15254 13.1035 8.65338 12.6071 8.03422 12.6074C7.41506 12.6076 6.91626 13.1043 5.91867 14.0977L2 18M22 7V12.5458M22 7H16.4179"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </g>
            </svg>
          ),
          text: "FORECAST",
          route: "/forecast",
          content_title: "Forecast Analytics",
          desc: "Fetch mid-range, short-range forecasts for orders and inventory / assortments.",
          subtitle: "Forecast demand and supply, with ease.",
        },
      ],
    },
    // RTO (Top-level)
    {
      svg: (
        <svg
          className="w-8 h-8"
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
              d="M22 10.5V12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2H13.5"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M7 14H16"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M7 17.5H13"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M22 2L17 6.99998M17 1.99998L22 6.99996"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
          </g>
        </svg>
      ),
      text: "RTO",
      route: "/rto",
      content_title: "Return / Cancellation",
      desc: "Discover factors for return / cancellation; target audience and geography with highest RTO.",
      subtitle: "Measure return & cancellation trends.",
    },
    // CATALOGUE (Top-level)
    {
      svg: (
        <svg
          className="w-8 h-8"
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
              d="M16 4.00195C18.175 4.01406 19.3529 4.11051 20.1213 4.87889C21 5.75757 21 7.17179 21 10.0002V16.0002C21 18.8286 21 20.2429 20.1213 21.1215C19.2426 22.0002 17.8284 22.0002 15 22.0002H9C6.17157 22.0002 4.75736 22.0002 3.87868 21.1215C3 20.2429 3 18.8286 3 16.0002V10.0002C3 7.17179 3 5.75757 3.87868 4.87889C4.64706 4.11051 5.82497 4.01406 8 4.00195"
              stroke="#fff"
              strokeWidth="1.5"
            ></path>
            <path
              d="M10.5 14L17 14"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M7 14H7.5"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M7 10.5H7.5"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M7 17.5H7.5"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M10.5 10.5H17"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M10.5 17.5H17"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M8 3.5C8 2.67157 8.67157 2 9.5 2H14.5C15.3284 2 16 2.67157 16 3.5V4.5C16 5.32843 15.3284 6 14.5 6H9.5C8.67157 6 8 5.32843 8 4.5V3.5Z"
              stroke="#fff"
              strokeWidth="1.5"
            ></path>
          </g>
        </svg>
      ),
      text: "CATALOGUE",
      route: "/catalogue",
      content_title: "Catalogue",
      desc: "Explore all available SKUs, compare historical sales performance among different SKUs.",
      subtitle: "Repository of all Chupps SKUs.",
    },
    // INVENTORY (Parent)
    {
      text: "INVENTORY",
      route: "/inventory",
      svg: (
        <svg
          className="w-8 h-8"
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
              d="M15.5777 3.38197L17.5777 4.43152C19.7294 5.56066 20.8052 6.12523 21.4026 7.13974C22 8.15425 22 9.41667 22 11.9415V12.0585C22 14.5833 22 15.8458 21.4026 16.8603C20.8052 17.8748 19.7294 18.4393 17.5777 19.5685L15.5777 20.618C13.8221 21.5393 12.9443 22 12 22C11.0557 22 10.1779 21.5393 8.42229 20.618L6.42229 19.5685C4.27063 18.4393 3.19479 17.8748 2.5974 16.8603C2 15.8458 2 14.5833 2 12.0585V11.9415C2 9.41667 2 8.15425 2.5974 7.13974C3.19479 6.12523 4.27063 5.56066 6.42229 4.43152L8.42229 3.38197C10.1779 2.46066 11.0557 2 12 2C12.9443 2 13.8221 2.46066 15.5777 3.38197Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
            <path
              d="M21 7.5L17 9.5M12 12L3 7.5M12 12V21.5M12 12C12 12 14.7426 10.6287 16.5 9.75C16.6953 9.65237 17 9.5 17 9.5M17 9.5V13M17 9.5L7.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
          </g>
        </svg>
      ),
      content_title: "Inventory Intelligence",
      desc: "Track stock health, damage rates, QC performance, dead stock, and channel distribution.",
      subtitle: "Real-time inventory insights and forecasting.",
      subItems: [
        // DASHBOARD
        {
          svg: (
            <svg
              className="w-8 h-8"
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
                <path d="M3 13H5V3H3V13Z" fill="currentColor"></path>
                <path d="M10 21H12V3H10V21Z" fill="currentColor"></path>
                <path d="M17 18H19V3H17V18Z" fill="currentColor"></path>
              </g>
            </svg>
          ),
          text: "DASHBOARD",
          route: "/inventory/dashboard",
          content_title: "Inventory Dashboard",
          desc: "Overview of key inventory metrics and health indicators.",
          subtitle: "Real-time inventory analytics and key metrics.",
        },
        // DATA TABLE
        {
          svg: (
            <svg
              className="w-8 h-8"
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
                  d="M3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M3 10H21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M3 14H21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M3 18H21"
                  stroke="currentColor"
                  strokeWidth="1.5"
                ></path>
                <path
                  d="M9 4V20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                ></path>
              </g>
            </svg>
          ),
          text: "SNAPSHOT",
          route: "/inventory/table",
          content_title: "Inventory Data Table",
          desc: "Detailed SKU-level inventory data and metrics.",
          subtitle: "Detailed SKU-level inventory data.",
        },
        // FORECAST
        {
          svg: (
            <svg
              className="w-8 h-8"
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
                  d="M22 7L14.6203 14.3347C13.6227 15.3263 13.1238 15.822 12.5051 15.822C11.8864 15.8219 11.3876 15.326 10.3902 14.3342L10.1509 14.0962C9.15254 13.1035 8.65338 12.6071 8.03422 12.6074C7.41506 12.6076 6.91626 13.1043 5.91867 14.0977L2 18M22 7V12.5458M22 7H16.4179"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </g>
            </svg>
          ),
          text: "FORECAST",
          route: "/inventory/forecast",
          content_title: "Inventory Forecast",
          desc: "AI-powered inventory demand forecasting and predictions.",
          subtitle: "AI-powered inventory demand forecasting.",
        },
      ],
    },
    // RISK (Top-level)
    {
      svg: (
        <svg
          className="w-8 h-8"
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
              d="M12 2l7 4v5c0 5-3.8 9.5-7 11-3.2-1.5-7-6-7-11V6l7-4z"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            ></path>
            <path
              d="M12 8v5"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M12 15.2h.01"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </g>
        </svg>
      ),
      text: "RISK",
      route: "/risk",
      content_title: "ORDER RISK ESTIMATION",
      desc: "Fetch risk scores of real-time orders for address & order intention verification.",
      subtitle: "How risky is this order?",
    },
  ];

  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const [inventoryExpanded, setInventoryExpanded] = useState(false);

  const handleNavClick = (route, closeAll = true) => {
    router.push(route);
    if (closeAll) {
      setOrdersExpanded(false);
      setInventoryExpanded(false);
    }
  };

  const toggleSection = (section) => {
    if (section === "orders") {
      setOrdersExpanded(!ordersExpanded);
      setInventoryExpanded(false);
    } else if (section === "inventory") {
      setInventoryExpanded(!inventoryExpanded);
      setOrdersExpanded(false);
    }
  };

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

        <div className="flex overflow-hidden">
          <div className="flex justify-center items-center gap-0 h-[75%] my-auto overflow-visible">
            {sidebarItems.map((item, idx) => {
              // Check if it's a section with subItems (like ORDERS or INVENTORY)
              if (item.subItems && item.subItems.length > 0) {
                const isOrders = item.text === "ORDERS";
                const isInventory = item.text === "INVENTORY";
                const isExpanded = isOrders
                  ? ordersExpanded
                  : isInventory
                    ? inventoryExpanded
                    : false;

                return (
                  <Fragment key={idx}>
                    {/* Parent item button */}
                    <button
                      onClick={() =>
                        toggleSection(isOrders ? "orders" : "inventory")
                      }
                      className={`
                        relative px-10 z-20 flex flex-col justify-center !rounded-2xl items-center !gap-3 w-full h-full transition-all duration-100
                        ${isExpanded ? "ml-2 opacity-100 bg-zinc-50 text-[#001FB0] shadow-[8px_0px_24px_rgba(0,0,0,0.18)] " : "opacity-80 hover:opacity-100 hover:bg-[#001a8e] text-white"}
                        overflow-visible
                      `}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        {item.svg}
                      </div>
                      <span className="text-xs tracking-wide poppins font-bold whitespace-nowrap">
                        {item.text}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="w-fit bg-zinc-200 z-10 flex flex-row gap-2 items-center justify-center my-5 -ml-4 mr-2 p-1 !rounded-2xl">
                        {item.subItems.map((subItem, subIdx) => (
                          <Fragment key={subIdx}>
                            <button
                              onClick={() => handleNavClick(subItem.route)}
                              className="relative group w-fit h-full transition-all duration-100 overflow-visible text-[#001FB0] transition-colors bg-transparent"
                            >
                              <div className="px-3 !border group-hover:!border-[#001FB0] opacity-80 group-hover:opacity-100 transition-all duration-100 ease-in flex flex-col items-center justify-center rounded-2xl gap-2">
                                <div className="w-6 h-6 flex items-center justify-center">
                                  {subItem.svg}
                                </div>
                                <span className="text-xs tracking-wide text-[#001FB0] poppins font-bold whitespace-nowrap">
                                  {subItem.text}
                                </span>
                              </div>
                            </button>
                          </Fragment>
                        ))}
                      </div>
                    )}

                    {/* Separator after the parent item */}
                    {idx !== sidebarItems.length - 1 && (
                      <div className="flex items-center">
                        <div className="w-px h-10 border-l border-white/20"></div>
                      </div>
                    )}
                  </Fragment>
                );
              } else {
                // Regular top-level navigation item (e.g., DATA SEARCH, RTO)
                return (
                  <Fragment key={idx}>
                    <button
                      onClick={() => handleNavClick(item.route)}
                      className={`
                        relative px-10 z-20 flex flex-col justify-center !rounded-2xl items-center !gap-3 w-full h-full transition-all duration-100 opacity-80 hover:opacity-100 hover:bg-[#001a8e] text-white overflow-visible
                      `}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        {item.svg}
                      </div>
                      <span className="text-xs tracking-wide poppins font-bold whitespace-nowrap">
                        {item.text}
                      </span>
                    </button>
                    {/* Separator */}
                    {idx !== sidebarItems.length - 1 && (
                      <div className="flex items-center">
                        <div className="w-px h-10 border-l border-white/20"></div>
                      </div>
                    )}
                  </Fragment>
                );
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
