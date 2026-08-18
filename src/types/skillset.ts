import type { ValidationDiagnostic } from './skill.js'

export interface RemoteSkillRef {
  name: string
  source_url: string
}

export interface SkillsetFrontmatter {
  name: string
  description: string
  version?: string
  tags?: string[]
  author?: string
  spec_version?: string
  skills?: RemoteSkillRef[]
}
