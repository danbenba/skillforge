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

export async function resolveSource(source: string): Promise<ResolvedSource> {
  if (source.startsWith('git+')) return { url: source }
  if (source.includes('://')) return { url: `git+${source}` }
  const info = await getSkillInstallInfo(source)
  return { url: `git+${info.source_url}`, registryName: info.name }
}

export async function withClonedSource<T>(
  source: string,
  fn: (skillFolder: string, resolved: ResolvedSource) => Promise<T>
): Promise<T> {
  const resolved = await resolveSource(source)
  const parsed = parseGitUrl(resolved.url)
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'skillforge-fetch-'))
  try {
    const git = simpleGit()
    const cloneOpts = parsed.branch
      ? ['--branch', parsed.branch, '--depth', '1']
      : ['--depth', '1']
    await git.clone(parsed.repoUrl, tmpDir, cloneOpts)
    const searchRoot = parsed.subPath ? path.join(tmpDir, parsed.subPath) : tmpDir
    const folders = await findSkillFolders(searchRoot)
    if (folders.length === 0) {
      throw new Error(`No skill folders (directories with SKILL.md) found in ${resolved.url}`)
    }
    let folder = folders[0]
    if (resolved.registryName) {
      folder = folders.find((f) => path.basename(f) === resolved.registryName) ?? folders[0]
    }
    return await fn(folder, resolved)
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}

async function walkFiles(root: string): Promise<string[]> {
  const out: string[] = []
  async function visit(dir: string): Promise<void> {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (SKIPPED_DIRS.has(entry.name)) continue
      const p = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await visit(p)
      } else if (entry.isFile()) {
        out.push(p)
      }
    }
  }
  await visit(root)
  return out.sort()
}
