# XState Search Implementation

## Installation

Make sure to install the required XState dependencies:

```bash
npm install xstate @xstate/react
```

## What's Been Implemented

### 1. State Machine (`src/lib/searchMachine.js`)
- **idle**: Initial state, waiting for search input
- **loading**: Search request in progress
- **success**: Search completed successfully with data
- **failure**: Search failed with error

### 2. State Components (`src/app/components/StateComponents.js`)
- **LoadingComponent**: Shows animated loading indicator with cancel button
- **ErrorComponent**: Displays error message with retry/reset options
- **EmptyStateComponent**: Shown when no search has been performed

### 3. Enhanced Main Component (`src/app/page.js`)
- Integrated XState machine using `useMachine` hook
- State-based conditional rendering
- Proper error handling and loading states
- Cancel functionality during requests
- Debug logging for development

## State Transitions

```
idle → loading (on SEARCH)
loading → success (on successful API response)
loading → failure (on API error)
loading → idle (on CANCEL)
success → loading (on new SEARCH)
failure → loading (on RETRY or new SEARCH)
success/failure → idle (on RESET)
```

## Benefits

- **Better UX**: Users see appropriate feedback for each state
- **Error Recovery**: Built-in retry and reset functionality
- **Request Cancellation**: Users can cancel long-running requests
- **Type Safety**: XState provides better state management than vanilla React
- **Debugging**: Clear state transitions and logging
- **Maintainability**: Centralized state logic in machine definition

## Usage

The component now automatically handles:
- Loading animations during API calls
- Error messages with retry options
- Empty states when no search is performed
- Success states with data display and reset options
- Request cancellation capabilities