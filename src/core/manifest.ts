import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import type { SkillManifest, InstalledSkill, InstalledSkillset } from '../types/manifest.js'
import type { ScopeConfig } from '../types/scope.js'

const MANIFEST_VERSION = '1'
