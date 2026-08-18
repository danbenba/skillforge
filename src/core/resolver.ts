import { stat, readdir } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import type { ScopeLevel, ScopeConfig } from '../types/scope.js'

const SKILLFORGE_DIR = '.skillforge'
const MANIFEST_FILE = 'skillforge.json'
const SKILLS_DIR = 'skills'
const SKILLSETS_DIR = 'skillsets'

function globalBase(): string {
  return path.join(os.homedir(), '.skillforge', 'global')
}

function sharedBase(): string {
  return path.join(os.homedir(), '.skillforge', 'shared')
}

function makeScopeConfig(level: ScopeLevel, rootPath: string): ScopeConfig {
  return {
    level,
    rootPath,
    manifestPath: path.join(rootPath, MANIFEST_FILE),
    skillsDir: path.join(rootPath, SKILLS_DIR),
    skillsetsDir: path.join(rootPath, SKILLSETS_DIR),
  }
}

export async function resolveScope(level: ScopeLevel, cwd?: string): Promise<ScopeConfig> {
  switch (level) {
    case 'global':
      return makeScopeConfig('global', globalBase())
    case 'shared':
      return makeScopeConfig('shared', sharedBase())
    case 'project': {
      const projectRoot = await findProjectRoot(cwd ?? process.cwd())
      return makeScopeConfig('project', path.join(projectRoot, SKILLFORGE_DIR))
    }
  }
}

export async function resolveAllScopes(cwd?: string): Promise<ScopeConfig[]> {
  return Promise.all([
    resolveScope('global', cwd),
    resolveScope('shared', cwd),
    resolveScope('project', cwd),
  ])
}
