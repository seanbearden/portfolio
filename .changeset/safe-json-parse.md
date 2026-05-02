---
"portfolio": patch
---

Refactor `parseFrontmatter` to use a typed `safeJsonParse` helper instead of try/catch as control flow when parsing frontmatter array values. Behavior unchanged.
