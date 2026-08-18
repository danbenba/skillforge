# SkillForge Operating Playbook

This document is the operations manual for SkillForge, an MCP server for discovering, comparing, evaluating, and installing Agent Skills. It is written for you, Claude, the AI operating the tools. Read it before your first SkillForge tool call in a conversation. It defines the mandatory procedures for search, comparison, security review, and installation in both operating modes. When any instruction here conflicts with an ad-hoc habit or shortcut you might otherwise take, this document wins. When any instruction here conflicts with user safety or with your core operating principles, safety wins and you say so explicitly.

## Table of Contents

1. [Overview: What SkillForge Is](#1-overview-what-skillforge-is)
2. [Glossary](#2-glossary)
3. [The Two Operating Modes](#3-the-two-operating-modes)
4. [Tool Reference](#4-tool-reference)
5. [The Skill Format](#5-the-skill-format)
6. [The Selection Funnel](#6-the-selection-funnel)
7. [Query Strategy in Depth](#7-query-strategy-in-depth)
8. [The Weighted Scoring Rubric](#8-the-weighted-scoring-rubric)
9. [Security Review](#9-security-review)
10. [The Comparison Table](#10-the-comparison-table)
11. [Verdicts, Tie-Breaking, and Recommending Nothing](#11-verdicts-tie-breaking-and-recommending-nothing)
12. [Installation Workflow: Claude Code (Real Install)](#12-installation-workflow-claude-code-real-install)
13. [Installation Workflow: claude.ai (Virtual and Persistent Install)](#13-installation-workflow-claudeai-virtual-and-persistent-install)
14. [The Fidelity Rule](#14-the-fidelity-rule)
15. [Multi-Skill Conflicts](#15-multi-skill-conflicts)
16. [Skillset Handling](#16-skillset-handling)
17. [Validation Diagnostics: How to Read Them](#17-validation-diagnostics-how-to-read-them)
18. [Error Handling and Fallbacks](#18-error-handling-and-fallbacks)
19. [Etiquette and Efficiency](#19-etiquette-and-efficiency)
20. [Limits: What SkillForge Cannot Do](#20-limits-what-skillforge-cannot-do)
21. [Reporting Style](#21-reporting-style)
22. [Quick-Reference Checklists](#22-quick-reference-checklists)

---

## 1. Overview: What SkillForge Is

SkillForge is an MCP server that gives you access to a catalog of Agent Skills (reusable instruction packages in the SKILL.md format) sourced from a hosted registry and from arbitrary git repositories. With SkillForge you can:

- **Search** the registry for skills and skillsets matching a task.
- **Inspect** the full registry record of any skill.
- **Activate** a skill: fetch the complete bundle (SKILL.md plus its references, scripts, and assets) server-side from its git source, framed for immediate loading into context, with no local git access needed. Individual auxiliary files are fetched on demand with `skillforge_file`.
- **Compare** several candidate skills side by side.
- **Validate** a skill's format conformance server-side and get a 0-100 score with diagnostics.
- **Install** skills to disk, but only in local mode (Claude Code via stdio). In remote mode (claude.ai custom connector), you cannot write directly into the user's account; use the virtual-install pattern and the persistent paths described in Section 13 instead.

Skills are also exposed as MCP resources for clients that support resource reading (SEP-2640): each skill at `skill://<name>/SKILL.md` and the catalog index at `skill://index.json`. When your host supports MCP resources, these are equivalent read paths; the tools remain the primary interface and everything in this manual applies regardless of which read path you use.

**Session start rule:** call `skillforge_start` before any other SkillForge tool in a session. It returns this playbook (claude.ai silently drops the MCP `instructions` field, so `skillforge_start` is the only way this manual reaches you there). Other tools detect a session where `skillforge_start` was skipped and will remind you; do not rely on that reminder: call it first.

SkillForge's purpose is not merely retrieval. Its purpose is **good selection**. Any tool can download a file. The value you add is the disciplined funnel: understand what the user actually needs, harvest candidates from multiple angles, shortlist, fetch the real contents, compare them against an explicit rubric, review them for security problems, and only then deliver, with a clear, honest recommendation that includes provenance and trust information. Follow that funnel. Do not skip from "found one search hit" to "installing it."

Two invariants govern everything in this manual:

1. **Compare before you commit.** Never install (really or virtually) the first search result without having examined at least one alternative, unless the user explicitly named a specific skill and asked for exactly it. Selection without comparison is guessing.
2. **Read before you run.** Never install, virtually install, or recommend a skill whose SKILL.md and scripts you have not actually read in this conversation. A registry description is marketing metadata; the fetched contents are the truth.

## 2. Glossary

| Term | Definition |
|---|---|
| **Agent Skill / skill** | A folder containing a `SKILL.md` file (YAML frontmatter + markdown instructions) and optionally `references/`, `scripts/`, and `assets/` subfolders. When loaded, its instructions direct an AI agent's behavior for a class of tasks. |
| **SKILL.md** | The skill's entry file. Frontmatter carries at minimum `name` and `description`; the markdown body carries the instructions the agent follows. |
| **Skillset** | A bundle of several skills, defined by a `SKILLSET.md` that either embeds skill folders directly or references remote skills. Installed and validated as a unit. |
| **Registry** | SkillForge's hosted index of published skills and skillsets, searchable by query, tags, tier, and sortable by installs, score, or recency. |
| **Datasource** | Anywhere a skill bundle can be fetched from: the registry (by name) or a git repository (by `git+https://` URL). |
| **Trust tier** | Registry-assigned provenance label: `verified` (author identity and package reviewed by registry operators) or `community` (self-published, unreviewed). A tier is not a security guarantee; it is one input among several. |
| **Validation score** | A 0-100 measure of *format conformance* produced by the validator: frontmatter validity, naming rules, description length, structure, absence of broken references, absence of XML in the description, and similar checks. It measures whether the package is well-formed, **not** whether its instructions are good, safe, or fit for the task. |
| **install_count** | Number of recorded installs via the registry. A popularity signal with known biases (see Section 8). |
| **Real install** | Writing the skill to disk via `skillforge_install`. Possible only in local (Claude Code) mode. |
| **Virtual install** | The remote-mode substitute for disk installation: activating a skill (`skillforge_activate`), loading the full SKILL.md into context, and following it verbatim for the rest of the conversation, as if it were installed. See Sections 13 and 14. |
| **Persistent install (claude.ai)** | Making a skill survive beyond the conversation on claude.ai: recreating the SKILL.md verbatim in claude.ai's in-chat skill creation panel so the user can click "Copy to your skills", or the fallback zip upload via Settings > Capabilities > Skills. Section 13.3. |
| **Progressive disclosure** | The design pattern where SKILL.md stays short and defers detail to files under `references/`, which the agent fetches only when needed. Skills built this way cost less context. |
| **Manifest** | The record `skillforge_install` writes alongside an installed skill: source URL, validation score, spec version, install time. Used by `skillforge_list` and for later audits. |
| **Scope** (local installs) | Where a skill is installed: `global` (`~/.skillforge/global`, available everywhere for this user), `shared` (`~/.skillforge/shared`, intended for skills shared across projects/team conventions), or `project` (`<project>/.skillforge/skills`, versioned with the project). |
| **Funnel** | The mandatory selection procedure: clarify → query → harvest → shortlist → fetch → compare → verdict → deliver. Section 6. |

