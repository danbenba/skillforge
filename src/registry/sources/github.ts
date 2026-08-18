import { mkdtemp, rm, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { simpleGit } from 'simple-git'
import type { ScopeConfig } from '../../types/scope.js'
import type { InstallOptions, InstallResult } from '../../core/installer.js'
import { installFromPath } from '../../core/installer.js'

export interface ParsedGitUrl {
  repoUrl: string
  branch?: string
  subPath?: string
}
