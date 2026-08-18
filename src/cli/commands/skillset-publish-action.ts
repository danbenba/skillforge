import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import ora from 'ora'
import { parse as parseYaml } from 'yaml'
import { simpleGit } from 'simple-git'
import { publishSkillset, updateSkillset } from '../../registry/sources/registry.js'
import { printJson, printError, printSuccess, printWarning, printInfo } from '../ui/output.js'

async function detectSourceUrl(skillsetPath: string): Promise<string | null> {
  try {
    const git = simpleGit(skillsetPath)
    const remotes = await git.getRemotes(true)
    const origin = remotes.find((r) => r.name === 'origin')
    if (!origin?.refs?.fetch) return null

    let url = origin.refs.fetch
    url = url.replace(/^git@github\.com:/, 'https://github.com/')
    url = url.replace(/\.git$/, '')
    return url
  } catch {
    return null
  }
}

async function readSkillsetName(skillsetPath: string): Promise<string | null> {
  try {
    const content = await readFile(join(skillsetPath, 'SKILLSET.md'), 'utf-8')
    const match = content.match(/^---\n([\s\S]*?)\n---/)
    if (!match) return null
    const fm = parseYaml(match[1]) as Record<string, unknown>
    return typeof fm['name'] === 'string' ? fm['name'] : null
  } catch {
    return null
  }
}
