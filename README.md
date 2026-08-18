<p align="center">
  <img src="assets/logo.svg" width="120" alt="SkillForge logo">
</p>

<h1 align="center">SkillForge</h1>

<p align="center">
  A package manager for Claude Agent Skills.<br>
  Works from claude.ai as a remote connector, and from Claude Code as a local MCP server and CLI.
</p>

<p align="center">
  <a href="#quick-start-claudeai">claude.ai setup</a> ·
  <a href="#quick-start-claude-code">Claude Code setup</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="#configuration">Configuration</a> ·
  <a href="#how-installation-works">How installs work</a>
</p>

---

Skills are folders with a `SKILL.md` file that teach Claude how to do a specific job. Finding a good one, checking that it is safe, and getting it loaded is still manual work. SkillForge turns that into a conversation: you ask Claude for a skill, Claude searches the registry and git sources, compares the candidates, checks their scripts, and loads the winner.

## What you get

- **Search**: query a hosted skill registry and any git repository, with filters for trust tier, popularity, format score and recency.
- **Compare**: fetch several candidates at once and rank them with a weighted rubric (task fit, instruction quality, provenance, score, popularity, token weight, script safety).
- **Validate**: run the format checker on any skill, local or remote, and get a 0 to 100 score with per-rule diagnostics.
- **Install**:
  - On Claude Code, `skillforge_install` writes the skill to disk in a global, shared or project scope, with a manifest that tracks version, source and score.
  - On claude.ai, `skillforge_activate` loads the full `SKILL.md` into the conversation and Claude follows it word for word. To keep it permanently, Claude recreates the skill in the claude.ai skill panel and you click "Copy to your skills".
- **Skillsets**: bundles of related skills, installable in one step.
- **Suggestions**: on Claude Code, `skillforge suggest` reads your project and proposes skills worth creating.

Skills are also exposed as MCP resources (`skill://<name>/SKILL.md` and `skill://index.json`) for clients that support skills over MCP ([SEP-2640](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2640)).

## Quick start (claude.ai)

You need the server deployed somewhere public first (see [Deployment](#deployment)).

1. Open claude.ai, go to **Settings > Connectors > Add custom connector**.
2. Paste your server URL followed by `/mcp`, for example `https://skillforge.example.com/mcp`. No authentication is needed unless you set a token.
3. Start a chat and ask something like "find me a skill for writing changelogs and install it".

Claude first calls `skillforge_start`, which returns the operating playbook (selection method, comparison rubric, security checklist). Then it searches, compares at least two candidates, and activates the best one. The playbook lives in [docs/PLAYBOOK.md](docs/PLAYBOOK.md) if you want to read what Claude reads.

Note: claude.ai drops the MCP `instructions` field for custom connectors, which is why the playbook ships as a tool instead.

## Quick start (Claude Code)

```bash
npm install -g skillforge
claude mcp add skillforge -- skillforge mcp
```

That registers the stdio server. On top of the claude.ai tool set, it adds real install tools: `skillforge_install`, `skillforge_uninstall`, `skillforge_list`, `skillforge_suggest`, and the skillset equivalents.

The CLI works on its own too:

```bash
skillforge search changelog
skillforge install conventional-changelog --scope project
skillforge list
skillforge validate ./my-skill
skillforge suggest
```

Scopes: `global` (`~/.skillforge/global`), `shared` (`~/.skillforge/shared`), `project` (`<repo>/.skillforge`). Details in [docs/scoping.md](docs/scoping.md).

## Deployment

With Docker:

```bash
git clone https://github.com/danbenba/skillforge.git
cd skillforge
cp .env.example .env    # set SKILLFORGE_ENV=prod and SKILLFORGE_PUBLIC_URL
docker compose up -d --build
```

Without Docker:

```bash
npm install
npm run build
npm run serve
```

Put HTTPS in front with your usual reverse proxy (Traefik, Caddy, nginx). A `nixpacks.toml` is included for Dokploy and Railway style platforms.

Endpoints:

| Route | Purpose |
|---|---|
| `POST /mcp` | MCP Streamable HTTP endpoint |
| `GET /health` | Health check |
| `GET /` | Landing page |
| `GET /logo.svg`, `/favicon.ico` | Brand assets. claude.ai picks up the connector icon from the domain favicon, so keep these reachable. |

## Configuration

Everything is driven by `.env` (see [.env.example](.env.example)):

| Variable | Default | Purpose |
|---|---|---|
| `SKILLFORGE_ENV` | `dev` | `dev` binds 127.0.0.1 with verbose logs, `prod` binds 0.0.0.0 with quiet logs |
| `SKILLFORGE_PORT` | `8765` | HTTP port |
| `SKILLFORGE_HOST` | mode default | Bind address override |
| `SKILLFORGE_PUBLIC_URL` | `http://localhost:8765` | Public URL; the connector URL is this plus `/mcp` |
| `SKILLFORGE_REGISTRY_URL` | built-in | Registry API base, if you host your own |
| `SKILLFORGE_AUTH_TOKEN` | empty | When set, `/mcp` requires this bearer token |
| `SKILLFORGE_BUNDLE_FILE_LIMIT` | `49152` | Max bytes per inlined skill file |
| `SKILLFORGE_BUNDLE_TOTAL_LIMIT` | `262144` | Max bytes per skill bundle |
| `ANTHROPIC_API_KEY` | empty | Only needed for `skillforge_suggest` |

## How installation works

Claude Code has a filesystem, claude.ai does not. So the two surfaces install differently:

| | Claude Code | claude.ai |
|---|---|---|
| Mechanism | `skillforge_install` copies the skill to disk and records it in a manifest | `skillforge_activate` returns the whole `SKILL.md`, Claude applies it in the conversation |
| Persistence | Permanent | Conversation only, unless you click "Copy to your skills" on the recreated skill, or upload the zip in Settings > Capabilities > Skills |
| Safety | Format validation plus your review | Claude reviews scripts and instructions before loading, and refuses skills that look unsafe |

The one rule that never changes: skill instructions are loaded and followed verbatim. SkillForge never rewrites, summarizes or "improves" a skill's content.

## Tools

Remote and local:

`skillforge_start` · `skillforge_search` · `skillforge_skillset_search` · `skillforge_inspect` · `skillforge_activate` · `skillforge_file` · `skillforge_compare` · `skillforge_validate_remote`

Local only (stdio):

`skillforge_install` · `skillforge_uninstall` · `skillforge_list` · `skillforge_validate` · `skillforge_suggest` · `skillforge_skillset_install` · `skillforge_skillset_uninstall` · `skillforge_skillset_list` · `skillforge_skillset_validate`

Full reference in [docs/mcp.md](docs/mcp.md) and [docs/cli.md](docs/cli.md).

## Project layout

```
src/
  cli/        commands and terminal UI
  core/       validator, installer, resolver, manifest, config
  mcp/        MCP server: http transport, stdio transport, tool groups
  registry/   registry client, git fetcher
  types/      shared types
docs/         user docs and the Claude playbook
tests/        vitest unit tests and fixtures
assets/       logo and favicons
schema/       architecture notes
```

## Development

```bash
npm install
npm run dev        # http server with tsx, no build step
npm test           # vitest
npm run build      # tsc to dist/
```

Contributions welcome, see [docs/contributing.md](docs/contributing.md).

