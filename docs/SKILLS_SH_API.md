# skills.sh API Reference (required reading)

> Vendored snapshot of <https://www.skills.sh/docs/api>, taken 2026-08-18.
> This document is served by the SkillForge MCP server as the mandatory resource
> `skillforge://docs/skills-sh-api`. Read it before making any call to the
> skills.sh API. If a request fails in a way this document does not explain,
> consult the live page — the snapshot may be out of date.

skills.sh is the Vercel-operated Agent Skills registry. Its API is served at
`https://skills.sh` under `/api/v1/`, over HTTPS, with JSON responses.

## Authentication

**All endpoints require authentication.** Unauthenticated requests return:

```json
{
  "error": "authentication_required",
  "message": "This endpoint requires authentication. Pass a Vercel OIDC token (Authorization: Bearer <VERCEL_OIDC_TOKEN>) — see https://skills.sh/docs/api#authentication."
}
```

Authentication uses Vercel OIDC federation:

1. **Enable OIDC**: project Settings → OIDC Federation in the Vercel dashboard.
2. **Install helper**: `npm install @vercel/oidc`.
3. **Get a token**: call `getVercelOidcToken()` *inside the request handler* —
   do not hoist it to module scope (tokens expire).
4. **Local dev**: `vercel link`, then `vercel env pull` to populate `.env.local`.

Raw access is also supported via `process.env.VERCEL_OIDC_TOKEN` or the
`x-vercel-oidc-token` request header. Send the token as
`Authorization: Bearer <token>`.

## Rate limits

| Tier | Limit | Scope |
|------|-------|-------|
| Authenticated | 600 requests/minute | Per (team, project) |

Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`,
`X-RateLimit-Reset` (seconds until the window resets). Exceeding the limit
returns `429 Too Many Requests` with a `Retry-After` header.

## Error responses

```json
{ "error": "error_code", "message": "Human-readable description." }
```

| Status | Meaning |
|--------|---------|
| 400 | Invalid request parameters |
| 401 | Missing, invalid, or expired token |
| 404 | Skill not found |
| 429 | Rate limit exceeded |
| 503 | Temporarily unavailable |

## Endpoints

### GET `/api/v1/skills`

Paginated leaderboard of all skills.

Query parameters:

- `view` (string): `all-time` (default), `trending`, or `hot`
- `page` (integer): 0-indexed, default 0
- `per_page` (integer): 1–500, default 100

```json
{
  "data": [
    {
      "id": "vercel-labs/skills/find-skills",
      "slug": "find-skills",
      "name": "find-skills",
      "source": "vercel-labs/skills",
      "installs": 24531,
      "sourceType": "github",
      "installUrl": "https://github.com/vercel-labs/skills",
      "url": "https://skills.sh/vercel-labs/skills/find-skills"
    }
  ],
  "pagination": { "page": 0, "perPage": 10, "total": 8420, "hasMore": true }
}
```

With `view=hot`, each entry also carries `installsYesterday` (integer) and
`change` (integer) for hourly comparisons.

### GET `/api/v1/skills/search`

Search by name, source, or description. Single-word queries use fuzzy
matching; multi-word queries use semantic search.

Query parameters:

- `q` (string, required): minimum 2 characters
- `limit` (integer): 1–200, default 50
- `owner` (string): filter by GitHub owner

```json
{
  "data": [ { "id": "expo/skills/react-native", "slug": "react-native", "name": "React Native", "source": "expo/skills", "installs": 3842, "sourceType": "github", "installUrl": "https://github.com/expo/skills", "url": "https://skills.sh/expo/skills/react-native" } ],
  "query": "react native",
  "searchType": "semantic",
  "count": 5,
  "durationMs": 142
}
```

### GET `/api/v1/skills/curated`

Official first-party skills from the organizations that build the
technologies. Returns owners with their skill lists:

```json
{
  "data": [
    {
      "owner": "vercel-labs",
      "totalInstalls": 89240,
      "featuredRepo": "skills",
      "featuredSkill": "find-skills",
      "skills": [ { "id": "vercel-labs/skills/find-skills", "slug": "find-skills", "name": "find-skills", "source": "vercel-labs/skills", "installs": 24531, "sourceType": "github", "installUrl": "https://github.com/vercel-labs/skills", "url": "https://skills.sh/vercel-labs/skills/find-skills" } ]
    }
  ],
  "totalOwners": 87,
  "totalSkills": 342,
  "generatedAt": "2026-03-31T08:00:00.000Z"
}
```

### GET `/api/v1/skills/:source/:skill`

Skill details, including install count and the complete file tree.

Path examples:

- GitHub source: `/api/v1/skills/vercel-labs/skills/find-skills`
- Well-known source: `/api/v1/skills/mintlify.com/mintlify`

```json
{
  "id": "vercel-labs/skills/find-skills",
  "source": "vercel-labs/skills",
  "slug": "find-skills",
  "installs": 24531,
  "hash": "a1b2c3d4e5f6...",
  "files": [
    { "path": "SKILL.md", "contents": "---\nname: ...\n---\n..." },
    { "path": "examples/app-router.ts", "contents": "// ..." }
  ]
}
```

Fields: `id` (`{source}/{slug}`), `source`, `slug`, `installs` (deduplicated
total), `hash` (SHA-256 content hash for cache invalidation, or null),
`files` (array of `{path, contents}`, or null).

### GET `/api/v1/skills/audit/:source/:skill`

Security audit results from partner providers (Gen Agent Trust Hub, Socket,
Snyk, Runlayer, ZeroLeaks). Same path format as the detail endpoint.

```json
{
  "id": "vercel-labs/skills/find-skills",
  "source": "vercel-labs/skills",
  "slug": "find-skills",
  "audits": [
    { "provider": "Gen Agent Trust Hub", "slug": "agent-trust-hub", "status": "pass", "summary": "No risks detected", "auditedAt": "2026-04-15T12:00:00.000Z", "riskLevel": "LOW" },
    { "provider": "Socket", "slug": "socket", "status": "pass", "summary": "No alerts", "auditedAt": "2026-04-15T12:05:00.000Z" }
  ]
}
```

Audit entry fields: `provider`, `slug`, `status` (`pass` | `warn` | `fail`),
`summary`, `auditedAt` (ISO 8601), `riskLevel` (optional: `NONE` | `LOW` |
`MEDIUM` | `HIGH` | `CRITICAL`), `categories` (string[], Agent Trust Hub
only). Returns 404 when no audits exist yet; audits are generated
automatically after a skill's first install, with possible delay.

## Standard skill object

All listing and search endpoints return skills with: `id`
(`{source}/{slug}`), `slug`, `name`, `source`, `installs` (deduplicated),
`sourceType` (`github` | `well-known`), `installUrl` (or null), `url`
(skills.sh page), and `isDuplicate` (boolean, present only when true).

## Caching

Honor the `Cache-Control` headers: leaderboard and search responses cache for
30–60 seconds, detail and curated responses for 5 minutes.

## Best practices

- **Stable identification**: use the `id` field to track skills and build
  detail paths.
- **Install detection**: compare `installUrl` or `id` against local skill
  folders.
- **Duplicate filtering**: drop entries with `isDuplicate: true` to show only
  originals.
