import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import type { ScopeLevel } from '../types/scope.js'

export interface SuggestionProposal {
  skillName: string
  reason: string
  suggestedScope: ScopeLevel
  available: boolean
}
