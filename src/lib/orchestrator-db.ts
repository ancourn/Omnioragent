import { db } from './db'

// Types for our orchestrator models
export interface RunData {
  id: string
  goal: string
  status: 'running' | 'completed' | 'failed'
  startTime: Date
  endTime?: Date
  duration?: number
  metadata?: string
  createdAt: Date
  updatedAt: Date
}

export interface LogData {
  id: string
  runId: string
  step: string
  status: 'ok' | 'fail' | 'running'
  message: string
  timestamp: Date
}

export interface ArtifactData {
  id: string
  runId: string
  name: string
  type: string
  content?: string
  filePath?: string
  size?: number
  createdAt: Date
}

// Database operations for Runs
export class RunDB {
  static async create(goal: string): Promise<RunData> {
    const run = await db.run.create({
      data: {
        goal,
        status: 'running',
        metadata: JSON.stringify({
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        })
      }
    })
    return run as RunData
  }

  static async findById(id: string): Promise<RunData | null> {
    const run = await db.run.findUnique({
      where: { id },
      include: {
        logs: true,
        artifacts: true
      }
    })
    return run as RunData | null
  }

  static async updateStatus(id: string, status: 'completed' | 'failed', endTime?: Date): Promise<RunData> {
    const run = await db.run.update({
      where: { id },
      data: {
        status,
        endTime: endTime || new Date(),
        duration: endTime ? Math.floor(endTime.getTime() - (await db.run.findUnique({ where: { id } }))!.startTime.getTime()) : undefined
      }
    })
    return run as RunData
  }

  static async list(limit: number = 50, offset: number = 0): Promise<RunData[]> {
    const runs = await db.run.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        logs: {
          orderBy: { timestamp: 'asc' },
          take: 1 // Just the first log for preview
        },
        artifacts: {
          take: 5 // First 5 artifacts for preview
        }
      }
    })
    return runs as RunData[]
  }

  static async count(): Promise<number> {
    return await db.run.count()
  }
}

// Database operations for Logs
export class LogDB {
  static async create(runId: string, step: string, status: 'ok' | 'fail' | 'running', message: string): Promise<LogData> {
    const log = await db.log.create({
      data: {
        runId,
        step,
        status,
        message
      }
    })
    return log as LogData
  }

  static async findByRun(runId: string): Promise<LogData[]> {
    const logs = await db.log.findMany({
      where: { runId },
      orderBy: { timestamp: 'asc' }
    })
    return logs as LogData[]
  }

  static async findRecent(runId: string, limit: number = 10): Promise<LogData[]> {
    const logs = await db.log.findMany({
      where: { runId },
      orderBy: { timestamp: 'desc' },
      take: limit
    })
    return logs as LogData[]
  }
}

// Database operations for Artifacts
export class ArtifactDB {
  static async create(runId: string, name: string, type: string, content?: string, filePath?: string): Promise<ArtifactData> {
    const artifact = await db.artifact.create({
      data: {
        runId,
        name,
        type,
        content,
        filePath,
        size: content ? content.length : undefined
      }
    })
    return artifact as ArtifactData
  }

  static async findByRun(runId: string): Promise<ArtifactData[]> {
    const artifacts = await db.artifact.findMany({
      where: { runId },
      orderBy: { createdAt: 'asc' }
    })
    return artifacts as ArtifactData[]
  }

  static async findByName(runId: string, name: string): Promise<ArtifactData | null> {
    const artifact = await db.artifact.findFirst({
      where: {
        runId,
        name
      }
    })
    return artifact as ArtifactData | null
  }
}

// Helper function to create a complete run with logs and artifacts
export async function createRunWithData(goal: string, logs: any[], artifacts: any[]): Promise<RunData> {
  // Create the run
  const run = await RunDB.create(goal)
  
  // Create logs
  for (const log of logs) {
    await LogDB.create(run.id, log.step, log.status, log.message || log.note || '')
  }
  
  // Create artifacts
  for (const artifact of artifacts) {
    await ArtifactDB.create(
      run.id,
      artifact.name,
      artifact.type || 'json',
      artifact.content,
      artifact.filePath
    )
  }
  
  // Update run status to completed
  await RunDB.updateStatus(run.id, 'completed')
  
  return run
}