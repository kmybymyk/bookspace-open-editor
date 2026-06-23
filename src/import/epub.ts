import type { Chapter, ChapterKind, ChapterType, ProjectFile } from "../domain/project";
import { createStarterProject } from "../domain/project";
import {
  EpubImportError,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMPORTED_CHAPTERS,
  MAX_IMPORTED_COVER_BYTES,
  MAX_TEXT_LENGTH,
  MAX_TOTAL_IMPORTED_HTML_LENGTH,
  assertZipBudgets,
  coverDataUrl,
  readZipBytes,
  readZipText,
  safeLanguageCode,
  sanitizeImportedHtml,
  trimmedText,
} from "./epubSafety";

export { EpubImportError } from "./epubSafety";

type ManifestItem = {
  readonly href: string;
  readonly mediaType: string;
  readonly properties: string;
};

type SpineChapter = {
  readonly item: ManifestItem;
  readonly order: number;
};

type ChapterClassification = {
  readonly type: ChapterType;
  readonly kind: ChapterKind;
};

function parseXml(raw: string, label: string): Document {
  const doc = new DOMParser().parseFromString(raw, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new EpubImportError(`${label} XML을 읽을 수 없습니다.`);
  }
  return doc;
}

function elementsByName(root: ParentNode, localName: string): Element[] {
  return Array.from(root.querySelectorAll("*")).filter((element) => element.localName === localName);
}

function firstText(root: ParentNode, localName: string): string {
  return elementsByName(root, localName)[0]?.textContent?.trim() ?? "";
}

function decodeHref(href: string): string {
  try {
    return decodeURIComponent(href);
  } catch (error) {
    if (error instanceof URIError) {
      return href;
    }
    throw error;
  }
}

