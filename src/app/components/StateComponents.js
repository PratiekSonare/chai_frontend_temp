import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import React, { useState, useEffect, useRef } from 'react';

// Enhanced Loading component with real-time log streaming
export const LoadingComponent = ({ 
  onCancel, 
  requestId, 
  logs, 
  isConnected, 
  viewLogs, 
  setViewLogs,
  showLogs = false 
}) => {
  const logsEndRef = useRef(null)

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch (error) {
      return timestamp
    }
  }

  const getLogIcon = (step, level) => {
    if (level === 'ERROR') return '❌'
    switch (step) {
      case 'REQUEST_START': return '🚀'
      case 'REQUEST_END': return '✅'
      default: return '📝'
    }
  }

  return (
    <div id='loading' className="relative flex flex-col items-center justify-center py-6 w-full max-w-4xl h-1/2 bg-blue-100 rounded-xl border-2 border-dashed border-blue-700">
      {/* Loading Animation */}
      <div className="flex flex-col items-center mb-6">

        {/* show logs when toggle is enabled */}
        {!viewLogs ? (
          <div className='flex flex-col gap-2 items-center justify-center'>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-2xl text-gray-700 font-bold poppins">Searching data...</p>
          </div>
        ) : (
          <div className="h-full w-full">
            <p className='text-center mt-4'>Logs</p>
            <div className="p-3">
              {logs.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-8">
                  {isConnected ? 'Waiting for logs...' : 'Connecting...'}
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded ${log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                        log.step === 'REQUEST_START' ? 'bg-green-100 text-green-800' :
                          log.step === 'REQUEST_END' ? 'bg-blue-100 text-blue-800' :
                            'bg-white text-gray-700'
                        }`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-sm flex-shrink-0">{getLogIcon(log.step, log.level)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-gray-500 font-mono">{formatTimestamp(log.timestamp)}</span>
                            {log.level && (
                              <span className={`px-1 rounded font-medium ${log.level === 'ERROR' ? 'bg-red-200 text-red-800' :
                                'bg-gray-200 text-gray-600'
                                }`}>
                                {log.level}
                              </span>
                            )}
                          </div>
                          <div className="font-medium break-words">{log.message}</div>
                          {log.details && (
                            <div className="text-gray-600 mt-1 break-words">{log.details}</div>
                          )}
                          {log.step && (
                            <div className="text-blue-600 mt-1">Step: {log.step}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Logs Toggle */}
        {(
          <div className="absolute top-2 right-5 flex items-center space-x-2! mt-3">
            <Switch
              id="view-logs-toggle"
              checked={viewLogs}
              onCheckedChange={setViewLogs}
              className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:border-blue-300 border-2 rounded-lg!"
            />
            <Label
              htmlFor="view-logs-toggle"
              className="text-sm text-gray-700 font-medium cursor-pointer"
            >
              View Logs
            </Label>
          </div>
        )}

        {requestId && (
          <p className="text-xs text-blue-700 mt-1">
            Request ID: <span className="font-mono bg-blue-200 px-1 rounded">{requestId}</span>
          </p>
        )}
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <Button
          variant="destructive"
          onClick={onCancel}
          className="rounded-lg! absolute bottom-5"
          size="sm"
        >
          Cancel
        </Button>
      )}
    </div>
  )
};

// Error component
export const ErrorComponent = ({ error, onRetry, onReset }) => (
  <div className="relative bg-red-50 border-2 border-dashed border-red-700 text-center rounded-lg flex flex-col items-center justify-center w-11/12 h-1/2">

    <div className="absolute top-10">
      <svg className='w-8 h-8' fill="#ff0000" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" id="memory-cancel" stroke="#ff0000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M21 7V15H20V17H19V18H18V19H17V20H15V21H7V20H5V19H4V18H3V17H2V15H1V7H2V5H3V4H4V3H5V2H7V1H15V2H17V3H18V4H19V5H20V7H21M17 6V5H16V4H14V3H8V4H6V5H7V6H8V7H9V8H10V9H11V10H12V11H13V12H14V13H15V14H16V15H17V16H18V14H19V8H18V6H17M14 16V15H13V14H12V13H11V12H10V11H9V10H8V9H7V8H6V7H5V6H4V8H3V14H4V16H5V17H6V18H8V19H14V18H16V17H15V16H14Z"></path></g></svg>
    </div>

    <p className="oswald font-bold text-4xl text-red-700">
      PLEASE TRY AGAIN!
    </p>
    <div className="text-sm text-red-700 mb-8">
      {'Refine your search, add date range if not already given. Let the agent understand what you want.'}
    </div>
    <div className="text-sm text-red-700">
      {error || 'An error occurred while searching. Please try again.'}
    </div>

    <div className="poppins absolute bottom-5 flex space-x-3!">
      <Button
        variant='destructive'
        onClick={onRetry}
        className="rounded-lg!"
      >
        Retry
      </Button>
      <Button
        onClick={onReset}
        className="rounded-lg!"
      >
        Start New Search
      </Button>
    </div>
  </div>
);

// Empty state component
export const EmptyStateComponent = () => (
  <div className='flex flex-col items-center justify-center py-12 w-11/12 h-1/2 border-2 border-dashed border-yellow-700 bg-yellow-100 rounded-2xl'>
    <svg className="animate-none w-12 h-12 mb-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <p className="animate-none poppins font-bold text-2xl text-yellow-700">Enter a search query above to get started</p>
  </div>
);