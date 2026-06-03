# Changelog

All notable changes to **StudentHub** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-06-03

### 🎉 First stable release

This marks the completion of the core StudentHub feature set. All primary student and admin workflows are implemented, tested, and production-ready.

### Added

#### Landing Page

- **Featured Campus Projects** section — dynamically renders the top 3 projects from the workspace directly on the home page via `home.js`.
- **Trending Ideas** section — displays the latest 4 student ideas inline with links to the full Ideas Board.
- GitHub stats widget (stars, forks, contributors) in the hero area.
- Proof-bar with animated contributor avatars.

#### Opportunities Page

- Interactive **status filter tabs** (All / Open / Watchlist / Closed) — clicking a tab filters internship cards by their `.opp-status` class without a page reload.
- Active tab highlighted with accent colour; smooth transition on hover.

#### Admin Dashboard

- **DSA Help Requests panel** — lists all student DSA doubt requests scoped to the active organisation; admins can click "Mark Resolved" to close each request.
- **Alumni Mock Interview Bookings panel** — shows all pending interview requests; admins can enter an alumnus mentor name, "Confirm Match" to assign, and "Mark Completed" to close the session.
- Status colour badges: pending (grey), matched (yellow), completed (green).
- Overview metrics now correctly count DSA help requests and pending interview bookings.

#### Core App (`app.js`)

- `SH.filterByActiveOrg()` — org-scoped data filtering used across all admin panels.
- `SH.requireAuth(['admin', 'org_admin'])` — role gate protecting the admin dashboard.
- `SH.safeJsonArray()` — defensive JSON loader with empty-array fallback.
- `SH.loadOrgStudents()` / `SH.importOrgStudents()` — student roster management.
- `SH.loadOrgRequests()` / `SH.approveOrgRequest()` / `SH.rejectOrgRequest()` — organisation workspace approval flow.
- `SH.renderProjectCard()` / `SH.renderIdeaItem()` — reusable card renderers.
- Toast notification system (`SH.toast()`).
- `SH.escapeHtml()` — XSS-safe output helper used across all dynamic HTML.
- Dark/light theme system via CSS custom properties (`data-theme` attribute).

#### Design System (`style.css`)

- Full dark-mode-first design with `--bg`, `--surface`, `--accent`, `--text` token cascade.
- Light mode overrides via `:root[data-theme='light']`.
- Glassmorphism nav with `backdrop-filter: blur(16px)`.
- Animated page-load skeleton states.
- Responsive grid layouts for projects, ideas, and organisation cards.
- `admin-metrics` strip, `panel`, `joined-project`, `mini-link-btn`, `role-badge` components.
- `empty-state` with animated icon for all zero-data views.
- Custom scrollbar styling.

#### Pages Added / Completed

- `pages/dsa.html` — DSA help request board with topic/level tagging.
- `pages/interviews.html` — Alumni mock interview booking form (track, date/time, note, budget).
- `pages/learninglab.html` — LearningLab events calendar.
- `pages/opportunities.html` — Internship board with filter tabs.
- `pages/organizations.html` — Public organisation directory with request workspace flow.
- `pages/profile.html` — Student profile editor (name, role, skills, GitHub, bio).
- `pages/about.html` — Platform about page.
- `pages/admin.html` — Role-gated admin dashboard (all panels).

#### Tooling & CI

- ESLint (`eslint-config-prettier`) configured for `assets/js/`.
- Prettier with `.prettierrc` for consistent formatting.
- Husky + lint-staged pre-commit hooks.
- GitHub Actions CI (`ci.yml`) — runs `npm run lint` and `npm test` on every push and pull request.
- Jest test suite with baseline sanity test.
- `.editorconfig` for cross-editor consistency.

#### Documentation

- `README.md` — complete with feature table, tech stack, quick-start guide, demo accounts, project structure, deployment options, and contribution guide.
- `CHANGELOG.md` — this file.
- `CONTRIBUTING.md` — full contributor guide with PR checklist.
- `CODE_OF_CONDUCT.md` — community standards.
- `docs/ARCHITECTURE.md` — system architecture overview with Mermaid diagram.
- `docs/PROJECT_DOCUMENTATION.md` — comprehensive feature and API reference.
- `docs/SETUP.md` — extended setup instructions.
- `docs/USER_GUIDES.md` — user-facing feature walkthroughs.
- `docs/EVENTS_GUIDE.md` — LearningLab events admin guide.
- `docs/CONTRIBUTING_FLOW.md` — visual contribution flow diagram.
- GitHub issue templates and PR template.

### Changed

- `package.json` bumped to version `1.0.0` with full metadata (repository, homepage, bugs, author, keywords, engines).
- Added `npm run dev`, `npm run lint:fix`, `npm run format:check`, `npm run test:watch`, `npm run test:coverage`, and `npm run validate` scripts.

### Fixed

- `index.html` was missing `#featured-projects` and `#home-ideas` containers; `home.js` now has valid mount points and renders correctly.
- Admin dashboard was not rendering DSA help requests or alumni interview bookings — both panels added and wired to `admin.js`.
- Opportunities status tabs were static decorations; they now filter cards by `opp-status` class.
- `SH.filterByActiveOrg()` was applied consistently across all admin render functions to prevent cross-org data leakage.
- Login redirect: `login.html` now correctly restores the intended post-login destination from `sessionStorage`.

---

## [0.1.0] — 2026-05-01 (initial prototype)

### Added

- Initial repository scaffold: `index.html`, `assets/`, `pages/`, `utils/supabase/`.
- Basic project listing (`projects.html`) and proposal form (`proposals.html`).
- Supabase client/server/middleware wrapper stubs.
- ESLint and Prettier dev tooling.
- MIT License, README, and CONTRIBUTING stubs.

---

[1.0.0]: https://github.com/Bvs2006/StudentCollab/releases/tag/v1.0.0
[0.1.0]: https://github.com/Bvs2006/StudentCollab/releases/tag/v0.1.0
