import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface LogEntry {
  time: string;
  step: string;
  status: string;
  note: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const logPath = searchParams.get('path');
    
    if (!logPath) {
      return NextResponse.json({ error: 'Log path is required' }, { status: 400 });
    }
    
    // Security: Ensure the path is within the workspace directory
    const workspacePath = path.join(process.cwd(), 'workspace');
    const fullPath = path.resolve(logPath);
    
    if (!fullPath.startsWith(workspacePath)) {
      return NextResponse.json({ error: 'Invalid log path' }, { status: 403 });
    }
    
    // Read the log file
    const logContent = await fs.readFile(fullPath, 'utf-8');
    const logs: LogEntry[] = JSON.parse(logContent);
    
    // Extract run path from log file path
    const runPath = path.dirname(fullPath);
    
    return NextResponse.json({ 
      logs, 
      runPath,
      success: true 
    });
  } catch (error: any) {
    console.error('Error loading logs:', error);
    return NextResponse.json({ 
      error: 'Failed to load logs', 
      details: error.message 
    }, { status: 500 });
  }
}