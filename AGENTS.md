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
# Retrieval layer (ingestion)
python3 scripts/ingest_portfolio.py

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

### Retrieval Layer (Vector Store)

The portfolio-agent queries a unified knowledge base hosted on **Cloud SQL (PostgreSQL)** with the `pgvector` extension.

- **Database**: `portfolio_vector`
- **Table**: `portfolio_chunks`
- **Embedding Model**: `gemini-embedding-001` (768 dimensions)
- **Ingestion**: Automated via `.github/workflows/reindex.yml` on pushes to `content/`.
- **Chunking Strategy**:
    - Blog/Portfolio: By markdown headings (`#`, `##`, `###`).
    - Publications: Individual entries.
    - Home: Logical sections (Bio, Experience, Education, Skills).

### Content Pipeline

Content lives outside the frontend in `content/` and is loaded at Vite build time:

```
content/blog/*.md          → import.meta.glob("?raw") → parseFrontmatter() → BlogPost[]
content/portfolio/*.md     → import.meta.glob("?raw") → parseFrontmatter() → PortfolioProject[]
content/publications.json  → direct JSON import → Publication[]
content/home.json          → direct JSON import → HomeData
```

All glob imports are **eager** — content is bundled into the JS, not lazy-loaded. The frontmatter parser lives in `frontend/src/utils/parseFrontmatter.ts`. As of PR #80 it's a thin wrapper around `gray-matter` (proper YAML parsing, including quote stripping); a regex fallback in the catch block handles cases where gray-matter throws. Don't add per-key string transforms in the wrapper — gray-matter does it correctly.

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
- **Domain mappings** not in Terraform — created out-of-band via `gcloud beta run domain-mappings create`. Three mappings live: `seanbearden.com` (apex, A/AAAA records), `www.seanbearden.com` (CNAME → `ghs.googlehosted.com`), and `beta.seanbearden.com` (CNAME, used as a staging URL during the Squarespace cutover and kept for future dry-runs). All use Google Trust Services certs.

### Old URL Redirects

`frontend/src/utils/redirects.ts` maps old Squarespace paths (`/news/YYYY/M/D/slug`) to new blog routes via a `Map` lookup. The `NotFoundPage` component checks this on render and redirects via React Router.

### Phases

- **Phase 1** (live, as of 2026-05-03): Static portfolio site on Cloud Run, served at `seanbearden.com` and `www.seanbearden.com`
- **Phase 2** (beta): AI resume chatbot — Python FastAPI on second Cloud Run service, proxied via nginx `/api/` block. Implements production safety guardrails:
    - **Prompt Injection**: Classifier-based detection (`ProtectAI/deberta-v3-base-prompt-injection-v2`).
    - **PII Leak Detection**: Presidio-based anonymization/detection.
    - **Off-topic Filter**: Keyword and semantic filtering to keep conversations professional.
    - **Rate Limiting**: Dual-layer (per-IP via `slowapi` and per-session).
    - **Cost Ceiling**: Daily budget kill switch with graceful fallback to static assets.
    - **Eval Integration**: Guardrail firings logged to Langfuse with `adversarial` tag for automated dataset expansion.
- **Phase 3** (planned): Interactive data playground

## Key Files

| File | Purpose |
|------|---------|
| `scripts/ingest_portfolio.py` | Content ingestion to pgvector |
| `frontend/src/utils/content.ts` | Content loading, asset URL builder |
| `frontend/src/utils/parseFrontmatter.ts` | Custom YAML-ish frontmatter parser |
| `frontend/src/utils/redirects.ts` | Old Squarespace URL → new route mapping |
| `frontend/nginx.conf.template` | SPA fallback, asset caching, API proxy stub |
| `Dockerfile` | Multi-stage: node:22-slim build → nginx:1.27-alpine |
| `.changeset/config.json` | Changesets release config |
| `infrastructure/main.tf` | All GCP resources |
| `infrastructure/outputs.tf` | GitHub Actions variables (set via `gh variable set`) |

## ZAP scan triage policy — `.zap/rules.tsv`

