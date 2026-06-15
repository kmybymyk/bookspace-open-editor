import type { ProjectFile } from "./project";

export type ReadinessItem = {
  readonly label: string;
  readonly ok: boolean;
};

function textFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function epubReadiness(project: ProjectFile): readonly ReadinessItem[] {
  return [
    { label: "제목", ok: project.metadata.title.trim().length > 0 },
    { label: "저자", ok: project.metadata.author.trim().length > 0 },
    { label: "언어", ok: project.metadata.language.trim().length >= 2 },
    { label: "본문", ok: project.chapters.some((chapter) => textFromHtml(chapter.contentHtml).length > 0) },
  ];
}

export function isEpubReady(items: readonly ReadinessItem[]): boolean {
  return items.every((item) => item.ok);
}

export function missingReadinessLabels(items: readonly ReadinessItem[]): string {
  return items.filter((item) => !item.ok).map((item) => item.label).join(", ");
}
