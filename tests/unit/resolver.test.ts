import { describe, it, expect } from 'vitest'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { findProjectRoot, resolveScope } from '../../src/core/resolver.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
