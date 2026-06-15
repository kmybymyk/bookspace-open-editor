# Contributing

Thanks for helping improve BookSpace Open Editor.

This repository is for the web-based open editor. It is not the full
BookSpace desktop app, and issues for private infrastructure, accounts,
payments, cloud sync, or unreleased Pro workflows are out of scope here.

## Development

```sh
npm install
npm run dev
```

Before opening a pull request, run:

```sh
npm run qa
npm audit --audit-level=moderate
```

## Pull Requests

- Keep changes focused on one behavior or documentation topic.
- Add or update tests when changing EPUB export, project storage, import, or
  editor behavior.
- Keep UI changes close to the existing BookSpace Open Editor layout and
  interaction style.
- Do not include secrets, real user content, unpublished desktop app code, or
  deployment credentials.
- Update documentation when behavior, commands, or deployment steps change.

## Project Boundaries

Good contribution areas:

- EPUB package generation and validation
- `.bksp` project file compatibility
- Web editor UX
- Import/export workflows
- Accessibility and responsive layout
- Documentation and QA coverage

Out of scope for this repository:

- BookSpace desktop app internals
- Hosted service infrastructure
- Account, payment, or cloud storage implementation
- Proprietary publishing workflows

## License

By contributing, you agree that your contribution is licensed under the
Apache License 2.0.
