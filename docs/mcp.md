# MCP Server Integration

SkillForge exposes a Model Context Protocol (MCP) server so any MCP-capable coding agent can invoke all package management operations directly: installing skills mid-session, listing what's available, validating skill quality, and generating suggestions.

The server is **agent-agnostic**. It communicates over stdio and speaks plain MCP, so Claude Code, Codex, Cursor, Windsurf, Zed, and any other MCP client all work the same way. All tools except `skillforge_suggest` are pure package-management operations (filesystem + registry) and call no LLM; their behavior is identical regardless of which agent invokes them. Only `skillforge_suggest` reaches an LLM, and only it needs an API key.

---

