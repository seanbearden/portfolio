---
"portfolio": patch
---

Optimize old-Squarespace URL redirect resolution to use a `Map` lookup instead of array iteration, reducing per-navigation overhead on 404s.
