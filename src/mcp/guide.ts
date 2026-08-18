import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { playbook } from './instructions.js'

export function registerGuideTool(server: McpServer): void {
  server.tool(
    'skillforge_start',
    'START HERE: call this once at the beginning of any session before using other SkillForge tools. Returns the complete SkillForge operating playbook: the skill selection funnel, the weighted comparison rubric, the mandatory security review, the virtual-install workflow for claude.ai, the real-install workflow for Claude Code, and error handling. Optionally pass a topic (e.g. "comparison", "security", "workflows") to get only the matching sections.',
    {
      topic: z
        .string()
        .optional()
        .describe('Optional section filter: a word from a playbook heading'),
    },
    async ({ topic }) => {
      const text = await playbook(topic)
      return {
        content: [{ type: 'text', text }],
      }
    }
  )
}
