import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import type { ScopeLevel } from '../types/scope.js'

export interface SuggestionProposal {
  skillName: string
  reason: string
  suggestedScope: ScopeLevel
  available: boolean
}

export async function gatherProjectContext(projectRoot: string): Promise<string> {
  const parts: string[] = []

  for (const name of ['README.md', 'README.txt', 'readme.md']) {
    try {
      const content = await readFile(path.join(projectRoot, name), 'utf8')
      const excerpt = content.split('\n').slice(0, 100).join('\n')
      parts.push(`## README (first 100 lines)\n${excerpt}`)
      break
    } catch {}
  }

  try {
    const pkgRaw = await readFile(path.join(projectRoot, 'package.json'), 'utf8')
    const pkg = JSON.parse(pkgRaw)
    const summary = {
      name: pkg.name,
      description: pkg.description,
      scripts: pkg.scripts,
      dependencies: Object.keys(pkg.dependencies ?? {}),
      devDependencies: Object.keys(pkg.devDependencies ?? {}),
    }
    parts.push(`## package.json summary\n${JSON.stringify(summary, null, 2)}`)
  } catch {}

  try {
    const claudeDir = path.join(projectRoot, '.claude')
    const entries = await readdir(claudeDir)
    parts.push(`## .claude/ directory\n${entries.join('\n')}`)
  } catch {}

  try {
    const manifestPath = path.join(projectRoot, '.skillforge', 'skillforge.json')
    const manifestRaw = await readFile(manifestPath, 'utf8')
    const manifest = JSON.parse(manifestRaw)
    const installedNames = Object.keys(manifest.skills ?? {})
    if (installedNames.length > 0) {
      parts.push(`## Already installed skills\n${installedNames.join(', ')}`)
    }
  } catch {}

  return parts.join('\n\n')
}
