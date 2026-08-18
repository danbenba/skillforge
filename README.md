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

