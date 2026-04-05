# Changesets

This project uses [changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a changeset

When making a PR, add a changeset describing what changed:

```bash
cd frontend && npx changeset
```

This creates a markdown file in `.changeset/` that gets consumed on release.

## Release flow

1. PRs merged to `main` accumulate changeset files
2. The **Release** GitHub Action opens a "Version Packages" PR that bumps the version and updates `CHANGELOG.md`
3. Merging the Version Packages PR creates a git tag (`v*`)
4. The **Deploy** GitHub Action triggers on the new tag and deploys to Cloud Run
