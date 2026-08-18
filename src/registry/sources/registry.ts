async function getRegistryBase(): Promise<string> {
  try {
    const { getConfigValue } = await import('../../core/config.js')
    return (await getConfigValue('registryUrl')) ?? 'https://skilldex-registry.vercel.app/v1'
  } catch {
    return process.env.SKILLFORGE_REGISTRY_URL ?? 'https://skilldex-registry.vercel.app/v1'
  }
}

export interface RegistrySkill {
  name: string
  description: string
  author: string | null
  source_url: string
  trust_tier: 'verified' | 'community'
  score: number | null
  spec_version: string
  tags: string[]
  install_count: number
  published_at: string
}

export interface SearchOptions {
  q?: string
  tier?: 'verified' | 'community'
  min_score?: number
  spec_version?: string
  tags?: string
  sort?: 'installs' | 'score' | 'recent' | 'name'
  limit?: number
  offset?: number
}

export interface SearchResponse {
  skills: RegistrySkill[]
  total: number
  limit: number
  offset: number
}
