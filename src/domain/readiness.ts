import type { ProjectFile } from "./project";

export type ReadinessItem = {
  readonly key: ReadinessKey;
  readonly ok: boolean;
};

export type ReadinessKey = "author" | "body" | "language" | "title";

function textFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function epubReadiness(project: ProjectFile): readonly ReadinessItem[] {
  return [
    { key: "title", ok: project.metadata.title.trim().length > 0 },
    { key: "author", ok: project.metadata.author.trim().length > 0 },
    { key: "language", ok: project.metadata.language.trim().length >= 2 },
    { key: "body", ok: project.chapters.some((chapter) => textFromHtml(chapter.contentHtml).length > 0) },
  ];
}

export function isEpubReady(items: readonly ReadinessItem[]): boolean {
  return items.every((item) => item.ok);
}

export function missingReadinessKeys(items: readonly ReadinessItem[]): readonly ReadinessKey[] {
  return items.filter((item) => !item.ok).map((item) => item.key);
}
