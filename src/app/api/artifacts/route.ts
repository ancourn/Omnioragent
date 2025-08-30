import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');
    const type = searchParams.get('type');

    if (!runId) {
      return NextResponse.json({ error: 'runId is required' }, { status: 400 });
    }

    const whereClause: any = { run_id: runId };
    if (type && type !== 'all') {
      whereClause.type = type;
    }

    const artifacts = await db.artifact.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ 
      artifacts,
      success: true 
    });
  } catch (error: any) {
    console.error('Error fetching artifacts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch artifacts', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runId, type, path, content } = body;

    if (!runId || !type || !path) {
      return NextResponse.json({ 
        error: 'runId, type, and path are required' 
      }, { status: 400 });
    }

    const artifact = await db.artifact.create({
      data: {
        run_id: runId,
        type,
        path,
        content: content || null
      }
    });

    return NextResponse.json({ 
      artifact,
      success: true 
    });
  } catch (error: any) {
    console.error('Error creating artifact:', error);
    return NextResponse.json({ 
      error: 'Failed to create artifact', 
      details: error.message 
    }, { status: 500 });
  }
}