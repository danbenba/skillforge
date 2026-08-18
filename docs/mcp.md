# MCP Server Integration

SkillForge exposes a Model Context Protocol (MCP) server so any MCP-capable coding agent can invoke all package management operations directly: installing skills mid-session, listing what's available, validating skill quality, and generating suggestions.

The server is **agent-agnostic**. It communicates over stdio and speaks plain MCP, so Claude Code, Codex, Cursor, Windsurf, Zed, and any other MCP client all work the same way. All tools except `skillforge_suggest` are pure package-management operations (filesystem + registry) and call no LLM; their behavior is identical regardless of which agent invokes them. Only `skillforge_suggest` reaches an LLM, and only it needs an API key.

---

## Setup

### 1. Install SkillForge

```bash
npm install -g skillforge
```

Or from source:

```bash
git clone https://github.com/danbenba/skillforge.git
cd skillforge
npm install && npm run build
npm link
```

### 2. Register the server with your agent

The server is launched with `skillforge mcp` (a stdio server). Point your agent's MCP config at that command.

**Claude Code**: `.mcp.json` in the project root, or the global `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "skillforge": {
      "command": "skillforge",
      "args": ["mcp"]
    }
  }
}
```

**Codex**: `~/.codex/config.toml`:

```toml
[mcp_servers.skillforge]
command = "skillforge"
args = ["mcp"]
```

The `ANTHROPIC_API_KEY` environment variable is only needed if you use the `skillforge_suggest` tool. Add it via the config's `env` block:

```json
{
  "mcpServers": {
    "skillforge": {
      "command": "skillforge",
      "args": ["mcp"],
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

```toml
# Codex equivalent
[mcp_servers.skillforge]
command = "skillforge"
args = ["mcp"]
env = { ANTHROPIC_API_KEY = "sk-ant-..." }
```

To point `skillforge_suggest` at a custom Anthropic-compatible endpoint instead, set `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, and optionally `SKILLPM_SUGGEST_MODEL` in the same `env` block. See [suggest.md](suggest.md#custom-endpoints).

### 3. Restart your agent

After saving the config, restart the agent (or reload its MCP servers). The SkillForge tools will appear in the tool list.

---

