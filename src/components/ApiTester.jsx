'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function ApiTester() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [requestId, setRequestId] = useState(null)

  const testQuery = async () => {
    setLoading(true)
    setResponse(null)
    setRequestId(null)
    
    try {
      const res = await fetch('http://localhost:5000/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })
      
      const data = await res.json()
      setResponse(data)
      
      // Extract request ID for log tracking
      if (data.request_id) {
        setRequestId(data.request_id)
      }
    } catch (error) {
      setResponse({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testPlan = async () => {
    setLoading(true)
    setResponse(null)
    setRequestId(null)
    
    try {
      const res = await fetch('http://localhost:5000/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })
      
      const data = await res.json()
      setResponse(data)
      
      // Extract request ID for log tracking
      if (data.request_id) {
        setRequestId(data.request_id)
      }
    } catch (error) {
      setResponse({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const getRequestLogs = async () => {
    if (!requestId) return
    
    try {
      const res = await fetch(`http://localhost:5000/logs/${requestId}`)
      const data = await res.json()
      console.log('Request logs:', data)
      alert(`Found ${data.total_logs} logs for request ${requestId}. Check console for details.`)
    } catch (error) {
      alert(`Error fetching logs: ${error.message}`)
    }
  }

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">API Tester with Log Tracking</h2>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Query:</label>
          <textarea
            className="w-full p-3 border rounded-md"
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Show me orders from last 5 days"
          />
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={testQuery} 
            disabled={loading || !query}
          >
            {loading ? 'Processing...' : 'Test Query'}
          </Button>
          <Button 
            onClick={testPlan} 
            disabled={loading || !query}
            variant="outline"
          >
            {loading ? 'Processing...' : 'Test Plan'}
          </Button>
        </div>
        
        {requestId && (
          <Card className="p-3 bg-blue-50">
            <div className="flex items-center justify-between">
              <span className="text-sm">Request ID: <code>{requestId}</code></span>
              <Button size="sm" onClick={getRequestLogs}>
                View Logs
              </Button>
            </div>
          </Card>
        )}
        
        {response && (
          <Card className="p-4">
            <h3 className="font-bold mb-2">Response:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(response, null, 2)}
            </pre>
          </Card>
        )}
      </div>
      
      <Card className="p-4 bg-yellow-50">
        <h3 className="font-bold mb-2">💡 Tips:</h3>
        <ul className="text-sm space-y-1">
          <li>• Open the Log Viewer component to see real-time logs</li>
          <li>• Use the Request ID to filter logs for specific requests</li>
          <li>• Try examples like: "Show orders from last 5 days"</li>
          <li>• Compare queries: "Compare COD vs prepaid orders"</li>
          <li>• Metric queries: "Calculate AOV from last week"</li>
        </ul>
      </Card>
    </div>
  )
}