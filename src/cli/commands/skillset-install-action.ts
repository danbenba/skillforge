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

export async function runSkillsetInstall(
  source: string,
  options: { scope: ScopeLevel; force: boolean; json: boolean }
): Promise<void> {
  const isGitUrl = source.startsWith('git+')

  if (!isGitUrl && isRegistryName(source)) {
    await runRegistrySkillsetInstall(source, options)
    return
  }

  if (isGitUrl) {
    await runGitSkillsetInstall(source, options)
    return
  }

  const spinner = options.json ? null : ora(`Validating ${source}...`).start()

  try {
    if (spinner) spinner.text = `Installing skillset from ${source}...`

    const result = await installSkillsetFromPath(source, {
      scope: options.scope,
      force: options.force,
    })

    if (spinner)
      spinner.succeed(`Installed skillset "${result.skillsetName}" at ${result.scope} scope`)

    if (options.json) {
      printJson({
        installed: true,
        skillsetName: result.skillsetName,
        scope: result.scope,
        score: result.validation.score,
        embeddedSkills: result.embeddedResults.map((r) => r.skillName),
        remoteSkills: result.remoteResults.map((r) => r.skillName),
        diagnostics: result.validation.diagnostics,
      })
    } else {
      printSuccess(`Score: ${result.validation.score}/100`)
      const allSkills = [
        ...result.embeddedResults.map((r) => r.skillName),
        ...result.remoteResults.map((r) => r.skillName),
      ]
      if (allSkills.length > 0) {
        printInfo(`  Skills installed: ${allSkills.join(', ')}`)
      }
    }
  } catch (e) {
    if (spinner) spinner.fail()
    printError(e instanceof Error ? e.message : String(e))
    process.exit(1)
  }
}
