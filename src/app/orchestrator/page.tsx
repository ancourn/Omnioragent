'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogEntry {
  time: string;
  step: string;
  status: string;
  note: string;
}

export default function OmniorDashboard() {
  const [logPath, setLogPath] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [runPath, setRunPath] = useState('');

  const loadLogs = async () => {
    if (!logPath) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/orchestrator/logs?path=${encodeURIComponent(logPath)}`);
      
      if (!response.ok) {
        throw new Error('Failed to load logs');
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      setRunPath(data.runPath || '');
    } catch (err) {
      setError('Error loading logs. Please check the file path and try again.');
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const runPipeline = async () => {
    const goal = "Build a TODO web app with users, JWT auth, and a /health endpoint.";
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to run pipeline');
      }
      
      const data = await response.json();
      
      // Auto-load the logs from the new run
      const logFilePath = `${data.runPath}/pipeline_log.json`;
      setLogPath(logFilePath);
      
      // Wait a moment for the file to be written, then load
      setTimeout(() => {
        loadLogs();
      }, 1000);
      
    } catch (err) {
      setError('Error running pipeline. Please try again.');
      console.error('Error running pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Omnior Pipeline Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and visualize your AI DevOps pipeline execution
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Run a sample pipeline or load existing logs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runPipeline} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Running Pipeline...' : 'Run Sample Pipeline'}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            This will run: "Build a TODO web app with users, JWT auth, and a /health endpoint."
          </div>
        </CardContent>
      </Card>

      {/* Log Loader */}
      <Card>
        <CardHeader>
          <CardTitle>Load Pipeline Logs</CardTitle>
          <CardDescription>
            Enter the path to a pipeline_log.json file to view execution details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="/workspace/run-20240101T120000Z/pipeline_log.json"
              value={logPath}
              onChange={(e) => setLogPath(e.target.value)}
              className="flex-1"
            />
            <Button onClick={loadLogs} disabled={loading || !logPath}>
              Load
            </Button>
          </div>
          
          {runPath && (
            <div className="text-sm text-muted-foreground">
              Current run: <code className="bg-muted px-1 rounded">{runPath}</code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Execution Logs</CardTitle>
          <CardDescription>
            Step-by-step execution trace with status and notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading logs...</div>
            </div>
          ) : logs.length > 0 ? (
            <ScrollArea className="h-96 w-full border rounded-md">
              <div className="p-4 space-y-3">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      log.status === 'ok' 
                        ? 'border-l-green-500 bg-green-50' 
                        : log.status === 'fail' 
                        ? 'border-l-red-500 bg-red-50' 
                        : 'border-l-gray-500 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant={log.status === 'ok' ? 'default' : log.status === 'fail' ? 'destructive' : 'secondary'}
                      >
                        {log.step}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.time).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Status: {log.status}</div>
                      {log.note && (
                        <div className="text-muted-foreground mt-1">{log.note}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-32 border rounded-md">
              <div className="text-muted-foreground text-center">
                <p>No logs loaded</p>
                <p className="text-sm">Run a pipeline or enter a log file path above</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}