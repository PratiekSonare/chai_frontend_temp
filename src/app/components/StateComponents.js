import React from 'react';

// Loading component
export const LoadingComponent = ({ onCancel }) => (
  <div id='loading' className="flex flex-col items-center justify-center py-12">
    <div className="flex items-center space-x-2">
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
      <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Searching data...</p>
    {onCancel && (
      <button
        onClick={onCancel}
        className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-md transition-colors"
      >
        Cancel
      </button>
    )}
  </div>
);

// Error component
export const ErrorComponent = ({ error, onRetry, onReset }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-red-800">
          Search Failed
        </h3>
      </div>
      <div className="text-sm text-red-700 mb-4">
        {error || 'An error occurred while searching. Please try again.'}
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onRetry}
          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Retry
        </button>
        <button
          onClick={onReset}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Start New Search
        </button>
      </div>
    </div>
  </div>
);

// Empty state component
export const EmptyStateComponent = () => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
    <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <p className="text-lg font-medium">Enter a search query above to get started</p>
  </div>
);