# AGENTS.md

Instructions for autonomous coding agents (Jules, Codex, Cursor, Claude Code, etc.) working in this repo. This file follows the [agents.md](https://agents.md) standard and is the source of truth for agent behavior. Human-oriented architecture notes live in `CLAUDE.md`.

## Release process — REQUIRED on every PR

This repo uses [Changesets](https://github.com/changesets/changesets) (`@changesets/cli`) with `changesets/action@v1`. The `Release` workflow opens a rolling `release: version packages` PR that, when merged, tags a release and triggers the Cloud Run deploy.

**Every PR that changes code shipped in the build MUST include a changeset** in `.changeset/`. Without one, the change won't appear in release notes and won't trigger a release.

To add a changeset:

```bash
cd frontend
npx changeset
```

- Bump type: `patch` (bugfix, perf, refactor, test, code-health), `minor` (user-visible feature or content addition), `major` (breaking change — unlikely on this site).
- Summary: one sentence in user-facing language. Describe the change, not the implementation. Example: `Add CV download separate from Resume on home and About pages.`
- Commit the generated `.changeset/<random-name>.md` alongside your code changes.

**Skip a changeset only when** the PR touches *only*:
- `.github/workflows/**` (CI changes don't ship)
- `infrastructure/**` (Terraform doesn't ship in the bundle)
- `scripts/**` (build-time tools, not in the runtime bundle)
- `*.md` documentation (README, CLAUDE.md, AGENTS.md, etc.)
- `.changeset/config.json` itself

If a PR mixes shipped code with one of the above, still add a changeset for the shipped portion.

## Build / verify before opening a PR

```bash
cd frontend
npm run build    # runs tsc -b && vite build — must pass
```

Tests, when present, live alongside source as `*.test.ts` and run via `vitest` (added in #33). Run them with `npx vitest run` from `frontend/`.

## Repo layout — quick reference

- `frontend/` — Vite + React 19 + TypeScript SPA (the only thing that ships)
- `content/` — Markdown blog posts and portfolio entries; `home.json`, `publications.json`. Loaded at build time via `import.meta.glob` (eager).
- `infrastructure/` — Terraform for GCP (Cloud Run, GCS, Artifact Registry)
- `scripts/` — Build-time helpers (content conversion, asset upload, version tagging)
- `site-data/` — Pre-conversion source content (assets uploaded to GCS bucket separately)

Path alias: `@/` → `frontend/src/`.

## PR conventions

- Branch off `main`. Don't edit `main` directly.
- One logical change per PR. Don't bundle unrelated work.
- Don't include changes already on `main` — rebase before opening if your branch is stale.
- Title: imperative, lowercase, no trailing period. Emoji prefix optional.
- Body: state *what* and *why*. Link any related issue with `Closes #N`.

## Things that have caused problems

- **Duplicate work**: Before starting, check open PRs for the same task. PRs #16, #21, #25, #26, #27 were all closed as duplicates of already-merged work.
- **Stale refactors**: If you edit a function, verify it still lives in the file your branch targets. `parseFrontmatter` was extracted to `frontend/src/utils/parseFrontmatter.ts` in #30 — older branches editing `content.ts` won't merge.
- **Missing changesets**: PRs #15, #17, #18, #20, #22, #28, #29, #30, #33 all merged without changesets and had to be backfilled in a follow-up PR. Don't repeat this — add the changeset in the same PR as the code.

## More context

For architecture, content pipeline details, GCP infrastructure layout, and phase roadmap, see [`CLAUDE.md`](./CLAUDE.md).
