import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');

  if (!runId) {
    return new Response('runId is required', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      const data = {
        type: 'connected',
        message: 'Connected to log stream',
        runId,
        timestamp: new Date().toISOString()
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      // Function to send logs from database
      const sendLogsFromDb = async () => {
        try {
          // Get existing logs for this run
          const logs = await db.log.findMany({
            where: { run_id: runId },
            orderBy: { timestamp: 'asc' }
          });

          // Send each log as an event
          for (const log of logs) {
            const event = {
              type: 'log',
              step: log.step,
              status: log.status,
              message: log.message,
              timestamp: log.timestamp.toISOString()
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }

          // Get run status
          const run = await db.run.findUnique({
            where: { id: runId }
          });

          if (run && (run.status === 'completed' || run.status === 'failed')) {
            const completionEvent = {
              type: 'complete',
              status: run.status,
              message: run.summary || `Pipeline ${run.status}`,
              timestamp: run.finished_at?.toISOString() || new Date().toISOString()
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionEvent)}\n\n`));
          }
        } catch (error) {
          console.error('Error fetching logs from database:', error);
        }
      };

      // Send existing logs immediately
      await sendLogsFromDb();

      // Set up polling for new logs
      let lastTimestamp = new Date();
      
      const pollForNewLogs = async () => {
        try {
          // Check if run is completed
          const run = await db.run.findUnique({
            where: { id: runId }
          });

          if (run && (run.status === 'completed' || run.status === 'failed')) {
            // Send completion event and stop polling
            const completionEvent = {
              type: 'complete',
              status: run.status,
              message: run.summary || `Pipeline ${run.status}`,
              timestamp: run.finished_at?.toISOString() || new Date().toISOString()
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionEvent)}\n\n`));
            return;
          }

          // Get new logs since last check
          const newLogs = await db.log.findMany({
            where: { 
              run_id: runId,
              timestamp: { gt: lastTimestamp }
            },
            orderBy: { timestamp: 'asc' }
          });

          // Send new logs
          for (const log of newLogs) {
            const event = {
              type: 'log',
              step: log.step,
              status: log.status,
              message: log.message,
              timestamp: log.timestamp.toISOString()
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            
            // Update last timestamp
            if (log.timestamp > lastTimestamp) {
              lastTimestamp = log.timestamp;
            }
          }

          // Schedule next poll
          setTimeout(pollForNewLogs, 1000);
        } catch (error) {
          console.error('Error polling for new logs:', error);
          
          // Send heartbeat and continue polling
          const heartbeat = {
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(heartbeat)}\n\n`));
          
          setTimeout(pollForNewLogs, 5000);
        }
      };

      // Start polling for new logs
      setTimeout(pollForNewLogs, 1000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        controller.close();
      });
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