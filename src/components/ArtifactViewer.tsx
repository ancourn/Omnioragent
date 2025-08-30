'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import JsonTreeViewer from './JsonTreeViewer';
import DiffViewer from './DiffViewer';
import { Download, RefreshCw, FolderOpen, FileText, Code, CheckCircle, AlertCircle } from 'lucide-react';

interface Artifact {
  id: string;
  run_id: string;
  type: string;
  path: string;
  content?: string;
  created_at: string;
}

interface Run {
  id: string;
  goal: string;
  status: string;
  started_at: string;
  finished_at?: string;
  summary?: string;
  _count: {
    logs: number;
    artifacts: number;
  };
}

interface ArtifactViewerProps {
  initialRunId?: string;
}

export default function ArtifactViewer({ initialRunId }: ArtifactViewerProps) {
  const [selectedRunId, setSelectedRunId] = useState(initialRunId || '');
  const [runs, setRuns] = useState<Run[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [compareArtifact, setCompareArtifact] = useState<Artifact | null>(null);
  const [activeTab, setActiveTab] = useState('specs');

  const loadRuns = async () => {
    try {
      const response = await fetch('/api/runs?limit=100');
      if (!response.ok) throw new Error('Failed to load runs');
      const data = await response.json();
      setRuns(data.runs);
      
      // Auto-select the most recent run if none is selected
      if (!selectedRunId && data.runs.length > 0) {
        setSelectedRunId(data.runs[0].id);
      }
    } catch (err) {
      setError('Error loading runs');
      console.error(err);
    }
  };

  const loadArtifacts = async (runId: string) => {
    setLoading(true);
    setError('');
    setArtifacts([]);
    setSelectedArtifact(null);
    setCompareArtifact(null);

    try {
      const response = await fetch(`/api/artifacts?runId=${runId}`);
      if (!response.ok) throw new Error('Failed to load artifacts');
      const data = await response.json();
      setArtifacts(data.artifacts);
    } catch (err) {
      setError('Error loading artifacts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadArtifact = (artifact: Artifact) => {
    if (!artifact.content) return;
    
    const blob = new Blob([artifact.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.type}_${artifact.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseArtifactContent = (content?: string) => {
    if (!content) return null;
    try {
      return JSON.parse(content);
    } catch {
      return { raw: content };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'spec':
        return <FileText className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'eval':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <FolderOpen className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  useEffect(() => {
    if (selectedRunId) {
      loadArtifacts(selectedRunId);
    }
  }, [selectedRunId]);

  const specsArtifacts = artifacts.filter(a => a.type === 'spec');
  const codeArtifacts = artifacts.filter(a => a.type === 'code');
  const evalArtifacts = artifacts.filter(a => a.type === 'eval');

  return (
    <div className="space-y-6">
      {/* Run Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5" />
            <span>Run Selector</span>
          </CardTitle>
          <CardDescription>
            Select a pipeline run to view its artifacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedRunId} onValueChange={setSelectedRunId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a run..." />
              </SelectTrigger>
              <SelectContent>
                {runs.map((run) => (
                  <SelectItem key={run.id} value={run.id}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(run.status)}
                      <span className="font-medium">
                        {new Date(run.started_at).toLocaleDateString()} {new Date(run.started_at).toLocaleTimeString()}
                      </span>
                      <Badge className={getStatusColor(run.status)}>
                        {run.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        ({run._count.artifacts} artifacts)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedRunId && (
              <div className="text-sm text-muted-foreground">
                Selected run: <code className="bg-muted px-1 rounded">{selectedRunId}</code>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Artifact Viewer */}
      {selectedRunId && (
        <Card>
          <CardHeader>
            <CardTitle>Artifacts</CardTitle>
            <CardDescription>
              View and analyze generated artifacts from the pipeline execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                <span>Loading artifacts...</span>
              </div>
            ) : artifacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No artifacts found for this run</p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="specs" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Specs ({specsArtifacts.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex items-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>Code ({codeArtifacts.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="eval" className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Evaluations ({evalArtifacts.length})</span>
                  </TabsTrigger>
                </TabsList>

                {/* Specs Tab */}
                <TabsContent value="specs" className="space-y-4">
                  {specsArtifacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No specification artifacts found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {specsArtifacts.map((artifact) => (
                        <Card key={artifact.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getArtifactIcon(artifact.type)}
                                <CardTitle className="text-sm">
                                  {artifact.path.split('/').pop() || 'Specification'}
                                </CardTitle>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadArtifact(artifact)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs text-muted-foreground mb-2">
                              {new Date(artifact.created_at).toLocaleString()}
                            </div>
                            {artifact.content && (
                              <ScrollArea className="h-48 w-full border rounded">
                                <JsonTreeViewer 
                                  data={parseArtifactContent(artifact.content)} 
                                  name="spec"
                                />
                              </ScrollArea>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Code Tab */}
                <TabsContent value="code" className="space-y-4">
                  {codeArtifacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No code artifacts found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {codeArtifacts.map((artifact) => (
                        <Card key={artifact.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getArtifactIcon(artifact.type)}
                                <CardTitle className="text-sm">
                                  {artifact.path.split('/').pop() || 'Code'}
                                </CardTitle>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedArtifact(selectedArtifact?.id === artifact.id ? null : artifact)}
                                >
                                  {selectedArtifact?.id === artifact.id ? 'Deselect' : 'Select'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadArtifact(artifact)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs text-muted-foreground mb-2">
                              {new Date(artifact.created_at).toLocaleString()}
                            </div>
                            {artifact.content && (
                              <ScrollArea className="h-64 w-full border rounded">
                                <pre className="p-4 text-sm bg-gray-900 text-green-400 overflow-auto">
                                  {artifact.content}
                                </pre>
                              </ScrollArea>
                            )}
                          </CardContent>
                        </Card>
                      ))}

                      {/* Diff Viewer */}
                      {selectedArtifact && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Diff Viewer</CardTitle>
                            <CardDescription>
                              Compare different versions or artifacts
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <DiffViewer
                              original={selectedArtifact.content ? parseArtifactContent(selectedArtifact.content) : undefined}
                              modified={compareArtifact?.content ? parseArtifactContent(compareArtifact.content) : undefined}
                              originalName={selectedArtifact.path.split('/').pop()}
                              modifiedName={compareArtifact?.path.split('/').pop() || 'Select to compare'}
                            />
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Evaluations Tab */}
                <TabsContent value="eval" className="space-y-4">
                  {evalArtifacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No evaluation artifacts found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {evalArtifacts.map((artifact) => (
                        <Card key={artifact.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getArtifactIcon(artifact.type)}
                                <CardTitle className="text-sm">
                                  {artifact.path.split('/').pop() || 'Evaluation'}
                                </CardTitle>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadArtifact(artifact)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs text-muted-foreground mb-2">
                              {new Date(artifact.created_at).toLocaleString()}
                            </div>
                            {artifact.content && (
                              <ScrollArea className="h-48 w-full border rounded">
                                <JsonTreeViewer 
                                  data={parseArtifactContent(artifact.content)} 
                                  name="evaluation"
                                />
                              </ScrollArea>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}