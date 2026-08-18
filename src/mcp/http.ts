import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { buildServer } from './server.js'
import { readServerEnv, type ServerEnv } from '../core/env.js'

async function findAssetsDir(): Promise<string | null> {
  let dir = path.dirname(fileURLToPath(import.meta.url))
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'assets')
    try {
      await stat(path.join(candidate, 'logo.svg'))
      return candidate
    } catch {}
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

function cors(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID'
  )
  res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id')
  next()
}

function requireAuth(env: ServerEnv) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!env.authToken) {
      next()
      return
    }
    const header = req.headers.authorization ?? ''
    if (header === `Bearer ${env.authToken}`) {
      next()
      return
    }
    res.status(401).json({
      jsonrpc: '2.0',
      error: { code: -32001, message: 'Unauthorized: missing or invalid bearer token' },
      id: null,
    })
  }
}

function methodNotAllowed(_req: Request, res: Response): void {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed. Use POST for MCP requests.' },
    id: null,
  })
}
