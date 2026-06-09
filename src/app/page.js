/* eslint-disable @next/next/no-img-element */
"use client";

import DotField from "../components/DotField";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  startTransition,
} from "react";
import { useMachine } from "@xstate/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

import Sidebar from "./components/sidebar/Sidebar";
import { searchMachine } from "../lib/searchMachine";
import { apiUrl } from "../lib/api";
import { LoadingComponent, ErrorComponent } from "./components/StateComponents";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import DataTableComponent from "./components/table/DataTableComponent";
import MetricAnalysis from "./components/output/metric_analysis/MetricAnalysis";
import {
  Send,
  Trash2,
  RefreshCw,
  Bot,
  User,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  GitCompare,
  Table,
  LineChart,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const exportToGoogleSheets = (rawTableData, queryName) => {
  let rows = [];
  if (Array.isArray(rawTableData)) {
    rows = rawTableData;
  } else if (rawTableData && Array.isArray(rawTableData.orders)) {
    rows = rawTableData.orders;
  } else if (rawTableData && Array.isArray(rawTableData.data)) {
    rows = rawTableData.data;
  } else if (
    rawTableData &&
    typeof rawTableData.data === "object" &&
    !Array.isArray(rawTableData.data)
  ) {
    const columnData = rawTableData.data;
    const columns = Object.keys(columnData);
    if (columns.length > 0) {
      const rowCount = Object.keys(columnData[columns[0]]).length;
      for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
        const row = {};
        columns.forEach((col) => {
          row[col] = columnData[col][rowIdx];
        });
        rows.push(row);
      }
    }
  }

  if (rows.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Get keys (headers)
  const headers = Object.keys(rows[0]);

  // Create tab-separated content (Google Sheets-friendly)
  const tsvRows = [];
  tsvRows.push(headers.join("\t"));

  rows.forEach((row) => {
    const values = headers.map((header) => {
      let val = row[header];
      if (val === null || val === undefined) return "";
      if (typeof val === "object") {
        return JSON.stringify(val).replace(/\t/g, " ");
      }
      return String(val).replace(/\t/g, " ");
    });
    tsvRows.push(values.join("\t"));
  });

  const tsvContent = tsvRows.join("\n");

  // Copy to Clipboard
  navigator.clipboard
    .writeText(tsvContent)
    .then(() => {
      alert("Opening Google Sheets in a new tab.");
      window.open("https://sheets.new", "_blank");
    })
    .catch((err) => {
      console.error("Failed to copy data: ", err);
      // Fallback: download CSV
      const csvContent =
        "data:text/csv;charset=utf-8," +
        tsvRows
          .map((row) =>
            row
              .split("\t")
              .map((v) => {
                // Properly quote and escape fields for CSV.
                // Wrap in double quotes, and escape internal double quotes with two double quotes.
                let cell = String(v);
                if (cell === null || cell === undefined) cell = "";
                // Handle fields that contain commas, double quotes, or newlines
                if (
                  cell.includes(",") ||
                  cell.includes('"') ||
                  cell.includes("\n")
                ) {
                  cell = `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
              })
              .join(","),
          )
          .join("\n");
      const encodedUri = encodeURI(csvContent); // Removed as direct download is preferred
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      // Sanitize queryName for filename
      const sanitizedQueryName = (queryName || "export")
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_") // Keep alphanumeric, underscore, hyphen
        .replace(/^_+|_+$/g, ""); // Remove leading/trailing underscores
      const filename = sanitizedQueryName
        ? `${sanitizedQueryName}_export.csv`
        : "export.csv";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Failed to copy to clipboard. Downloaded CSV file instead.");
    });
};

export default function ChatLandingPage() {
  const [inputValue, setInputValue] = useState("");
  const [searchState, sendSearch] = useMachine(searchMachine);
  const [messages, setMessages] = useState([]);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [activeView, setActiveView] = useState({ id: null, type: null }); // { id: msgId, type: 'table' | 'metrics' }

  const scrollRef = useRef(null);
  const searchbarRef = useRef(null);

  const isLoading = searchState.matches("loading");
  const isSuccess = searchState.matches("success");
  const isError = searchState.matches("failure");
  const requestId = searchState.context?.requestId;
  const workflowLogs = searchState.context.logs;

  // Poll backend logs during loading for real-time step updates
  const sendSearchRef = useRef(sendSearch);
  sendSearchRef.current = sendSearch;
  const lastSequenceRef = useRef(0);
  const intervalIdRef = useRef(null);
  const activeRef = useRef(true);

  useEffect(() => {
    if (!isLoading || !requestId) return;

    const pollLogs = async () => {
      try {
        const url = apiUrl(
          `/query-v2/logs/${requestId}?since=${lastSequenceRef.current}`,
        );
        console.log("[pollLogs] Fetching logs from:", url);
        const res = await fetch(url);
        console.log('[pollLogs] Fetch response object:', res);
        console.log(`[pollLogs] Fetch response status: ${res.status} ${res.statusText}, ok: ${res.ok}`);
        if (!res.ok) {
          console.warn(`[pollLogs] Fetch failed: ${res.status} ${res.statusText}`);
          // Attempt to get error details from response if possible
          try {
            const errorData = await res.json();
            console.warn("[pollLogs] Fetch error details:", errorData);
          } catch (jsonErr) {
            console.warn("[pollLogs] Could not parse error response:", jsonErr);
          }
          return; // Exit if fetch failed
        }
        let data;
        try {
          data = await res.json();
          console.log("[pollLogs] Backend response data:", data);
        } catch (jsonErr) {
          console.warn("[pollLogs] Error parsing JSON response:", jsonErr);
          return; // Exit if JSON parsing failed
        }

        const newLogs = data.logs || [];
        console.log(`[pollLogs] Received ${newLogs.length} logs.`);
        console.log(`[pollLogs] Backend next_sequence: ${data.next_sequence}`);
        console.log("[pollLogs] Current lastSequenceRef.current:", lastSequenceRef.current);

        // This log should show what latestLog/currentStep would be derived from *if* newLogs was processed
        const derivedLatestLog = newLogs.length ? newLogs[newLogs.length - 1] : null;
        const derivedCurrentStep = derivedLatestLog?.summary || "Thinking...";
        console.log("[pollLogs] Derived latestLog from newLogs:", derivedLatestLog);
        console.log("[pollLogs] Derived currentStep from newLogs:", derivedCurrentStep);

        if (newLogs.length > 0 && activeRef.current) {
          lastSequenceRef.current = data.next_sequence || lastSequenceRef.current;
          sendSearchRef.current({ type: "APPEND_LOGS", logs: newLogs });
        } else if (newLogs.length === 0) {
            // If no new logs, still update lastSequenceRef if backend provided it
            console.log(`[pollLogs] No new logs received, updating lastSequenceRef to ${data.next_sequence || lastSequenceRef.current}`);
            lastSequenceRef.current = data.next_sequence || lastSequenceRef.current;
        }
      } catch (err) {
        console.warn("[pollLogs] Error during fetch or processing:", err);
      }
    };

    const startPolling = () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      pollLogs(); // Initial poll
      intervalIdRef.current = setInterval(pollLogs, 800);
    };

    startPolling();

    return () => {
      activeRef.current = false;
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
    };
  }, [isLoading, requestId]);

  // Poll logs for the loading component
  const latestLog = workflowLogs.length
    ? workflowLogs[workflowLogs.length - 1]
    : null;
  const currentStep = latestLog?.summary || "Thinking...";

  const quickStarters = [
    {
      label: "SKU Performance",
      query: "Show top-performing products by sales volume last month",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      label: "Order Tracking",
      query: "What was the count of yesterday's total orders?",
      icon: <ShoppingCart className="w-4 h-4" />,
    },
    {
      label: "Sales Metrics",
      query: "Fetch order metrics for the last 30 days",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: "Channel Comparison",
      query: "Compare Shopify vs Myntra sales performance",
      icon: <GitCompare className="w-4 h-4" />,
    },
  ];

  // Handle Search Initiation
  const handleSearch = useCallback(
    (query) => {
      if (isLoading || !query.trim()) return;

      // Clear existing loading/error messages and add user message to chat
      setMessages((prev) => {
        const filteredMessages = prev.filter(
          (msg) => msg.role !== "loading" && msg.role !== "error",
        );
        return [
          ...filteredMessages,
          { id: Date.now(), role: "user", content: query },
        ];
      });

      sendSearch({ type: "SEARCH", query: query.trim() });
      setInputValue("");
    },
    [isLoading, sendSearch],
  );

  // Manage loading message in chat
  useEffect(() => {
    if (isLoading) {
      startTransition(() => {
        setMessages((prev) => {
          // If there's already a loading message, don't add another
          if (prev.some((msg) => msg.role === "loading")) return prev;

          return [
            ...prev,
            { id: "loading-message", role: "loading", content: "Loading..." },
          ];
        });
      });
    } else {
      // Remove loading message when no longer loading
      startTransition(() => {
        setMessages((prev) => prev.filter((msg) => msg.role !== "loading"));
      });
    }
  }, [isLoading]);

  // Manage error message in chat
  useEffect(() => {
    if (isError && searchState.context?.error) {
      startTransition(() => {
        setMessages((prev) => {
          // If there's already an error message, don't add another
          if (prev.some((msg) => msg.role === "error")) return prev;

          return [
            ...prev,
            {
              id: "error-message",
              role: "error",
              content: searchState.context.error.message || "An error occurred",
              error: searchState.context.error,
            },
          ];
        });
      });
    } else {
      // Remove error message when no longer in error state
      startTransition(() => {
        setMessages((prev) => prev.filter((msg) => msg.role !== "error"));
      });
    }
  }, [isError, searchState.context?.error]);

  // Handle successful response and append to chat
  useEffect(() => {
    if (isSuccess && searchState.context.data) {
      const response = searchState.context.data;
      const botMsgId = Date.now() + 1;

      startTransition(() => {
        setMessages((prev) => {
          // Remove any loading or error messages before adding the bot's response
          const filteredMessages = prev.filter(
            (msg) => msg.role !== "loading" && msg.role !== "error",
          );

          // Check if this response is already in messages to avoid duplication
          if (filteredMessages.some((m) => m.requestId === response.request_id))
            return filteredMessages;

          return [
            ...filteredMessages,
            {
              id: botMsgId,
              role: "bot",
              content: response.answer,
              requestId: response.request_id,
              results: response.results,
              thinking: response.thinking || null,
              queryType: response.query_type,
              summarizedQuery: response.summarized_query,
            },
          ];
        });
      });
    }
  }, [isSuccess, searchState.context.data]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, workflowLogs]);

  const handleReset = () => {
    setMessages([]);
    sendSearch({ type: "RESET" });
  };

  return (
    <div className="overflow-hidden h-screen flex flex-col font-sans bg-[#001fb0]">
      <Sidebar onHoverChange={setSidebarHovered} />

      <div className="flex-1 bg-[#001fb0] p-5 pt-0 min-h-0">
        <div className="relative landing-sdw overflow-hidden bg-zinc-50 font-sans rounded-4xl h-full flex flex-col">
          {/* Background DotField */}
          <div
            className={`${isLoading ? "opacity-80" : "opacity-30"} absolute inset-0.5 z-0 pointer-events-none`}
          >
            <DotField
              dotRadius={3}
              dotSpacing={20}
              bulgeStrength={500}
              glowRadius={0}
              sparkle={isLoading || isError}
              waveAmplitude={0}
              cursorRadius={50}
              cursorForce={0.1}
              bulgeOnly={true}
              gradientFrom="#0012b2"
              gradientTo="#001FB0"
              glowColor="#000000"
            />
          </div>
          <div className="relative z-10 flex flex-col h-full min-h-0">
            {/* Chat Messages Container */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 flex flex-col min-h-0"
            >
              {messages.length === 0 && !isLoading && (
                <div className="flex-1 flex flex-col items-center justify-around text-center p-8 max-w-2xl mx-auto my-auto z-10">
                  <div className="relative mb-10">
                    <img
                      src="/data_portal_new.png"
                      className="mx-auto mt-auto w-full object-contain filter"
                      alt="Portal"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <h1 className="text-xs font-bold text-gray-400 hover:text-[#001FB0] transition-colors duration-200 cursor-pointer mb-2">
                      Get started, click on any query to test Chupps AI.
                    </h1>

                    {/* Quick Starter Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                      {quickStarters.map((starter, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(starter.query)}
                          className="p-5 bg-white hover:bg-blue-50 border border-blue-100 hover:border-[#001FB0] rounded-xl text-left transition-all duration-200 shadow-sm hover:shadow-md group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 bg-blue-50 text-[#001FB0] rounded-lg group-hover:bg-[#001FB0] group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                              {starter.icon}
                            </span>
                            <div>
                              <p className="font-semibold text-xs text-[#001FB0] uppercase tracking-wider">
                                {starter.label}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {starter.query}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full max-w-6xl mx-auto ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "loading" && (
                    <div className="w-full max-w-2xl">
                      <LoadingComponent
                        onCancel={() => sendSearch({ type: "CANCEL" })}
                        requestId={requestId}
                        logs={workflowLogs}
                        currentStep={currentStep}
                        showLogs={true}
                        variant="chat"
                      />
                    </div>
                  )}

                  {msg.role === "error" && (
                    <div className="w-full max-w-2xl">
                      <ErrorComponent
                        error={msg.error}
                        onRetry={() =>
                          handleSearch(
                            messages.find((m) => m.role === "user")?.content ||
                              "",
                          )
                        }
                        onReset={handleReset}
                        variant="chat"
                      />
                    </div>
                  )}

                  {msg.role === "user" && (
                    <div className="flex items-start gap-3 max-w-[80%] self-end flex-row-reverse">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-[#001FB0] text-white flex items-center justify-center font-bold text-xs shadow">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="rounded-2xl px-4 py-3 bg-[#001FB0] text-white shadow-sm rounded-tr-none">
                        <div className="prose prose-sm prose-invert max-w-none text-white">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0 text-base leading-relaxed">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="text-white font-extrabold">
                                  {children}
                                </strong>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-5 mb-2">
                                  {children}
                                </ul>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.role === "bot" && (
                    <div className="flex items-start gap-3 self-start w-fit">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-[#001FB0] flex items-center justify-center font-bold text-xs shadow-sm border border-blue-200">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="rounded-2xl p-5 bg-white border border-blue-100 text-gray-800 rounded-tl-none shadow-sm flex-1">
                        <div className="text-xs font-bold text-[#001FB0] mb-2 uppercase tracking-wider poppins">
                          Chupps AI
                        </div>
                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed text-gray-700">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0 text-base leading-relaxed">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="text-[#001FB0] font-bold">
                                  {children}
                                </strong>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-5 mb-2">
                                  {children}
                                </ul>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>

                        {msg.thinking && (
                          <details className="mt-3 group">
                            <summary className="text-xs text-gray-400 hover:text-[#001FB0] cursor-pointer select-none transition-colors flex items-center gap-1.5">
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.2 6-.5.5-.8 1.2-.8 2v1a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1c0-.8-.3-1.5-.8-2C6.3 13.7 5 11.5 5 9a7 7 0 0 1 7-7z" />
                                <path d="M9 22h6" />
                              </svg>
                              Thinking
                              <span className="text-[10px] text-gray-300 group-open:hidden">
                                · click to expand
                              </span>
                              <span className="text-[10px] text-gray-300 hidden group-open:inline">
                                · click to collapse
                              </span>
                            </summary>
                            <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100 whitespace-pre-wrap leading-relaxed">
                              <ReactMarkdown
                                components={{
                                  strong: ({ children }) => (
                                    <strong className="text-[#001FB0] font-semibold">
                                      {children}
                                    </strong>
                                  ),
                                  p: ({ children }) => (
                                    <p className="mb-1 last:mb-0">{children}</p>
                                  ),
                                }}
                              >
                                {msg.thinking}
                              </ReactMarkdown>
                            </div>
                          </details>
                        )}

                        {msg.results && (
                          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                            {msg.results.data &&
                              (Array.isArray(msg.results.data)
                                ? msg.results.data.length > 0
                                : Object.keys(msg.results.data).length > 0) && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`rounded-full border-[#001FB0] text-[#001FB0] hover:bg-blue-50 ${
                                      activeView.id === msg.id &&
                                      activeView.type === "table"
                                        ? "bg-blue-100"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      setActiveView(
                                        activeView.id === msg.id &&
                                          activeView.type === "table"
                                          ? { id: null, type: null }
                                          : { id: msg.id, type: "table" },
                                      )
                                    }
                                  >
                                    <Table className="w-4 h-4 mr-2" />
                                    {activeView.id === msg.id &&
                                    activeView.type === "table"
                                      ? "Hide Data Table"
                                      : "View Data Table"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full border-[#001FB0] text-[#001FB0] hover:bg-blue-50 bg-white"
                                    onClick={() =>
                                      exportToGoogleSheets(
                                        msg.results.data,
                                        msg.summarizedQuery || "query_result",
                                      )
                                    }
                                  >
                                    <svg
                                      className="w-4 h-4 mr-2 text-green-600"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                                    </svg>
                                    Export to Google Sheets
                                  </Button>
                                </>
                              )}

                            {msg.results.metrics_calculated &&
                              msg.results.metrics_calculated.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`rounded-full border-[#001FB0] text-[#001FB0] hover:bg-blue-50 ${
                                    activeView.id === msg.id &&
                                    activeView.type === "metrics"
                                      ? "bg-blue-100"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    setActiveView(
                                      activeView.id === msg.id &&
                                        activeView.type === "metrics"
                                        ? { id: null, type: null }
                                        : { id: msg.id, type: "metrics" },
                                    )
                                  }
                                >
                                  <LineChart className="w-4 h-4 mr-2" />
                                  {activeView.id === msg.id &&
                                  activeView.type === "metrics"
                                    ? "Hide Metrics"
                                    : "View Metrics"}
                                </Button>
                              )}
                          </div>
                        )}

                        {/* Inline Expanded Views */}
                        {activeView.id === msg.id &&
                          activeView.type === "table" && (
                            <div className="mt-4 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                              <DataTableComponent
                                data={{
                                  data: msg.results.data,
                                  query_type:
                                    msg.queryType?.toLowerCase() || "standard",
                                  summarized_query: msg.summarizedQuery || "",
                                }}
                                summarized_query={msg.summarizedQuery || ""}
                                title={
                                  msg.queryType?.replace(/_/g, " ") ||
                                  "RESULT DATA"
                                }
                              />
                            </div>
                          )}

                        {activeView.id === msg.id &&
                          activeView.type === "metrics" && (
                            <div className="mt-4 w-full animate-in fade-in slide-in-from-top-2 duration-300">
                              <MetricAnalysis
                                metric_analysis={null}
                                metric_calculated={
                                  msg.results.metrics_calculated
                                }
                                showInsight={false}
                              />
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sticky Searchbar Area */}
            <div className="w-full py-5 px-6 flex flex-col items-center gap-4 rounded-b-4xl">
              <div className="w-full max-w-4xl relative flex items-center focus-within:border-[#001FB0]  drop-shadow-2xl focus-within:ring-4 focus-within:ring-[#001FB0] rounded-2xl transition-all pr-2">
                <input
                  ref={searchbarRef}
                  className="w-full p-5 pr-16 bg-zinc-50 rounded-2xl outline-none poppins text-gray-700 placeholder-gray-400 text-sm md:text-base"
                  placeholder="Ask a follow up question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearch(inputValue)
                  }
                  disabled={isLoading}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#001FB0] text-white p-2.5 rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none shadow"
                  onClick={() => handleSearch(inputValue)}
                  disabled={isLoading}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-wider">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer bg-transparent border-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Chat
                </button>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-[#001FB0] transition-colors duration-200 cursor-pointer bg-transparent border-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
