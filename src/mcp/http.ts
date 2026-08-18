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

function landingPage(env: ServerEnv, version: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SkillForge, the MCP skill manager for Claude</title>
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="icon" type="image/svg+xml" href="/logo.svg">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<style>
:root { color-scheme: light dark; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; display: grid; place-items: center; min-height: 100vh; background: #0d0f14; color: #e8eaf0; }
main { text-align: center; padding: 48px 24px; max-width: 620px; }
img { width: 112px; height: 112px; }
h1 { font-size: 2rem; margin: 20px 0 8px; letter-spacing: -0.02em; }
p { color: #9aa3b2; line-height: 1.6; }
code { background: #1a1e28; border: 1px solid #2a3040; border-radius: 6px; padding: 3px 8px; color: #7ee0a3; font-size: 0.9em; }
.badge { display: inline-block; margin-top: 18px; font-size: 0.8rem; color: #6b7484; }
</style>
</head>
<body>
<main>
<img src="/logo.svg" alt="SkillForge logo">
<h1>SkillForge</h1>
<p>Search, compare and install Claude Agent Skills from claude.ai or Claude Code.</p>
<p>Add this server to claude.ai as a custom connector:<br><code>${env.publicUrl}/mcp</code></p>
<p class="badge">v${version} · ${env.mode} · MCP Streamable HTTP</p>
</main>
</body>
</html>`
}
