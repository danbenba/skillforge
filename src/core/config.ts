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

export async function writeConfig(config: SkillForgeConfig): Promise<void> {
  const configPath = getConfigPath()
  await mkdir(path.dirname(configPath), { recursive: true })
  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8')
}

export async function getConfigValue<K extends keyof SkillForgeConfig>(
  key: K
): Promise<SkillForgeConfig[K] | undefined> {
  const envMap: Record<keyof SkillForgeConfig, string> = {
    registryUrl: 'SKILLFORGE_REGISTRY_URL',
    token: 'SKILLFORGE_TOKEN',
    anthropicApiKey: 'ANTHROPIC_API_KEY',
    defaultScope: 'SKILLFORGE_DEFAULT_SCOPE',
  }

  const envVal = process.env[envMap[key]]
  if (envVal !== undefined) return envVal as SkillForgeConfig[K]

  const config = await readConfig()
  return config[key]
}
