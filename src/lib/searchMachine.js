import { createMachine, assign, fromPromise } from "xstate";
import axios from "axios";
import { apiUrl } from "./api";

let activeQueryController = null;

const abortActiveQuery = () => {
  if (!activeQueryController) {
    return;
  }

  try {
    activeQueryController.abort();
  } catch (error) {
    console.error("Failed to abort active query:", error);
  } finally {
    activeQueryController = null;
  }
};

export const cancelQueryOnServer = async (
  requestId,
  reason = "client_cancelled",
) => {
  if (!requestId) {
    return;
  }

  try {
    await fetch(apiUrl(`/query/${requestId}/cancel`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
      keepalive: true,
    });
  } catch (error) {
    console.error("Failed to notify server cancellation:", error);
  }
};

const generateRequestId = () => {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}${rand}`.slice(0, 12);
};

// Search states
export const searchMachine = createMachine({
  id: "search",
  initial: "idle",
  context: {
    query: "",
    data: [],
    error: null,
    metrics: null,
    requestId: null,
    sessionId: null,
    logs: [],
    lastLogSequence: 0,
  },
  states: {
    idle: {
      on: {
        SEARCH: {
          target: "loading",
          actions: assign({
            query: ({ event }) => event.query,
            error: null,
            requestId: () => generateRequestId(),
            logs: () => [],
            lastLogSequence: () => 0,
          }),
        },
      },
    },
    loading: {
      invoke: {
        id: "searchService",
        src: fromPromise(async ({ input }) => {
          abortActiveQuery();
          const controller = new AbortController();
          activeQueryController = controller;

          try {
            const response = await axios.post(
              apiUrl("/query-v2/query"),
              {
                query: input.query,
                session_id: input.sessionId,
              },
              {
                headers: {
                  "X-Request-ID": input.requestId,
                },
                signal: controller.signal,
              },
            );

            return response.data;
          } finally {
            if (activeQueryController === controller) {
              activeQueryController = null;
            }
          }
        }),
        input: ({ context }) => ({
          query: context.query,
          requestId: context.requestId,
          sessionId: context.sessionId,
        }),
        onDone: {
          target: "success",
          actions: assign({
            data: ({ event }) => event.output,
            error: null,
            requestId: ({ context, event }) =>
              event.output?.request_id || context.requestId,
            sessionId: ({ context, event }) =>
              event.output?.session_id || context.sessionId,
            logs: ({ context, event }) => {
              const incoming = Array.isArray(event.output?.logs)
                ? event.output.logs
                : [];
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
              const backendLogs = Array.isArray(event.output?.logs)
                ? event.output.logs
                : [];
              const latestBackend = backendLogs.reduce(
                (max, log) => Math.max(max, Number(log.sequence || 0)),
                0,
              );
              return Math.max(context.lastLogSequence, latestBackend);
            },
          }),
        },
        onError: {
          target: "failure",
          actions: assign({
            error: ({ event }) => event.error?.message || "Search failed",
            data: [],
          }),
        },
      },
      on: {
        CANCEL: {
          target: "idle",
          actions: [
            () => abortActiveQuery(),
            assign({
              logs: () => [],
              lastLogSequence: () => 0,
              requestId: () => null,
            }),
          ],
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
              const latestIncoming = incoming.reduce(
                (max, log) => Math.max(max, Number(log.sequence || 0)),
                0,
              );
              return Math.max(context.lastLogSequence, latestIncoming);
            },
          }),
        },
        RESET: {
          target: "idle",
          actions: assign({
            metrics: null,
            logs: [],
            lastLogSequence: 0,
            requestId: null,
            sessionId: null,
            data: null,
          }),
        },
      },
    },
    success: {
      on: {
        SEARCH: {
          target: "loading",
          actions: [
            () => abortActiveQuery(),
            assign({
              query: ({ event }) => event.query,
              error: null,
              requestId: () => generateRequestId(),
              logs: () => [],
              lastLogSequence: () => 0,
            }),
          ],
        },
        SET_METRICS: {
          actions: assign({
            metrics: ({ event }) => event.metrics,
          }),
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
              const latestIncoming = incoming.reduce(
                (max, log) => Math.max(max, Number(log.sequence || 0)),
                0,
              );
              return Math.max(context.lastLogSequence, latestIncoming);
            },
          }),
        },
        RESET: {
          target: "idle",
          actions: assign({
            metrics: null,
            logs: [],
            lastLogSequence: 0,
            requestId: null,
            sessionId: null,
            data: null,
          }),
        },
      },
    },
    failure: {
      on: {
        SEARCH: {
          target: "loading",
          actions: [
            () => abortActiveQuery(),
            assign({
              query: ({ event }) => event.query,
              error: null,
              requestId: () => generateRequestId(),
              logs: () => [],
              lastLogSequence: () => 0,
            }),
          ],
        },
        RETRY: "loading",
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
              const latestIncoming = incoming.reduce(
                (max, log) => Math.max(max, Number(log.sequence || 0)),
                0,
              );
              return Math.max(context.lastLogSequence, latestIncoming);
            },
          }),
        },
        RESET: {
          target: "idle",
          actions: assign({
            metrics: null,
            logs: [],
            lastLogSequence: 0,
            requestId: null,
            sessionId: null,
            data: null,
          }),
        },
      },
    },
  },
});
