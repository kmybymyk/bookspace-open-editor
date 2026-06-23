# Deployment

BookSpace Open Editor is a static Vite app.

## Build

```sh
npm install
npm run qa
npm run build
```

`npm run build` runs TypeScript checks, builds the Vite app, and copies the SPA
entry HTML to:

- `dist/editor/index.html`
- `dist/en/editor/index.html`

Do not deploy this repository directly to the `bookspace.work` production root.
This repository only owns the open editor app. The public site root is managed
separately, so the editor must be published only through an explicit `/editor/`
integration or through a separate editor-only domain linked from the public
site.

Before any production deploy, verify the target does not replace the public
site root for `bookspace.work`.

## Environment

No server-side environment variables are required.

The app stores project state in the user's browser local storage and generates project/EPUB files in the browser.

The current client build initializes Google Analytics with the editor
measurement ID in `src/analytics.ts`. Analytics is client-side only and emits
editor surface, locale, route, and tagged UI events.

## Pre-Deploy Checklist

- `npm run qa` passes
- `npm audit --audit-level=moderate` passes
- production preview smoke passes
- font license files are present under `public/licenses/`
- `dist/robots.txt` and `dist/sitemap.xml` are present
- `dist/editor/index.html` and `dist/en/editor/index.html` are present
- `dist/` is generated from the current commit
- the deployment target preserves the existing public site root
- the editor is mounted at `/editor/`, `/en/editor/`, or a separate editor-only domain

## Google Organic Search Checklist

The editor is intended to rank for lightweight EPUB editor searches such as "online EPUB editor", "free EPUB editor", "EPUB 웹 에디터", and "무료 EPUB 에디터" without overstating the web version's scope.

Code-level SEO assets:

- `index.html` includes title, description, canonical, hreflang, Open Graph, Twitter card, and `SoftwareApplication` JSON-LD metadata.
- `public/robots.txt` allows crawling and points crawlers to the sitemap.
- `public/sitemap.xml` lists the Korean and English editor URLs with reciprocal hreflang links.
- `noscript` content provides a crawlable summary for browsers or crawlers without JavaScript execution.

Post-deploy SEO operations:

- Confirm `https://bookspace.work/` still serves the public BookSpace page, not the editor shell.
- Confirm `https://bookspace.work/editor/` returns the built app with the canonical URL set to itself.
- Confirm `https://bookspace.work/en/editor/` resolves and serves the English alternate route or redirects consistently with the published hreflang policy.
- Confirm `https://bookspace.work/robots.txt` and `https://bookspace.work/sitemap.xml` return HTTP 200.
- Submit `https://bookspace.work/sitemap.xml` in Google Search Console.
- Request indexing for `https://bookspace.work/editor/` and `https://bookspace.work/en/editor/`.
- Inspect Search Console queries after indexing and adjust copy only when real query data shows a mismatch.

## Post-Deploy Smoke

On `bookspace.work`, verify:

- public site root still loads
- `/editor/` loads the Korean editor route
- `/en/editor/` loads the English editor route
- editor lazy loads
- metadata can be edited
- body text can be edited
- project file export works
- EPUB import works
- EPUB export works
- no console errors
- `robots.txt` and `sitemap.xml` are reachable
- Search Console has the sitemap submitted and indexing requested for `/editor/` and `/en/editor/`

## Rollback

The deployment artifact is static. Roll back by restoring the previous
known-good editor files in the host site or by redeploying the previous
known-good deployment for the host site.
