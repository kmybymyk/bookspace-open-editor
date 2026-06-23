# Open Source Documentation Scope

This repository is intended to be useful to users and contributors without
exposing BookSpace private operations. Use this guide when adding or reviewing
documentation.

## Public Documents

These documents are intended to stay public in this repository:

- `README.md`: project overview, feature scope, local development, QA, and deploy guardrails
- `LICENSE`: Apache-2.0 license terms
- `NOTICE`: third-party notices when required
- `CONTRIBUTING.md`: contribution process and maintainer expectations
- `CODE_OF_CONDUCT.md`: community behavior expectations
- `SECURITY.md`: responsible security reporting channel
- `DESIGN.md`: public design-system and UI direction for the open web editor
- `docs/architecture.md`: implementation structure for contributors
- `docs/deployment.md`: public deploy guardrails and verification checklist
- `docs/epub-import.md`: EPUB import support matrix and limits
- `docs/epub-export.md`: EPUB export structure and validation approach
- `docs/project-format.md`: `.bksp` project format and compatibility notes
- `docs/qa.md`: automated and manual QA expectations

## Public With Care

The following topics can be documented publicly, but must stay high-level:

- Production deploy shape, such as the editor being mounted under `/editor/`
- SEO operations, such as sitemap submission and indexing requests
- Analytics event categories and public measurement behavior
- BookSpace Web versus desktop app scope differences
- Roadmap items that are already intended to be public

## Keep Private

Do not commit documentation containing:

- API keys, access tokens, cookies, or credentials
- Vercel, DNS, analytics, or Search Console account details
- Internal project IDs, team IDs, billing details, or recovery URLs
- Private BookSpace desktop app implementation details
- Unannounced pricing, conversion, KPI, or go-to-market strategy
- Private roadmap items or unreleased proprietary workflows
- Concrete exploit steps for unresolved security issues
- Personal information or private customer/user data

## Review Rule

Before publishing documentation, check whether the document helps an external
contributor build, test, use, or safely operate the open editor. If it mainly
helps only the internal BookSpace team operate private infrastructure, keep it
outside this repository.
