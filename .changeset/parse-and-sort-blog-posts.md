---
"portfolio": patch
---

Extract `parseAndSortBlogPosts(modules)` as a pure function from `getBlogPosts`, enabling unit tests for the sorting and edge-case handling without mocking Vite's `import.meta.glob`. Behavior unchanged.
