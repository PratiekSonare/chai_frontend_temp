import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';

export const LoadingComponent = ({
  onCancel,
  requestId,
  logs: liveLogs = [],
  currentStep,
  nextStep,
  showLogs = true
}) => {

  const sourceLogs = liveLogs;
  const visibleLogs = sourceLogs.slice(-8);
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div id='loading' className="relative my-5 flex flex-col items-center justify-center py-6 px-6 w-full max-w-4xl h-1/2 bg-blue-100 rounded-xl border-2 border-dashed border-blue-700">
      {/* Loading Animation */}
      <div className="flex flex-col items-center mb-6">
        <div className='flex flex-col gap-1 items-center justify-center'>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-2xl text-gray-700 font-bold poppins">{currentStep || 'Planning execution...'}</p>
        </div>

        {requestId && (
          <p className="text-xs text-blue-700 mt-1">
            Request ID: <span className="font-mono bg-blue-200 px-1 rounded">{requestId}</span>
          </p>
        )}
      </div>

      {showLogs && (
        <div className="w-full max-w-2xl bg-white/70 border border-blue-200 mb-10 rounded-xl">
          <div className="text-xs poppins font-bold border-b text-blue-900 bg-blue-200 p-2 !rounded-t-xl"><span >Logs</span></div>
          <div className="max-h-28 overflow-y-auto space-y-1 p-2">
            {visibleLogs.length === 0 && (
              <p className="text-xs text-blue-700">Waiting for backend logs...</p>
            )}
            {visibleLogs.map((log) => (
              <div key={log.sequence || `${log.timestamp}-${log.step_key}`} className={`${log.status === "COMPLETE" ? "text-green-700" : "text-blue-700"} poppins flex items-end justify-between text-xs text-blue-900`}>
                <div className='flex flex-row gap-2'>
                  <span className="truncate pr-2 !text-gray-400">{formatTimestamp(log.timestamp)}</span>
                  <span className="text-left">{log.summary || log.step_key}</span>
                </div>                
                <span>{log.status || 'INFO'}</span>
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
  )
};

// Error component with structured error handling
export const ErrorComponent = ({ error, errors, onRetry, onReset }) => {
  // Handle both single error string and structured error array
  const errorList = (() => {
    if (errors && Array.isArray(errors)) return errors;
    if (error) {
      if (typeof error === 'string') return [{ error, error_type: 'UnstructuredError' }];
      if (typeof error === 'object') return [error];
    }
    return [];
  })();
  
  const hasErrors = errorList.length > 0;

  return (
    <div className="relative bg-red-50 border-2 border-dashed border-red-700 rounded-lg flex flex-col items-center justify-center w-11/12 max-h-[75vh] overflow-y-auto py-8 px-6">

      <div className="pt-4 pb-4">
        <svg className='w-8 h-8' fill="#ff0000" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" id="memory-cancel" stroke="#ff0000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M21 7V15H20V17H19V18H18V19H17V20H15V21H7V20H5V19H4V18H3V17H2V15H1V7H2V5H3V4H4V3H5V2H7V1H15V2H17V3H18V4H19V5H20V7H21M17 6V5H16V4H14V3H8V4H6V5H7V6H8V7H9V8H10V9H11V10H12V11H13V12H14V13H15V14H16V15H17V16H18V14H19V8H18V6H17M14 16V15H13V14H12V13H11V12H10V11H9V10H8V9H7V8H6V7H5V6H4V8H3V14H4V16H5V17H6V18H8V19H14V18H16V17H15V16H14Z"></path></g></svg>
      </div>

      <p className="oswald font-bold text-4xl text-red-700 mb-2">
        PLEASE TRY AGAIN!
      </p>
      <div className="text-sm text-red-700 mb-6 px-4 text-center">
        Refine your search, add date range if not already given. Let the agent understand what you want.
      </div>

      {/* Error Details Section */}
      {hasErrors && (
        <div className="w-full max-w-3xl mb-6">
          <div className="text-xs text-red-600 font-bold mb-3 px-4">
            {errorList.length} Error{errorList.length !== 1 ? 's' : ''} Occurred
          </div>
          <div className="space-y-3 px-4">
            {errorList.map((err, idx) => (
              <div key={idx} className="bg-white/70 border border-red-300 rounded-lg p-4 text-left">
                
                {/* Step/Stage Information */}
                {err.step && (
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                      📍 {err.step}
                    </p>
                    {err.timestamp && (
                      <span className="text-xs text-gray-500">
                        {new Date(err.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Error Message - Primary */}
                <div className="mb-3">
                  <p className="text-sm text-red-700 font-semibold leading-relaxed">
                    {err.error || 'Unknown error occurred'}
                  </p>
                </div>

                {/* Error Type Badge */}
                {err.error_type && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="inline-block bg-red-100 text-red-700 text-xs font-mono px-2.5 py-1 rounded border border-red-200">
                      {err.error_type}
                    </span>
                    {err.severity && (
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded ${
                        err.severity === 'critical' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                        err.severity === 'warning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {err.severity.toUpperCase()}
                      </span>
                    )}
                  </div>
                )}

                {/* Additional Context/Suggestion */}
                {err.context && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Context:</p>
                    <p className="text-xs text-gray-700 font-mono bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto">
                      {err.context}
                    </p>
                  </div>
                )}

                {/* Suggestion for Fix */}
                {err.suggestion && (
                  <div className="mt-3 pt-3 border-t border-green-200 bg-green-50/30 p-2 rounded">
                    <p className="text-xs text-green-700 font-semibold mb-1">💡 Suggestion:</p>
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
        <Button
          variant='destructive'
          onClick={onRetry}
          className="!rounded-lg"
        >
          Retry
        </Button>
        <Button
          onClick={onReset}
          className="!rounded-lg"
        >
          Start New Search
        </Button>
      </div>
    </div>
  );
};

// Empty state component
export const EmptyStateComponent = () => (
  <div className='flex flex-col items-center justify-center py-12 w-11/12 h-1/2 border-2 border-dashed border-yellow-700 bg-yellow-100 rounded-2xl'>
    <svg className="animate-none w-12 h-12 mb-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <p className="animate-none poppins font-bold text-2xl text-yellow-700">Enter a search query above to get started</p>
  </div>
);