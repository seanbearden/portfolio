# Security Policy

## Reporting a vulnerability

If you find a security issue in this repository or the deployed site, please report it privately rather than opening a public issue.

**Preferred:** use [GitHub's private vulnerability reporting](https://github.com/seanbearden/portfolio/security/advisories/new) — this opens a private channel between you and the maintainer.

**Alternative:** email `seanbearden@seanbearden.com`.

You can expect:

- Acknowledgement within 7 days
- A resolution or mitigation plan within 30 days for confirmed issues
- Public disclosure coordinated with you after a fix ships

## Scope

This policy covers:

- The site at https://seanbearden.com (and the underlying Cloud Run service)
- Code in this repository (`frontend/`, `infrastructure/`, `scripts/`, GitHub Actions workflows)

Out of scope: third-party services this site links to (LinkedIn, GitHub, etc.) — please report those to the respective providers.

## Supported versions

Only the latest tagged release is supported. The site auto-deploys from `v*` tags on `main`; older versions are not maintained.
