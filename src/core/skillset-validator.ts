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