function resolveZipPath(baseDir: string, href: string): string {
  const cleanHref = href.split("#")[0]?.split("?")[0] ?? "";
  const rawParts = `${baseDir}/${decodeHref(cleanHref)}`.split("/");
  const parts: string[] = [];
  for (const part of rawParts) {
    if (part === "" || part === ".") {
      continue;
    }
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}

function classifyChapter(title: string): ChapterClassification {
  const normalized = title.trim().toLowerCase();
  if (/^(part|book)\s+\S+/u.test(normalized) || /^(part|파트|부)\s*\d+/u.test(title.trim())) {
    return { type: "part", kind: "part" };
  }
  if (/(copyright|dedication|epigraph|foreword|introduction|preface|prologue|title page|판권|헌정|인용|추천|머리말|들어가며|서문|프롤로그|표제)/u.test(normalized)) {
    return { type: "front", kind: "introduction" };
  }
  if (/(epilogue|afterword|bibliography|acknowledg|about the author|also by|에필로그|후기|참고문헌|감사|저자 소개|지은 책)/u.test(normalized)) {
    return { type: "back", kind: "afterword" };
  }
  return { type: "chapter", kind: "chapter" };
}

function chapterTitle(doc: Document, navTitle: string, order: number): string {
  const title = navTitle || firstText(doc, "title") || firstText(doc, "h1") || firstText(doc, "h2");
  return trimmedText(title, MAX_TEXT_LENGTH) || `Chapter ${order + 1}`;
}

function extractNavTitles(navDoc: Document, navPath: string): Map<string, string> {
  const titles = new Map<string, string>();
  const navDir = navPath.split("/").slice(0, -1).join("/");
  for (const anchor of elementsByName(navDoc, "a")) {
    const href = anchor.getAttribute("href") ?? "";
    const text = anchor.textContent?.trim() ?? "";
    if (href.length > 0 && text.length > 0) {
      titles.set(resolveZipPath(navDir, href), text);
    }
  }
  return titles;
}

function findCoverItem(manifest: Map<string, ManifestItem>, opf: Document): ManifestItem | undefined {
  const propertyCover = Array.from(manifest.values()).find((item) => item.properties.split(/\s+/u).includes("cover-image"));
  if (propertyCover !== undefined) {
    return propertyCover;
  }
  const legacyCoverId = elementsByName(opf, "meta").find((item) => item.getAttribute("name") === "cover")?.getAttribute("content") ?? "";
  return legacyCoverId.length > 0 ? manifest.get(legacyCoverId) : undefined;
}

function createManifest(opf: Document, opfDir: string): Map<string, ManifestItem> {
  const manifest = new Map<string, ManifestItem>();
  for (const item of elementsByName(opf, "item")) {
    const id = item.getAttribute("id") ?? "";
    const href = item.getAttribute("href") ?? "";
    if (id.length > 0 && href.length > 0) {
      manifest.set(id, {
        href: resolveZipPath(opfDir, href),
        mediaType: item.getAttribute("media-type") ?? "",
        properties: item.getAttribute("properties") ?? "",
      });
    }
  }
  return manifest;
}

export async function importEpubProject(file: Blob, locale: "ko" | "en" = "ko"): Promise<ProjectFile> {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(file);
  assertZipBudgets(zip);

  const containerFile = zip.file("META-INF/container.xml");
  if (containerFile === null) {
    throw new EpubImportError("EPUB container.xml을 찾을 수 없습니다.");
  }

  const container = parseXml(await readZipText(containerFile, "container"), "container");
  const opfPath = elementsByName(container, "rootfile")[0]?.getAttribute("full-path") ?? "";
  const opfFile = opfPath.length > 0 ? zip.file(opfPath) : null;
  if (opfFile === null) {
    throw new EpubImportError("EPUB OPF 파일을 찾을 수 없습니다.");
  }

  const opf = parseXml(await readZipText(opfFile, "OPF"), "OPF");
  const manifest = createManifest(opf, opfPath.split("/").slice(0, -1).join("/"));
  const navItem = Array.from(manifest.values()).find((item) => item.properties.split(/\s+/u).includes("nav"));
  const navFile = navItem ? zip.file(navItem.href) : null;
  const navTitles = navFile === null || navItem === undefined ? new Map<string, string>() : extractNavTitles(parseXml(await readZipText(navFile, "nav"), "nav"), navItem.href);
  const allSpineItems: SpineChapter[] = elementsByName(opf, "itemref")
    .map((itemref, order) => ({ item: manifest.get(itemref.getAttribute("idref") ?? ""), order }))
    .filter((entry): entry is SpineChapter => entry.item !== undefined && entry.item.mediaType.includes("html"));
  if (allSpineItems.length > MAX_IMPORTED_CHAPTERS) {
    throw new EpubImportError("EPUB 본문 항목이 너무 많습니다.");
  }

  const chapters: Chapter[] = [];
  let totalImportedHtmlLength = 0;
  for (const spine of allSpineItems) {
    const chapterFile = zip.file(spine.item.href);
    if (chapterFile === null) {
      throw new EpubImportError("EPUB 본문 파일을 찾을 수 없습니다.");
    }
    const doc = new DOMParser().parseFromString(await readZipText(chapterFile, "본문"), "text/html");
    const title = chapterTitle(doc, navTitles.get(spine.item.href) ?? "", spine.order);
    const classification = classifyChapter(title);
    const contentHtml = sanitizeImportedHtml(doc.body, title);
    totalImportedHtmlLength += contentHtml.length;
    if (totalImportedHtmlLength > MAX_TOTAL_IMPORTED_HTML_LENGTH) {
      throw new EpubImportError("EPUB 본문 전체 크기가 너무 큽니다.");
    }
    chapters.push({ id: `epub-${chapters.length + 1}`, title, type: classification.type, kind: classification.kind, contentHtml });
  }
  if (chapters.length === 0) {
    throw new EpubImportError("EPUB에서 가져올 본문을 찾을 수 없습니다.");
  }

  const starter = createStarterProject(locale);
  const coverItem = findCoverItem(manifest, opf);
  const coverFile = coverItem ? zip.file(coverItem.href) : null;
  const coverBytes = coverFile ? await readZipBytes(coverFile, "표지", MAX_IMPORTED_COVER_BYTES) : undefined;

  return {
    ...starter,
    metadata: {
      ...starter.metadata,
      title: trimmedText(firstText(opf, "title"), MAX_TEXT_LENGTH) || starter.metadata.title,
      author: trimmedText(firstText(opf, "creator"), MAX_TEXT_LENGTH),
      language: safeLanguageCode(firstText(opf, "language"), starter.metadata.language),
      publisher: trimmedText(firstText(opf, "publisher"), MAX_TEXT_LENGTH),
      identifier: trimmedText(firstText(opf, "identifier"), MAX_TEXT_LENGTH),
      description: trimmedText(firstText(opf, "description"), MAX_DESCRIPTION_LENGTH),
      coverImage: coverDataUrl(coverItem?.mediaType ?? "", coverBytes),
    },
    chapters,
  };
}
