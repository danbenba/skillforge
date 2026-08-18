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

