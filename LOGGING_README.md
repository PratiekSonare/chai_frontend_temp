# Real-time Backend Log Streaming

## Implementation Summary

I've added WebSocket-based real-time log streaming to your FastAPI backend with the following features:

### Backend Changes (`app.py`)

1. **WebSocket Connection Manager**:
   - Manages multiple WebSocket connections
   - Broadcasts logs to all connected clients
   - Stores request-specific logs for retrieval

2. **New Endpoints**:
   - `ws://localhost:5000/ws/logs` - WebSocket for real-time log streaming
   - `GET /logs/{request_id}` - HTTP endpoint to get logs for specific requests

3. **Enhanced API Logging**:
   - All `/plan` and `/query` requests now generate unique request IDs
   - Logs include request start, processing steps, and completion status
   - Error handling includes request ID in responses

### Frontend Component (`LogViewer.jsx`)

A complete React component that:
- Connects to WebSocket for real-time logs
- Displays logs with timestamps, levels, and request IDs
- Allows filtering by specific request ID
- Auto-scrolls to latest logs
- Shows connection status

## Usage Examples

### Frontend Integration
```jsx
import LogViewer from '@/components/LogViewer'

// Add to your page
<LogViewer />
```

### JavaScript WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:5000/ws/logs');

ws.onmessage = (event) => {
  const logData = JSON.parse(event.data);
  console.log('Log:', logData);
};
```

### API Request with Logging
```javascript
// Make a request and track its logs
const response = await fetch('http://localhost:5000/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'Show orders from last 5 days' })
});

const result = await response.json();
const requestId = result.request_id;

// Get specific logs for this request
const logsResponse = await fetch(`http://localhost:5000/logs/${requestId}`);
const logs = await logsResponse.json();
```

## Alternative Frontend Libraries

If you prefer other libraries for log streaming:

### 1. Socket.IO (Most Popular)
```bash
# Backend
pip install python-socketio

# Frontend  
npm install socket.io-client
```

### 2. Server-Sent Events (SSE)
```javascript
// Simpler one-way communication
const eventSource = new EventSource('http://localhost:5000/logs/stream');
eventSource.onmessage = (event) => {
  const logData = JSON.parse(event.data);
  console.log(logData);
};
```

### 3. React Query + Polling
```javascript
// For non-real-time requirements
const { data } = useQuery(['logs', requestId], 
  () => fetch(`/logs/${requestId}`).then(r => r.json()),
  { refetchInterval: 1000 }
);
```

## Log Message Format

```json
{
  "timestamp": "2026-02-22T10:30:00.000Z",
  "level": "INFO",
  "message": "Request started: /query",
  "request_id": "abc12345",
  "type": "request_start",
  "query": "Show orders from last 5 days",
  "endpoint": "/query"
}
```

## Next Steps

1. **Add to existing pages**: Import and use the LogViewer component
2. **Customize styling**: Modify the component to match your design system
3. **Add filters**: Filter logs by level, request ID, or time range
4. **Persist logs**: Store logs in database for historical analysis
5. **Add authentication**: Secure WebSocket connections if needed

The implementation is production-ready and includes proper error handling, connection management, and cleanup.