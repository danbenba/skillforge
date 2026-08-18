import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createRequire } from 'node:module'
import { registerCatalogTools } from './catalog.js'
import { registerGuideTool } from './guide.js'
import { registerLocalTools } from './local.js'
import { registerSkillResources } from './resources.js'
import { shortInstructions } from './instructions.js'
import { readServerEnv } from '../core/env.js'

const require = createRequire(import.meta.url)
const { version } = require('../../package.json') as { version: string }

export type ServerMode = 'local' | 'remote'
