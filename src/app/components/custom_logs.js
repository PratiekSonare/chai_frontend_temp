export const custom_logs = [
  {
    request_id: 'mmrg98t6zx34',
    sequence: 1,
    step_key: 'REQUEST_START',
    summary: 'Query request accepted',
    details: 'fetch orders from past week.',
    status: 'START',
    wait_ms: null,
    timestamp: '2026-03-15T07:45:13.455431+00:00'
  },
  {
    request_id: 'mmrg98t6zx34',
    sequence: 2,
    step_key: 'PLANNING_START',
    summary: 'Planning execution...',
    details: 'Query: fetch orders from past week.',
    status: 'START',
    wait_ms: null,
    timestamp: '2026-03-15T07:45:13.459190+00:00'
  },
  {
    request_id: 'mmrg98t6zx34',
    sequence: 3,
    step_key: 'NEXT_STEP_PENDING',
    summary: 'Calling planning model...',
    details: null,
    status: 'PENDING',
    wait_ms: 500,
    timestamp: '2026-03-15T07:45:13.459341+00:00'
  },
  {
    request_id: 'mmrg98t6zx34',
    sequence: 4,
    step_key: 'PLANNING_COMPLETE',
    summary: 'Plan created: standard query',
    details: null,
    status: 'COMPLETE',
    wait_ms: null,
    timestamp: '2026-03-15T07:45:21.210238+00:00'
  },
  {
    request_id: 'mmrg98t6zx34',
    sequence: 5,
    step_key: 'EXECUTE_STEP_START',
    summary: 'Step 1/1',
    details: 'Retry: 0',
    status: 'START',
    wait_ms: null,
    timestamp: '2026-03-15T07:45:21.216142+00:00'
  },
  {
    request_id: 'mmrg98t6zx34',
    sequence: 6,
    step_key: 'NEXT_STEP_PENDING',
    summary: 'Executing get_all_orders...',
    details: null,
    status: 'PENDING',
    wait_ms: 500,
    timestamp: '2026-03-15T07:45:21.216503+00:00'
  },
  {
    request_id: 'mmrg98t6zx34',
    sequence: 7,
    step_key: 'TOOL_EXECUTION_START',
    summary: 'Executing get_all_orders...',
    details: null,
    status: 'START',
    wait_ms: null,
    timestamp: '2026-03-15T07:45:21.716883+00:00'
  },
  {
    request_id: 'mmrg98t6zx34',
    sequence: 8,
    step_key: 'TOOL_EXECUTION_COMPLETE',
    summary: 'Executed get_all_orders',
    details: 'Records: 2596',
    status: 'COMPLETE',
    wait_ms: null,
    timestamp: '2026-03-15T07:45:36.902881+00:00'
  },
  {
    request_id: 'mmrg98t6zx34',
    sequence: 9,
    step_key: 'WORKFLOW_COMPLETE',
    summary: 'Workflow execution finished',
    details: null,
    status: 'COMPLETE',
    wait_ms: null,
    timestamp: '2026-03-15T07:45:36.914374+00:00'
  }
];
