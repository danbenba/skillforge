import { Command } from 'commander'
import { createRequire } from 'node:module'
import { registerInstall } from './commands/install.js'
import { registerUninstall } from './commands/uninstall.js'
import { registerList } from './commands/list.js'
import { registerValidate } from './commands/validate.js'
import { registerSuggest } from './commands/suggest.js'
import { registerPublish } from './commands/publish.js'
import { registerSearch } from './commands/search.js'
import { registerSkillset } from './commands/skillset.js'
import { registerUpdate } from './commands/update.js'
import { registerConfig } from './commands/config.js'

const require = createRequire(import.meta.url)
const { version } = require('../../package.json') as { version: string }
