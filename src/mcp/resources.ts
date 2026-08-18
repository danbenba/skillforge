import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { searchRegistry } from '../registry/sources/registry.js'
import { fetchSkillBundle, fetchSkillFile } from '../registry/fetcher.js'
import { skillsShApiDoc } from './instructions.js'

export function registerSkillResources(server: McpServer): void {
  server.resource(
    'skills-sh-api-reference',
    'skillforge://docs/skills-sh-api',
    {
      description:
        'REQUIRED READING before any call to the skills.sh API: bundled reference of https://www.skills.sh/docs/api (authentication, endpoints, rate limits, response shapes)',
      mimeType: 'text/markdown',
      annotations: { audience: ['assistant'], priority: 1 },
    },
    async (uri) => {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: await skillsShApiDoc(),
          },
        ],
      }
    }
  )

  server.resource(
    'skill-index',
    'skill://index.json',
    {
      description:
        'SEP-2640 discovery document: the most installed skills of the SkillForge registry',
      mimeType: 'application/json',
    },
    async (uri) => {
      const result = await searchRegistry({ sort: 'installs', limit: 50 })
      const skills = result.skills.map((s) => ({
        name: s.name,
        description: s.description,
        files: [`skill://${s.name}/SKILL.md`],
      }))
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({ skills }, null, 2),
          },
        ],
      }
    }
  )

  server.resource(
    'skill-file',
    new ResourceTemplate('skill://{name}/{+path}', { list: undefined }),
    {
      description:
        'Any file of a registry skill, served per SEP-2640 (skill://<name>/SKILL.md and auxiliary files)',
    },
    async (uri, variables) => {
      const name = String(variables.name)
      const filePath = String(variables.path)
      if (filePath === 'SKILL.md') {
        const bundle = await fetchSkillBundle(name, [])
        return {
          contents: [{ uri: uri.href, mimeType: 'text/markdown', text: bundle.skillMd }],
        }
      }
      const file = await fetchSkillFile(name, filePath)
      if (file.content === null) {
        throw new Error(`File "${filePath}" of skill "${name}" is binary or too large to serve`)
      }
      return {
        contents: [{ uri: uri.href, mimeType: 'text/plain', text: file.content }],
      }
    }
  )
}
