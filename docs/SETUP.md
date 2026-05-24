# Setup & Local Development

Follow these steps to run StudentHub locally for development.

Prerequisites
- Node.js v16+ and npm
- Git

Install dependencies

```bash
git clone <repo-url>
cd studenthub
npm install
```

Prepare developer hooks (Husky)

```bash
npm run prepare
```

Run the local static server

```bash
npm run start
# opens at http://localhost:3000
```

Lint, format and test

```bash
npm run lint
npm run format
npm test
```

Notes
- Secrets and API keys must not be committed. Use a `.env` file and add it to `.gitignore`.
- The project uses Supabase for optional persistence; see `utils/supabase` for server helpers.
