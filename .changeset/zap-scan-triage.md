---
"portfolio": patch
---

Triage ZAP baseline scan alerts:
- Resolved Information Disclosure (Rule 10027) by removing a deployment-related comment from `sitemap.xml`.
- Documented accepted trade-offs for caching policies (Rules 10049, 10015) in `nginx.conf.template`, favoring freshness for HTML and performance for static assets.
- Re-confirmed that existing justifications for CSP `style-src 'unsafe-inline'` (Rule 10055) and COEP `unsafe-none` (Rule 90004) in `nginx.conf.template` remain necessary for compatibility with framer-motion and GCS assets, respectively.
