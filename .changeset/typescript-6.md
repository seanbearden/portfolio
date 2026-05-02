---
"portfolio": patch
---

Bump TypeScript 5.9.3 → 6.0.3. Removes `baseUrl` from `tsconfig.json` and `tsconfig.app.json` because TS 6.0 deprecates it; `paths` still resolves correctly under `moduleResolution: "bundler"`. Path alias `@/*` continues to work unchanged.
