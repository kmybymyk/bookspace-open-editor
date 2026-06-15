# Deployment

BookSpace Open Editor is a static Vite app.

## Build

```sh
npm install
npm run qa
npm run build
```

Deploy the generated `dist/` directory to `bookspace.work`.

## Environment

No server-side environment variables are required.

The app stores project state in the user's browser local storage and generates project/EPUB files in the browser.

## Pre-Deploy Checklist

- `npm run qa` passes
- `npm audit --audit-level=moderate` passes
- production preview smoke passes
- font license files are present under `public/licenses/`
- `dist/` is generated from the current commit

## Post-Deploy Smoke

On `bookspace.work`, verify:

- app loads
- editor lazy loads
- metadata can be edited
- body text can be edited
- project file export works
- EPUB export works
- no console errors

## Rollback

The deployment artifact is static. Roll back by redeploying the previous known-good `dist/` artifact or previous commit.
