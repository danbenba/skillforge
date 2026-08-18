import { mkdtemp, rm, readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { simpleGit } from 'simple-git'
import { parseGitUrl, findSkillFolders } from './sources/github.js'
import { getSkillInstallInfo } from './sources/registry.js'
import { readServerEnv } from '../core/env.js'

export interface BundleFile {
  path: string
  size: number
  content: string | null
  status: 'inline' | 'truncated' | 'omitted' | 'binary'
}

export interface SkillBundle {
  skillName: string
  source: string
  sourceUrl: string
  skillMd: string
  files: BundleFile[]
  notes: string[]
}

export interface ResolvedSource {
  url: string
  registryName?: string
}

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.mp3',
  '.mp4',
  '.wav',
  '.bin',
])

const SKIPPED_DIRS = new Set(['.git', 'node_modules', '.skillforge'])
