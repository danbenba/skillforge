import { readFile, stat, readdir } from 'node:fs/promises'
import path from 'node:path'
import { parseDocument } from 'yaml'
import type { ValidationResult, ValidationDiagnostic, SkillFrontmatter } from '../types/skill.js'

export const SPEC_VERSION = '1.0'
const SKILL_MD = 'SKILL.md'
const ALLOWED_SUBDIRS = new Set(['scripts', 'references', 'assets'])
