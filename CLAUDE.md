# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Personal portfolio website for Sean Bearden, Ph.D. — migrating from Squarespace to self-hosted GCP (Cloud Run). React SPA serving blog posts, portfolio projects, publications, and professional background.

## Commands

```bash
# Development (from frontend/)
cd frontend
npm run dev          # Vite dev server on localhost:5173
npm run build        # tsc -b && vite build → frontend/dist/
npm run preview      # Serve built output locally

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

# Release: add a changeset during development
cd frontend && npx changeset
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

All glob imports are **eager** — content is bundled into the JS, not lazy-loaded. The frontmatter parser in `frontend/src/utils/content.ts` is custom (regex-based, not `gray-matter`).

Images and PDFs are **not** bundled. They live in a GCS bucket (`seanbearden-assets`). Content references images by filename only; `assetUrl()` and `pdfUrl()` in `content.ts` prepend the `VITE_ASSETS_BASE_URL` env var.

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

`frontend/src/utils/redirects.ts` maps old Squarespace paths (`/news/YYYY/M/D/slug`) to new blog routes. The `NotFoundPage` component checks this on render and redirects via React Router.

### Phases

- **Phase 1** (current): Static portfolio site on Cloud Run
- **Phase 2** (planned): AI resume chatbot — Python FastAPI on second Cloud Run service, proxied via nginx `/api/` block (already stubbed in `nginx.conf.template`)
- **Phase 3** (planned): Interactive data playground

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/utils/content.ts` | Content loading, frontmatter parsing, asset URL builder |
| `frontend/src/utils/redirects.ts` | Old Squarespace URL → new route mapping |
| `frontend/nginx.conf.template` | SPA fallback, asset caching, API proxy stub |
| `Dockerfile` | Multi-stage: node:22-slim build → nginx:1.27-alpine |
| `.changeset/config.json` | Changesets release config |
| `infrastructure/main.tf` | All GCP resources |
| `infrastructure/outputs.tf` | GitHub Actions variables (set via `gh variable set`) |
