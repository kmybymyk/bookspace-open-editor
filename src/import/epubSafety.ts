import type JSZip from "jszip";

export const MAX_IMPORTED_CHAPTERS = 300;
export const MAX_IMPORTED_COVER_BYTES = 2_200_000;
export const MAX_TOTAL_IMPORTED_HTML_LENGTH = 8_000_000;
export const MAX_TEXT_LENGTH = 5_000;
export const MAX_DESCRIPTION_LENGTH = 20_000;

const MAX_IMPORTED_CHAPTER_HTML_LENGTH = 250_000;
const MAX_IMPORTED_COVER_DATA_URL_LENGTH = 3_000_000;
const MAX_IMPORTED_TEXT_ENTRY_BYTES = 2_000_000;
const MAX_TOTAL_UNCOMPRESSED_BYTES = 50_000_000;
const MAX_ZIP_ENTRIES = 1_000;
const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/u;
const SAFE_TAGS = new Set(["a", "blockquote", "br", "code", "em", "h2", "h3", "hr", "li", "ol", "p", "strong", "ul"]);
const DROP_TAGS = new Set(["audio", "canvas", "embed", "iframe", "img", "link", "math", "meta", "object", "script", "style", "svg", "video"]);
const SUPPORTED_COVER_MEDIA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type SizedZipObject = JSZip.JSZipObject & {
  readonly _data?: {
    readonly uncompressedSize?: unknown;
  };
};

export class EpubImportError extends Error {
  override readonly name = "EpubImportError";

  constructor(message = "EPUB 파일을 읽을 수 없습니다.") {
    super(message);
  }
}

export function trimmedText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function safeLanguageCode(value: string, fallback: string): string {
  return LANGUAGE_CODE_PATTERN.test(value) ? value : fallback;
}

function zipEntrySize(file: SizedZipObject): number | undefined {
  return typeof file._data?.uncompressedSize === "number" ? file._data.uncompressedSize : undefined;
}

export function assertZipBudgets(zip: JSZip): void {
  const files = Object.values(zip.files).filter((file) => !file.dir);
  if (files.length > MAX_ZIP_ENTRIES) {
    throw new EpubImportError("EPUB 파일 항목이 너무 많습니다.");
  }

  let totalUncompressedBytes = 0;
  for (const file of files) {
    const uncompressedSize = zipEntrySize(file);
    if (uncompressedSize === undefined) {
      continue;
    }
    totalUncompressedBytes += uncompressedSize;
    if (totalUncompressedBytes > MAX_TOTAL_UNCOMPRESSED_BYTES) {
      throw new EpubImportError("EPUB 압축 해제 크기가 너무 큽니다.");
    }
  }
}

export async function readZipText(file: SizedZipObject, label: string): Promise<string> {
  const uncompressedSize = zipEntrySize(file);
  if (uncompressedSize !== undefined && uncompressedSize > MAX_IMPORTED_TEXT_ENTRY_BYTES) {
    throw new EpubImportError(`EPUB ${label} 파일이 너무 큽니다.`);
  }
  const raw = await file.async("string");
  if (raw.length > MAX_IMPORTED_TEXT_ENTRY_BYTES) {
    throw new EpubImportError(`EPUB ${label} 파일이 너무 큽니다.`);
  }
  return raw;
}

export async function readZipBytes(file: SizedZipObject, label: string, maxBytes: number): Promise<Uint8Array> {
  const uncompressedSize = zipEntrySize(file);
  if (uncompressedSize !== undefined && uncompressedSize > maxBytes) {
    throw new EpubImportError(`EPUB ${label} 파일이 너무 큽니다.`);
  }
  const bytes = await file.async("uint8array");
  if (bytes.length > maxBytes) {
    throw new EpubImportError(`EPUB ${label} 파일이 너무 큽니다.`);
  }
  return bytes;
}

function isSafeHref(href: string): boolean {
  return href.startsWith("#") || href.startsWith("https://");
}

function sanitizeNode(node: Node, outputDoc: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return outputDoc.createTextNode(node.textContent ?? "");
  }
  if (!(node instanceof Element)) {
    return null;
  }

  const sourceTag = node.localName.toLowerCase();
  if (DROP_TAGS.has(sourceTag)) {
    return null;
  }
  const tagName = sourceTag === "h1" ? "h2" : sourceTag;
  const target = SAFE_TAGS.has(tagName) ? outputDoc.createElement(tagName) : outputDoc.createDocumentFragment();

  if (target instanceof HTMLElement && tagName === "a") {
    const href = node.getAttribute("href")?.trim() ?? "";
    if (isSafeHref(href)) {
      target.setAttribute("href", href);
    }
  }

  for (const child of Array.from(node.childNodes)) {
    const sanitized = sanitizeNode(child, outputDoc);
    if (sanitized !== null) {
      target.appendChild(sanitized);
    }
  }
  return target;
}

export function sanitizeImportedHtml(body: HTMLElement, title: string): string {
  const clone = body.cloneNode(true);
  if (!(clone instanceof HTMLElement)) {
    return "<p></p>";
  }
  const firstHeading = clone.querySelector("h1,h2,h3");
  if (firstHeading?.textContent?.trim() === title.trim()) {
    firstHeading.remove();
  }

  const outputDoc = document.implementation.createHTMLDocument("");
  const container = outputDoc.createElement("div");
  for (const child of Array.from(clone.childNodes)) {
    const sanitized = sanitizeNode(child, outputDoc);
    if (sanitized !== null) {
      container.appendChild(sanitized);
    }
  }
  const html = container.innerHTML.trim();
  if (html.length > MAX_IMPORTED_CHAPTER_HTML_LENGTH) {
    throw new EpubImportError("EPUB 본문이 너무 큽니다.");
  }
  return html.length > 0 ? html : "<p></p>";
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32_768) {
    binary += String.fromCharCode(...bytes.slice(offset, offset + 32_768));
  }
  return btoa(binary);
}

function hasImageMagic(mediaType: string, bytes: Uint8Array): boolean {
  if (mediaType === "image/png") {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a;
  }
  if (mediaType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mediaType === "image/webp") {
    return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  }
  return false;
}

export function coverDataUrl(mediaType: string, bytes: Uint8Array | undefined): string | undefined {
  if (bytes === undefined || !SUPPORTED_COVER_MEDIA_TYPES.has(mediaType)) {
    return undefined;
  }
  if (!hasImageMagic(mediaType, bytes)) {
    throw new EpubImportError("EPUB 표지 이미지 형식이 올바르지 않습니다.");
  }
  const dataUrl = `data:${mediaType};base64,${bytesToBase64(bytes)}`;
  return dataUrl.length <= MAX_IMPORTED_COVER_DATA_URL_LENGTH ? dataUrl : undefined;
}
