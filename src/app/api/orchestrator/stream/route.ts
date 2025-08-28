import { NextRequest } from 'next/server';
import { RunDB, LogDB } from '@/lib/orchestrator-db';

// Global active runs storage (shared with orchestrator route)
const activeRuns = new Map<string, any>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');
  
  if (!runId) {
    return new Response('Run ID is required', { status: 400 });
  }
  
  // Set up SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial connection message
        const initMessage = {
          type: 'connected',
          message: 'Stream connected',
          timestamp: new Date().toISOString()
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initMessage)}\n\n`));
        
        // Send existing logs for this run
        const existingLogs = await LogDB.findByRun(runId);
        for (const log of existingLogs) {
          const logMessage = {
            type: 'log',
            data: {
              step: log.step,
              status: log.status,
              message: log.message,
              timestamp: log.timestamp.toISOString()
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(logMessage)}\n\n`));
        }
        
        // Set up interval for new logs
        const interval = setInterval(async () => {
          try {
            // Get recent logs
            const recentLogs = await LogDB.findRecent(runId, 5);
            
            // Send new logs
            for (const log of recentLogs) {
              const logMessage = {
                type: 'log',
                data: {
                  step: log.step,
                  status: log.status,
                  message: log.message,
                  timestamp: log.timestamp.toISOString()
                }
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(logMessage)}\n\n`));
            }
            
            // Check if run is completed
            const run = await RunDB.findById(runId);
            if (run && (run.status === 'completed' || run.status === 'failed')) {
              const completionMessage = {
                type: 'completed',
                data: {
                  status: run.status,
                  endTime: run.endTime?.toISOString(),
                  duration: run.duration
                }
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionMessage)}\n\n`));
              
              // Close the stream
              clearInterval(interval);
              controller.close();
            }
          } catch (error) {
            console.error('Error in SSE stream:', error);
            const errorMessage = {
              type: 'error',
              message: 'Error streaming logs'
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
          }
        }, 1000); // Check every second
        
        // Clean up on disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
        
      } catch (error) {
        console.error('Error setting up SSE stream:', error);
        const errorMessage = {
          type: 'error',
          message: 'Failed to set up stream'
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`));
        controller.close();
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}