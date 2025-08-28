import { NextRequest, NextResponse } from 'next/server';
import { RunDB, LogDB, ArtifactDB } from '@/lib/orchestrator-db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get run with full details
    const run = await RunDB.findById(id);
    
    if (!run) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      );
    }
    
    // Get logs and artifacts
    const logs = await LogDB.findByRun(id);
    const artifacts = await ArtifactDB.findByRun(id);
    
    // Format response
    const formattedRun = {
      id: run.id,
      goal: run.goal,
      status: run.status,
      startTime: run.startTime.toISOString(),
      endTime: run.endTime?.toISOString(),
      duration: run.duration,
      metadata: run.metadata ? JSON.parse(run.metadata) : null,
      logs: logs.map(log => ({
        id: log.id,
        step: log.step,
        status: log.status,
        message: log.message,
        timestamp: log.timestamp.toISOString()
      })),
      artifacts: artifacts.map(artifact => ({
        id: artifact.id,
        name: artifact.name,
        type: artifact.type,
        content: artifact.content,
        filePath: artifact.filePath,
        size: artifact.size,
        createdAt: artifact.createdAt.toISOString()
      }))
    };
    
    return NextResponse.json(formattedRun);
  } catch (error: any) {
    console.error('Error fetching run:', error);
    return NextResponse.json(
      { error: 'Failed to fetch run', details: error.message },
      { status: 500 }
    );
  }
}