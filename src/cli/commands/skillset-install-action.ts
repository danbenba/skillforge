import ora from 'ora'
import type { ScopeLevel } from '../../types/scope.js'
import { installSkillsetFromPath } from '../../core/skillset-installer.js'
import { printJson, printError, printSuccess, printInfo } from '../ui/output.js'

function isRegistryName(source: string): boolean {
  return (
    !source.startsWith('git+') &&
    !source.startsWith('/') &&
    !source.startsWith('./') &&
    !source.startsWith('../') &&
    !source.includes('://') &&
    !source.endsWith('.md')
  )
}
