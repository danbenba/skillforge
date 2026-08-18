import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateSkillset } from '../../src/core/skillset-validator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtures = (name: string) => path.join(__dirname, '..', 'fixtures', name)
