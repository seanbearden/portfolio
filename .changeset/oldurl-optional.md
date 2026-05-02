---
"portfolio": patch
---

Make `BlogPost.oldUrl` optional. Posts without a Squarespace history don't need the field; the redirect logic in `redirects.ts` already truthy-checks before use, so behavior is unchanged for posts that do have it.
