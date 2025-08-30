import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    const runs = await db.run.findMany({
      orderBy: { started_at: 'desc' },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: {
            logs: true,
            artifacts: true
          }
        }
      }
    });

    const total = await db.run.count();

    return NextResponse.json({ 
      runs,
      total,
      limit,
      offset,
      success: true 
    });
  } catch (error: any) {
    console.error('Error fetching runs:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch runs', 
      details: error.message 
    }, { status: 500 });
  }
}