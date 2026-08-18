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
