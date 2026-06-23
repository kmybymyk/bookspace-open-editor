# Deployment

BookSpace Open Editor is a static Vite app.

## Build

```sh
npm install
npm run qa
npm run build
```

Do not deploy this repository directly to the `bookspace.work` production root.
The root domain is owned by the BookSpace landing site. This editor must be
published only through an explicit `/editor/` integration in the landing-site
project or through a separate Vercel project/domain that is linked from the
landing site.

Before any production deploy, verify the target project is not the landing-site
production deployment for `bookspace.work`.

## Environment

No server-side environment variables are required.

The app stores project state in the user's browser local storage and generates project/EPUB files in the browser.

## Pre-Deploy Checklist

- `npm run qa` passes
- `npm audit --audit-level=moderate` passes
- production preview smoke passes
- font license files are present under `public/licenses/`
- `dist/robots.txt` and `dist/sitemap.xml` are present
- `dist/` is generated from the current commit
- the deployment target preserves the existing `bookspace.work` landing page
- the editor is mounted at `/editor/`, `/en/editor/`, or a separate editor-only domain

## Google Organic Search Checklist

The editor is intended to rank for lightweight EPUB editor searches such as "online EPUB editor", "free EPUB editor", "EPUB 웹 에디터", and "무료 EPUB 에디터" without overstating the web version's scope.

Code-level SEO assets:

- `index.html` includes title, description, canonical, hreflang, Open Graph, Twitter card, and `SoftwareApplication` JSON-LD metadata.
- `public/robots.txt` allows crawling and points crawlers to the sitemap.
- `public/sitemap.xml` lists the Korean and English editor URLs with reciprocal hreflang links.
- `noscript` content provides a crawlable summary for browsers or crawlers without JavaScript execution.

Post-deploy SEO operations:

- Confirm `https://bookspace.work/` still serves the BookSpace landing page, not the editor shell.
- Confirm `https://bookspace.work/editor/` returns the built app with the canonical URL set to itself.
- Confirm `https://bookspace.work/en/editor/` resolves and serves the English alternate route or redirects consistently with the published hreflang policy.
- Confirm `https://bookspace.work/robots.txt` and `https://bookspace.work/sitemap.xml` return HTTP 200.
- Submit `https://bookspace.work/sitemap.xml` in Google Search Console.
- Request indexing for `https://bookspace.work/editor/` and `https://bookspace.work/en/editor/`.
- Inspect Search Console queries after indexing and adjust copy only when real query data shows a mismatch.

## Post-Deploy Smoke

On `bookspace.work`, verify:

- root landing page still loads
- app loads
- editor lazy loads
- metadata can be edited
- body text can be edited
- project file export works
- EPUB export works
- no console errors
- `robots.txt` and `sitemap.xml` are reachable

## Rollback

The deployment artifact is static. Roll back by redeploying the previous known-good `dist/` artifact or previous commit.
