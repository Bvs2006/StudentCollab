# Contributing to StudentHub

Thanks for your interest in contributing to StudentHub! We welcome contributions of all sizes — from documentation fixes to new features.

## How to contribute

1. Read the `CODE_OF_CONDUCT.md` and be respectful and inclusive.
2. Search existing issues or open a new issue to discuss larger changes before implementing them.
3. Fork the repo and create a descriptive feature branch:

```bash
git checkout -b feat/short-description
```

4. Make small, focused commits with clear messages. Rebase or squash as appropriate before opening a PR.
5. Open a pull request against `main` with:
	- A clear title and description
	- Screenshots or short verification steps if the change affects UI
	- Link to any related proposal or issue

## Code style and tools

- JavaScript: follow the existing vanilla JS style. We recommend using ESLint and Prettier. If you add dependencies, update `package.json` and include instructions.
- Keep UI changes responsive and accessible.
- Do not commit secrets or environment variables — use a `.env` file and add it to `.gitignore`.

## Pull request checklist

- [ ] My changes follow the repository style
- [ ] I added or updated documentation where needed
- [ ] I opened an issue for major changes (if applicable)
- [ ] CI/lint/format checks pass (when configured)

## Local development

1. Install dependencies:

```bash
npm install
```

2. Serve the project locally:

```bash
npx serve .
```

3. Run linter and formatter (if installed):

```bash
npm run lint
npm run format
```

## Reporting issues

- Use the issue templates when creating bug reports or feature requests.
- Provide steps to reproduce, expected vs actual behavior, and any relevant environment details.

## Code of conduct

All contributors must follow `CODE_OF_CONDUCT.md`.

Thanks — your contributions make StudentHub better for everyone.
