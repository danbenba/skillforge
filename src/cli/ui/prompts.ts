import { select, confirm, input } from '@inquirer/prompts'
import chalk from 'chalk'
import type { SuggestionProposal } from '../../core/suggest-agent.js'
import type { ScopeLevel } from '../../types/scope.js'

export interface ApprovedSkill {
  proposal: SuggestionProposal
  scope: ScopeLevel
}
