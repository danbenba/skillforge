import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import type { SkillManifest, InstalledSkill, InstalledSkillset } from '../types/manifest.js'
import type { ScopeConfig } from '../types/scope.js'

const MANIFEST_VERSION = '1'

const InstalledSkillSchema = z.object({
  name: z.string(),
  version: z.string(),
  source: z.enum(['official', 'community', 'local']),
  sourceUrl: z.string().optional(),
  installedAt: z.string(),
  specVersion: z.string(),
  score: z.number(),
  path: z.string(),
})

const InstalledSkillsetSchema = z.object({
  name: z.string(),
  version: z.string(),
  source: z.enum(['official', 'community', 'local']),
  sourceUrl: z.string().optional(),
  installedAt: z.string(),
  specVersion: z.string(),
  score: z.number(),
  path: z.string(),
  embeddedSkills: z.array(z.string()),
  remoteSkills: z.array(z.string()),
})

const SkillManifestSchema = z.object({
  skillforgeVersion: z.string(),
  scope: z.enum(['global', 'shared', 'project']),
  skills: z.record(InstalledSkillSchema),
  skillsets: z.record(InstalledSkillsetSchema).default({}),
  updatedAt: z.string(),
})

export function createEmptyManifest(scope: SkillManifest['scope']): SkillManifest {
  return {
    skillforgeVersion: MANIFEST_VERSION,
    scope,
    skills: {},
    skillsets: {},
    updatedAt: new Date().toISOString(),
  }
}

export async function readManifest(scopeConfig: ScopeConfig): Promise<SkillManifest> {
  try {
    const raw = await readFile(scopeConfig.manifestPath, 'utf8')
    const parsed = JSON.parse(raw)
    return SkillManifestSchema.parse(parsed) as SkillManifest
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return createEmptyManifest(scopeConfig.level)
    }
    throw new Error(
      `Failed to read manifest at ${scopeConfig.manifestPath}: ${e instanceof Error ? e.message : String(e)}`
    )
  }
}
