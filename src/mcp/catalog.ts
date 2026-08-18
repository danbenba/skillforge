import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { searchRegistry, searchSkillsets, getSkill, getSkillset } from '../registry/sources/registry.js'
import { fetchSkillBundle, fetchSkillFile, withClonedSource } from '../registry/fetcher.js'
import { validateSkill } from '../core/validator.js'

const START_REMINDER =
  'If skillforge_start has not been called yet in this session, call it now and read the playbook before recommending or activating anything.'
