import { readFile, stat, readdir } from 'node:fs/promises'
import path from 'node:path'
import { parseDocument } from 'yaml'
import type { ValidationDiagnostic } from '../types/skill.js'
import type {
  SkillsetFrontmatter,
  SkillsetValidationResult,
  RemoteSkillRef,
} from '../types/skillset.js'

export const SKILLSET_SPEC_VERSION = '1.0'
const SKILLSET_MD = 'SKILLSET.md'
const MIN_DESCRIPTION_WORDS = 30

const WEIGHTS = {
  frontmatterParseable: 25,
  namePresent: 10,
  descriptionPresent: 10,
  descriptionLength: 10,
  hasSkills: 20,
  allowedSubdirs: 10,
  validSourceUrls: 15,
} as const

export async function validateSkillset(skillsetPath: string): Promise<SkillsetValidationResult> {
  const diagnostics: ValidationDiagnostic[] = []
  let score = 0

  const absPath = path.resolve(skillsetPath)

  try {
    const s = await stat(absPath)
    if (!s.isDirectory()) {
      return fatal(skillsetPath, `Path is not a directory: ${absPath}`)
    }
  } catch {
    return fatal(skillsetPath, `Path does not exist: ${absPath}`)
  }

  const skillsetMdPath = path.join(absPath, SKILLSET_MD)
  let content: string
  try {
    content = await readFile(skillsetMdPath, 'utf8')
  } catch {
    return fatal(skillsetPath, `SKILLSET.md not found in ${absPath}`)
  }

  const lines = content.split('\n')

  const { frontmatter, parseError } = extractFrontmatter(content, lines)

  if (parseError || frontmatter === null) {
    return {
      skillset: path.basename(absPath),
      score: 0,
      diagnostics: [
        {
          severity: 'error',
          line: 1,
          message: parseError ?? 'Missing YAML frontmatter: file must start with ---',
          check: 'yaml-frontmatter',
        },
      ],
      specVersion: SKILLSET_SPEC_VERSION,
      embeddedSkills: [],
      remoteSkills: [],
      passCount: 0,
      warnCount: 0,
      errorCount: 1,
    }
  }

  score += WEIGHTS.frontmatterParseable
  diagnostics.push({
    severity: 'pass',
    message: 'YAML frontmatter valid',
    check: 'yaml-frontmatter',
  })

  if (!frontmatter.name || String(frontmatter.name).trim() === '') {
    diagnostics.push({
      severity: 'error',
      message: 'Required field "name" is missing or empty',
      check: 'name-present',
    })
  } else {
    score += WEIGHTS.namePresent
    diagnostics.push({ severity: 'pass', message: 'name field present', check: 'name-present' })
  }

  if (!frontmatter.description || String(frontmatter.description).trim() === '') {
    diagnostics.push({
      severity: 'error',
      message: 'Required field "description" is missing or empty',
      check: 'description-length',
    })
  } else {
    score += WEIGHTS.descriptionPresent
    const wordCount = String(frontmatter.description).trim().split(/\s+/).length
    if (wordCount < MIN_DESCRIPTION_WORDS) {
      diagnostics.push({
        severity: 'error',
        message: `description too short (current: ${wordCount} words, recommended: ${MIN_DESCRIPTION_WORDS}+)`,
        check: 'description-length',
      })
    } else {
      score += WEIGHTS.descriptionLength
      diagnostics.push({
        severity: 'pass',
        message: `description meets length requirement (${wordCount} words)`,
        check: 'description-length',
      })
    }
  }

  const embeddedSkills = await discoverEmbeddedSkills(absPath)
  const remoteSkills: RemoteSkillRef[] = Array.isArray(frontmatter.skills)
    ? (frontmatter.skills as RemoteSkillRef[]).filter(
        (s) => s && typeof s.name === 'string' && typeof s.source_url === 'string'
      )
    : []

  if (embeddedSkills.length === 0 && remoteSkills.length === 0) {
    diagnostics.push({
      severity: 'error',
      message:
        'Skillset must contain at least one embedded skill (subdir with SKILL.md) or remote skill reference',
      check: 'has-skills',
    })
  } else {
    score += WEIGHTS.hasSkills
    diagnostics.push({
      severity: 'pass',
      message: `${embeddedSkills.length} embedded skill(s), ${remoteSkills.length} remote reference(s)`,
      check: 'has-skills',
    })
  }

  const unknownDirs = await checkUnknownDirs(absPath, embeddedSkills)
  if (unknownDirs.length > 0) {
    for (const dir of unknownDirs) {
      diagnostics.push({
        severity: 'warning',
        message: `Unknown subdirectory "${dir}": only embedded skill dirs (with SKILL.md) and assets/ are allowed`,
        check: 'allowed-subdirs',
      })
    }
    const deduction = Math.min(WEIGHTS.allowedSubdirs, unknownDirs.length * 3)
    score += Math.max(0, WEIGHTS.allowedSubdirs - deduction)
  } else {
    score += WEIGHTS.allowedSubdirs
    diagnostics.push({
      severity: 'pass',
      message: 'Folder structure matches convention',
      check: 'allowed-subdirs',
    })
  }

  if (remoteSkills.length === 0) {
    score += WEIGHTS.validSourceUrls
    diagnostics.push({
      severity: 'pass',
      message: 'No remote skill references to validate',
      check: 'valid-source-urls',
    })
  } else {
    const invalidRefs = remoteSkills.filter((s) => !isValidGitHubUrl(s.source_url))
    if (invalidRefs.length > 0) {
      for (const ref of invalidRefs) {
        diagnostics.push({
          severity: 'error',
          message: `Remote skill "${ref.name}" has invalid source_url: "${ref.source_url}": must be a GitHub URL`,
          check: 'valid-source-urls',
        })
      }
    } else {
      score += WEIGHTS.validSourceUrls
      diagnostics.push({
        severity: 'pass',
        message: `All ${remoteSkills.length} remote source URL(s) are valid`,
        check: 'valid-source-urls',
      })
    }
  }

  score = Math.min(100, Math.max(0, Math.round(score)))

  return {
    skillset: path.basename(absPath),
    score,
    diagnostics,
    specVersion: SKILLSET_SPEC_VERSION,
    embeddedSkills,
    remoteSkills,
    passCount: diagnostics.filter((d) => d.severity === 'pass').length,
    warnCount: diagnostics.filter((d) => d.severity === 'warning').length,
    errorCount: diagnostics.filter((d) => d.severity === 'error').length,
  }
}

function fatal(skillsetPath: string, message: string): SkillsetValidationResult {
  return {
    skillset: path.basename(skillsetPath),
    score: 0,
    diagnostics: [{ severity: 'error', message, check: 'skillset-exists' }],
    specVersion: SKILLSET_SPEC_VERSION,
    embeddedSkills: [],
    remoteSkills: [],
    passCount: 0,
    warnCount: 0,
    errorCount: 1,
  }
}

interface FrontmatterResult {
  frontmatter: SkillsetFrontmatter | null
  parseError: string | null
}
