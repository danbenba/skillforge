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

export async function runInstall(
  source: string,
  options: { scope: ScopeLevel; force: boolean; json: boolean }
): Promise<void> {
  const isGitUrl = source.startsWith('git+')

  if (!isGitUrl && isRegistryName(source)) {
    await runRegistryInstall(source, options)
    return
  }

  if (isGitUrl) {
    await runGitInstall(source, options)
    return
  }

  const spinner = options.json ? null : ora(`Validating ${source}...`).start()

  try {
    if (spinner) spinner.text = `Validating ${source}...`
    const result = await installFromPath(source, {
      scope: options.scope,
      force: options.force,
    })

    if (spinner) spinner.succeed(`Installed "${result.skillName}" at ${result.scope} scope`)

    if (options.json) {
      printJson({
        installed: true,
        skillName: result.skillName,
        scope: result.scope,
        score: result.validation.score,
        diagnostics: result.validation.diagnostics,
      })
    } else {
      if (result.validation.warnCount > 0 || result.validation.errorCount > 0) {
        console.log('')
        printValidationReport(result.validation)
      } else {
        printSuccess(`Score: ${result.validation.score}/100`)
      }
    }
  } catch (e) {
    if (spinner) spinner.fail()
    printError(e instanceof Error ? e.message : String(e))
    process.exit(1)
  }
}
