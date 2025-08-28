import { NextRequest, NextResponse } from 'next/server';
import { RunDB } from '@/lib/orchestrator-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Get runs with pagination
    const runs = await RunDB.list(limit, offset);
    const total = await RunDB.count();
    
    // Format response
    const formattedRuns = runs.map(run => ({
      id: run.id,
      goal: run.goal,
      status: run.status,
      startTime: run.startTime.toISOString(),
      endTime: run.endTime?.toISOString(),
      duration: run.duration,
      metadata: run.metadata ? JSON.parse(run.metadata) : null,
      logCount: run.logs?.length || 0,
      artifactCount: run.artifacts?.length || 0
    }));
    
    return NextResponse.json({
      runs: formattedRuns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error: any) {
    console.error('Error fetching runs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch runs', details: error.message },
      { status: 500 }
    );
  }
}