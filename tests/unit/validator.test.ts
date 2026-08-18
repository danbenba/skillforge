import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateSkill } from '../../src/core/validator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
