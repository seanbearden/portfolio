# AGENTS.md

Source of truth for both human contributors and autonomous coding agents (Jules, Codex, Cursor, Claude Code, Amp, Factory). Follows the [agents.md](https://agents.md) standard.

`CLAUDE.md` is a one-line pointer to this file via Claude Code's `@import` directive (per [Anthropic's memory docs](https://docs.anthropic.com/en/docs/claude-code/memory#agents-md)).

## What This Is

Personal portfolio website for Sean Bearden, Ph.D. — migrated from Squarespace to self-hosted GCP (Cloud Run). React SPA serving blog posts, portfolio projects, publications, and professional background.

## Release process — REQUIRED on every PR

This repo uses [Changesets](https://github.com/changesets/changesets) (`@changesets/cli`) with `changesets/action@v1`. The `Release` workflow opens a rolling `release: version packages` PR; merging it tags a release and triggers the Cloud Run deploy.

**Every PR that changes shipped code MUST include a changeset** in `.changeset/`. Without one, the change is invisible in release notes and won't trigger a release.

To add a changeset:

```bash
cd frontend
npx changeset
```

- Bump type: `patch` (bugfix, perf, refactor, test, code-health), `minor` (user-visible feature or content addition), `major` (breaking change — unlikely on this site).
- Summary: one sentence in user-facing language. Describe the change, not the implementation.
- Commit the generated `.changeset/<random-name>.md` alongside your code changes.

**Skip a changeset only when** the PR touches *only*:
- `.github/workflows/**` (CI doesn't ship)
- `infrastructure/**` (Terraform doesn't ship in the bundle)
- `scripts/**` (build-time tools, not in the runtime bundle)
- `*.md` documentation (README, AGENTS.md, CLAUDE.md, etc.)
- `.changeset/config.json` itself

If a PR mixes shipped code with one of the above, still add a changeset for the shipped portion.

## Commands

```bash
# Development (from frontend/)
cd frontend
npm run dev          # Vite dev server on localhost:5173
npm run build        # tsc -b && vite build → frontend/dist/  (run before opening a PR)
npm run preview      # Serve built output locally
npx vitest run       # Run tests (vitest + jsdom)

# Docker (from repo root — context needs content/ + frontend/)
docker build -t portfolio-frontend .
docker run -p 8080:8080 portfolio-frontend

# Terraform (from infrastructure/)
cd infrastructure
terraform init
terraform plan
terraform apply

# Content conversion (one-time, from repo root)
python3 scripts/convert_content.py    # site-data/ → content/

# Asset upload (one-time, from repo root)
./scripts/upload-assets.sh            # site-data/assets → GCS bucket
```

## Architecture

### Content Pipeline

Content lives outside the frontend in `content/` and is loaded at Vite build time:

```
content/blog/*.md          → import.meta.glob("?raw") → parseFrontmatter() → BlogPost[]
content/portfolio/*.md     → import.meta.glob("?raw") → parseFrontmatter() → PortfolioProject[]
content/publications.json  → direct JSON import → Publication[]
content/home.json          → direct JSON import → HomeData
```

All glob imports are **eager** — content is bundled into the JS, not lazy-loaded. The frontmatter parser lives in `frontend/src/utils/parseFrontmatter.ts` (custom regex-based, not `gray-matter`).

Images and PDFs are **not** bundled. They live in a GCS bucket (`seanbearden-assets`). Content references assets by filename only; `assetUrl()` and `pdfUrl()` in `content.ts` prepend the `VITE_ASSETS_BASE_URL` env var.

### Frontend Stack

- **Vite 8** + **React 19** + **TypeScript** + **React Router 7**
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config.js` — uses CSS-first config in `index.css`)
- **Shadcn/ui** components using `@base-ui/react` primitives (not Radix). The Button component does **not** support `asChild` — use `buttonVariants()` with `<Link>` or `<a>` instead.
- **Lucide React** for icons, but brand icons (GitHub, LinkedIn, Twitter) are custom SVGs in `components/common/SocialIcons.tsx` since Lucide dropped brand icons.
- Path alias: `@/` → `frontend/src/`

### Release Flow

```
Feature PR (include .changeset/*.md file)
  → merge to main
    → release.yml: changesets/action opens "Version Packages" PR
      → merge that PR: creates git tag (v*)
        → deploy.yml: builds Docker image → pushes to Artifact Registry → deploys to Cloud Run
```

Deploy can also be triggered manually: `gh workflow run deploy --field ref=main`

### GCP Infrastructure

Managed by Terraform in `infrastructure/`. Project: `bearden-portfolio`, region: `us-central1`.

- **Cloud Run** (`portfolio-frontend`): nginx serving Vite build output, 0 min instances
- **Cloud Storage** (`seanbearden-assets`): public bucket for images and PDFs
- **Artifact Registry** (`portfolio`): Docker images, keeps 5 recent
- **Workload Identity Federation**: GitHub Actions authenticates to GCP via OIDC (no static keys)
- **Domain mapping** not in Terraform — configured via `gcloud run domain-mappings create`

### Old URL Redirects

`frontend/src/utils/redirects.ts` maps old Squarespace paths (`/news/YYYY/M/D/slug`) to new blog routes via a `Map` lookup. The `NotFoundPage` component checks this on render and redirects via React Router.

### Phases

- **Phase 1** (current): Static portfolio site on Cloud Run
- **Phase 2** (planned): AI resume chatbot — Python FastAPI on second Cloud Run service, proxied via nginx `/api/` block (already stubbed in `nginx.conf.template`)
- **Phase 3** (planned): Interactive data playground

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/utils/content.ts` | Content loading, asset URL builder |
| `frontend/src/utils/parseFrontmatter.ts` | Custom YAML-ish frontmatter parser |
| `frontend/src/utils/redirects.ts` | Old Squarespace URL → new route mapping |
| `frontend/nginx.conf.template` | SPA fallback, asset caching, API proxy stub |
| `Dockerfile` | Multi-stage: node:22-slim build → nginx:1.27-alpine |
| `.changeset/config.json` | Changesets release config |
| `infrastructure/main.tf` | All GCP resources |
| `infrastructure/outputs.tf` | GitHub Actions variables (set via `gh variable set`) |

## PR conventions

- Branch off `main`. Don't edit `main` directly.
- One logical change per PR. Don't bundle unrelated work.
- Rebase before opening if your branch is stale — never include changes already on `main`.
- Title: imperative, lowercase, no trailing period. Emoji prefix optional.
- Body: state *what* and *why*. Link any related issue with `Closes #N`.
- Run `npm run build` from `frontend/` before opening; the PR is not done if build fails.

## Things that have caused problems

- **Duplicate work**: Before starting, check open PRs for the same task. PRs #16, #21, #25, #26, #27 were all closed as duplicates of already-merged work. Cross-reference issue numbers and recent merges.
- **Stale refactors**: If you edit a function, verify it still lives in the file your branch targets. `parseFrontmatter` was extracted to `frontend/src/utils/parseFrontmatter.ts` in #30 — branches editing the old `content.ts` location won't merge.
- **Missing changesets**: PRs #15, #17, #18, #20, #22, #28, #29, #30, #33 all merged without changesets and had to be backfilled in #34. Don't repeat this — the changeset belongs in the same PR as the code.
