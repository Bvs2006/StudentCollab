# StudentHub

StudentHub is a lightweight, contributor-friendly frontend prototype for discovering, pitching, and collaborating on student projects.

**This repository is maintained as a community project. Contributions, issues, and pull requests are welcome.**

**Quick links**

- Home: index.html
- Pages: pages/
- Styles: assets/css/style.css
- Scripts: assets/js/

## Getting started

Recommended: use Node.js and a static server for development so live-reload tools can be added later.

1. Install Node.js (v16+ recommended).
2. Install dev dependencies:

```bash
npm install
```

3. Serve locally:

```bash
npm run start
# or
python -m http.server 8080
```

## Development workflow

- Fork the repository and create a feature branch: `git checkout -b feat/short-description`.
- Make focused changes, add tests for logic where feasible, and run lint/format scripts before committing.
- Open a pull request with a description of the change and any manual verification steps.

## Contribution guide

- See the full contributing guide: [CONTRIBUTING.md](CONTRIBUTING.md).
- Follow the Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

### PR checklist

- [ ] I read the contribution guidelines
- [ ] Changes are small and scoped to one purpose
- [ ] Lint and formatting pass: `npm run lint` and `npm run format`
- [ ] No sensitive data is committed (use `.env` and `.gitignore`)

## Project structure

```text
.
|-- assets/
|   |-- css/        # shared styling
|   `-- js/         # browser scripts and feature logic
|-- pages/          # secondary HTML pages
|-- utils/          # Supabase helper files kept for future backend integration
|-- __tests__/      # Jest tests
|-- index.html      # app entry page
|-- package.json    # scripts and dependencies
`-- README.md
```

## Recommended tools

- ESLint for JS linting
- Prettier for consistent formatting
- GitHub Actions for CI checks

## Licensing

This project is distributed under the MIT License. See the `LICENSE` file for details.

## Maintainers & Contact

If you want to help maintain the project, open an issue or mention it when opening a PR.
