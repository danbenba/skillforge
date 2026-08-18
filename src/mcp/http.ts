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

export async function startHttpServer(): Promise<void> {
  const env = readServerEnv()
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
  const { version } = require('../../package.json') as { version: string }
  const assetsDir = await findAssetsDir()

  const app = express()
  app.disable('x-powered-by')
  app.use(cors)
  app.use(express.json({ limit: '4mb' }))

  if (env.mode === 'dev') {
    app.use((req, _res, next) => {
      console.error(`[skillforge] ${req.method} ${req.path}`)
      next()
    })
  }

  app.options('/mcp', (_req, res) => {
    res.sendStatus(204)
  })

  app.post('/mcp', requireAuth(env), async (req: Request, res: Response) => {
    try {
      const server = await buildServer('remote')
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      })
      res.on('close', () => {
        void transport.close()
        void server.close()
      })
      await server.connect(transport)
      await transport.handleRequest(req, res, req.body)
    } catch (error) {
      if (env.mode === 'dev') console.error('[skillforge] request failed:', error)
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        })
      }
    }
  })

  app.get('/mcp', methodNotAllowed)
  app.delete('/mcp', methodNotAllowed)

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', name: 'skillforge', version, mode: env.mode })
  })

  app.get('/logo.svg', async (_req, res) => {
    if (!assetsDir) {
      res.status(404).end()
      return
    }
    const svg = await readFile(path.join(assetsDir, 'logo.svg'), 'utf8')
    res.type('image/svg+xml').send(svg)
  })

  const iconRoutes: Array<[string, string, string]> = [
    ['/favicon.ico', 'favicon.ico', 'image/x-icon'],
    ['/favicon-192.png', 'favicon-192.png', 'image/png'],
    ['/apple-touch-icon.png', 'apple-touch-icon.png', 'image/png'],
  ]
  for (const [route, fileName, mime] of iconRoutes) {
    app.get(route, async (_req, res) => {
      if (!assetsDir) {
        res.status(404).end()
        return
      }
      const data = await readFile(path.join(assetsDir, fileName))
      res.type(mime).send(data)
    })
  }

  app.get('/', (_req, res) => {
    res.type('html').send(landingPage(env, version))
  })

  app.listen(env.port, env.host, () => {
    console.error(
      `[skillforge] ${env.mode} server listening on http://${env.host}:${env.port}: public URL ${env.publicUrl}/mcp`
    )
  })
}
