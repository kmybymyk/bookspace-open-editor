# Project Format

BookSpace Open Editor stores project files as `.bksp` JSON.

## Version

Current files serialize with:

```json
{
  "version": "bookspace-web-1"
}
```

The parser still accepts the legacy `bookspace-lite-1` value and normalizes it to `bookspace-web-1` after import. This keeps older local exports readable while allowing new files to use the BookSpace Web naming.

## Top-Level Shape

```json
{
  "version": "bookspace-web-1",
  "metadata": {},
  "chapters": [],
  "design": {}
}
```

## Metadata

`metadata` contains the values used for project display and EPUB export:

- `title`
- `subtitle`
- `author`
- `language`
- `publisher`
- `publishDate`
- `identifierType`
- `identifier`
- `coverImage`
- `description`

Blank book titles are normalized to a fallback title during parsing. Cover images must be JPEG, PNG, or WebP data URLs.

## Chapters

Each chapter contains:

- `id`
- `title`
- `type`
- `kind`
- `contentHtml`

`type` controls the broad section:

- `front`
- `part`
- `chapter`
- `back`

`kind` controls the EPUB/page-specific role, such as `prologue`, `title-page`, `chapter`, `epilogue`, or `acknowledgments`.

Chapter titles are normalized to a fallback title when blank. Chapter HTML is bounded during parsing and is sanitized again during EPUB XHTML generation.

## Design

`design` contains:

- `fontFamily`
- `fontSize`
- `lineHeight`
- `pageTone`

These values drive the editor preview and generated EPUB stylesheet.

## Browser Storage

New local browser data uses `bookspace-web:*` keys:

- `bookspace-web:autosave:v1`
- `bookspace-web:snapshots:v1`
- `bookspace-web:locale:v1`

Legacy `bookspace-lite:*` keys remain readable for migration. New writes use the BookSpace Web keys.
