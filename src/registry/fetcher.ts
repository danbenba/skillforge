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
