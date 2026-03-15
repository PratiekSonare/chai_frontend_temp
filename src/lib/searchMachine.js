import { createMachine, assign, fromPromise } from 'xstate';
import axios from 'axios';

const generateRequestId = () => {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}${rand}`.slice(0, 12);
};

// Search states
export const searchMachine = createMachine({
  id: 'search',
  initial: 'idle',
  context: {
    query: '',
    data: [],
    error: null,
    metrics: null,
    requestId: null,
    logs: [],
    lastLogSequence: 0
  },
  states: {
    idle: {
      on: {
        SEARCH: {
          target: 'loading',
          actions: assign({
            query: ({ event }) => event.query,
            error: null,
            requestId: () => generateRequestId(),
            logs: () => [],
            lastLogSequence: () => 0
          })
        }
      }
    },
    loading: {
      invoke: {
        id: 'searchService',
        src: fromPromise(async ({ input }) => {
          const response = await axios.post('http://localhost:5000/query', { 
            query: input.query 
          }, {
            headers: {
              'X-Request-ID': input.requestId
            }
          });
          return response.data;
        }),
        input: ({ context }) => ({ query: context.query, requestId: context.requestId }),
        onDone: {
          target: 'success',
          actions: assign({
            data: ({ event }) => event.output,
            error: null,
            requestId: ({ context, event }) => event.output?.request_id || context.requestId,
            logs: ({ context, event }) => {
              const backendLogs = Array.isArray(event.output?.logs) ? event.output.logs : [];
              if (!backendLogs.length) {
                return context.logs;
              }
              return [...context.logs, ...backendLogs].reduce((acc, item) => {
                if (!acc.some((log) => log.sequence === item.sequence)) {
                  acc.push(item);
                }
                return acc;
              }, []);
            },
            lastLogSequence: ({ context, event }) => {
              const backendLogs = Array.isArray(event.output?.logs) ? event.output.logs : [];
              const latestBackend = backendLogs.reduce((max, log) => Math.max(max, Number(log.sequence || 0)), 0);
              return Math.max(context.lastLogSequence, latestBackend);
            }
          })
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: ({ event }) => event.error?.message || 'Search failed',
            data: []
          })
        }
      },
      on: {
        CANCEL: {
          target: 'idle',
          actions: assign({
            logs: () => [],
            lastLogSequence: () => 0,
            requestId: () => null
          })
        },
        APPEND_LOGS: {
          actions: assign({
            logs: ({ context, event }) => {
              const incoming = Array.isArray(event.logs) ? event.logs : [];
              if (!incoming.length) {
                return context.logs;
              }
              return [...context.logs, ...incoming].reduce((acc, item) => {
                if (!acc.some((log) => log.sequence === item.sequence)) {
                  acc.push(item);
                }
                return acc;
              }, []);
            },
            lastLogSequence: ({ context, event }) => {
              const incoming = Array.isArray(event.logs) ? event.logs : [];
              const latestIncoming = incoming.reduce((max, log) => Math.max(max, Number(log.sequence || 0)), 0);
              return Math.max(context.lastLogSequence, latestIncoming);
            }
          })
        }
      }
    },
    success: {
      on: {
        SEARCH: {
          target: 'loading',
          actions: assign({
            query: ({ event }) => event.query,
            error: null,
            requestId: () => generateRequestId(),
            logs: () => [],
            lastLogSequence: () => 0
          })
        },
        SET_METRICS: {
          actions: assign({
            metrics: ({ event }) => event.metrics
          })
        },
        APPEND_LOGS: {
          actions: assign({
            logs: ({ context, event }) => {
              const incoming = Array.isArray(event.logs) ? event.logs : [];
              if (!incoming.length) {
                return context.logs;
              }
              return [...context.logs, ...incoming].reduce((acc, item) => {
                if (!acc.some((log) => log.sequence === item.sequence)) {
                  acc.push(item);
                }
                return acc;
              }, []);
            },
            lastLogSequence: ({ context, event }) => {
              const incoming = Array.isArray(event.logs) ? event.logs : [];
              const latestIncoming = incoming.reduce((max, log) => Math.max(max, Number(log.sequence || 0)), 0);
              return Math.max(context.lastLogSequence, latestIncoming);
            }
          })
        },
        RESET: {
          target: 'idle',
          actions: assign({
            metrics: null,
            logs: [],
            lastLogSequence: 0,
            requestId: null
          })
        }
      }
    },
    failure: {
      on: {
        SEARCH: {
          target: 'loading',
          actions: assign({
            query: ({ event }) => event.query,
            error: null,
            requestId: () => generateRequestId(),
            logs: () => [],
            lastLogSequence: () => 0
          })
        },
        RETRY: 'loading',
        APPEND_LOGS: {
          actions: assign({
            logs: ({ context, event }) => {
              const incoming = Array.isArray(event.logs) ? event.logs : [];
              if (!incoming.length) {
                return context.logs;
              }
              return [...context.logs, ...incoming].reduce((acc, item) => {
                if (!acc.some((log) => log.sequence === item.sequence)) {
                  acc.push(item);
                }
                return acc;
              }, []);
            },
            lastLogSequence: ({ context, event }) => {
              const incoming = Array.isArray(event.logs) ? event.logs : [];
              const latestIncoming = incoming.reduce((max, log) => Math.max(max, Number(log.sequence || 0)), 0);
              return Math.max(context.lastLogSequence, latestIncoming);
            }
          })
        },
        RESET: {
          target: 'idle',
          actions: assign({
            metrics: null,
            logs: [],
            lastLogSequence: 0,
            requestId: null
          })
        }
      }
    }
  }
});