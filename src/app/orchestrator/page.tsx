'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ArtifactViewer from '@/components/ArtifactViewer';

interface LogEntry {
  time: string;
  step: string;
  status: string;
  note: string;
}

interface StreamEvent {
  type: string;
  step?: string;
  status?: string;
  message?: string;
  timestamp: string;
  runId?: string;
}

export default function OmniorDashboard() {
  const [logPath, setLogPath] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [streamLogs, setStreamLogs] = useState<StreamEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [runPath, setRunPath] = useState('');
  const [runId, setRunId] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamEndRef = useRef<HTMLDivElement>(null);

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
    setStreamLogs([]); // Clear stream logs for new run
    
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
      
      // Set the run ID for streaming
      if (data.runId) {
        setRunId(data.runId);
        connectToStream(data.runId);
      }
      
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

  const connectToStream = (runId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/orchestrator/stream?runId=${runId}`);
    eventSourceRef.current = eventSource;
    setIsStreaming(true);

    eventSource.onmessage = (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);
        setStreamLogs(prev => [...prev, data]);
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      setIsStreaming(false);
      eventSource.close();
    };

    eventSource.addEventListener('complete', (event) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);
        setStreamLogs(prev => [...prev, data]);
        setIsStreaming(false);
        eventSource.close();
      } catch (error) {
        console.error('Error parsing complete event:', error);
      }
    });
  };

  const disconnectStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  };

  // Auto-scroll to bottom of stream logs
  useEffect(() => {
    if (streamEndRef.current) {
      streamEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamLogs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'completed':
        return 'text-green-600';
      case 'fail':
      case 'failed':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
      case 'completed':
        return '✓';
      case 'fail':
      case 'failed':
        return '✗';
      case 'info':
        return 'ℹ';
      case 'warning':
        return '⚠';
      default:
        return '•';
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
          
          {runId && (
            <div className="text-sm text-muted-foreground">
              Run ID: <code className="bg-muted px-1 rounded">{runId}</code>
              {isStreaming && (
                <Badge variant="secondary" className="ml-2">
                  Streaming Live
                </Badge>
              )}
            </div>
          )}
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

      {/* Logs Display with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Execution Dashboard</CardTitle>
          <CardDescription>
            Monitor real-time logs and view generated artifacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stream" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stream">Real-time Stream</TabsTrigger>
              <TabsTrigger value="file">File Logs</TabsTrigger>
              <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stream" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Live Terminal Stream</h3>
                {isStreaming && (
                  <Button variant="outline" size="sm" onClick={disconnectStream}>
                    Disconnect
                  </Button>
                )}
              </div>
              
              <div className="border rounded-lg bg-black text-green-400 font-mono text-sm">
                <ScrollArea className="h-96 w-full">
                  <div className="p-4 space-y-1">
                    {streamLogs.length === 0 ? (
                      <div className="text-gray-500">
                        {runId ? 'Waiting for stream events...' : 'Run a pipeline to start streaming logs'}
                      </div>
                    ) : (
                      streamLogs.map((event, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <span className="text-gray-500 text-xs w-20 flex-shrink-0">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                          <span className={`flex-shrink-0 ${getStatusColor(event.status || '')}`}>
                            {getStatusIcon(event.status || '')}
                          </span>
                          <span className="flex-1">
                            {event.step && (
                              <span className="text-blue-400">[{event.step}]</span>
                            )}{' '}
                            {event.message}
                          </span>
                        </div>
                      ))
                    )}
                    <div ref={streamEndRef} />
                  </div>
                </ScrollArea>
              </div>
              
              {isStreaming && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Connected to live stream</span>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <h3 className="text-lg font-semibold">File-based Logs</h3>
              
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
            </TabsContent>
            
            <TabsContent value="artifacts" className="space-y-4">
              <ArtifactViewer initialRunId={runId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}