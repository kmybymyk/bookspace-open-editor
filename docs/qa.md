# QA Checklist

## Automated

Run:

```sh
npm run qa
npm audit --audit-level=moderate
```

Expected:

- all Vitest tests pass
- TypeScript check passes
- Vite production build passes
- no moderate-or-higher npm audit findings

Current automated coverage includes:

- starter project structure
- BookSpace Web project version serialization
- legacy project file and local storage fallback
- chapter add/delete/reorder
- keyboard-accessible page move controls
- page type menu
- drag preview
- metadata editing
- browser-language locale initialization
- manual locale persistence and legacy locale fallback
- right inspector tab keyboard pattern
- EPUB readiness blocking
- project save feedback
- valid project import success path
- malformed project import feedback
- oversized project and Markdown import blocking
- Markdown file import success path
- Markdown import parsing
- EPUB export success path after required metadata is complete
- local snapshot parsing and recovery
- EPUB package files
- EPUB section ordering
- XHTML namespace and void element validity
- unsafe chapter HTML removal
- unsafe anchor href removal
- unsupported cover rejection
- structural EPUB package validation

## Production Preview Smoke

Run:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/`.

Verify:

- app loads from production build
- chapter title input appears
- editor appears after lazy load
- metadata title and author can be edited
- body text can be edited
- a new chapter can be created
- project export shows `.bksp` feedback
- EPUB export shows `.epub` feedback
- page type menu shows 19 options
- changing a page type moves it to the expected section
- structure move up/down buttons reorder pages and announce the move
- right inspector design tab opens
- right inspector version tab opens
- right inspector tabs respond to arrow keys
- 390px mobile width shows the editor before the structure pane
- 390px mobile width has no horizontal overflow
- top-level language selector follows browser language by default and persists manual changes
- browser console has no errors

## Manual External Checks

Before public launch, create one sample EPUB and verify it with:

- a real EPUB reader
- `epubcheck`, if available

This is separate from the in-repo structural validation and catches reader-specific compatibility issues.
