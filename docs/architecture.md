# Architecture

BookSpace Open Editor is a client-only React application built with Vite.

## Main Flow

`src/App.tsx` owns the project state and coordinates:

- local autosave
- active chapter selection
- project import/export
- Markdown import
- EPUB export
- snapshot restore
- browser-language locale initialization and manual locale switching

The UI is split into three panes:

- `LeftPane`: book structure, page type changes, delete, drag reorder
- `CenterEditor`: TipTap editor and chapter title editing
- `RightInspector`: EPUB metadata, cover image, design settings, local versions

On mobile widths, CSS keeps the same DOM structure but visually prioritizes the editor pane before the structure and inspector panes. This keeps the primary writing workflow reachable first while preserving the desktop-style structure and EPUB controls below it.

## Domain Modules

- `src/domain/project.ts`
  - Zod schemas
  - project parsing and serialization
  - starter project
  - chapter creation
- `src/domain/projectOps.ts`
  - chapter replacement
  - book section ordering
  - drag reorder
  - timestamp label
- `src/domain/readiness.ts`
  - EPUB readiness checks
- `src/domain/fonts.ts`
  - UI and EPUB font mapping
- `src/domain/safeLinks.ts`
  - link protocol filtering for generated XHTML
- `src/i18n.ts`
  - Korean and English UI strings
- `src/i18nLocale.ts`
  - browser language detection, persisted manual locale, and legacy locale key fallback

## Storage

`src/storage/browserProject.ts` uses browser local storage for:

- autosave
- local snapshots
- project and EPUB file naming
- browser download helpers

Invalid autosave and snapshot payloads are handled defensively. Bad snapshots are ignored, and bad autosave falls back to the starter project.

New writes use `bookspace-web:*` local storage keys. Legacy `bookspace-lite:*` keys remain readable so existing browser data can be recovered after the product name change.

`.bksp` project files now serialize as `bookspace-web-1`. The parser still accepts the legacy `bookspace-lite-1` version and normalizes it to the current version in memory.

## Editor

`src/components/CenterEditor.tsx` lazy loads as a separate chunk from `App.tsx`.

The editor uses TipTap StarterKit with:

- paragraph
- heading level 2 and 3
- bold
- italic
- bullet list
- blockquote
- horizontal rule
- undo and redo

Pasted HTML is sanitized before insertion to remove script/style metadata, inline attributes, and noisy span/font wrappers.

## Accessibility

The structure pane supports pointer drag and keyboard-accessible move up/down buttons. Movement announcements are exposed through an offscreen live region.

The right inspector uses tablist/tab/tabpanel semantics with roving tab focus and arrow/Home/End keyboard handling. Disabled EPUB export uses the native `disabled` state until required metadata is complete.

## EPUB Export

EPUB generation is split by responsibility:

- `src/export/epub.ts`: ZIP package assembly
- `src/export/epubAssets.ts`: cover data URL decoding
- `src/export/epubXhtml.ts`: XHTML, nav, and CSS generation
- `src/export/epubValidation.ts`: structural package validation for tests

`jszip` is dynamically imported so it is not part of the initial application chunk.

## Styling

Styles are organized under `src/styles/` by UI area:

- base variables
- top bar
- layout
- left pane
- editor
- right inspector
- responsive rules
- scrollbars

`src/styles.css` imports these files in order.
