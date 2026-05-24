# Contribution Flow & Process

This document explains how community members can contribute to StudentHub.

1. Find or open an issue
- Search existing issues to avoid duplication.
- Use the issue templates when creating bug reports or feature requests.

2. Discuss larger changes
- For major features (events, auth, integrations) open an issue to discuss scope and design before coding.

3. Create a branch

```bash
git checkout -b feat/your-feature
```

4. Small commits & tests
- Keep commits focused and descriptive. Add tests for logic where appropriate.

5. Run lint and format before pushing

```bash
npm run lint
npm run format
```

6. Open a Pull Request
- Use the PR template and include verification steps, screenshots, and links to related issues or proposals.
- The maintainers will review and may request changes.

7. Merge and deploy
- After approval, merge the PR. For simple static changes, GitHub Pages / Netlify can auto-deploy. For server integrations, coordinate environment variables and Supabase settings.

Maintainer guidelines
- Aim for timely reviews. Use labels to triage issues (bug, enhancement, help wanted).
- Keep the `main` branch stable; use protected branches and CI checks.
