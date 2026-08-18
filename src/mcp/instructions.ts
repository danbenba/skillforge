import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FALLBACK_SHORT = `SkillForge is a package manager for Claude Agent Skills. It searches, compares, validates and delivers skills from a registry and from git datasources.

Golden rule: before recommending a skill, search with at least two query formulations, shortlist candidates, compare at least two of them with skillforge_compare, then deliver:
- On claude.ai (remote connector): call skillforge_activate to load the full SKILL.md into context and follow its instructions verbatim for the rest of the conversation. Never paraphrase or alter a skill's instructions. For a permanent install, recreate the skill verbatim in the claude.ai skill panel so the user can click "Copy to your skills", or point the user to the zip-upload path in Settings.
- On Claude Code (stdio): call skillforge_install for a real on-disk installation.

Call skillforge_start before first use: it returns the complete operating playbook (comparison methodology, scoring rubric, security review, workflows).`
