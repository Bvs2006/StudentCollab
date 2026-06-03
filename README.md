# StudentHub

> **The verified organisation workspace for student collaboration** — projects, DSA prep, alumni interviews, learning events, and ideas. All in one place.

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/Bvs2006/StudentCollab/ci.yml?branch=main&label=CI)](/.github/workflows/ci.yml)
[![ESLint](https://img.shields.io/badge/code%20style-eslint-brightgreen)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/formatter-prettier-ff69b4)](https://prettier.io/)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](package.json)

---

## ✨ What is StudentHub?

StudentHub is a **full-featured, organisation-verified student collaboration platform** built with vanilla HTML, CSS, and JavaScript. It provides a complete workspace for colleges, departments, and student organisations to manage their students' collaborative activities — from project proposals to alumni mock interviews.

Each organisation gets its own scoped workspace. Students log in with their **college email**, and every feature — projects, ideas, DSA prep, interviews, events — is kept inside that organisation boundary.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🏗️ **Projects** | Browse, filter, create, and join peer projects with skill-tag matching |
| 💡 **Ideas Board** | Pitch early-stage concepts and collect collaborators |
| 📋 **Proposals** | Submit structured project proposals; admins review and accept |
| 🔐 **Auth & Roles** | College-email login; Student, Org Admin, and Global Admin roles |
| 🏢 **Organisations** | Scoped multi-tenant workspaces per organisation |
| 🧠 **DSA Prep** | Post help requests for algorithms/data structures; peers respond |
| 🎤 **Alumni Interviews** | Book mock interviews with alumni mentors |
| 📅 **LearningLab Events** | Discover and register for workshops and study sessions |
| 🎯 **Opportunities** | Internship board with filterable status tabs (Open / Watchlist / Closed) |
| 🛡️ **Admin Dashboard** | Full moderation: proposals, projects, events, students, DSA & interview queues |
| 🌙 **Dark / Light Mode** | CSS custom-property theme system, switchable at runtime |
| 📱 **Responsive** | Mobile-friendly layouts on every page |

---

## 🖥️ Pages

```
index.html              → Landing page (featured projects + trending ideas)
pages/
  login.html            → College-email login & registration
  profile.html          → Student profile editor
  projects.html         → Project browser with search & filters
  proposals.html        → Submit a new project proposal
  ideas.html            → Ideas board
  dsa.html              → DSA help request board
  interviews.html       → Alumni mock interview booking
  learninglab.html      → Learning events calendar
  opportunities.html    → Internship / opportunity board (filterable)
  organizations.html    → Public organisation directory
  about.html            → About the platform
  admin.html            → Admin dashboard (role-gated)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **UI** | Vanilla HTML5 + CSS3 (custom properties, glassmorphism, animations) |
| **Logic** | Vanilla JavaScript (ES2020), modular IIFE pattern |
| **Fonts** | Google Fonts — Syne (display) + DM Sans (body) |
| **Storage** | `localStorage` for offline-first data; Supabase ready for cloud sync |
| **Auth** | Supabase Auth (optional) — falls back gracefully to localStorage |
| **Tooling** | ESLint · Prettier · Jest · Husky · lint-staged |
| **CI** | GitHub Actions (lint + test on every push/PR) |

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** v16 or higher
- **npm** v8 or higher

### Install & Run

```bash
# 1. Clone the repository
git clone https://github.com/Bvs2006/StudentCollab.git
cd StudentCollab

# 2. Install dev dependencies
npm install

# 3. Serve locally
npm run start
# → Opens at http://localhost:5000
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run start` | Serve site locally with `serve` |
| `npm run lint` | Run ESLint over `assets/js/` |
| `npm run format` | Auto-format all files with Prettier |
| `npm run test` | Run Jest unit tests |
| `npm run prepare` | Install Husky git hooks (auto-runs on `npm install`) |

---

## 🔐 Supabase (Optional Cloud Backend)

StudentHub works **100% offline** using `localStorage`. To enable cloud persistence and real authentication:

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local` and fill in your keys:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

3. The client wrappers in `utils/supabase/` will pick up the configuration automatically.

> ⚠️ **Never commit real keys.** `.env.local` is in `.gitignore`.

---

## 👥 Default Demo Accounts

When running without Supabase (localStorage mode), you can use the built-in seed accounts:

| Role | Email | Password |
|---|---|---|
| Global Admin | `admin@studenthub.local` | `admin123` |
| Org Admin | `org@adityauniversity.edu` | `admin123` |
| Student | `student@adityauniversity.edu` | `student123` |

---

## 🏗️ Project Structure

```
studenthub/
├── assets/
│   ├── css/
│   │   └── style.css          # Full design system & all page styles
│   └── js/
│       ├── app.js             # Core SH namespace, auth, data helpers
│       ├── data.js            # Seed data for offline mode
│       ├── home.js            # Landing page featured content loader
│       ├── admin.js           # Admin dashboard logic
│       ├── proposals.js       # Proposal form submission
│       └── aditya-projects.js # Projects browser & filter
├── pages/                     # All secondary HTML pages
├── utils/
│   └── supabase/              # Supabase client/server/middleware wrappers
├── docs/                      # Extended documentation
│   ├── ARCHITECTURE.md
│   ├── PROJECT_DOCUMENTATION.md
│   ├── SETUP.md
│   ├── USER_GUIDES.md
│   └── EVENTS_GUIDE.md
├── __tests__/                 # Jest test suite
├── .github/
│   ├── workflows/ci.yml       # CI: lint + test on push/PR
│   └── ISSUE_TEMPLATE/
├── index.html                 # App entry point
├── package.json
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── LICENSE
```

---

## 🧪 Testing & Quality

```bash
# Lint
npm run lint

# Format check
npm run format

# Tests
npm run test
```

CI runs automatically on every push and pull request via GitHub Actions. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## 🚀 Deployment

StudentHub is a **zero-build static site** and deploys to any platform:

| Platform | Command / Steps |
|---|---|
| **GitHub Pages** | Push to `gh-pages` branch or configure in repo settings |
| **Netlify** | Drag-and-drop the repo folder, or connect GitHub repo |
| **Vercel** | `vercel --prod` from the project root |
| **Cloudflare Pages** | Connect repo, no build command needed |

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

**Quick contribution checklist:**
- [ ] Create a feature branch: `git checkout -b feat/short-description`
- [ ] Run `npm run lint` and `npm run format` before committing
- [ ] Add/update tests in `__tests__/` for any logic changes
- [ ] Open a PR with screenshots if you changed the UI

See also: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

---

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

Built as a community project for students, by students. Special thanks to all contributors who have submitted issues, PRs, and feedback.

---

<p align="center">
  <strong>StudentHub</strong> — One verified workspace per organisation.<br/>
  <a href="pages/about.html">About</a> · <a href="CONTRIBUTING.md">Contribute</a> · <a href="https://github.com/Bvs2006/StudentCollab/issues">Issues</a>
</p>
