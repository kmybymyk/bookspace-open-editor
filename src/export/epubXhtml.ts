import { fontOptionFor } from "../domain/fonts";
import type { Chapter, ProjectFile } from "../domain/project";

const UNSAFE_TAGS = ["script", "style", "iframe", "object", "embed", "link", "meta"] as const;
const ALLOWED_TAGS = ["a", "blockquote", "br", "code", "em", "h2", "h3", "hr", "li", "ol", "p", "strong", "ul"] as const;

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function optionalMeta(tag: string, value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  return trimmed ? `    <${tag}>${escapeXml(trimmed)}</${tag}>\n` : "";
}

function isAllowedTag(tagName: string): boolean {
  return ALLOWED_TAGS.some((allowedTag) => allowedTag === tagName);
}

function isUnsafeTag(tagName: string): boolean {
  return UNSAFE_TAGS.some((unsafeTag) => unsafeTag === tagName);
}

function isSafeHref(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith("#") || trimmed.startsWith("https://") || trimmed.startsWith("http://") || trimmed.startsWith("mailto:");
}

function sanitizeElement(element: Element): void {
  const tagName = element.localName.toLowerCase();
  if (isUnsafeTag(tagName)) {
    element.remove();
    return;
  }

  for (const child of Array.from(element.childNodes)) {
    if (child instanceof Element) {
      sanitizeElement(child);
    }
  }

  if (!isAllowedTag(tagName)) {
    element.replaceWith(...Array.from(element.childNodes));
    return;
  }

  const href = tagName === "a" ? element.getAttribute("href") : null;
  for (const attribute of Array.from(element.attributes)) {
    element.removeAttribute(attribute.name);
  }
  if (tagName === "a" && href !== null && isSafeHref(href)) {
    element.setAttribute("href", href.trim());
  }
}

function sanitizeChapterHtml(contentHtml: string): string {
  const template = document.createElement("template");
  template.innerHTML = contentHtml;
  for (const child of Array.from(template.content.childNodes)) {
    if (child instanceof Element) {
      sanitizeElement(child);
    }
  }
  const html = template.innerHTML || "<p></p>";
  return html
    .replaceAll(/<br>/g, "<br />")
    .replaceAll(/<hr>/g, "<hr />");
}

export function coverXhtml(project: ProjectFile, coverFileName: string): string {
  const title = escapeXml(project.metadata.title);
  const language = escapeXml(project.metadata.language);
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${language}" xml:lang="${language}">
<head>
  <title>${title} 표지</title>
  <link rel="stylesheet" type="text/css" href="styles/book.css" />
</head>
<body>
  <section epub:type="cover" class="cover-page">
    <img src="images/${coverFileName}" alt="${title} 표지" />
  </section>
</body>
</html>`;
}

export function chapterXhtml(project: ProjectFile, chapter: Chapter): string {
  const title = escapeXml(chapter.title);
  const language = escapeXml(project.metadata.language);
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${language}" xml:lang="${language}">
<head>
  <title>${title}</title>
  <link rel="stylesheet" type="text/css" href="../styles/book.css" />
</head>
<body>
  <section epub:type="${chapter.type}">
    <h1>${title}</h1>
    ${sanitizeChapterHtml(chapter.contentHtml)}
  </section>
</body>
</html>`;
}

export function navXhtml(project: ProjectFile, chapterEntries: readonly [Chapter, string][]): string {
  const items = chapterEntries
    .map(([chapter, fileName]) => `<li><a href="chapters/${fileName}">${escapeXml(chapter.title)}</a></li>`)
    .join("\n      ");
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${escapeXml(project.metadata.language)}">
<head><title>Table of Contents</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>${escapeXml(project.metadata.title)}</h1>
    <ol>
      ${items}
    </ol>
  </nav>
</body>
</html>`;
}

export function bookCss(project: ProjectFile): string {
  const fontFamily = fontOptionFor(project.design.fontFamily).epubFamily;
  const background = project.design.pageTone === "white" ? "#ffffff" : project.design.pageTone === "warm" ? "#fbf1df" : "#f7f1e8";
  return `body {
  font-family: ${fontFamily};
  font-size: ${project.design.fontSize}px;
  line-height: ${project.design.lineHeight};
  color: #1f1a17;
  background: ${background};
}
h1 {
  font-size: 1.8em;
  line-height: 1.25;
  margin: 0 0 1.5em;
}
.cover-page {
  margin: 0;
  text-align: center;
}
.cover-page img {
  max-width: 100%;
  max-height: 100vh;
}`;
}