`.zap/rules.tsv` overrides the default action for [ZAP baseline](https://www.zaproxy.org/docs/docker/baseline-scan/) findings. It's tempting to silence noisy alerts; **don't, by default**. Suppression hides regressions.

### Rules of the road

1. **Default is to *not* silence**. The baseline scan is non-failing (`fail_action: false` in `zap-baseline.yml`). A recurring warning in the report is documentation, not a problem. Add suppression only when leaving the warning visible has zero security value.
2. **Verify every finding against the actual artifact before silencing**. Don't trust the alert text. For findings on `/assets/*`, build locally (`cd frontend && npm run build`) and grep `dist/assets/` to confirm what ZAP is matching. Justifications like \"bundled dep\" must be evidenced in the PR body.
3. **Know what a rule ID covers**. Many ZAP rule IDs bundle multiple sub-checks under one number. Rule **10055 (CSP)** covers 13 sub-alerts including `script-src 'unsafe-inline'` and `script-src 'unsafe-eval'`. Suppressing 10055 to silence one sub-alert blinds you to the other twelve. **Check [`zaproxy.org/docs/alerts/<id>`](https://www.zaproxy.org/docs/alerts/) before suppressing.**
4. **Prefer `OUTOFSCOPE` over `IGNORE`** when the noise is path-specific. The rules.tsv parser in [`zap_common.py`](https://github.com/zaproxy/zaproxy/blob/main/docker/zap_common.py) treats column 3 as a comment for `IGNORE`/`WARN`/`FAIL`, but as a **regex URL pattern** for `OUTOFSCOPE`. Use it.
5. **Document the rationale where the choice lives**, not in the rules file. For accepted policy trade-offs (e.g. CSP `style-src 'unsafe-inline'` for `framer-motion`), put the explanation as a comment in `frontend/nginx.conf.template` and let the warning keep firing. Don't IGNORE the rule.

### When each action is appropriate

| Action | When to use | Example |
|---|---|---|
| `IGNORE` (site-wide) | Genuine **scanner artifacts** that will fire on every URL forever, regardless of server config. | `90005 IGNORE  Sec-Fetch-* are browser request headers; ZAP doesn't send them.` |
| `IGNORE` (site-wide) | Purely **informational** rules with no actionable content. | `10109 IGNORE  Modern Web Application — confirms this is an SPA.` |
| `OUTOFSCOPE  .*/assets/.*` | Bundle-only noise from a verified dependency. The same rule still fires on non-bundled URLs. | Dependency strings matching dangerous-JS regex |
| (no entry, leave as default `WARN`) | Accepted policy trade-offs where the warning is itself the audit trail. | `style-src 'unsafe-inline'` for animation libraries |
| `FAIL` | Anything we'd want to **break the scan** on. Reserved for the future when we want hard gates. | — |

### Required PR checklist when modifying `.zap/rules.tsv`

A PR that adds or changes a rule entry must include:

- [ ] Link to the [`zaproxy.org/docs/alerts/<rule-id>`](https://www.zaproxy.org/docs/alerts/) page in the PR body, with a list of all sub-alerts the rule covers.
- [ ] Evidence of verification (grep output, build inspection, or a screenshot from the ZAP report) showing what ZAP actually matched.
- [ ] Justification for `IGNORE` vs `OUTOFSCOPE` vs no-change.
- [ ] If `IGNORE`: explicit acknowledgement of which sub-alerts get silenced and why that's acceptable.

PRs that add `IGNORE` without these get rejected and re-opened with the right scope.

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
- **Apex domain cert provisioning is slow vs CNAME**: Cloud Run domain mapping cert provisioning typically takes ~10-20 min for CNAME-based subdomains (`www`, `beta` → `ghs.googlehosted.com`) but can take **up to several hours** for the apex (A/AAAA records → Google's anycast IPs). Validation goes through a different path. If the apex is stuck in `CertificatePending` with "challenge data was not visible through the public internet": **don't recreate repeatedly** — that doesn't help and may worsen things by burning retry attempts. Wait through the full DNS-cache TTL window from any prior records (4 hours in the Squarespace case). Re-creates *can* clear genuinely wedged state but only after waiting a reasonable interval first.
- **Long DNS TTLs make cutovers slow**: When migrating from another provider, the **old TTL** dictates worst-case propagation, not the new one. Squarespace's preset records had 4-hour TTL we couldn't lower in advance; cutover took ~3 hours for global propagation. Future migrations: lower TTL on the old records *first*, wait the old TTL window to expire, *then* change records.
