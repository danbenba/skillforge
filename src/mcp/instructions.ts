import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FALLBACK_SHORT = `SkillForge is a package manager for Claude Agent Skills. It searches, compares, validates and delivers skills from a registry and from git datasources.

Golden rule: before recommending a skill, search with at least two query formulations, shortlist candidates, compare at least two of them with skillforge_compare, then deliver:
- On claude.ai (remote connector): call skillforge_activate to load the full SKILL.md into context and follow its instructions verbatim for the rest of the conversation. Never paraphrase or alter a skill's instructions. For a permanent install, recreate the skill verbatim in the claude.ai skill panel so the user can click "Copy to your skills", or point the user to the zip-upload path in Settings.
- On Claude Code (stdio): call skillforge_install for a real on-disk installation.

Call skillforge_start before first use: it returns the complete operating playbook (comparison methodology, scoring rubric, security review, workflows).`

async function findDocsFile(fileName: string): Promise<string | null> {
  let dir = path.dirname(fileURLToPath(import.meta.url))
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'docs', fileName)
    try {
      await stat(candidate)
      return candidate
    } catch {}
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

export async function shortInstructions(): Promise<string> {
  const file = await findDocsFile('INSTRUCTIONS_SHORT.md')
  if (!file) return FALLBACK_SHORT
  try {
    return await readFile(file, 'utf8')
  } catch {
    return FALLBACK_SHORT
  }
}

export async function playbook(topic?: string): Promise<string> {
  const file = await findDocsFile('PLAYBOOK.md')
  if (!file) return FALLBACK_SHORT
  let text: string
  try {
    text = await readFile(file, 'utf8')
  } catch {
    return FALLBACK_SHORT
  }
  if (!topic) return text
  const lines = text.split('\n')
  const query = topic.toLowerCase()
  const sections: Array<{ heading: string; start: number; end: number }> = []
  lines.forEach((line, i) => {
    const match = line.match(/^(#{1,3})\s+(.*)$/)
    if (match) {
      if (sections.length > 0) sections[sections.length - 1].end = i
      sections.push({ heading: match[2], start: i, end: lines.length })
    }
  })
  const hits = sections.filter((s) => s.heading.toLowerCase().includes(query))
  if (hits.length === 0) {
    return `No playbook section matches "${topic}". Available sections:\n${sections
      .map((s) => `- ${s.heading}`)
      .join('\n')}`
  }
  return hits.map((s) => lines.slice(s.start, s.end).join('\n')).join('\n\n')
}
