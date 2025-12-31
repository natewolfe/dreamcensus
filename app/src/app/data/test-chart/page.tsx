'use client'

/**
 * Simple test page to verify Recharts is working
 * Visit /data/test-chart to see this
 */

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const testData = [
  { name: '00:00', value: 30 },
  { name: '04:00', value: 45 },
  { name: '08:00', value: 60 },
  { name: '12:00', value: 75 },
  { name: '16:00', value: 55 },
  { name: '20:00', value: 40 },
  { name: '24:00', value: 35 },
]

export default function TestChartPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Recharts Test Page</h1>
      
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm">
          <strong>If you see a chart below, Recharts is working fine.</strong><br />
          If not, there may be a build or compatibility issue.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Simple Area Chart Test</h2>
        
        <div className="h-64 w-full border border-gray-200 rounded p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={testData}>
              <defs>
                <linearGradient id="testGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                fill="url(#testGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Test Data:</h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold mb-2">Debugging Steps:</h3>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Open browser console (F12)</li>
            <li>Check for any error messages</li>
            <li>Look for warnings about Recharts or ResponsiveContainer</li>
            <li>Verify the chart container has height (inspect element)</li>
            <li>Check if CSS variables are defined in your theme</li>
          </ol>
        </div>
      </div>

      <div className="mt-6">
        <a 
          href="/data" 
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Back to Data Observatory
        </a>
      </div>
    </div>
  )
}

