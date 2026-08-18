import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { searchRegistry } from '../registry/sources/registry.js'
import { fetchSkillBundle, fetchSkillFile } from '../registry/fetcher.js'

export function registerSkillResources(server: McpServer): void {
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
