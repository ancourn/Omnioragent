'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { JsonViewer, DiffViewer } from '@/components/ui/json-viewer';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Play, Square, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

// Types
interface LogEntry {
  id?: string;
  step: string;
  status: 'ok' | 'fail' | 'running';
  message: string;
  timestamp: string;
}

interface Artifact {
  id: string;
  name: string;
  type: string;
  content?: string;
  filePath?: string;
  size?: number;
  createdAt: string;
}

interface Run {
  id: string;
  goal: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  duration?: number;
  metadata?: any;
  logs?: LogEntry[];
  artifacts?: Artifact[];
}

interface RunHistoryItem {
  id: string;
  goal: string;
  status: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  logCount: number;
  artifactCount: number;
}

export default function OmniorDashboard() {
  const [currentRun, setCurrentRun] = useState<Run | null>(null);
  const [streamLogs, setStreamLogs] = useState<LogEntry[]>([]);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [runHistory, setRunHistory] = useState<RunHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [goal, setGoal] = useState('Build a TODO web app with users, JWT auth, and a /health endpoint.');
  const [activeTab, setActiveTab] = useState('live');

  // Load run history
  const loadRunHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/orchestrator/runs');
      const data = await response.json();
      setRunHistory(data.runs || []);
    } catch (err) {
      console.error('Error loading run history:', err);
    }
  }, []);

  // Load specific run
  const loadRun = useCallback(async (runId: string) => {
    try {
      const response = await fetch(`/api/orchestrator/runs/${runId}`);
      const data = await response.json();
      setSelectedRun(data);
      setActiveTab('artifacts');
    } catch (err) {
      console.error('Error loading run:', err);
      setError('Error loading run details');
    }
  }, []);

  // Setup SSE streaming
  const setupStreaming = useCallback((runId: string) => {
    const eventSource = new EventSource(`/api/orchestrator/stream?runId=${runId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected') {
        setIsStreaming(true);
        console.log('Stream connected');
      } else if (data.type === 'log') {
        setStreamLogs(prev => [...prev, data.data]);
      } else if (data.type === 'completed') {
        setIsStreaming(false);
        eventSource.close();
        loadRunHistory();
      } else if (data.type === 'error') {
        setError(data.message);
        setIsStreaming(false);
        eventSource.close();
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setError('Stream connection error');
      setIsStreaming(false);
      eventSource.close();
    };
    
    return eventSource;
  }, [loadRunHistory]);

  // Run pipeline
  const runPipeline = async () => {
    if (!goal.trim()) {
      setError('Goal is required');
      return;
    }
    
    setLoading(true);
    setError('');
    setStreamLogs([]);
    setIsStreaming(true);
    setActiveTab('live');
    
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
      
      // Setup streaming for the new run
      if (data.runId) {
        setupStreaming(data.runId);
      }
      
    } catch (err) {
      setError('Error running pipeline. Please try again.');
      console.error('Error running pipeline:', err);
      setIsStreaming(false);
    } finally {
      setLoading(false);
    }
  };

  // Load run history on mount
  useEffect(() => {
    loadRunHistory();
  }, [loadRunHistory]);

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      running: 'default',
      completed: 'default',
      failed: 'destructive',
      ok: 'default',
      fail: 'destructive'
    } as const;
    
    const icons = {
      running: <Play className="h-3 w-3" />,
      completed: <CheckCircle className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />,
      ok: <CheckCircle className="h-3 w-3" />,
      fail: <XCircle className="h-3 w-3" />
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="gap-1">
        {icons[status as keyof typeof icons] || <Square className="h-3 w-3" />}
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Omnior Pipeline Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and visualize your AI DevOps pipeline execution with real-time streaming
        </p>
      </div>

      {/* Pipeline Runner */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Runner</CardTitle>
          <CardDescription>
            Execute AI-powered development pipelines with real-time monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter your development goal..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="flex-1 min-h-[80px]"
            />
            <Button 
              onClick={runPipeline} 
              disabled={loading || !goal.trim()}
              className="self-end"
            >
              {loading ? 'Running...' : 'Execute Pipeline'}
            </Button>
          </div>
          
          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Streaming live logs...
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live" className="gap-2">
            <Clock className="h-4 w-4" />
            Live Stream
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <FileText className="h-4 w-4" />
            Run History
          </TabsTrigger>
          <TabsTrigger value="artifacts" className="gap-2">
            <FileText className="h-4 w-4" />
            Artifacts
          </TabsTrigger>
        </TabsList>

        {/* Live Stream Tab */}
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Pipeline Execution</CardTitle>
              <CardDescription>
                Real-time streaming of pipeline execution logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full border rounded-md bg-black text-green-400 font-mono text-sm">
                <div className="p-4 space-y-2">
                  {streamLogs.length === 0 ? (
                    <div className="text-gray-500">
                      {isStreaming ? 'Waiting for logs...' : 'No logs available. Run a pipeline to see live execution.'}
                    </div>
                  ) : (
                    streamLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-gray-500 min-w-[120px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <StatusBadge status={log.status} />
                        <span className="text-blue-400 min-w-[80px]">{log.step}</span>
                        <span className="text-gray-300 flex-1">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Run History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Run History</CardTitle>
              <CardDescription>
                View all previous pipeline executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {runHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No runs yet. Execute a pipeline to see history.
                  </div>
                ) : (
                  runHistory.map((run) => (
                    <div 
                      key={run.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => loadRun(run.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={run.status} />
                          <span className="text-sm text-muted-foreground">
                            {new Date(run.startTime).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{run.goal}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>{run.logCount} logs</span>
                          <span>{run.artifactCount} artifacts</span>
                          {run.duration && <span>{run.duration}ms</span>}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Artifacts Tab */}
        <TabsContent value="artifacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Run Artifacts</CardTitle>
              <CardDescription>
                View generated files and data from pipeline execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRun ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <StatusBadge status={selectedRun.status} />
                    <span className="text-sm text-muted-foreground">
                      {selectedRun.startTime && `Started: ${new Date(selectedRun.startTime).toLocaleString()}`}
                    </span>
                    {selectedRun.endTime && (
                      <span className="text-sm text-muted-foreground">
                        Ended: {new Date(selectedRun.endTime).toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Goal:</h4>
                    <p className="text-sm bg-muted p-3 rounded">{selectedRun.goal}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Generated Artifacts:</h4>
                    
                    {selectedRun.artifacts && selectedRun.artifacts.length > 0 ? (
                      selectedRun.artifacts.map((artifact) => (
                        <div key={artifact.id}>
                          {artifact.content && (
                            <JsonViewer 
                              data={JSON.parse(artifact.content)} 
                              title={artifact.name}
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground">No artifacts available</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a run from the history to view its artifacts
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}