import type { Command } from 'commander'
import chalk from 'chalk'
import { readConfig, writeConfig } from '../../core/config.js'
import { printJson, printError, printSuccess } from '../ui/output.js'
import type { SkillForgeConfig } from '../../core/config.js'
import os from 'node:os'
import path from 'node:path'

const CONFIG_PATH = () => path.join(os.homedir(), '.skillforge', 'config.json')

const VALID_KEYS: Array<keyof SkillForgeConfig> = [
  'registryUrl',
  'token',
  'anthropicApiKey',
  'defaultScope',
]
