import { readFile, stat, readdir } from 'node:fs/promises'
import path from 'node:path'
import { parseDocument } from 'yaml'
import type { ValidationResult, ValidationDiagnostic, SkillFrontmatter } from '../types/skill.js'

export const SPEC_VERSION = '1.0'
const SKILL_MD = 'SKILL.md'
const ALLOWED_SUBDIRS = new Set(['scripts', 'references', 'assets'])
const MAX_LINES = 500
const WARN_LINES = 400
const MIN_DESCRIPTION_WORDS = 30
const MAX_DESCRIPTION_CHARS = 1024

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const RESERVED_NAME_WORDS = ['claude', 'anthropic']

const WEIGHTS = {
  frontmatterParseable: 16,
  namePresent: 16,
  nameFormat: 11,
  descriptionPresent: 16,
  descriptionLength: 6,
  descriptionFormat: 11,
  lineCount: 7,
  allowedSubdirs: 4,
  noReadme: 4,
  referencedResourcesExist: 7,
  bundledResourcesCorrect: 2,
} as const
