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

