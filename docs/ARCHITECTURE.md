# Architecture Overview

StudentHub is a lightweight frontend-first prototype built with vanilla HTML, CSS, and JavaScript. It is designed to be easy for contributors to understand and extend.

Directory layout

- `index.html` — Landing page and main UX
- `pages/` — Secondary pages (projects, ideas, proposals, admin, profile)
- `css/` — Styles (single stylesheet: `style.css`)
- `js/` — Frontend logic and shared utilities (`data.js`, `app.js`, `home.js`)
- `utils/supabase/` — Supabase client and server helpers for optional backend integration
- `docs/` — Project documentation (this folder)

Key design points

- Frontend-first: the UI works fully without a backend using `localStorage` for persistence.
- Optional Supabase integration: `SH.SUPABASE_URL` and `SH.SUPABASE_KEY` in `js/app.js` allow swapping in Supabase REST endpoints for projects and ideas.
- Minimal build tooling: development uses `serve` as a static server; linting and formatting are provided by ESLint and Prettier.

Data flow

- `js/data.js` defines initial data and fallback mock datasets.
- `js/app.js` contains helpers to fetch/save to Supabase, render cards, modals, and UI state.
- Components are simple functions that return HTML strings injected into the DOM.

Extending the project

- To add authentication, integrate Supabase Auth in `utils/supabase/client.ts` and expose login UI in `pages/profile.html`.
- To add persistent events/meetings, create a `events` table in Supabase and add REST endpoints used by `js/app.js`.

Deployment

- Static hosting (GitHub Pages, Netlify, Vercel) works as-is. For a server-backed deployment, host `utils/` server code on a small Node/Edge function and point frontend calls to it.
