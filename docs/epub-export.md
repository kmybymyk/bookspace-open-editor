# EPUB Export

The EPUB export is designed as a browser-side EPUB 3 package generator.

## Inputs

The exporter consumes a `ProjectFile`:

- metadata
- ordered chapters
- design settings
- optional cover image data URL

## Chapter Ordering

Before export, chapters are ordered by book section:

1. front matter
2. body matter: parts and chapters
3. back matter

Within each section, the visible local order is preserved.

## Package Contents

Generated EPUB files include:

- `mimetype`
- `META-INF/container.xml`
- `OEBPS/content.opf`
- `OEBPS/nav.xhtml`
- `OEBPS/styles/book.css`
- `OEBPS/chapters/*.xhtml`
- optional `OEBPS/cover.xhtml`
- optional `OEBPS/images/cover.*`

The `mimetype` file is stored first and uncompressed.

## XHTML Safety

Chapter HTML is sanitized during XHTML generation:

- unsafe tags are removed
- unsupported tags are unwrapped
- attributes are removed
- safe anchor href values are preserved
- `br` and `hr` are serialized as XHTML-compatible void elements

Generated XHTML includes the EPUB namespace when `epub:type` is used.

## Cover Handling

Supported cover media types:

- JPEG
- PNG
- WebP

Unsupported or malformed cover data URLs are ignored rather than blocking export.

## Validation

`src/export/epubValidation.ts` validates generated blobs in tests:

- first ZIP entry is uncompressed `mimetype`
- `container.xml` points to `OEBPS/content.opf`
- manifest files exist
- spine references exist in manifest
- nav entry exists
- XHTML files parse as XML

This validation is not a replacement for full `epubcheck`, but it protects the core package structure.
