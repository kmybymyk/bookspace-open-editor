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

The UI is split into three panes:

- `LeftPane`: book structure, page type changes, delete, drag reorder
- `CenterEditor`: TipTap editor and chapter title editing
- `RightInspector`: EPUB metadata, cover image, design settings, local versions

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

## Storage

`src/storage/browserProject.ts` uses browser local storage for:

- autosave
- local snapshots
- project and EPUB file naming
- browser download helpers

Invalid autosave and snapshot payloads are handled defensively. Bad snapshots are ignored, and bad autosave falls back to the starter project.

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
