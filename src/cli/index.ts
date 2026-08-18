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

export function createCli(): Command {
  const program = new Command()

  program
    .name('skillforge')
    .description('Package manager for Claude skill packages')
    .version(version)
    .option('--no-color', 'Disable colored output')

  registerInstall(program)
  registerUninstall(program)
  registerUpdate(program)
  registerList(program)
  registerValidate(program)
  registerSuggest(program)
  registerPublish(program)
  registerSearch(program)
  registerSkillset(program)
  registerConfig(program)

  program
    .command('mcp', { hidden: true })
    .description('Start the MCP server')
    .action(async () => {
      const { startMcpServer } = await import('../mcp/server.js')
      await startMcpServer()
    })

  program
    .command('serve')
    .description('Start the remote MCP server (Streamable HTTP, for claude.ai custom connectors)')
    .option('-p, --port <port>', 'Port to listen on (overrides SKILLFORGE_PORT)')
    .option('-H, --host <host>', 'Host to bind (overrides SKILLFORGE_HOST)')
    .action(async (options: { port?: string; host?: string }) => {
      if (options.port) process.env.SKILLFORGE_PORT = options.port
      if (options.host) process.env.SKILLFORGE_HOST = options.host
      const { startHttpServer } = await import('../mcp/http.js')
      await startHttpServer()
    })

  return program
}
