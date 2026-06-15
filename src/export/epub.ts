import type { Chapter, ProjectFile } from "../domain/project";
import { orderChaptersForBook } from "../domain/projectOps";
import { coverAssetFromDataUrl, type ImageAsset } from "./epubAssets";
import { bookCss, chapterXhtml, coverXhtml, escapeXml, navXhtml, optionalMeta } from "./epubXhtml";

function chapterFileName(chapter: Chapter, index: number): string {
  const safeId = chapter.id.replaceAll(/[^a-zA-Z0-9_-]/g, "-");
  if (index === 0 && safeId === "chapter-1") {
    return "chapter-1.xhtml";
  }
  return `${String(index + 1).padStart(2, "0")}-${safeId}.xhtml`;
}

function containerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

function contentOpf(project: ProjectFile, chapterEntries: readonly [Chapter, string][], cover: ImageAsset | null): string {
  const title = escapeXml(project.metadata.title);
  const author = escapeXml(project.metadata.author || "BookSpace Author");
  const language = escapeXml(project.metadata.language);
  const identifier = project.metadata.identifier?.trim() || `urn:uuid:${crypto.randomUUID()}`;
  const coverManifest = cover
    ? `\n    <item id="cover-image" href="images/cover.${cover.extension}" media-type="${cover.mediaType}" properties="cover-image"/>\n    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`
    : "";
  const coverSpine = cover ? `\n    <itemref idref="cover" linear="yes"/>` : "";
  const manifestItems = chapterEntries
    .map(([, fileName], index) => `<item id="chapter-${index + 1}" href="chapters/${fileName}" media-type="application/xhtml+xml"/>`)
    .join("\n    ");
  const spineItems = chapterEntries
    .map(([, _fileName], index) => `<itemref idref="chapter-${index + 1}"/>`)
    .join("\n    ");

  return `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${escapeXml(identifier)}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:language>${language}</dc:language>
${optionalMeta("dc:publisher", project.metadata.publisher)}${optionalMeta("dc:description", project.metadata.description)}${optionalMeta("dc:date", project.metadata.publishDate)}
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="style" href="styles/book.css" media-type="text/css"/>
    ${coverManifest}
    ${manifestItems}
  </manifest>
  <spine>${coverSpine}
    ${spineItems}
  </spine>
</package>`;
}

export async function exportEpub(project: ProjectFile): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const cover = coverAssetFromDataUrl(project.metadata.coverImage);
  const chapterEntries = orderChaptersForBook(project.chapters).map((chapter, index) => [chapter, chapterFileName(chapter, index)] satisfies [Chapter, string]);

  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file("META-INF/container.xml", containerXml());
  zip.file("OEBPS/content.opf", contentOpf(project, chapterEntries, cover));
  zip.file("OEBPS/nav.xhtml", navXhtml(project, chapterEntries));
  zip.file("OEBPS/styles/book.css", bookCss(project));
  if (cover) {
    zip.file(`OEBPS/images/cover.${cover.extension}`, cover.bytes);
    zip.file("OEBPS/cover.xhtml", coverXhtml(project, `cover.${cover.extension}`));
  }
  for (const [chapter, fileName] of chapterEntries) {
    zip.file(`OEBPS/chapters/${fileName}`, chapterXhtml(project, chapter));
  }

  const bytes = await zip.generateAsync({ type: "uint8array", mimeType: "application/epub+zip" });
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new Blob([buffer], { type: "application/epub+zip" });
}
