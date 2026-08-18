import chalk from 'chalk'
import ora from 'ora'
import { searchRegistry } from '../../registry/sources/registry.js'
import { printJson, printError, printInfo } from '../ui/output.js'
import type { RegistrySkill } from '../../registry/sources/registry.js'

function tierBadge(tier: RegistrySkill['trust_tier']): string {
  return tier === 'verified' ? chalk.blue('[verified]') : chalk.dim('[community]')
}

function scoreLabel(score: number | null): string {
  if (score === null) return chalk.dim('no score')
  if (score >= 80) return chalk.green(`${score}/100`)
  if (score >= 50) return chalk.yellow(`${score}/100`)
  return chalk.red(`${score}/100`)
}
