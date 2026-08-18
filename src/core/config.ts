import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

export interface SkillForgeConfig {
  registryUrl?: string
  token?: string
  anthropicApiKey?: string
  defaultScope?: 'global' | 'shared' | 'project'
}

function getConfigPath(): string {
  return path.join(os.homedir(), '.skillforge', 'config.json')
}

export async function readConfig(): Promise<SkillForgeConfig> {
  try {
    const raw = await readFile(getConfigPath(), 'utf8')
    return JSON.parse(raw) as SkillForgeConfig
  } catch {
    return {}
  }
}
