import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { importEpubProject } from "./epub";

async function createMinimalEpub(
  chapterBody: string,
  options: {
    readonly coverMediaType?: string;
    readonly fakeCoverBytes?: boolean;
    readonly includeCover?: boolean;
    readonly legacyCoverMeta?: boolean;
    readonly omitFirstChapterFile?: boolean;
    readonly spineCount?: number;
  } = {},
): Promise<File> {
  const coverMediaType = options.coverMediaType ?? "image/png";
  const spineCount = options.spineCount ?? 1;
  const chapterManifest = Array.from({ length: spineCount }, (_, index) => {
    const chapterIndex = index + 1;
    return `<item id="chapter-${chapterIndex}" href="chapters/chapter-${chapterIndex}.xhtml" media-type="application/xhtml+xml" />`;
  }).join("");
  const spineItems = Array.from({ length: spineCount }, (_, index) => `<itemref idref="chapter-${index + 1}" />`).join("");
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip");
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0"?>
    <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
      <rootfiles>
        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />
      </rootfiles>
    </container>`,
  );
  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0"?>
    <package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
      <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:identifier id="book-id">urn:uuid:test-import</dc:identifier>
        <dc:title>Imported EPUB</dc:title>
        <dc:creator>Test Author</dc:creator>
        <dc:language>en</dc:language>
        <dc:publisher>Test Publisher</dc:publisher>
        <dc:description>Imported description</dc:description>
        ${options.legacyCoverMeta ? '<meta name="cover" content="cover" />' : ""}
      </metadata>
      <manifest>
        <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
        ${chapterManifest}
        ${options.includeCover ? `<item id="cover" href="images/cover.png" media-type="${coverMediaType}" ${options.legacyCoverMeta ? "" : 'properties="cover-image"'} />` : ""}
      </manifest>
      <spine>${spineItems}</spine>
    </package>`,
  );
  zip.file(
    "OEBPS/nav.xhtml",
    `<?xml version="1.0"?>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
      <body>
        <nav epub:type="toc">
          <ol><li><a href="chapters/chapter-1.xhtml">Chapter from nav</a></li></ol>
        </nav>
      </body>
    </html>`,
  );
  for (let index = 1; index <= spineCount; index += 1) {
    if (index === 1 && options.omitFirstChapterFile) {
      continue;
    }
    zip.file(
      `OEBPS/chapters/chapter-${index}.xhtml`,
      `<?xml version="1.0"?>
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head><title>Chapter from head</title></head>
        <body>${chapterBody}</body>
      </html>`,
    );
  }
  if (options.includeCover) {
    const coverBytes = options.fakeCoverBytes ? Uint8Array.from([60, 115, 118, 103]) : Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
    zip.file("OEBPS/images/cover.png", coverBytes);
  }

  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
  return new File([blob], "import.epub", { type: "application/epub+zip" });
}

describe("EPUB import", () => {
  it("creates a project from OPF metadata and spine XHTML", async () => {
    const file = await createMinimalEpub(`
      <h1>Chapter from nav</h1>
      <p>Readable <strong>body</strong> text.</p>
      <script>alert("x")</script>
      <p><a href="javascript:bad()">unsafe link</a></p>
    `);

    const project = await importEpubProject(file, "en");

    expect(project.metadata.title).toBe("Imported EPUB");
    expect(project.metadata.author).toBe("Test Author");
    expect(project.metadata.publisher).toBe("Test Publisher");
    expect(project.metadata.description).toBe("Imported description");
    expect(project.chapters).toHaveLength(1);
    expect(project.chapters[0]?.title).toBe("Chapter from nav");
    expect(project.chapters[0]?.type).toBe("chapter");
    expect(project.chapters[0]?.contentHtml).toContain("<p>Readable <strong>body</strong> text.</p>");
    expect(project.chapters[0]?.contentHtml).not.toContain("<h1>");
    expect(project.chapters[0]?.contentHtml).not.toContain("javascript:");
    expect(project.chapters[0]?.contentHtml).not.toContain("script");
  });

  it("imports a manifest cover image when it fits the project limit", async () => {
    const file = await createMinimalEpub("<p>Body</p>", { includeCover: true });

    const project = await importEpubProject(file, "en");

    expect(project.metadata.coverImage).toMatch(/^data:image\/png;base64,/u);
  });

  it("imports a legacy OPF cover meta image when the media type is supported", async () => {
    const file = await createMinimalEpub("<p>Body</p>", { includeCover: true, legacyCoverMeta: true });

    const project = await importEpubProject(file, "en");

    expect(project.metadata.coverImage).toMatch(/^data:image\/png;base64,/u);
  });

  it("ignores unsupported cover media types", async () => {
    const file = await createMinimalEpub("<p>Body</p>", { coverMediaType: "image/svg+xml", includeCover: true });

    const project = await importEpubProject(file, "en");

    expect(project.metadata.coverImage).toBeUndefined();
  });

  it("rejects compressed EPUB entries that inflate past importer budgets", async () => {
    const file = await createMinimalEpub(`<p>${"x".repeat(2_100_000)}</p>`);

    await expect(importEpubProject(file, "en")).rejects.toThrow("EPUB");
  });

  it("rejects fake cover bytes that do not match the declared image type", async () => {
    const file = await createMinimalEpub("<p>Body</p>", { fakeCoverBytes: true, includeCover: true });

    await expect(importEpubProject(file, "en")).rejects.toThrow("EPUB");
  });

  it("rejects EPUBs with more spine chapters than the project supports", async () => {
    const file = await createMinimalEpub("<p>Body</p>", { spineCount: 301 });

    await expect(importEpubProject(file, "en")).rejects.toThrow("EPUB");
  });

  it("rejects missing spine XHTML instead of silently dropping content", async () => {
    const file = await createMinimalEpub("<p>Body</p>", { omitFirstChapterFile: true });

    await expect(importEpubProject(file, "en")).rejects.toThrow("EPUB");
  });

  it("throws a typed error when the EPUB package is missing required files", async () => {
    const zip = new JSZip();
    zip.file("mimetype", "application/epub+zip");
    const blob = await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });

    await expect(importEpubProject(new File([blob], "broken.epub"), "en")).rejects.toThrow("EPUB");
  });
});
