import chalk from 'chalk'
import ora from 'ora'
import { searchRegistry } from '../../registry/sources/registry.js'
import { printJson, printError, printInfo } from '../ui/output.js'
import type { RegistrySkill } from '../../registry/sources/registry.js'

function tierBadge(tier: RegistrySkill['trust_tier']): string {
  return tier === 'verified' ? chalk.blue('[verified]') : chalk.dim('[community]')
}
