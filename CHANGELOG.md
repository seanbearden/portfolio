# portfolio

## 0.3.2

### Patch Changes

- [#129](https://github.com/seanbearden/portfolio/pull/129) [`84299e6`](https://github.com/seanbearden/portfolio/commit/84299e63bc53c46b482495fb001f15688b6bbf2a) Thanks [@seanbearden](https://github.com/seanbearden)! - Add route-table tests for App.

- [#126](https://github.com/seanbearden/portfolio/pull/126) [`6e277e9`](https://github.com/seanbearden/portfolio/commit/6e277e9e62d7cec1caf923df70ffb55acb77b6a2) Thanks [@seanbearden](https://github.com/seanbearden)! - Add test coverage for blog post route.

- [#131](https://github.com/seanbearden/portfolio/pull/131) [`4c54ad4`](https://github.com/seanbearden/portfolio/commit/4c54ad41e1579e3d20ed9145d0df61d5e7433a17) Thanks [@seanbearden](https://github.com/seanbearden)! - Add reduced-motion branch coverage for page components.

- [#127](https://github.com/seanbearden/portfolio/pull/127) [`9cffb07`](https://github.com/seanbearden/portfolio/commit/9cffb07ee44195ca68b3c84eaa7ff9708f0d6bcd) Thanks [@seanbearden](https://github.com/seanbearden)! - Add tests for Button and Card UI primitives.

- [#140](https://github.com/seanbearden/portfolio/pull/140) [`c3121b5`](https://github.com/seanbearden/portfolio/commit/c3121b54f815d418e3baf6386944f146c8c75578) Thanks [@seanbearden](https://github.com/seanbearden)! - Auto-generate YouTube thumbnails for portfolio cards.

- [#135](https://github.com/seanbearden/portfolio/pull/135) [`31038e0`](https://github.com/seanbearden/portfolio/commit/31038e04c0cd03ec6fcf12dcb9df4730a183e109) Thanks [@seanbearden](https://github.com/seanbearden)! - Extend page component branch coverage.

- [#141](https://github.com/seanbearden/portfolio/pull/141) [`1b4da99`](https://github.com/seanbearden/portfolio/commit/1b4da999957d0098cf358819bcd58c8dec8c02d2) Thanks [@seanbearden](https://github.com/seanbearden)! - Fix Contact page email link silently failing for users without a default mail client. Clicking the email now copies it to the clipboard with visible feedback while still attempting to open the user's mail app. Also redirects the Footer "Contact" link to the /contact page instead of mailto:.

- [#143](https://github.com/seanbearden/portfolio/pull/143) [`59fc700`](https://github.com/seanbearden/portfolio/commit/59fc7009cc793146d569c4f7483d3a022e86d4fb) Thanks [@seanbearden](https://github.com/seanbearden)! - Fix broken UB Goldwater Scholars press link on home page (UB reorganized the news URL path; new URL points to the same article with its actual title).

- [#138](https://github.com/seanbearden/portfolio/pull/138) [`b9a04d0`](https://github.com/seanbearden/portfolio/commit/b9a04d0e93835b1bf6380da246df9362ee510b17) Thanks [@seanbearden](https://github.com/seanbearden)! - Harden frontmatter parsing by stripping surrounding quotes in the fallback parser to prevent malformed URLs.

- [#124](https://github.com/seanbearden/portfolio/pull/124) [`18465df`](https://github.com/seanbearden/portfolio/commit/18465dfceedcae0ee8048b222ff09f7df7c80d46) Thanks [@seanbearden](https://github.com/seanbearden)! - Resolve security alerts from ZAP scan by hardening Nginx configuration, adding robots.txt and sitemap.xml, and triaging false positives.

## 0.3.1

### Patch Changes

- [#109](https://github.com/seanbearden/portfolio/pull/109) [`c41d760`](https://github.com/seanbearden/portfolio/commit/c41d7609de3b4b29947f7521a6adcce9b06133d0) Thanks [@seanbearden](https://github.com/seanbearden)! - Cache HTML as no-cache and hashed assets as immutable.

- [#110](https://github.com/seanbearden/portfolio/pull/110) [`a044d92`](https://github.com/seanbearden/portfolio/commit/a044d928d2cd9ac102aefeb64559c02cd164cb23) Thanks [@seanbearden](https://github.com/seanbearden)! - Add cross-origin isolation response headers (COOP/CORP).

## 0.3.0

### Minor Changes

- [#11](https://github.com/seanbearden/portfolio/pull/11) [`18fc87b`](https://github.com/seanbearden/portfolio/commit/18fc87b455693ecc2d54565e58a77b28b5347ab4) Thanks [@seanbearden](https://github.com/seanbearden)! - Expand About page bio with multi-paragraph narrative and add "Beyond Work" interests section.

- [#12](https://github.com/seanbearden/portfolio/pull/12) [`07388ef`](https://github.com/seanbearden/portfolio/commit/07388ef0d2de7b888cadad10edd7889fbe62c168) Thanks [@seanbearden](https://github.com/seanbearden)! - Add "Chat with My Resume" CTA to home page hero, linking to the existing resume chatbot at bearden-resume-chatbot.com (until Phase 2 ports it to /chat).

- [#34](https://github.com/seanbearden/portfolio/pull/34) [`5de0564`](https://github.com/seanbearden/portfolio/commit/5de0564eee6cbc555d60a13b6e123f03994cc137) Thanks [@seanbearden](https://github.com/seanbearden)! - Add a CV download link separate from the Resume on the home and About pages, sourcing `Bearden_CV.pdf` from the assets bucket.

- [#34](https://github.com/seanbearden/portfolio/pull/34) [`5de0564`](https://github.com/seanbearden/portfolio/commit/5de0564eee6cbc555d60a13b6e123f03994cc137) Thanks [@seanbearden](https://github.com/seanbearden)! - Improve Featured Project cards on the home page with richer summaries and surface them through new `PortfolioProject` fields.

- [#9](https://github.com/seanbearden/portfolio/pull/9) [`ab8b799`](https://github.com/seanbearden/portfolio/commit/ab8b799ed38eeb5e6a7584527778b599660e534b) Thanks [@seanbearden](https://github.com/seanbearden)! - Add profile photo to home page hero for stronger visual identity.

- [#87](https://github.com/seanbearden/portfolio/pull/87) [`15bec21`](https://github.com/seanbearden/portfolio/commit/15bec211b15575dce727ca7f430c2857ad74cfab) Thanks [@seanbearden](https://github.com/seanbearden)! - Modernize website design with a default dark theme, fluid framer-motion animations, and subtle background elements.

- [#13](https://github.com/seanbearden/portfolio/pull/13) [`bd0d8c1`](https://github.com/seanbearden/portfolio/commit/bd0d8c1ff20e65e2bdfc973969f5465d2af0b593) Thanks [@seanbearden](https://github.com/seanbearden)! - Add Press & Media section to About page surfacing external coverage (Physics Today, Story Collider, Buffalo News, UB Reporter, Ohio Today, The Spectrum).

### Patch Changes

- [#84](https://github.com/seanbearden/portfolio/pull/84) [`1e4f291`](https://github.com/seanbearden/portfolio/commit/1e4f29132c6092f44efbd23d548eed1fe5c92363) Thanks [@seanbearden](https://github.com/seanbearden)! - Add tests for cn() utility (Lib coverage to 100%).

- [#89](https://github.com/seanbearden/portfolio/pull/89) [`acbaba8`](https://github.com/seanbearden/portfolio/commit/acbaba8cdff2321fa2f6ffea78f0940063807111) Thanks [@seanbearden](https://github.com/seanbearden)! - Add render tests for HomePage, AboutPage, PublicationsPage, PortfolioPage, BlogPage, ContactPage, and NotFoundPage.

- [#88](https://github.com/seanbearden/portfolio/pull/88) [`07a5757`](https://github.com/seanbearden/portfolio/commit/07a57572f8bf0d5d7467bb9eb23d25c3e18492c3) Thanks [@seanbearden](https://github.com/seanbearden)! - Add render tests for Header, Footer, Layout, and SocialIcon components to ensure core UI stability.

- [#86](https://github.com/seanbearden/portfolio/pull/86) [`d076fea`](https://github.com/seanbearden/portfolio/commit/d076fea96a5ae9d2f0839e3ec96e07107a4bd259) Thanks [@seanbearden](https://github.com/seanbearden)! - Bootstrap React component testing with @testing-library/react + jsdom

- [#34](https://github.com/seanbearden/portfolio/pull/34) [`5de0564`](https://github.com/seanbearden/portfolio/commit/5de0564eee6cbc555d60a13b6e123f03994cc137) Thanks [@seanbearden](https://github.com/seanbearden)! - Use dynamic social links and email from `home.json` in the site Header and Footer instead of hardcoded values, so contact info stays in sync with the home page.

- [#34](https://github.com/seanbearden/portfolio/pull/34) [`5de0564`](https://github.com/seanbearden/portfolio/commit/5de0564eee6cbc555d60a13b6e123f03994cc137) Thanks [@seanbearden](https://github.com/seanbearden)! - Fix `import.meta.glob` typing in `content.ts` so the eager raw-content map is properly typed without manual assertions.

- [#60](https://github.com/seanbearden/portfolio/pull/60) [`cbc94e4`](https://github.com/seanbearden/portfolio/commit/cbc94e4e53b6323047554068c69f400ddaf74c0f) Thanks [@seanbearden](https://github.com/seanbearden)! - Bump shipped runtime dependencies in the Dependabot minor-and-patch group: `react` 19.2.4 → 19.2.5, `react-dom` 19.2.4 → 19.2.5, `react-router` 7.14.0 → 7.14.2, `@base-ui/react` 1.3.0 → 1.4.1, `lucide-react` 1.7.0 → 1.14.0, plus build-tool patches (`tailwindcss`, `@tailwindcss/vite`, `shadcn`).

- [#60](https://github.com/seanbearden/portfolio/pull/60) [`cbc94e4`](https://github.com/seanbearden/portfolio/commit/cbc94e4e53b6323047554068c69f400ddaf74c0f) Thanks [@seanbearden](https://github.com/seanbearden)! - Bump nginx Docker base image from `1.27-alpine` to `1.29-alpine` for the runtime container served from Cloud Run.

- [#93](https://github.com/seanbearden/portfolio/pull/93) [`80f0675`](https://github.com/seanbearden/portfolio/commit/80f06750331ed00878f2cca8e9a3b14b1497571f) Thanks [@seanbearden](https://github.com/seanbearden)! - Harden nginx security headers (HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options) so the Cloud Run revision passes Mozilla Observatory at grade B+ on cutover.

- Make `BlogPost.oldUrl` optional. Posts without a Squarespace history don't need the field; the redirect logic in `redirects.ts` already truthy-checks before use, so behavior is unchanged for posts that do have it.

- Extract `parseAndSortBlogPosts(modules)` as a pure function from `getBlogPosts`, enabling unit tests for the sorting and edge-case handling without mocking Vite's `import.meta.glob`. Behavior unchanged.

- [#34](https://github.com/seanbearden/portfolio/pull/34) [`5de0564`](https://github.com/seanbearden/portfolio/commit/5de0564eee6cbc555d60a13b6e123f03994cc137) Thanks [@seanbearden](https://github.com/seanbearden)! - Extract `parseFrontmatter` to its own module and add tests covering empty-input edge cases. Adds `vitest`/`jsdom` dev tooling.

- [#34](https://github.com/seanbearden/portfolio/pull/34) [`5de0564`](https://github.com/seanbearden/portfolio/commit/5de0564eee6cbc555d60a13b6e123f03994cc137) Thanks [@seanbearden](https://github.com/seanbearden)! - Remove redundant ternary in `PortfolioPage` project link rendering.

- [#34](https://github.com/seanbearden/portfolio/pull/34) [`5de0564`](https://github.com/seanbearden/portfolio/commit/5de0564eee6cbc555d60a13b6e123f03994cc137) Thanks [@seanbearden](https://github.com/seanbearden)! - Optimize old-Squarespace URL redirect resolution to use a `Map` lookup instead of array iteration, reducing per-navigation overhead on 404s.

- [#34](https://github.com/seanbearden/portfolio/pull/34) [`5de0564`](https://github.com/seanbearden/portfolio/commit/5de0564eee6cbc555d60a13b6e123f03994cc137) Thanks [@seanbearden](https://github.com/seanbearden)! - Add tests for `resolveOldUrl` covering Squarespace path normalization and unknown-slug fallback.

- [#31](https://github.com/seanbearden/portfolio/pull/31) [`b0e24da`](https://github.com/seanbearden/portfolio/commit/b0e24da9ecb6c5b33c3293c8c70f76e60842799c) Thanks [@seanbearden](https://github.com/seanbearden)! - Refactor `parseFrontmatter` to use a typed `safeJsonParse` helper instead of try/catch as control flow when parsing frontmatter array values. Behavior unchanged.

- [#60](https://github.com/seanbearden/portfolio/pull/60) [`cbc94e4`](https://github.com/seanbearden/portfolio/commit/cbc94e4e53b6323047554068c69f400ddaf74c0f) Thanks [@seanbearden](https://github.com/seanbearden)! - Refactor social icon mapping into a unified `SocialIcons` component shared between Header, Footer, and ContactPage. No visual change.

- [#97](https://github.com/seanbearden/portfolio/pull/97) [`e05d7d9`](https://github.com/seanbearden/portfolio/commit/e05d7d9adfb092b0d285f54659071197ae248ca8) Thanks [@seanbearden](https://github.com/seanbearden)! - Stub IntersectionObserver, ResizeObserver, and matchMedia in the test setup so framer-motion components can mount under jsdom without crashing.

- [#85](https://github.com/seanbearden/portfolio/pull/85) [`840f2c3`](https://github.com/seanbearden/portfolio/commit/840f2c350ed4b996d565e1684bca85dbf8948aba) Thanks [@seanbearden](https://github.com/seanbearden)! - Expand Utils coverage with asset URL helpers and content data accessors

- [#55](https://github.com/seanbearden/portfolio/pull/55) [`34953a8`](https://github.com/seanbearden/portfolio/commit/34953a8d8ba06d41ec067edbc2b22a715a0b52a4) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump TypeScript 5.9.3 → 6.0.3. Removes `baseUrl` from `tsconfig.json` and `tsconfig.app.json` because TS 6.0 deprecates it; `paths` still resolves correctly under `moduleResolution: "bundler"`. Path alias `@/*` continues to work unchanged.

- [#60](https://github.com/seanbearden/portfolio/pull/60) [`cbc94e4`](https://github.com/seanbearden/portfolio/commit/cbc94e4e53b6323047554068c69f400ddaf74c0f) Thanks [@seanbearden](https://github.com/seanbearden)! - Bump Vite 8.0.3 → 8.0.10 (patch updates from upstream). Affects the production bundle output.

## 0.2.0

### Minor Changes

- [#1](https://github.com/seanbearden/portfolio/pull/1) [`9ed2613`](https://github.com/seanbearden/portfolio/commit/9ed2613c5ac44591b4b8fbec9eb4efd0c52f50b9) Thanks [@seanbearden](https://github.com/seanbearden)! - Initial portfolio site with full Squarespace content migration

  - React 19 + Vite + TypeScript + Shadcn/ui + Tailwind CSS
  - 25 blog posts migrated from Squarespace with frontmatter
  - 8 portfolio projects with descriptions, skills, and links
  - 6 peer-reviewed publications page
  - About page with experience, education, awards, and skills
  - Contact page with social links
  - Old Squarespace URL redirect support
  - GCP infrastructure: Cloud Run, Cloud Storage, Artifact Registry, WIF
  - CI/CD pipeline with GitHub Actions
  - Changeset-based release workflow with automated changelogs
