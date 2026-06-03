import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Loader2, Bot, AlertTriangle } from "lucide-react";

export const LoadingComponent = ({
  onCancel,
  requestId,
  logs: liveLogs = [],
  currentStep,
  nextStep,
  showLogs = true,
  variant = "classic",
}) => {
  const sourceLogs = liveLogs;
  const visibleLogs = sourceLogs.slice(-8);
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Chat Interface Optimization
  if (variant === "chat") {
    return (
      <div className="flex items-start gap-3 w-full animate-pulse-slow my-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-[#001FB0] flex items-center justify-center font-bold text-xs shadow-sm border border-blue-200">
          <Bot className="w-4 h-4" />
        </div>
        <div className="rounded-2xl p-5 bg-white border border-blue-100 text-gray-800 rounded-tl-none shadow-sm flex-1 max-w-2xl">
          <div className="text-xs font-bold text-[#001FB0] mb-2 uppercase tracking-wider poppins">
            Chupps AI
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="animate-spin h-5 w-5 text-blue-600 flex-shrink-0" />
            <p className="text-base text-gray-700 font-medium poppins">
              {currentStep || "Thinking..."}
            </p>
          </div>

          {requestId && (
            <p className="text-xs text-gray-400 mb-3 font-mono">
              Request ID: {requestId}
            </p>
          )}

          {showLogs && visibleLogs.length > 0 && (
            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl overflow-hidden mb-3">
              <div className="text-xs font-bold text-gray-500 bg-slate-100 px-3 py-1.5 flex justify-between items-center">
                <span>Execution Steps</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 p-2.5 scrollbar-thin">
                {visibleLogs.map((log) => (
                  <div
                    key={log.sequence || `${log.timestamp}-${log.step_key}`}
                    className="flex items-start justify-between text-[11px] font-mono leading-relaxed"
                  >
                    <div className="flex gap-2 min-w-0">
                      <span className="text-gray-400 flex-shrink-0">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span
                        className={`truncate ${log.status === "COMPLETE" ? "text-green-600 font-medium" : "text-blue-600"}`}
                      >
                        {log.summary || log.step_key}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-1 rounded ${log.status === "COMPLETE" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}
                    >
                      {log.status || "INFO"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto rounded-lg font-semibold flex items-center gap-1.5 bg-transparent"
              size="sm"
            >
              Cancel Execution
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Classic Interface View
  return (
    <div
      id="loading"
      className="relative my-5 flex flex-col items-center justify-center py-6 px-6 w-full max-w-4xl h-1/2 bg-blue-100 rounded-xl border-2 border-dashed border-blue-700"
    >
      {/* Loading Animation */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex flex-row gap-4 items-center justify-center">
          {/* Aligned Spinner */}
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-2xl text-gray-700 font-bold poppins">
            {currentStep || "Thinking..."}
          </p>
        </div>

        {requestId && (
          <p className="text-xs text-blue-700 mt-1">
            Request ID:{" "}
            <span className="font-mono bg-blue-200 px-1 rounded">
              {requestId}
            </span>
          </p>
        )}
      </div>

      {showLogs && (
        <div className="w-full max-w-2xl bg-white/70 border border-blue-200 mb-10 rounded-xl">
          <div className="text-xs poppins font-bold border-b text-blue-900 bg-blue-200 p-2 !rounded-t-xl">
            <span>Logs</span>
          </div>
          <div className="max-h-28 overflow-y-auto space-y-1 p-2">
            {visibleLogs.length === 0 && (
              <p className="text-xs text-blue-700">
                Waiting for backend logs...
              </p>
            )}
            {visibleLogs.map((log) => (
              <div
                key={log.sequence || `${log.timestamp}-${log.step_key}`}
                className={`${log.status === "COMPLETE" ? "text-green-700" : "text-blue-700"} poppins flex items-end justify-between text-xs text-blue-900`}
              >
                <div className="flex flex-row gap-2">
                  <span className="truncate pr-2 !text-gray-400">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="text-left">
                    {log.summary || log.step_key}
                  </span>
                </div>
                <span>{log.status || "INFO"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Button */}
      {onCancel && (
        <Button
          variant="destructive"
          onClick={onCancel}
          className="!rounded-lg absolute bottom-5"
          size="sm"
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

// Error component with structured error handling
export const ErrorComponent = ({
  error,
  errors,
  onRetry,
  onReset,
  variant = "classic",
}) => {
  // Handle both single error string and structured error array
  const errorList = (() => {
    if (errors && Array.isArray(errors)) return errors;
    if (error) {
      if (typeof error === "string")
        return [{ error, error_type: "UnstructuredError" }];
      if (typeof error === "object") return [error];
    }
    return [];
  })();

  const hasErrors = errorList.length > 0;

  const checkIfGeminiOverloaded = (errorObjOrStr) => {
    if (!errorObjOrStr) return false;
    const str =
      typeof errorObjOrStr === "string"
        ? errorObjOrStr
        : JSON.stringify(errorObjOrStr);
    return (
      str.includes("503") ||
      str.includes("UNAVAILABLE") ||
      str.includes("high demand") ||
      str.includes("temporary spikes") ||
      str.includes("experiencing high demand")
    );
  };

  const isGeminiOverloaded = errorList.some(
    (err) => checkIfGeminiOverloaded(err.error) || checkIfGeminiOverloaded(err),
  );

  // Chat Interface Optimization
  if (variant === "chat") {
    return (
      <div className="flex items-start gap-3 w-full my-4 animate-in fade-in duration-200">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shadow-sm border border-red-200">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="rounded-2xl p-5 bg-red-50/50 border border-red-100 text-gray-800 rounded-tl-none shadow-sm flex-1 max-w-2xl">
          <div className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wider poppins">
            System Error
          </div>

          {isGeminiOverloaded && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs md:text-sm shadow-sm animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 font-bold mb-1.5 text-amber-800">
                <span className="text-base">⚠️</span>
                <span>Google Gemini API Service High Demand (503)</span>
              </div>
              <p className="leading-relaxed mb-2 font-medium">
                Google's Gemini model is currently overloaded.{" "}
                <strong>Please note: this is NOT an app issue</strong>, but
                rather a temporary upstream service spike from Google's servers.
              </p>
              <p className="opacity-90 leading-relaxed font-normal">
                These spikes are usually temporary and resolve within a few
                seconds. Please wait a moment and try clicking{" "}
                <strong>"Retry Request"</strong> below to send your query again.
              </p>
            </div>
          )}

          <p className="text-sm text-red-800 font-medium mb-3">
            I couldn't complete your request. Please try again!
          </p>

          <p className="text-xs text-gray-500 mb-4">
            Try refining your search (e.g. including a specific date range) or
            checking database logs.
          </p>

          {hasErrors && (
            <div className="space-y-2 mb-4">
              {errorList.map((err, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-red-100 rounded-lg p-3 text-left shadow-sm"
                >
                  {err.step && (
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                        📍 {err.step}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-red-700 font-mono break-all leading-relaxed">
                    {err.error || "Unknown error occurred"}
                  </p>
                  {err.suggestion && (
                    <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 p-1.5 rounded border border-emerald-100">
                      💡 {err.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {onRetry && (
              <Button
                variant="outline"
                onClick={onRetry}
                className="rounded-lg border-red-200 text-red-700 hover:bg-red-50 text-xs py-1.5 h-auto font-bold"
                size="sm"
              >
                Retry Request
              </Button>
            )}
            {onReset && (
              <Button
                onClick={onReset}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 h-auto font-bold border-0"
                size="sm"
              >
                Start Fresh
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Classic Interface View
  return (
    <div className="relative bg-red-50 border-2 border-dashed border-red-700 rounded-lg flex flex-col items-center justify-center w-11/12 max-h-[75vh] overflow-y-auto py-8 px-6">
      <div className="pt-4 pb-4">
        <svg
          className="w-8 h-8"
          fill="#ff0000"
          viewBox="0 0 22 22"
          xmlns="http://www.w3.org/2000/svg"
          id="memory-cancel"
          stroke="#ff0000"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            <path d="M21 7V15H20V17H19V18H18V19H17V20H15V21H7V20H5V19H4V18H3V17H2V15H1V7H2V5H3V4H4V3H5V2H7V1H15V2H17V3H18V4H19V5H20V7H21M17 6V5H16V4H14V3H8V4H6V5H7V6H8V7H9V8H10V9H11V10H12V11H13V12H14V13H15V14H16V15H17V16H18V14H19V8H18V6H17M14 16V15H13V14H12V13H11V12H10V11H9V10H8V9H7V8H6V7H5V6H4V8H3V14H4V16H5V17H6V18H8V19H14V18H16V17H15V16H14Z"></path>
          </g>
        </svg>
      </div>

      <p className="oswald font-bold text-4xl text-red-700 mb-2">
        PLEASE TRY AGAIN!
      </p>

      {isGeminiOverloaded && (
        <div className="w-full max-w-3xl mb-6 p-5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-sm shadow-sm text-left animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 font-bold mb-2 text-amber-800 text-lg">
            <span>⚠️</span>
            <span>Upstream API Service Limit (Google Gemini 503)</span>
          </div>
          <p className="leading-relaxed mb-2">
            <strong>Notice:</strong> Google's Gemini AI service is currently
            experiencing extremely high traffic and spikes in demand.{" "}
            <strong>This is NOT an issue with the Chupps application</strong>,
            but rather a temporary availability limitation on the Google Gemini
            API servers.
          </p>
          <p className="opacity-90 leading-relaxed font-normal">
            API demand spikes usually resolve within a few seconds. Please wait
            a moment and click the <strong>Retry</strong> button below to try
            your search again.
          </p>
        </div>
      )}

      <div className="text-sm text-red-700 mb-6 px-4 text-center">
        Refine your search, add date range if not already given. Let the agent
        understand what you want.
      </div>

      {/* Error Details Section */}
      {hasErrors && (
        <div className="w-full max-w-3xl mb-6">
          <div className="text-xs text-red-600 font-bold mb-3 px-4">
            {errorList.length} Error{errorList.length !== 1 ? "s" : ""} Occurred
          </div>
          <div className="space-y-3 px-4">
            {errorList.map((err, idx) => (
              <div
                key={idx}
                className="bg-white/70 border border-red-300 rounded-lg p-4 text-left"
              >
                {/* Step/Stage Information */}
                {err.step && (
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                      📍 {err.step}
                    </p>
                    {err.timestamp && (
                      <span className="text-xs text-gray-500">
                        {new Date(err.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                )}

                {/* Error Message - Primary */}
                <div className="mb-3">
                  <p className="text-sm text-red-700 font-semibold leading-relaxed">
                    {err.error || "Unknown error occurred"}
                  </p>
                </div>

                {/* Additional Context/Suggestion */}
                {err.context && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">
                      Context:
                    </p>
                    <p className="text-xs text-gray-700 font-mono bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto">
                      {err.context}
                    </p>
                  </div>
                )}

                {/* Suggestion for Fix */}
                {err.suggestion && (
                  <div className="mt-3 pt-3 border-t border-green-200 bg-green-50/30 p-2 rounded">
                    <p className="text-xs text-green-700 font-semibold mb-1">
                      💡 Suggestion:
                    </p>
                    <p className="text-xs text-green-700">{err.suggestion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback Error Message */}
      {!hasErrors && (
        <div className="text-sm text-red-700 mb-6 px-4">
          An error occurred while searching. Please try again.
        </div>
      )}

      {/* Action Buttons */}
      <div className="poppins flex gap-3 mt-6">
        <Button variant="destructive" onClick={onRetry} className="!rounded-lg">
          Retry
        </Button>
        <Button onClick={onReset} className="!rounded-lg">
          Start New Search
        </Button>
      </div>
    </div>
  );
};

// Empty state component
export const EmptyStateComponent = () => (
  <div className="flex flex-col items-center justify-center py-12 w-11/12 h-1/2 border-2 border-dashed border-yellow-700 bg-yellow-100 rounded-2xl">
    <svg
      className="animate-none w-12 h-12 mb-4 text-yellow-700"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <p className="animate-none poppins font-bold text-2xl text-yellow-700">
      Enter a search query above to get started
    </p>
  </div>
);
