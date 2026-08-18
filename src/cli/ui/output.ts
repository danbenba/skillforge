import chalk from 'chalk'
import type { ValidationResult, ValidationDiagnostic } from '../../types/skill.js'

const LABEL_WIDTH = 7

function label(severity: ValidationDiagnostic['severity']): string {
  switch (severity) {
    case 'error':
      return chalk.red('error'.padEnd(LABEL_WIDTH))
    case 'warning':
      return chalk.yellow('warn'.padEnd(LABEL_WIDTH))
    case 'pass':
      return chalk.green('pass'.padEnd(LABEL_WIDTH))
  }
}
