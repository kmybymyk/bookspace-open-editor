import type { Chapter, ProjectFile } from "../domain/project";
import { createStarterProject } from "../domain/project";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inlineMarkdownToHtml(value: string): string {
  return escapeHtml(value)
    .replaceAll(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replaceAll(/\*([^*]+)\*/g, "<em>$1</em>")
    .replaceAll(/`([^`]+)`/g, "<code>$1</code>");
}

function blocksToHtml(lines: readonly string[]): string {
  const blocks: string[] = [];
  let listItems: string[] = [];
  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }
    blocks.push(`<ul>${listItems.map((item) => `<li>${item}</li>`).join("")}</ul>`);
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      flushList();
      continue;
    }

    const listMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (listMatch) {
      listItems.push(inlineMarkdownToHtml(listMatch[1] ?? ""));
      continue;
    }

    flushList();
    blocks.push(`<p>${inlineMarkdownToHtml(trimmed)}</p>`);
  }
  flushList();
  return blocks.join("");
}

function splitMarkdown(raw: string): Chapter[] {
  const lines = raw.replaceAll("\r\n", "\n").split("\n");
  const chapters: Chapter[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  const flush = () => {
    if (currentTitle.trim().length === 0 && currentLines.every((line) => line.trim().length === 0)) {
      return;
    }
    chapters.push({
      id: `chapter-${chapters.length + 1}`,
      title: currentTitle.trim() || "가져온 원고",
      type: "chapter",
      contentHtml: blocksToHtml(currentLines),
    });
    currentLines = [];
  };

  for (const line of lines) {
    const headingMatch = /^#\s+(.+)$/.exec(line);
    if (headingMatch) {
      flush();
      currentTitle = headingMatch[1] ?? "";
      continue;
    }
    currentLines.push(line);
  }
  flush();
  return chapters.length > 0 ? chapters : [{
    id: "chapter-1",
    title: "가져온 원고",
    type: "chapter",
    contentHtml: "<p></p>",
  }];
}

export function importMarkdownProject(raw: string): ProjectFile {
  const starter = createStarterProject();
  const chapters = splitMarkdown(raw);
  const firstTitle = chapters[0]?.title ?? starter.metadata.title;
  return {
    ...starter,
    metadata: {
      ...starter.metadata,
      title: firstTitle,
    },
    chapters,
  };
}
