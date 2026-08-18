import ora from 'ora'
import type { ScopeLevel } from '../../types/scope.js'
import { installFromPath } from '../../core/installer.js'
import { printValidationReport, printJson, printError, printSuccess } from '../ui/output.js'

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
