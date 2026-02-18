import { createMachine, assign, fromPromise } from 'xstate';
import axios from 'axios';

// Search states
export const searchMachine = createMachine({
  id: 'search',
  initial: 'idle',
  context: {
    query: '',
    data: [],
    error: null
  },
  states: {
    idle: {
      on: {
        SEARCH: {
          target: 'loading',
          actions: assign({
            query: ({ event }) => event.query,
            error: null
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
          });
          return response.data;
        }),
        input: ({ context }) => ({ query: context.query }),
        onDone: {
          target: 'success',
          actions: assign({
            data: ({ event }) => event.output,
            error: null
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
        CANCEL: 'idle'
      }
    },
    success: {
      on: {
        SEARCH: {
          target: 'loading',
          actions: assign({
            query: ({ event }) => event.query,
            error: null
          })
        },
        RESET: 'idle'
      }
    },
    failure: {
      on: {
        SEARCH: {
          target: 'loading',
          actions: assign({
            query: ({ event }) => event.query,
            error: null
          })
        },
        RETRY: 'loading',
        RESET: 'idle'
      }
    }
  }
});