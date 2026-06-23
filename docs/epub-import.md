# EPUB Import

BookSpace Web can import a reflowable EPUB file and convert it into the internal `.bksp` project model.

## Supported Flow

The importer runs entirely in the browser:

1. Read the EPUB ZIP with `jszip`.
2. Locate `META-INF/container.xml`.
3. Resolve the OPF package path.
4. Read OPF metadata, manifest, and spine.
5. Use the navigation document for chapter titles when available.
6. Convert spine XHTML files into BookSpace chapters.
7. Sanitize imported chapter HTML.
8. Keep a supported cover image when it fits the project data URL limit.

## Imported Data

The importer maps EPUB data into `ProjectFile`:

- `dc:title` to book title
- `dc:creator` to author
- `dc:language` to language
- `dc:publisher` to publisher
- `dc:identifier` to identifier
- `dc:description` to description
- `properties="cover-image"` image to cover
- spine XHTML files to chapters

Chapter titles prefer the nav document, then document `<title>`, then the first heading.

## HTML Safety

Imported chapter HTML is sanitized before entering the editor:

- script/style/media/embed/svg/math tags are removed
- unsupported wrapper tags are unwrapped
- attributes are removed except safe anchor `href`
- `javascript:` and other unsafe links are stripped
- the first heading is removed when it duplicates the chapter title

This keeps imported content compatible with the current editor and EPUB export sanitizer.

## Limits

Current limits are intentionally conservative:

- EPUB upload: 20MB
- imported chapters: 300
- imported chapter HTML: 250KB per chapter
- imported cover data URL: 3MB

If a file exceeds these limits, the UI reports an import failure rather than silently producing a partial project.

## Not Supported

The importer is not a lossless EPUB editor. It does not preserve:

- DRM-protected books
- fixed-layout EPUB rendering
- original CSS layout
- embedded fonts
- images inside chapter bodies
- audio/video/media overlays
- arbitrary manifest resources
- exact original OPF/nav file structure

The supported goal is browser-based revision and re-export through the BookSpace Web editing model.

## Tests

Coverage lives in:

- `src/import/epub.test.ts`
- `src/App.test.tsx`

The tests build EPUB fixtures in memory and cover metadata, spine conversion, nav titles, sanitization, cover import, broken package errors, UI upload success, and oversized upload blocking.
