'use client'
import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function LogViewer() {
  const [logs, setLogs] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const wsRef = useRef(null)
  const logsEndRef = useRef(null)

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  const connectWebSocket = () => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
    }

    // Create new WebSocket connection
    const ws = new WebSocket('ws://localhost:5000/ws/logs')
    wsRef.current = ws

    ws.onopen = (event) => {
      console.log('WebSocket connected:', event)
      setIsConnected(true)
    }

    ws.onmessage = (event) => {
      const logData = JSON.parse(event.data)
      console.log('Received log:', logData)
      
      // Add timestamp for display if not present
      if (!logData.timestamp) {
        logData.timestamp = new Date().toISOString()
      }
      
      setLogs(prevLogs => [...prevLogs, logData])
    }

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event)
      setIsConnected(false)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
    }
  }

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }

  const clearLogs = () => {
    setLogs([])
  }

  const getRequestLogs = (requestId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'get_request_logs',
        request_id: requestId
      }
      wsRef.current.send(JSON.stringify(message))
    }
  }

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString()
    } catch (error) {
      return timestamp
    }
  }

  const getLevelColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'ERROR': return 'text-red-600'
      case 'WARNING': return 'text-yellow-600'
      case 'INFO': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'connection': return '🔗'
      case 'request_start': return '🚀'
      case 'request_step': return '⚙️'
      case 'request_end': return '✅'
      default: return '📝'
    }
  }

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-time Backend Logs</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button 
          onClick={connectWebSocket} 
          disabled={isConnected}
          variant={isConnected ? "secondary" : "default"}
        >
          Connect
        </Button>
        <Button 
          onClick={disconnectWebSocket} 
          disabled={!isConnected}
          variant="destructive"
        >
          Disconnect
        </Button>
        <Button onClick={clearLogs} variant="outline">
          Clear Logs
        </Button>
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Request ID (e.g., abc12345)"
          value={selectedRequestId}
          onChange={(e) => setSelectedRequestId(e.target.value)}
          className="px-3 py-2 border rounded-md flex-1"
        />
        <Button 
          onClick={() => getRequestLogs(selectedRequestId)}
          disabled={!isConnected || !selectedRequestId}
        >
          Get Request Logs
        </Button>
      </div>

      <Card className="h-96 overflow-y-auto p-4 bg-gray-50">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center">
            {isConnected ? 'Waiting for logs...' : 'Connect to view logs'}
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  log.level === 'ERROR' ? 'bg-red-100' : 
                  log.type === 'request_start' ? 'bg-green-100' :
                  log.type === 'request_end' ? 'bg-blue-100' : 'bg-white'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-lg">{getTypeIcon(log.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                      <span>{formatTimestamp(log.timestamp)}</span>
                      <span className={getLevelColor(log.level)}>[{log.level}]</span>
                      {log.request_id && (
                        <span className="bg-gray-200 px-1 rounded">
                          ID: {log.request_id}
                        </span>
                      )}
                    </div>
                    <div className="font-medium">{log.message}</div>
                    {log.details && (
                      <div className="text-xs text-gray-600 mt-1">{log.details}</div>
                    )}
                    {log.query && (
                      <div className="text-xs text-blue-600 mt-1">Query: {log.query}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </Card>

      <div className="text-sm text-gray-600">
        <p><strong>WebSocket URL:</strong> ws://localhost:5000/ws/logs</p>
        <p><strong>HTTP Logs API:</strong> GET http://localhost:5000/logs/&lt;request_id&gt;</p>
      </div>
    </div>
  )
}